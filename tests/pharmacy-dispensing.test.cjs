const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");

function load(file, mocks = {}, globals = {}, suffix = "") {
  const scope = { exports: {}, ...globals, require: (name) => name in mocks ? mocks[name] : require(name) };
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText + suffix, scope);
  return scope.exports;
}
const lib = load("src/app/lib/pharmacy-dispensing.ts");
const rawBarcode = "01095060001343521727123110BATCH-A\u001d21VIAL-0001";
const valid = {
  identifiers: { gtin: "09506000134352", lot: "BATCH-A", serial: "VIAL-0001", expiry: "2027-12-31" },
  manifestId: "manifest", manifestMatch: "MATCH", mismatches: [], duplicate: false,
  suspectedCounterfeit: false, canDispense: true, reasons: [], authenticity: "UNVERIFIED",
};

test("incomplete and contradictory assessments cannot authorize dispensing", () => {
  assert.equal(lib.isPackAssessment(valid), true);
  for (const patch of [{ canDispense: "true" }, { duplicate: true }, { reasons: ["PACK_EXPIRED"] },
    { manifestMatch: "NOT_FOUND" }, { identifiers: {} }, { authenticity: "VERIFIED" }, { mismatches: ["lot"] }]) {
    assert.equal(lib.isPackAssessment({ ...valid, ...patch }), false);
  }
  assert.equal(lib.isDispenseResult(valid), false);
  assert.equal(lib.isDispenseResult({ ...valid, id: "event", replay: true }), true);
});

function mount({ storage = new Map(), dispense, preview = valid, storageFails = false } = {}) {
  const states = [], effects = [], initialized = new Set(), calls = [];
  let index = 0, tree;
  const react = {
    useState(value) { const slot = index++; if (!(slot in states)) states[slot] = value; return [states[slot], (v) => { states[slot] = v; }]; },
    useRef(value) { const slot = index++; if (!(slot in states)) states[slot] = { current: value }; return states[slot]; },
    useEffect(fn) { const slot = index++; if (!initialized.has(slot)) { initialized.add(slot); effects.push(fn); } },
  };
  const service = {
    check: async (raw) => { calls.push({ type: "check", raw }); return { success: true, data: preview }; },
    detail: async () => ({ success: true, data: { reference: "Delivery 42" } }),
    dispense: async (body) => {
      assert.equal(storage.get(lib.dispensingStorageKey("user", "facility")), JSON.stringify(body), "exact body must be persisted before sending");
      calls.push({ type: "dispense", body });
      return dispense(body);
    },
  };
  const component = load("src/app/components/pharmacy/PharmacyDispensing.tsx", {
    react,
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: "fragment" },
    "@/app/components/Camera/camera": { default: "camera" },
    "./PharmacyManifests": { default: "manifests" },
    "@/app/pages/dashboard/ScanPage.module.css": { default: {} },
    "@/app/lib/medicine-verification": { validateVerificationImage: () => null },
    "@/app/lib/pharmacy-dispensing": lib,
    "@/app/providers/provider": {},
    "@/app/services/manifest-service/manifest-service": { MANIFEST_SERVICE: service },
    "@/app/services/scan-service/scan-service": {},
  }, {
    crypto: { randomUUID: () => "bd9d8d89-e680-4981-a0e0-5a7719272a36" },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem(key, value) { if (storageFails) throw new Error("blocked"); storage.set(key, value); },
      removeItem: (key) => storage.delete(key),
    },
  }, "\nexports.Workspace = DispensingWorkspace;").Workspace;
  function render() { index = 0; tree = component({ userId: "user", facilityId: "facility" }); while (effects.length) effects.shift()(); }
  function nodes(node) {
    if (!node || typeof node !== "object") return [];
    return [node, ...[node.props?.children].flat(Infinity).flatMap((child) => nodes(child))];
  }
  const text = (node) => !node ? "" : typeof node !== "object" ? String(node) : [node.props?.children].flat(Infinity).map(text).join(" ");
  async function click(label) { const button = nodes(tree).find((n) => n.type === "button" && text(n) === label); assert.ok(button, `missing button ${label}`); assert.equal(Boolean(button.props.disabled), false); await button.props.onClick(); render(); }
  async function check() {
    nodes(tree).find((n) => n.type === "textarea").props.onChange({ target: { value: rawBarcode } }); render();
    nodes(tree).find((n) => n.type === "form").props.onSubmit({ preventDefault() {} });
    await new Promise(setImmediate); render();
  }
  render(); render();
  return { check, click, calls, storage, text: () => text(tree), nodes: () => nodes(tree) };
}

test("preview is read-only; uncertain confirmation retries and reloads with exact UUID/body", async () => {
  let count = 0;
  const app = mount({ dispense: async () => ++count === 1 ? { success: false, status: 408 } : { success: true, data: { ...valid, id: "event", replay: true } } });
  await app.check();
  assert.equal(app.calls.filter((c) => c.type === "dispense").length, 0);
  await app.click("Confirm dispensing");
  assert.match(app.text(), /Saved dispensing operation/);
  assert.equal(app.nodes().find((n) => n.type === "textarea").props.disabled, true);
  const recovered = mount({ storage: app.storage, dispense: async () => ({ success: true, data: { ...valid, id: "event", replay: true } }) });
  await recovered.click("Retry saved operation");
  assert.equal(JSON.stringify(recovered.calls[0].body), JSON.stringify(app.calls.at(-1).body));
  assert.equal(recovered.calls[0].body.rawBarcode, rawBarcode);
  assert.match(recovered.text(), /Do not trigger a second physical handoff/);
  assert.ok(!recovered.nodes().some((n) => n.type === "button" && n.props.children === "Confirm dispensing"));
});

test("HTTP success with a blocked decision displays the block and requires a new assessment", async () => {
  const app = mount({ dispense: async () => ({ success: true, status: 201, data: { ...valid, id: "blocked", replay: false, canDispense: false, duplicate: true, suspectedCounterfeit: true, reasons: ["SERIAL_ALREADY_DISPENSED"] } }) });
  await app.check(); await app.click("Confirm dispensing");
  assert.match(app.text(), /Blocked attempt recorded/);
  assert.match(app.text(), /Suspected duplicate pack — dispensing blocked. Review with the pharmacist./);
  await app.click("Start a new pack / assessment");
  assert.equal(app.storage.size, 0);
});

test("storage failure prevents sending a dispensing request", async () => {
  const app = mount({ storageFails: true, dispense: async () => { throw new Error("must not send"); } });
  await app.check(); await app.click("Confirm dispensing");
  assert.equal(app.calls.filter((c) => c.type === "dispense").length, 0);
  assert.match(app.text(), /request has not been sent/);
});

test("a blocked preview cannot enable confirmation", async () => {
  const app = mount({ preview: { ...valid, canDispense: false, reasons: ["PACK_EXPIRED"] } });
  await app.check();
  assert.equal(app.nodes().find((n) => n.type === "button" && n.props.children === "Confirm dispensing").props.disabled, true);
  assert.match(app.text(), /Do not dispense it/);
});

test("saved attempts are scoped by user and facility and preserve raw separators and case", () => {
  assert.notEqual(lib.dispensingStorageKey("a", "b"), lib.dispensingStorageKey("a", "c"));
  assert.notEqual(lib.dispensingStorageKey("a", "b"), lib.dispensingStorageKey("c", "b"));
  const body = { rawBarcode, clientUuid: "bd9d8d89-e680-4981-a0e0-5a7719272a36" };
  assert.equal(JSON.stringify(lib.readDispenseRequest(JSON.stringify(body))), JSON.stringify(body));
  assert.throws(() => lib.readDispenseRequest('{"clientUuid":"broken"}'));
});

test("manifest APIs use facility user authentication, exact dispensing bodies and the manifest multipart field", async () => {
  const calls = [];
  class CoreService {
    get(...args) { calls.push(["GET", ...args]); return Promise.resolve({ success: true }); }
    send(...args) { calls.push(["POST", ...args]); return Promise.resolve({ success: true }); }
  }
  const { Routes } = load("src/app/services/api-routes.ts");
  const { MANIFEST_SERVICE: service } = load("src/app/services/manifest-service/manifest-service.ts", {
    "@/app/hooks/service/core-service": { CoreService }, "../api-routes": { Routes },
  }, { FormData });
  await service.list();
  await service.detail("a/b");
  await service.upload(new File(['{"reference":"Delivery","packs":[]}'], "manifest.json", { type: "application/json" }));
  await service.check(rawBarcode);
  const body = { rawBarcode, clientUuid: "bd9d8d89-e680-4981-a0e0-5a7719272a36" };
  await service.dispense(body);
  assert.equal(calls[0][1], "/api/manifests");
  assert.equal(calls[1][1], "/api/manifests/a%2Fb");
  assert.equal(calls[2][1], "/api/manifests/upload");
  assert.deepEqual([...calls[2][2].keys()], ["manifest"]);
  assert.equal(calls[3][1], "/api/scans/manifest-check");
  assert.equal(calls[3][2].rawBarcode, rawBarcode);
  assert.equal(calls[4][1], "/api/scans/dispense");
  assert.equal(calls[4][2], body);
  const delivery = { reference: "Delivery 42", packs: [valid.identifiers] };
  await service.create(delivery);
  assert.equal(calls.at(-1)[1], "/api/manifests");
  assert.equal(calls.at(-1)[2], delivery);
  for (const call of calls) {
    const options = call.at(-1);
    assert.equal(options.facilityOnly, true);
    assert.equal(options.retryAuth, false);
    assert.equal(options.timeoutMs, 30000);
  }
});
