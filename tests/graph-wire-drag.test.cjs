const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
function moduleFrom(file, dependencies = {}, globals = {}) {
  const scope = { exports: {}, require: (id) => { if (!(id in dependencies)) throw new Error(`Unexpected import: ${id}`); return dependencies[id]; }, ...globals };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, file), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, scope);
  return scope.exports;
}
const graphLib = moduleFrom("../src/app/lib/transfer-graph.ts");
const wireLib = moduleFrom("../src/app/lib/graph-wires.ts");
const output = (node) => ({ node, direction: "output", input: 0 });
const input = (node, index = 1) => ({ node, direction: "input", input: index });
const plain = (value) => JSON.parse(JSON.stringify(value));

/** Exercise pointer handlers with deterministic hit testing and React state/ref slots. */
function harness(graph, zoom = 0.5) {
  const slots = []; let cursor = 0; const effects = []; let hit = null;
  const commits = []; const notices = []; const listeners = new Map();
  const mockReact = {
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }]; },
    useEffect(effect) { effects.push(effect); },
  };
  const world = { current: { getBoundingClientRect: () => ({ left: 20, top: 40 }), contains: () => true } };
  const { useGraphWireDrag } = moduleFrom("../src/app/hooks/useGraphWireDrag.ts", {
    react: mockReact, "@/app/lib/graph-wires": wireLib, "@/app/lib/transfer-graph": graphLib,
  }, {
    document: { elementFromPoint: () => hit ? { closest: () => ({ dataset: { graphPort: hit.direction, node: hit.node, input: String(hit.input) } }) } : null },
    window: { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name) => listeners.delete(name) },
    performance: { now: () => 1000 },
  });
  const render = () => { cursor = 0; effects.length = 0; const api = useGraphWireDrag({ graph, world, zoom, disabled: false, commit: (...args) => commits.push(args), announce: (message) => notices.push(message) }); effects.forEach((effect) => effect()); return api; };
  const event = (x, y) => ({ button: 0, pointerId: 1, clientX: x, clientY: y, stopPropagation() {}, currentTarget: { setPointerCapture() {} } });
  return { render, event, commits, notices, listeners, target: (port) => { hit = port; } };
}
const graph = () => ({ nodes: [{ id: "number", kind: "number", value: 5, x: 40, y: 60 }, { id: "quantity", kind: "quantity", x: 370, y: 60 }, { id: "other", kind: "quantity", x: 700, y: 60 }, { id: "bool", kind: "boolean", value: true, x: 40, y: 300 }], edges: [] });

test("pointer drag creates a connection in either direction and tracks scaled world coordinates", () => {
  for (const reverse of [false, true]) {
    const h = harness(graph()); let api = h.render();
    api.start(h.event(40, 80), reverse ? input("quantity") : output("number"));
    h.target(reverse ? output("number") : input("quantity"));
    api.track(h.event(220, 140)); api = h.render();
    assert.deepEqual(plain(api.draft.point), { x: 400, y: 200 });
    assert.equal(api.draft.error, null);
    api.finish(h.event(220, 140));
    assert.deepEqual(plain(h.commits[0][0]), { from: "number", to: "quantity", input: 1 });
    assert.equal(h.render().suppressClick(), true);
  }
});

test("rewiring supplies the original edge for atomic replacement", () => {
  const g = graph(); const original = { from: "number", to: "quantity", input: 1 }; g.edges.push(original);
  const h = harness(g); const api = h.render();
  api.start(h.event(50, 80), output("number"), original); h.target(input("other")); api.finish(h.event(400, 150));
  assert.deepEqual(plain(h.commits[0][0]), { from: "number", to: "other", input: 1 });
  assert.equal(h.commits[0][1], original);
  assert.equal(g.edges[0], original);
});

test("invalid types and empty drops never commit or remove existing connections", () => {
  for (const target of [input("quantity"), null, output("number")]) {
    const h = harness(graph()); const api = h.render();
    api.start(h.event(40, 80), output("bool")); h.target(target); api.finish(h.event(220, 140));
    assert.equal(h.commits.length, 0); assert.equal(h.notices.length, 1);
  }
});

test("simple clicks retain the keyboard/click fallback and Escape cancels an active wire drag", () => {
  const h = harness(graph()); let api = h.render();
  api.start(h.event(40, 80), output("number")); api.finish(h.event(40, 80));
  assert.equal(h.commits.length, 0); assert.equal(h.render().suppressClick(), false);
  api = h.render(); api.start(h.event(40, 80), output("number")); api = h.render();
  h.listeners.get("keydown")({ key: "Escape" }); api = h.render();
  assert.equal(api.draft, null); api.finish(h.event(220, 140)); assert.equal(h.commits.length, 0);
});

test("input drag changes the source, and port geometry matches the fixed header and row spacing", () => {
  const g = graph(); const original = { from: "number", to: "quantity", input: 1 }; g.edges.push(original);
  g.nodes.push({ id: "new-number", kind: "number", x: 40, y: 500 });
  const h = harness(g); const api = h.render(); api.start(h.event(40, 80), input("quantity"), original); h.target(output("new-number")); api.finish(h.event(220, 140));
  assert.deepEqual(plain(h.commits[0][0]), { from: "new-number", to: "quantity", input: 1 });
  assert.deepEqual(plain(wireLib.portPoint(g.nodes, output("number"))), { x: 300, y: 131 });
  assert.deepEqual(plain(wireLib.portPoint(g.nodes, input("quantity", 1))), { x: 370, y: 163 });
});
