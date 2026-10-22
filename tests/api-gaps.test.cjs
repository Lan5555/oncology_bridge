const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function setup(userSession = true) {
  const requests = [];
  const sessions = new Map([["adminSession", JSON.stringify({ token: "admin-token" })]]);
  if (userSession) sessions.set("userSession", JSON.stringify({ token: "facility-token" }));
  const cache = new Map();
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(__dirname, "..", relative);
    const exports = {};
    cache.set(relative, exports);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(code, {
      exports, Blob, Uint8Array, atob, FormData, Event, URLSearchParams,
      process: { env: { NEXT_PUBLIC_BASE_URL: "https://backend.test" } },
      localStorage: { getItem: (key) => sessions.get(key) ?? null },
      window: { dispatchEvent() {} },
      fetch: async (url, options) => { requests.push({ url, ...options }); return { ok: true, status: 200, text: async () => JSON.stringify({ success: true, message: "OK", data: {} }) }; },
      require: (name) => {
        if (name === "@/app/hooks/service/core-service") return load("src/app/hooks/service/core-service.ts");
        if (name === "../api-routes" || name === "@/app/services/api-routes") return load("src/app/services/api-routes.ts");
        if (name === "./net-response") return load("src/app/hooks/service/net-response.ts");
        throw new Error(`Unexpected import ${name}`);
      },
    });
    return exports;
  }
  return { load, requests };
}

test("managed options and pharmacy pagination call their exact protected routes", async () => {
  const app = setup();
  const { FORM_OPTIONS_SERVICE } = app.load("src/app/services/form-options-service/form-options-service.ts");
  const { PRESCRIPTION_SERVICE } = app.load("src/app/services/prescription-service/prescription-service.ts");
  await FORM_OPTIONS_SERVICE.options("prescription");
  await PRESCRIPTION_SERVICE.pharmacies(2);
  assert.deepEqual(app.requests.map((request) => [request.url, request.method, request.headers.Authorization]), [
    ["https://backend.test/api/form-options?context=prescription", "GET", "Bearer facility-token"],
    ["https://backend.test/api/prescriptions/pharmacies?page=2&limit=100", "GET", "Bearer facility-token"],
  ]);
});

test("transfer confirmations send empty bodies and encode transfer IDs", async () => {
  const app = setup();
  const { TRANSFER_SERVICE } = app.load("src/app/services/transfer-service/transfer-service.ts");
  await TRANSFER_SERVICE.dispatch("id/with space");
  await TRANSFER_SERVICE.deliver("transfer-id");
  assert.deepEqual(app.requests.map((request) => [request.url, request.method, JSON.parse(request.body)]), [
    ["https://backend.test/api/transfers/id%2Fwith%20space/dispatch", "POST", {}],
    ["https://backend.test/api/transfers/transfer-id/deliver", "POST", {}],
  ]);
});

test("facility lookups and custody confirmations never borrow a stored admin session", async () => {
  const app = setup(false);
  await app.load("src/app/services/form-options-service/form-options-service.ts").FORM_OPTIONS_SERVICE.options("settings");
  await app.load("src/app/services/prescription-service/prescription-service.ts").PRESCRIPTION_SERVICE.pharmacies();
  await app.load("src/app/services/transfer-service/transfer-service.ts").TRANSFER_SERVICE.dispatch("transfer-id");
  assert.ok(app.requests.every((request) => request.headers.Authorization === undefined));
});

test("managed options reject wrong contexts, missing groups, duplicates and fabricated labels", () => {
  const { readFormOptions } = setup().load("src/app/services/form-options-service/form-options-service.ts");
  const good = { context: "marketplace", options: { categories: [{ value: "managed-code", label: "Managed category" }] } };
  assert.equal(readFormOptions(good, "marketplace", "categories")[0].value, "managed-code");
  assert.equal(readFormOptions({ context: "marketplace", options: { categories: [] } }, "marketplace", "categories").length, 0);
  for (const data of [{}, { ...good, context: "settings" }, { context: "marketplace", options: {} }, { context: "marketplace", options: { categories: [{ value: "missing-label" }] } }, { ...good, options: { categories: [...good.options.categories, ...good.options.categories] } }]) {
    assert.throws(() => readFormOptions(data, "marketplace", "categories"));
  }
});

test("reports preserve real file bytes and reject missing or unsafe file responses", async () => {
  const { reportDownload } = setup().load("src/app/lib/report-download.ts");
  assert.equal(await reportDownload({ csv: "medicine,quantity\nDrug,3" }).blob.text(), "medicine,quantity\nDrug,3");
  const file = reportDownload({ fileName: "report.pdf", mimeType: "application/pdf", contentBase64: btoa("%PDF-test") });
  assert.equal(file.filename, "report.pdf");
  assert.equal(await file.blob.text(), "%PDF-test");
  for (const data of [{}, { fileName: "../report.pdf", mimeType: "application/pdf", contentBase64: "YQ==" }, { fileName: "report.html", mimeType: "text/html", contentBase64: "YQ==" }]) assert.throws(() => reportDownload(data));
});

test("the OpenAPI handoff has resolvable schemas and all new wired paths", () => {
  const spec = JSON.parse(fs.readFileSync(path.join(__dirname, "../api-contracts/frontend-gaps.openapi.json"), "utf8"));
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (value.$ref) assert.ok(value.$ref.slice(2).split("/").reduce((current, key) => current?.[key], spec), value.$ref);
    Object.values(value).forEach(visit);
  };
  visit(spec);
  for (const route of ["/api/form-options", "/api/prescriptions/pharmacies", "/api/transfers/{id}/dispatch", "/api/transfers/{id}/deliver"]) assert.ok(spec.paths[route]);
});
