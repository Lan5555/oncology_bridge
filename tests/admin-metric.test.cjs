const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/lib/admin-metric.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, scope);
const { adminMetric } = scope.exports;

test("missing and invalid aggregates remain unavailable rather than zero or NaN", () => {
  for (const value of [null, undefined, "", "0", "12", NaN, Infinity, -1, false, {}]) {
    assert.equal(adminMetric(value), "Unavailable");
    assert.equal(adminMetric(value, true), "Unavailable");
  }
  assert.equal(adminMetric(1.5), "Unavailable");
});
test("actual zero counts and zero recovery values are preserved", () => {
  assert.equal(adminMetric(0), "0");
  assert.notEqual(adminMetric(0, true), "Unavailable");
  assert.equal(adminMetric(2), "2");
  assert.notEqual(adminMetric(1250.5, true), "Unavailable");
});
