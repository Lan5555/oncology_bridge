const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function setup({ buyer = true, status = 200 } = {}) {
  const requests = [];
  const storage = new Map([["adminSession", JSON.stringify({ token: "network-token" })]]);
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
        return { status, ok: status < 400, text: async () => JSON.stringify({ success: status < 400, data: null, message: status === 503 ? "Provider integration pending" : "" }) };
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
  return { service: load("src/app/services/shipment-service/shipment-service.ts").SHIPMENT_SERVICE, display: load("src/app/lib/shipment-temperature.ts"), requests };
}

test("shipment list/detail/history/events use buyer scope and exact pagination routes", async () => {
  const { service, requests } = setup();
  await service.list(2);
  await service.temperature("shipment/1");
  await service.history("shipment/1", 3);
  await service.events("shipment/1", 4);
  assert.deepEqual(requests.map((r) => r.url), [
    "https://backend.test/api/shipments?page=2&limit=20",
    "https://backend.test/api/shipments/shipment%2F1/temperature",
    "https://backend.test/api/shipments/shipment%2F1/temperature/history?page=3&limit=20",
    "https://backend.test/api/shipments/shipment%2F1/temperature/events?page=4&limit=20",
  ]);
  assert.ok(requests.every((r) => r.headers.Authorization === "Bearer buyer-token"));
});

test("network reads use the network token despite a simultaneous buyer session", async () => {
  const { service, requests } = setup();
  await service.list(1, true);
  await service.temperature("shipment", true);
  await service.history("shipment", 1, true);
  await service.events("shipment", 1, true);
  assert.ok(requests.every((r) => r.headers.Authorization === "Bearer network-token"));
});

test("facility reads do not borrow a stored network token", async () => {
  const { service, requests } = setup({ buyer: false });
  await service.list();
  await service.temperature("shipment");
  await service.history("shipment");
  await service.events("shipment");
  assert.ok(requests.every((r) => r.headers.Authorization === undefined));
});

test("pending provider synchronization stays a 503 failure", async () => {
  const { service, requests } = setup({ status: 503 });
  const response = await service.sync("shipment/1");
  assert.equal(response.success, false);
  assert.equal(response.status, 503);
  assert.equal(response.message, "Provider integration pending");
  assert.equal(requests[0].headers.Authorization, "Bearer network-token");
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].body, "{}");
  assert.equal(requests[0].url, "https://backend.test/admin/api/shipments/shipment%2F1/temperature/sync");
});

test("missing or invalid samples never display a nominal temperature or healthy range", () => {
  const { display } = setup();
  for (const latestReading of [null, { celsius: NaN, recordedAt: "2026-10-23T10:00:00Z" }, { celsius: 5, recordedAt: "invalid" }, { celsius: null, recordedAt: "2026-10-23T10:00:00Z" }]) {
    const result = display.shipmentTemperature({ latestReading, temperatureStatus: "IN_RANGE" });
    assert.equal(result.value, "Unavailable");
    assert.equal(result.status, "No temperature data");
    assert.equal(result.recordedAt, null);
  }
});

test("actual zero-degree samples and original timestamps are preserved", () => {
  const { display } = setup();
  const recordedAt = "2026-10-23T10:00:00Z";
  const result = display.shipmentTemperature({ latestReading: { celsius: 0, recordedAt, outOfRange: true }, temperatureStatus: "OUT_OF_RANGE" });
  assert.equal(result.value, "0 °C");
  assert.equal(result.recordedAt, recordedAt);
  assert.equal(result.outOfRange, true);
  assert.equal(result.status, "Outside configured range");
});

test("unknown range status remains unavailable and sensor excursions remain visible", () => {
  const { display } = setup();
  const latestReading = { celsius: 12, recordedAt: "2026-10-23T10:00:00Z", outOfRange: false };
  assert.equal(display.shipmentTemperature({ latestReading, temperatureStatus: "NO_DATA" }).status, "Range status unavailable");
  assert.equal(display.shipmentTemperature({ latestReading: { ...latestReading, outOfRange: true }, temperatureStatus: "IN_RANGE" }).outOfRange, true);
});

test("poll intervals use server guidance with a finite fallback", () => {
  const { display } = setup();
  assert.equal(display.shipmentPollSeconds(60), 60);
  for (const invalid of [null, undefined, NaN, Infinity, -1, 0]) assert.equal(display.shipmentPollSeconds(invalid), 30);
});
