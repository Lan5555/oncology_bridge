const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/lib/record-graph.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, scope);
const lib = scope.exports;
const context = { medicines: [{ id: "med-a", name: "Medicine A" }], facilityId: "facility-a", now: Date.parse("2026-10-23T12:00:00Z") };
const plain = (value) => JSON.parse(JSON.stringify(value));
function source(id, kind, value) { return { id, kind, value, label: id, x: 40, y: 60 }; }
function medicineGraph() {
  return { nodes: [source("generic", "text", " Medicine A "), source("brand", "text", "Brand A"), source("maker", "text", "Manufacturer A"), source("form", "text", "Tablet"), source("storage", "text", "Store below 25 C"), source("identity", "identity"), source("details", "details"), source("final", "medicineCreate")], edges: [
    { from: "generic", to: "identity", input: 0 }, { from: "brand", to: "identity", input: 1 },
    { from: "maker", to: "details", input: 0 }, { from: "form", to: "details", input: 1 }, { from: "storage", to: "details", input: 2 },
    { from: "identity", to: "final", input: 0 }, { from: "details", to: "final", input: 1 },
  ] };
}
function inventoryGraph() {
  return { nodes: [source("medicine", "medicine", "med-a"), source("lot", "text", " LOT-10 "), source("date", "date", "2027-12-31"), source("amount", "number", 10), source("unit", "unit", "box"), source("batch", "batch"), source("stock", "stock"), source("final", "inventoryCreate")], edges: [
    { from: "medicine", to: "batch", input: 0 }, { from: "lot", to: "batch", input: 1 }, { from: "date", to: "batch", input: 2 },
    { from: "batch", to: "stock", input: 0 }, { from: "amount", to: "stock", input: 1 }, { from: "unit", to: "stock", input: 2 }, { from: "stock", to: "final", input: 0 },
  ] };
}
const validate = (mode, graph, ctx = context) => lib.validateRecordGraph(mode, graph, ctx);
const node = (graph, id) => graph.nodes.find((item) => item.id === id);

test("medicine graph builds the existing create contract from required wired Text variables", () => {
  const graph = medicineGraph();
  assert.deepEqual(plain(validate("medicine", graph)), { errors: [], payload: { generic_name: "Medicine A", brand_name: "Brand A", manufacturer: "Manufacturer A", dosage_form: "Tablet", storage_temperature: "Store below 25 C" } });
  graph.nodes.push(source("strength", "text", "10 mg"), source("gtin", "text", "01234567890123"));
  graph.edges.push({ from: "strength", to: "identity", input: 2 }, { from: "gtin", to: "identity", input: 3 });
  assert.equal(validate("medicine", graph).payload.strength, "10 mg");
  assert.equal(validate("medicine", graph).payload.gtin, "01234567890123");
});

test("medicine creation needs all required connections and rejects blank required values", () => {
  for (let index = 0; index < 7; index++) { const graph = medicineGraph(); graph.edges.splice(index, 1); assert.equal(validate("medicine", graph).payload, null); }
  for (const id of ["generic", "brand", "maker", "form", "storage"]) { const graph = medicineGraph(); node(graph, id).value = "  "; assert.equal(validate("medicine", graph).payload, null); }
  assert.equal(validate("medicine", { nodes: [], edges: [] }).payload, null);
});

test("inventory graph links the live medicine ID, batch, whole quantity, unit and session facility", () => {
  assert.deepEqual(plain(validate("inventory", inventoryGraph())), { errors: [], payload: { medicineId: "med-a", batchNumber: "LOT-10", expiry: "2027-12-31", quantity: 10, unit: "box", facilityId: "facility-a" } });
  for (let index = 0; index < 7; index++) { const graph = inventoryGraph(); graph.edges.splice(index, 1); assert.equal(validate("inventory", graph).payload, null); }
});

test("inventory rejects missing or removed medicine choices, missing facility, invalid quantities and unsupported units", () => {
  assert.equal(validate("inventory", inventoryGraph(), { ...context, medicines: [] }).payload, null);
  assert.equal(validate("inventory", inventoryGraph(), { ...context, facilityId: undefined }).payload, null);
  for (const quantity of [0, -1, 1.5, NaN, Infinity, null, "10"]) { const graph = inventoryGraph(); node(graph, "amount").value = quantity; assert.equal(validate("inventory", graph).payload, null); }
  for (const unit of ["", "tablet", "VIAL"]) { const graph = inventoryGraph(); node(graph, "unit").value = unit; assert.equal(validate("inventory", graph).payload, null); }
});

test("expiry uses a real calendar date and does not silently accept expired stock", () => {
  for (const expiry of ["2026-02-30", "2025-12-31", "bad", "", "2027-13-01"]) { const graph = inventoryGraph(); node(graph, "date").value = expiry; assert.equal(validate("inventory", graph).payload, null); }
  const graph = inventoryGraph(); node(graph, "date").value = "2026-10-23"; assert.notEqual(validate("inventory", graph).payload, null);
});

test("boolean conditions require true, and connected unknown optional values block review", () => {
  for (const [mode, factory, input] of [["medicine", medicineGraph, 2], ["inventory", inventoryGraph, 1]]) {
    const graph = factory(); graph.nodes.push(source("gate", "boolean", false)); graph.edges.push({ from: "gate", to: "final", input });
    assert.equal(validate(mode, graph).payload, null);
    node(graph, "gate").value = true; assert.notEqual(validate(mode, graph).payload, null);
    node(graph, "gate").value = null; assert.equal(validate(mode, graph).payload, null);
  }
});

test("number math flows into intake quantity and both inputs must be wired", () => {
  const graph = inventoryGraph(); graph.nodes.push(source("per-box", "number", 2), source("multiply", "multiply"));
  graph.edges[4].from = "multiply";
  graph.edges.push({ from: "amount", to: "multiply", input: 0 }, { from: "per-box", to: "multiply", input: 1 });
  assert.equal(validate("inventory", graph).payload.quantity, 20);
  graph.edges.pop(); assert.equal(validate("inventory", graph).payload, null);
});

test("typed wires, cycles, duplicate inputs, duplicate final nodes and wrong workflows are rejected", () => {
  const graph = inventoryGraph();
  assert.match(lib.recordConnectionError(graph, { from: "amount", to: "batch", input: 0 }), /matching types/);
  graph.nodes.push(source("a", "not"), source("b", "not")); graph.edges.push({ from: "a", to: "b", input: 0 });
  assert.match(lib.recordConnectionError(graph, { from: "b", to: "a", input: 0 }), /cycle/);
  const duplicate = inventoryGraph(); duplicate.edges.push({ ...duplicate.edges[0] }); assert.equal(validate("inventory", duplicate).payload, null);
  duplicate.nodes.push(source("extra", "inventoryCreate")); assert.equal(validate("inventory", duplicate).payload, null);
  assert.equal(validate("medicine", inventoryGraph()).payload, null);
});

function compile(file, dependencies = {}) {
  const moduleScope = { exports: {}, require: (id) => id in dependencies ? dependencies[id] : require(id) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, file), "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, moduleScope);
  return moduleScope.exports;
}
function walk(element, predicate) {
  if (!element || typeof element !== "object") return null;
  if (predicate(element)) return element;
  for (const child of [element.props?.children].flat(Infinity)) { const found = walk(child, predicate); if (found) return found; }
  return null;
}
const text = (value) => Array.isArray(value) ? value.map(text).join("") : typeof value === "string" ? value : "";
function componentHarness(mode, response = { success: true }) {
  const graph = mode === "medicine" ? medicineGraph() : inventoryGraph();
  if (mode === "inventory") node(graph, "date").value = "2099-12-31";
  const slots = []; let cursor = 0; const calls = []; let refreshes = 0;
  const react = {
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = index === 0 ? graph : typeof initial === "function" ? initial() : initial; return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }]; },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect() {},
  };
  const props = { mode, medicines: [{ id: "med-a", name: "Medicine A" }], facilityId: "facility-a", canCreate: true, onCreated: () => refreshes++ };
  const create = async (service, payload) => { calls.push({ service, payload: plain(payload) }); return response; };
  const { default: Component } = compile("../src/app/components/RecordGraph.tsx", {
    react,
    sonner: { toast: { success() {} } },
    "@/app/hooks/useGraphWireDrag": { useGraphWireDrag: () => ({ draft: null, cancel() {}, suppressClick: () => false }) },
    "@/app/lib/graph-wires": compile("../src/app/lib/graph-wires.ts"),
    "@/app/lib/record-graph": lib,
    "@/app/services/inventory-service/inventory-service": { INVENTORY_SERVICE: { create: (payload) => create("inventory", payload) } },
    "@/app/services/medicine-service/medicine-service": { MEDICINE_SERVICE: { create: (payload) => create("medicine", payload) } },
    "./TransferGraph.module.css": { default: {} },
  });
  const render = () => { cursor = 0; return Component(props); };
  const preview = (tree) => walk(tree, (element) => typeof element.type === "function" && element.type.name === "ReviewDialog");
  const button = (tree) => walk(tree, (element) => element.type === "button" && text(element.props.children) === (mode === "medicine" ? "Review medicine" : "Review inventory intake"));
  return { graph, props, calls, render, preview, button, refreshes: () => refreshes };
}
const flush = () => new Promise(setImmediate);

test("both graph builders preview and cancel without sending, then confirm through their existing service once", async () => {
  for (const mode of ["medicine", "inventory"]) {
    const h = componentHarness(mode); h.button(h.render()).props.onClick(); let preview = h.preview(h.render());
    assert.ok(preview); assert.equal(h.calls.length, 0); preview.props.onClose(); assert.equal(h.preview(h.render()), null);
    h.button(h.render()).props.onClick(); preview = h.preview(h.render());
    preview.props.onConfirm(); preview.props.onConfirm(); assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].service, mode); assert.deepEqual(h.calls[0].payload, plain(preview.props.review.payload));
    await flush(); assert.equal(h.preview(h.render()), null); assert.equal(h.refreshes(), 1);
  }
});

test("failed medicine or inventory writes preserve the modal and draft", async () => {
  for (const mode of ["medicine", "inventory"]) {
    const h = componentHarness(mode, { success: false, message: "Backend rejected this record." });
    h.button(h.render()).props.onClick(); h.preview(h.render()).props.onConfirm(); await flush();
    assert.match(h.preview(h.render()).props.error, /Backend rejected/); assert.equal(h.refreshes(), 0);
    assert.notEqual(node(h.graph, mode === "medicine" ? "generic" : "medicine").value, null);
  }
});

test("changed reviewed values or revoked inventory permission cannot be submitted", () => {
  for (const mode of ["medicine", "inventory"]) {
    const h = componentHarness(mode); h.button(h.render()).props.onClick();
    node(h.graph, mode === "medicine" ? "generic" : "amount").value = mode === "medicine" ? "Changed medicine" : 12;
    h.preview(h.render()).props.onConfirm(); assert.equal(h.calls.length, 0); assert.ok(h.preview(h.render()).props.error);
  }
  const h = componentHarness("inventory"); h.button(h.render()).props.onClick(); h.props.canCreate = false;
  h.preview(h.render()).props.onConfirm(); assert.equal(h.calls.length, 0);
});

test("a removed medicine or changed facility invalidates an open inventory preview", () => {
  for (const change of [(h) => { h.props.medicines = []; }, (h) => { h.props.facilityId = "other-facility"; }]) {
    const h = componentHarness("inventory"); h.button(h.render()).props.onClick(); change(h);
    h.preview(h.render()).props.onConfirm(); assert.equal(h.calls.length, 0); assert.ok(h.preview(h.render()).props.error);
  }
});
