const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/lib/transfer-graph.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, scope);
const { initialTransferGraph, evaluateGraph, connectionError, validateTransferGraph, NODE_DEFINITIONS, sameTransferRequest } = scope.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));
const stock = [{ id: "stock-a", quantity: 10, expiry: "2099-12-31" }];
const recipients = [{ id: "hospital-b" }];
function requestGraph() {
  return {
    nodes: [
      { id: "batch", kind: "batch", value: "stock-a" },
      { id: "recipient", kind: "recipient", value: "hospital-b" },
      { id: "number", kind: "number", value: 5 },
      { id: "quantity", kind: "quantity" },
      { id: "request", kind: "request" },
    ],
    edges: [
      { from: "batch", to: "recipient", input: 0 },
      { from: "recipient", to: "quantity", input: 0 },
      { from: "quantity", to: "request", input: 0 },
      { from: "number", to: "quantity", input: 1 },
    ],
  };
}
const validate = (graph, available = stock, suggestions = recipients, forBatch = "stock-a") => validateTransferGraph(graph, available, suggestions, forBatch);
const node = (graph, id) => graph.nodes.find((item) => item.id === id);

test("empty graph stays user-created; the Number → Quantity → Request path produces the existing payload", () => {
  assert.deepEqual(plain(initialTransferGraph()), { nodes: [], edges: [] });
  assert.equal(validate(initialTransferGraph()).payload, null);
  assert.deepEqual(plain(validate(requestGraph())), { errors: [], payload: { inventoryItemId: "stock-a", recipientFacilityId: "hospital-b", quantity: 5 } });
});

test("all four required connections must exist and errors identify the missing input", () => {
  for (let i = 0; i < 4; i++) {
    const graph = requestGraph(); graph.edges.splice(i, 1);
    assert.equal(validate(graph).payload, null);
  }
  const graph = requestGraph(); graph.edges.pop();
  assert.match(validate(graph).errors.join(" "), /Transfer quantity: connect Amount/);
  graph.nodes.push({ id: "second", kind: "request" });
  assert.equal(validate(graph).payload, null);
});

test("legacy manual quantity/default values and direct Number → Request cannot bypass the required quantity stage", () => {
  const graph = requestGraph(); graph.edges.pop();
  node(graph, "quantity").value = 5; node(graph, "quantity").defaults = [5];
  assert.equal(evaluateGraph(graph.nodes, graph.edges).get("quantity"), null);
  assert.equal(validate(graph).payload, null);
  graph.edges[2].from = "number";
  assert.match(connectionError(graph.nodes, graph.edges, graph.edges[2]), /Transfer quantity/);
  assert.equal(validate(graph).payload, null);
});

test("recipients are checked against the current connected batch and server suggestions", () => {
  assert.equal(validate(requestGraph(), stock, []).payload, null);
  assert.equal(validate(requestGraph(), stock, recipients, "previous-stock").payload, null);
  const graph = requestGraph(); node(graph, "recipient").value = "unlisted";
  assert.equal(validate(graph).payload, null);
  const other = requestGraph(); other.nodes.push({ id: "other-batch", kind: "batch", value: "other-stock" }); other.edges[0].from = "other-batch";
  assert.equal(validate(other).payload, null);
});

test("submitted quantity must be finite positive whole units within available unexpired stock", () => {
  for (const quantity of [null, 0, -1, 1.5, 11, NaN, Infinity, "5"]) {
    const graph = requestGraph(); node(graph, "number").value = quantity;
    assert.equal(validate(graph).payload, null, String(quantity));
  }
  const graph = requestGraph(); node(graph, "number").value = 10;
  assert.equal(validate(graph).payload.quantity, 10);
  assert.equal(validate(graph, []).payload, null);
  assert.equal(validate(graph, [{ ...stock[0], expiry: "2000-01-01" }]).payload, null);
});

test("math and logic operators have two required inputs; legacy inline defaults are ignored", () => {
  for (const kind of ["compare", "equals", "and", "or", "add", "subtract", "multiply", "divide"]) {
    assert.equal(NODE_DEFINITIONS[kind].inputs.length, 2);
    const type = NODE_DEFINITIONS[kind].inputs[0];
    const value = type === "boolean" ? kind === "or" : type === "text" ? "same" : 3;
    const source = { id: "source", kind: type === "number" ? "number" : type === "text" ? "text" : "boolean", value };
    const operator = { id: "operator", kind, defaults: [value, value] };
    assert.equal(evaluateGraph([source, operator], [{ from: "source", to: "operator", input: 0 }]).get("operator"), null, kind);
  }
});

test("boolean operators use both connected variables and block incomplete or false request conditions", () => {
  const graph = requestGraph();
  graph.nodes.push({ id: "review", kind: "boolean", value: true }, { id: "checked", kind: "boolean", value: true }, { id: "and", kind: "and" });
  graph.edges.push({ from: "review", to: "and", input: 0 }, { from: "and", to: "request", input: 1 });
  assert.equal(validate(graph).payload, null);
  assert.match(validate(graph).errors.join(" "), /AND: connect B/);
  graph.edges.push({ from: "checked", to: "and", input: 1 });
  assert.notEqual(validate(graph).payload, null);
  node(graph, "checked").value = false;
  assert.equal(validate(graph).payload, null);
  node(graph, "checked").value = null;
  assert.equal(validate(graph).payload, null);
});

test("two Number variables feed math and propagate edits to the submitted quantity", () => {
  const graph = requestGraph();
  graph.nodes.push({ id: "boxes", kind: "number", value: 2 }, { id: "per-box", kind: "number", value: 3 }, { id: "multiply", kind: "multiply" });
  graph.edges[3].from = "multiply";
  graph.edges.push({ from: "boxes", to: "multiply", input: 0 }, { from: "per-box", to: "multiply", input: 1 });
  assert.equal(validate(graph).payload.quantity, 6);
  node(graph, "boxes").value = 3;
  assert.equal(validate(graph).payload.quantity, 9);
  node(graph, "boxes").value = 4;
  assert.equal(validate(graph).payload, null);
  graph.edges.pop(); assert.equal(validate(graph).payload, null);
});

test("Text variables feed comparison and numeric comparisons feed boolean conditions", () => {
  const graph = requestGraph();
  graph.nodes.push({ id: "a", kind: "text", value: "reviewed" }, { id: "b", kind: "text", value: "reviewed" }, { id: "equals", kind: "equals" });
  graph.edges.push({ from: "a", to: "equals", input: 0 }, { from: "b", to: "equals", input: 1 }, { from: "equals", to: "request", input: 1 });
  assert.notEqual(validate(graph).payload, null);
  node(graph, "b").value = "REVIEWED"; assert.equal(validate(graph).payload, null);
  graph.nodes.push({ id: "minimum", kind: "number", value: 3 }, { id: "compare", kind: "compare" });
  graph.edges.at(-1).from = "compare";
  graph.edges.push({ from: "number", to: "compare", input: 0 }, { from: "minimum", to: "compare", input: 1 });
  assert.notEqual(validate(graph).payload, null);
  node(graph, "minimum").value = 7; assert.equal(validate(graph).payload, null);
});

test("arithmetic handles subtraction, division, zero, fractional and nonfinite results", () => {
  for (const [kind, a, b, expected] of [["add", 2, 3, 5], ["subtract", 8, 3, 5], ["multiply", 2, 3, 6], ["divide", 10, 2, 5], ["divide", 5, 0, null], ["multiply", 1e308, 1e308, null], ["add", Infinity, 1, null]]) {
    const nodes = [{ id: "a", kind: "number", value: a }, { id: "b", kind: "number", value: b }, { id: "math", kind }];
    const edges = [{ from: "a", to: "math", input: 0 }, { from: "b", to: "math", input: 1 }];
    assert.equal(evaluateGraph(nodes, edges).get("math"), expected);
  }
  const graph = requestGraph();
  graph.nodes.push({ id: "divisor", kind: "number", value: 2 }, { id: "divide", kind: "divide" });
  graph.edges[3].from = "divide";
  graph.edges.push({ from: "number", to: "divide", input: 0 }, { from: "divisor", to: "divide", input: 1 });
  assert.equal(validate(graph).payload, null);
});

test("types, cycles, duplicate inputs and connections out of the final request remain rejected", () => {
  const graph = requestGraph();
  assert.match(connectionError(graph.nodes, graph.edges, { from: "batch", to: "quantity", input: 0 }), /matching types/);
  assert.match(connectionError(graph.nodes, graph.edges, { from: "request", to: "request", input: 1 }), /final node/);
  graph.nodes.push({ id: "a", kind: "not" }, { id: "b", kind: "not" });
  graph.edges.push({ from: "a", to: "b", input: 0 });
  assert.match(connectionError(graph.nodes, graph.edges, { from: "b", to: "a", input: 0 }), /cycle/);
  graph.edges.push({ from: "b", to: "a", input: 0 }); assert.equal(validate(graph).payload, null);
  const duplicate = requestGraph(); duplicate.edges.push({ ...duplicate.edges[3] }); assert.equal(validate(duplicate).payload, null);
});

test("Quantity bundles the batch, recipient and amount and requires both inputs", () => {
  const graph = requestGraph();
  assert.deepEqual(plain(NODE_DEFINITIONS.quantity.inputs), ["facility", "number"]);
  assert.deepEqual(plain(evaluateGraph(graph.nodes, graph.edges).get("quantity")), { inventoryItemId: "stock-a", recipientFacilityId: "hospital-b", quantity: 5 });
  graph.edges.splice(1, 1);
  assert.equal(evaluateGraph(graph.nodes, graph.edges).get("quantity"), null);
  assert.equal(validate(graph).payload, null);
});

test("reviewed payload comparison rejects any changed batch, recipient or quantity", () => {
  const payload = validate(requestGraph()).payload;
  assert.equal(sameTransferRequest(payload, { ...payload }), true);
  for (const change of [{ inventoryItemId: "different" }, { recipientFacilityId: "different" }, { quantity: 6 }]) {
    assert.equal(sameTransferRequest(payload, { ...payload, ...change }), false);
  }
  assert.equal(sameTransferRequest(null, payload), false);
});
