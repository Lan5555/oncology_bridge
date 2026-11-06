const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, globals = {}) {
  const scope = { exports: {}, ...globals };
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
        },
      },
    ).outputText,
    scope,
  );
  return scope.exports;
}
const lib = load("src/app/lib/notification-state.ts");
test("unread detection supports the API readAt contract and existing read formats", () => {
  for (const notification of [
    { readAt: null },
    { read_at: null },
    { read: false },
    {},
  ])
    assert.equal(lib.isNotificationUnread(notification), true);
  for (const notification of [
    { readAt: "2026-11-02" },
    { read_at: "2026-11-02" },
    { read: true },
  ])
    assert.equal(lib.isNotificationUnread(notification), false);
});

test("badge refresh counts unread notifications, ignores stale requests, and cleans up", async () => {
  const listeners = new Map();
  const pending = [];
  const users = [];
  let state = null;
  let effect;
  let interval;
  let cleared = false;
  const document = {
    visibilityState: "visible",
    addEventListener: (key, fn) => listeners.set(key, fn),
    removeEventListener: (key) => listeners.delete(key),
  };
  const window = {
    addEventListener: document.addEventListener,
    removeEventListener: document.removeEventListener,
    setInterval: (fn) => {
      interval = fn;
      return 1;
    },
    clearInterval: () => {
      cleared = true;
    },
  };
  const { useUnreadNotifications } = load(
    "src/app/hooks/useUnreadNotifications.ts",
    {
      window,
      document,
      require(name) {
        if (name === "react")
          return {
            useState: () => [
              state,
              (next) => {
                state = next;
              },
            ],
            useEffect: (fn) => {
              effect = fn;
            },
          };
        if (name === "@/app/lib/notification-state") return lib;
        if (name === "@/app/services/response-utils")
          return { unwrapArray: (value) => value };
        if (name === "@/app/services/notification-service/notification-service")
          return {
            NOTIFICATION_SERVICE: {
              list: (id) => {
                users.push(id);
                return new Promise((resolve) => pending.push(resolve));
              },
            },
          };
        throw new Error(name);
      },
    },
  );
  assert.equal(useUnreadNotifications("user-a"), null);
  const cleanup = effect();
  pending.shift()({
    success: true,
    data: [{ readAt: null }, { readAt: "read" }],
  });
  await new Promise(setImmediate);
  assert.equal(useUnreadNotifications("user-a"), 1);
  assert.equal(useUnreadNotifications("user-b"), null);
  const first = listeners.get(lib.NOTIFICATIONS_CHANGED)();
  const stale = pending.shift();
  const second = listeners.get("focus")();
  pending.shift()({ success: true, data: [] });
  await second;
  stale({ success: true, data: [{ readAt: null }] });
  await first;
  assert.equal(useUnreadNotifications("user-a"), 0);
  document.visibilityState = "hidden";
  interval();
  assert.equal(pending.length, 0);
  cleanup();
  assert.equal(cleared, true);
  assert.equal(listeners.size, 0);
  assert.ok(users.every((id) => id === "user-a"));
});

test("mark read notifies the badge only after a successful response", async () => {
  const events = [];
  let success = false;
  class CoreService {
    async update() {
      return { success };
    }
  }
  const service = load(
    "src/app/services/notification-service/notification-service.ts",
    {
      window: { dispatchEvent: (event) => events.push(event.type) },
      Event,
      require(name) {
        if (name.includes("core-service")) return { CoreService };
        if (name.includes("notification-state")) return lib;
        if (name === "../api-routes")
          return {
            Routes: {
              NOTIFICATION_READ: (id) => `/api/notifications/${id}/read`,
            },
          };
        throw new Error(name);
      },
    },
  ).NOTIFICATION_SERVICE;
  await service.markRead("n1");
  assert.equal(events.length, 0);
  success = true;
  await service.markRead("n1");
  assert.deepEqual(events, [lib.NOTIFICATIONS_CHANGED]);
});
