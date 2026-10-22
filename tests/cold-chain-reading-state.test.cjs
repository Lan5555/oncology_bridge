const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
const source = fs.readFileSync(path.join(__dirname, "../src/app/lib/cold-chain-reading-state.ts"), "utf8");
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, scope);
const { coldChainReadingState } = scope.exports;

test("a missing or invalid storage policy does not imply a safe reading", () => {
  for (const [low, high] of [[undefined, undefined], [null, 8], [2, null], ["", ""], [" ", 8], [false, true], [8, 2], ["invalid", 8]]) {
    assert.equal(coldChainReadingState(undefined, 5, low, high), "UNKNOWN");
  }
  assert.equal(coldChainReadingState("invalid", 5, 2, 8), "UNKNOWN");
});

test("classification uses recorded limits instead of a default range", () => {
  assert.equal(coldChainReadingState(undefined, 5, 10, 20), "BREACH");
  assert.equal(coldChainReadingState(undefined, 15, 10, 20), "NOMINAL");
  assert.equal(coldChainReadingState(undefined, 20, 10, 20), "NOMINAL");
  assert.equal(coldChainReadingState(undefined, 21, 10, 20), "BREACH");
  assert.equal(coldChainReadingState(undefined, NaN, 10, 20), "UNKNOWN");
});

test("explicit backend states remain authoritative", () => {
  for (const state of ["NOMINAL", "BREACH", "OFFLINE"]) {
    assert.equal(coldChainReadingState(state, 5, undefined, undefined), state);
  }
});
