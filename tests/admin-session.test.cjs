const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Load the real REST client with isolated browser storage and mocked HTTP.
function setup(status, body, { userToken, beforeResponse } = {}) {
  const storage = new Map([
    ["adminSession", JSON.stringify({ token: "admin-token" })],
  ]);
  if (userToken) storage.set("userSession", JSON.stringify({ token: userToken, refreshToken: "refresh-token" }));
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    removeItem: (key) => storage.delete(key),
  };
  const events = [];
  const requests = [];
  const context = {
    exports: {},
    process: { env: { NEXT_PUBLIC_BASE_URL: "https://backend.test" } },
    localStorage,
    window: { dispatchEvent: (event) => events.push(event.type) },
    Event,
    FormData,
    fetch: async (url, options) => {
      requests.push({ url, ...options });
      beforeResponse?.(storage);
      return { status, ok: status < 400, text: async () => JSON.stringify(body) };
    },
  };
  function load(relativePath) {
    const filename = path.join(__dirname, "..", relativePath);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const scope = { ...context, exports: {}, require: requireMock };
    vm.runInNewContext(code, scope, { filename });
    return scope.exports;
  }
  function requireMock(name) {
    if (name === "./net-response") return load("src/app/hooks/service/net-response.ts");
    if (name === "@/app/services/api-routes" || name === "../api-routes") {
      return load("src/app/services/api-routes.ts");
    }
    if (name === "@/app/hooks/service/core-service") return core;
    throw new Error(`Unexpected import: ${name}`);
  }
  const core = load("src/app/hooks/service/core-service.ts");
  const { ADMIN_SERVICE } = load("src/app/services/admin-service/admin-service.ts");
  const { AUTH_SERVICE } = load("src/app/services/auth-service/auth-service.ts");
  return { client: new core.CoreService(), admin: ADMIN_SERVICE, auth: AUTH_SERVICE, storage, events, requests };
}

test("password recovery sends public requests with exact payloads", async () => {
  const app = setup(200, { success: true, data: { emailQueued: true } }, { userToken: "facility-token" });
  await app.auth.forgotPassword("person@example.test");
  await app.auth.resetPassword({ token: "reset-token", password: "new-password" });
  assert.deepEqual(app.requests.map(({ url, method, headers, body }) => ({ url, method, authorization: headers.Authorization, body: JSON.parse(body) })), [
    { url: "https://backend.test/auth/api/forgot-password", method: "POST", authorization: undefined, body: { email: "person@example.test" } },
    { url: "https://backend.test/auth/api/reset-password", method: "POST", authorization: undefined, body: { token: "reset-token", password: "new-password" } },
  ]);
  assert.deepEqual(app.events, []);
});

test("an invalid reset token never refreshes or clears an existing session", async () => {
  const app = setup(401, { success: false, message: "Invalid reset token" }, { userToken: "facility-token" });
  assert.equal((await app.auth.resetPassword({ token: "expired", password: "new-password" })).success, false);
  assert.equal(app.requests.length, 1);
  assert.ok(app.storage.has("userSession"));
  assert.ok(app.storage.has("adminSession"));
  assert.deepEqual(app.events, []);
});

test("session validation uses /api/me and the admin token even with a facility session", async () => {
  const app = setup(200, { success: true, data: { role: "ADMIN" } }, { userToken: "facility-token" });
  assert.equal((await app.admin.session()).success, true);
  assert.equal(app.requests[0].url, "https://backend.test/api/me");
  assert.equal(app.requests[0].headers.Authorization, "Bearer admin-token");
  assert.ok(app.storage.has("adminSession"));
});

for (const [status, body] of [
  [401, { message: "Invalid token" }],
  [403, { message: "Invalid token" }],
  [403, { code: "TOKEN_EXPIRED" }],
]) {
  test(`admin auth rejection clears the session (${status}, ${JSON.stringify(body)})`, async () => {
    const app = setup(status, body, { userToken: "facility-token" });
    assert.equal((await app.admin.session()).success, false);
    assert.equal(app.storage.has("adminSession"), false);
    assert.equal(app.storage.has("userSession"), true);
    assert.deepEqual(app.events, ["admin-session-invalidated"]);
  });
}

for (const [status, message] of [[403, "Missing permission: user.read"], [500, "Unavailable"]]) {
  test(`ordinary API errors preserve the session (${status})`, async () => {
    const app = setup(status, { message });
    await app.admin.session();
    assert.ok(app.storage.has("adminSession"));
    assert.deepEqual(app.events, []);
  });
}

test("a late rejection cannot remove a newer admin session", async () => {
  const app = setup(401, { message: "Invalid token" }, {
    beforeResponse: (storage) => storage.set("adminSession", JSON.stringify({ token: "new-token" })),
  });
  await app.admin.session();
  assert.equal(JSON.parse(app.storage.get("adminSession")).token, "new-token");
  assert.deepEqual(app.events, []);
});

test("a facility-token rejection does not invalidate the admin session", async () => {
  const app = setup(401, { message: "Invalid token" }, { userToken: "facility-token" });
  await app.client.get("/api/users");
  assert.ok(app.storage.has("adminSession"));
  assert.deepEqual(app.events, []);
});

test("shared views using the fallback admin token invalidate that admin session", async () => {
  const app = setup(401, { message: "Invalid token" });
  await app.client.get("/api/users");
  assert.equal(app.storage.has("adminSession"), false);
  assert.deepEqual(app.events, ["admin-session-invalidated"]);
});

test("failed login does not invalidate a stored admin session", async () => {
  const app = setup(401, { message: "Invalid credentials" });
  await app.admin.login({ email: "test@example.com", password: "wrong" });
  assert.ok(app.storage.has("adminSession"));
  assert.deepEqual(app.events, []);
});

test("successful authenticated mutations notify the dashboard", async () => {
  const app = setup(201, { success: true, data: { id: "saved" } });
  await app.client.send("/api/inventory", { quantity: 10 });
  assert.deepEqual(app.events, ["dashboard-data-changed"]);
});

test("failed mutations and public login do not signal a dashboard update", async () => {
  const failed = setup(422, { success: false, message: "Invalid batch" });
  await failed.client.send("/api/inventory", {});
  assert.deepEqual(failed.events, []);
  const login = setup(200, { success: true, data: { token: "new-token" } });
  await login.admin.login({ email: "test@example.com", password: "example" });
  assert.deepEqual(login.events, []);
});

test("facility-only dashboard reads never fall back to the admin session", async () => {
  const app = setup(401, { message: "Authentication required" });
  await app.client.get("/api/dashboard/charts", {facilityOnly: true});
  assert.equal(app.requests[0].headers.Authorization, undefined);
  assert.ok(app.storage.has("adminSession"));
});
