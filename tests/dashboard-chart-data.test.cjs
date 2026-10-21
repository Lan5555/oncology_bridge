const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/lib/dashboard-chart-data.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, scope);
const { dashboardSeries, unitSeries } = scope.exports;
test("reads named chart series from supported envelopes", () => {
  const payload = { inventoryOverTime: [{ label: "Today", vials: 10 }] };
  for (const data of [payload, { charts: payload }, { data: payload }, { data: { charts: payload } }]) {
    assert.equal(dashboardSeries(data, "inventoryOverTime")[0].value, 10);
  }
});
test("supports snake-case fields and valid numeric zero", () => {
  assert.equal(dashboardSeries({ therapeutic_stock: [{ drug: "Medicine", quantity: "0" }] }, "therapeuticStock")[0].value, 0);
});
test("empty data differs from missing or malformed data", () => {
  assert.equal(dashboardSeries({ inventoryOverTime: [] }, "inventoryOverTime").length, 0);
  assert.throws(() => dashboardSeries({ drugSplit: [{ drug: "Other", pct: 100 }] }, "inventoryOverTime"), /did not return inventoryOverTime/);
  assert.throws(() => dashboardSeries({ therapeuticStock: [{ drug: "Drug", qty: null }] }, "therapeuticStock"), /invalid row/);
  assert.throws(() => dashboardSeries({ inventoryOverTime: {} }, "inventoryOverTime"), /invalid inventoryOverTime/);
});

test("medicine shares retain separate unit denominators", () => {
  const rows = dashboardSeries({drugSplit: [
    {drug: "Drug A", unit: "box", pct: 100},
    {drug: "Drug A", unit: "vial", pct: 25},
    {drug: "Drug B", unit: "vial", pct: 75},
  ]}, "drugSplit");
  assert.equal(unitSeries(rows, "box").rows.length, 1);
  assert.equal(unitSeries(rows, "box").rows[0].value, 100);
  assert.equal(unitSeries(rows, "vial").rows.length, 2);
});

test("intake cohorts use quantitiesByUnit without converting packages", () => {
  const rows = dashboardSeries({inventoryOverTime: [
    {label: "Oct", vials: 3, quantitiesByUnit: {vial: 3, box: 10, unknown: 2}},
  ]}, "inventoryOverTime");
  assert.equal(unitSeries(rows, "box", true).rows[0].value, 10);
  assert.equal(unitSeries(rows, "vial", true).rows[0].value, 3);
  assert.equal(unitSeries(rows, "unknown", true).rows[0].value, 2);
});

test("box-only stock is visible without an initial vial selection", () => {
  const rows = dashboardSeries({inventoryOverTime: [{label: "Oct", vials: 0, quantitiesByUnit: {vial: 0, box: 10}}]}, "inventoryOverTime");
  const selected = unitSeries(rows, "vial", true);
  assert.equal(selected.selected, "box");
  assert.equal(selected.rows[0].value, 10);
});

test("delivered transfers display quantities even when delivery timing is unavailable", () => {
  const [row] = dashboardSeries({redistributionTimingAvailable: false, redistributionEfficiency: [{id: "transfer", label: "Delivery", quantity: 4, unit: "pack", days: null}]}, "redistributionEfficiency");
  assert.equal(row.value, 4);
  assert.equal(row.unit, "pack");
  assert.equal(row.id, "transfer");
});
