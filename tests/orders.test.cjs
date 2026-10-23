const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function setup({ buyer = true, status = 200 } = {}) {
  const requests = [];
  const storage = new Map([["adminSession", JSON.stringify({ token: "admin-token" })]]);
  if (buyer) storage.set("userSession", JSON.stringify({ token: "buyer-token" }));
  const cache = new Map();
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(__dirname, "..", relative);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const scope = {
      exports: {}, URLSearchParams, encodeURIComponent, FormData, Event,
      process: { env: { NEXT_PUBLIC_BASE_URL: "https://backend.test" } },
      localStorage: { getItem: (key) => storage.get(key) ?? null, removeItem: (key) => storage.delete(key) },
      window: { dispatchEvent() {} },
      fetch: async (url, options) => {
        requests.push({ url, ...options });
        return { status, ok: status < 400, text: async () => JSON.stringify({ success: status < 400, data: null, message: status === 409 ? "Order changed" : "" }) };
      },
      require(name) {
        const files = {
          "@/app/hooks/service/core-service": "src/app/hooks/service/core-service.ts",
          "@/app/services/api-routes": "src/app/services/api-routes.ts",
          "../api-routes": "src/app/services/api-routes.ts",
          "./net-response": "src/app/hooks/service/net-response.ts",
        };
        if (!files[name]) throw new Error(`Unexpected import ${name}`);
        return load(files[name]);
      },
    };
    vm.runInNewContext(code, scope, { filename });
    cache.set(relative, scope.exports);
    return scope.exports;
  }
  return { service: load("src/app/services/order-service/order-service.ts").ORDER_SERVICE, requests };
}

test("buyer/admin order calls retain their own tokens with simultaneous sessions", async () => {
  const { service, requests } = setup();
  const params = new URLSearchParams({ page: "2", limit: "20", q: "Drug & name", status: "SHIPPED", paymentStatus: "PAID" });
  await service.list(params);
  await service.list(params, true);
  await service.detail("order/with space");
  await service.detail("order/with space", true);
  assert.deepEqual(requests.map((r) => r.headers.Authorization), ["Bearer buyer-token", "Bearer admin-token", "Bearer buyer-token", "Bearer admin-token"]);
  assert.equal(new URL(requests[0].url).searchParams.get("q"), "Drug & name");
  assert.equal(new URL(requests[1].url).pathname, "/admin/api/orders");
  assert.equal(new URL(requests[0].url).searchParams.get("paymentStatus"), "PAID");
  assert.ok(requests[2].url.endsWith("/api/orders/order%2Fwith%20space"));
  assert.ok(requests[3].url.endsWith("/admin/api/orders/order%2Fwith%20space"));
});

test("buyer order reads never fall back to an administrator session", async () => {
  const { service, requests } = setup({ buyer: false });
  await service.list(new URLSearchParams());
  await service.detail("order");
  assert.ok(requests.every((request) => request.headers.Authorization === undefined));
});

test("fulfillment uses admin authorization and preserves the concurrency conflict", async () => {
  const { service, requests } = setup({ status: 409 });
  const payload = { status: "SHIPPED", expectedVersion: 7, note: "Dispatched", carrier: "Carrier", trackingNumber: "TRACK-1" };
  const response = await service.updateFulfillment("order/1", payload);
  assert.equal(response.success, false);
  assert.equal(response.status, 409);
  assert.equal(response.message, "Order changed");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "PATCH");
  assert.equal(requests[0].url, "https://backend.test/admin/api/orders/order%2F1/fulfillment");
  assert.equal(requests[0].headers.Authorization, "Bearer admin-token");
  assert.deepEqual(JSON.parse(requests[0].body), payload);
});
