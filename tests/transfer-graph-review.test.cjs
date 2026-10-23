const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
function moduleFrom(file, dependencies = {}, globals = {}) {
  const scope = { exports: {}, require: (id) => id in dependencies ? dependencies[id] : require(id), ...globals };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, file), "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, scope);
  return scope.exports;
}
const graphLib = moduleFrom("../src/app/lib/transfer-graph.ts");
const wiresLib = moduleFrom("../src/app/lib/graph-wires.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));
function walk(element, predicate) {
  if (!element || typeof element !== "object") return null;
  if (predicate(element)) return element;
  for (const child of [element.props?.children].flat(Infinity)) { const found = walk(child, predicate); if (found) return found; }
  return null;
}
function harness(response = { success: true }) {
  const graph = { nodes: [
    { id: "batch", kind: "batch", value: "batch-uuid", x: 40, y: 60 },
    { id: "recipient", kind: "recipient", value: "facility-uuid", x: 370, y: 60 },
    { id: "number", kind: "number", value: 5, x: 700, y: 60 },
    { id: "quantity", kind: "quantity", x: 40, y: 440 },
    { id: "request", kind: "request", x: 370, y: 440 },
  ], edges: [
    { from: "batch", to: "recipient", input: 0 }, { from: "recipient", to: "quantity", input: 0 },
    { from: "number", to: "quantity", input: 1 }, { from: "quantity", to: "request", input: 0 },
  ] };
  const slots = []; let cursor = 0; const calls = []; let refreshes = 0;
  const ReactMock = {
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = index === 0 ? graph : typeof initial === "function" ? initial() : initial; return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }]; },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
  };
  const Review = () => null;
  const options = { stock: [{ id: "batch-uuid", name: "Medicine A", batch: "LOT-10", expiry: "2099-12-31", quantity: 20, unit: "vial" }], recipients: [{ id: "facility-uuid", name: "Recipient hospital", city: "Abuja" }], recipientsForBatch: "batch-uuid", stockLoading: false, recipientLoading: false, stockError: "", recipientError: "", loadStock: async () => {}, hasMore: false };
  const { default: TransferGraph } = moduleFrom("../src/app/components/TransferGraph.tsx", {
    react: ReactMock,
    sonner: { toast: { success() {} } },
    "@/app/hooks/useGraphWireDrag": { useGraphWireDrag: () => ({ draft: null, cancel() {}, suppressClick: () => false }) },
    "@/app/hooks/useTransferRequestOptions": { useTransferRequestOptions: () => options },
    "@/app/lib/graph-wires": wiresLib,
    "@/app/lib/transfer-graph": graphLib,
    "@/app/services/transfer-service/transfer-service": { TRANSFER_SERVICE: { create: async (payload) => { calls.push(plain(payload)); return response; } } },
    "./TransferGraph.module.css": { default: {} },
    "./TransferGraphReview": { default: Review },
  });
  const render = () => { cursor = 0; return TransferGraph({ onSubmitted: () => refreshes++ }); };
  const preview = (tree) => walk(tree, (element) => element.type === Review);
  const reviewButton = (tree) => walk(tree, (element) => element.type === "button" && element.props.children === "Review transfer request");
  return { graph, options, calls, render, preview, reviewButton, refreshes: () => refreshes };
}
const flush = () => new Promise(setImmediate);

test("opening and cancelling the final preview never sends a transfer", () => {
  const h = harness(); let tree = h.render();
  h.reviewButton(tree).props.onClick(); tree = h.render();
  const preview = h.preview(tree);
  assert.equal(preview.props.review.medicine, "Medicine A");
  assert.equal(preview.props.review.recipient, "Recipient hospital");
  assert.deepEqual(plain(preview.props.review.payload), { inventoryItemId: "batch-uuid", recipientFacilityId: "facility-uuid", quantity: 5 });
  assert.equal(h.calls.length, 0);
  preview.props.onClose(); tree = h.render();
  assert.equal(h.preview(tree), null); assert.equal(h.calls.length, 0);
  assert.equal(h.graph.nodes.find((node) => node.id === "number").value, 5);
});

test("only confirmation submits the reviewed payload, and repeated confirmation is suppressed", async () => {
  const h = harness(); h.reviewButton(h.render()).props.onClick();
  const preview = h.preview(h.render());
  preview.props.onConfirm(); preview.props.onConfirm();
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0], plain(preview.props.review.payload));
  await flush();
  assert.equal(h.preview(h.render()), null); assert.equal(h.refreshes(), 1);
});

test("a backend rejection keeps the modal and graph values for correction", async () => {
  const h = harness({ success: false, message: "Stock changed. Refresh before retrying." });
  h.reviewButton(h.render()).props.onClick(); h.preview(h.render()).props.onConfirm(); await flush();
  const preview = h.preview(h.render());
  assert.match(preview.props.error, /Stock changed/);
  assert.equal(h.graph.nodes.find((node) => node.id === "batch").value, "batch-uuid");
  assert.equal(h.refreshes(), 0);
});

test("a changed quantity, revoked recipient or expired batch blocks confirmation of an old preview", () => {
  for (const change of [
    (h) => { h.graph.nodes.find((node) => node.id === "number").value = 6; },
    (h) => { h.options.recipients = []; },
    (h) => { h.options.stock[0].expiry = "2000-01-01"; },
  ]) {
    const h = harness(); h.reviewButton(h.render()).props.onClick(); change(h);
    h.preview(h.render()).props.onConfirm();
    assert.equal(h.calls.length, 0);
    assert.ok(h.preview(h.render()).props.error);
  }
});

test("preview dialog renders the final details and disables both actions during submission", () => {
  const React = require("react"); const { renderToStaticMarkup } = require("react-dom/server");
  const Review = moduleFrom("../src/app/components/TransferGraphReview.tsx", { "./TransferGraph.module.css": { default: {} } }).default;
  const review = { payload: { inventoryItemId: "b", recipientFacilityId: "r", quantity: 5 }, medicine: "Medicine A", batch: "LOT-10", expiry: "2099-12-31", available: 20, unit: "vial", recipient: "Recipient hospital", city: "Abuja", condition: "Passed (true)" };
  const html = renderToStaticMarkup(React.createElement(Review, { review, saving: true, error: "", onClose() {}, onConfirm() {} }));
  assert.match(html, /<dialog/); assert.match(html, /Recipient hospital/); assert.match(html, /5<!-- --> <!-- -->vial|5 vial/);
  assert.equal((html.match(/disabled=""/g) || []).length, 2);
  assert.match(html, /Sending request/);
});
