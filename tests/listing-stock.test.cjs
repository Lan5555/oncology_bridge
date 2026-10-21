const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {}, require: (name) => {
  if (name !== "./medicine-availability") throw new Error(`Unexpected import: ${name}`);
  const dependency = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/lib/medicine-availability.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, dependency);
  return dependency.exports;
} };
const source = fs.readFileSync(path.join(__dirname, "../src/app/lib/listing-stock.ts"), "utf8");
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, scope);
const { listingStock } = scope.exports;
const { inventoryBatchRows, unavailableStockMessage } = scope.exports;
const now = Date.parse("2026-10-21T12:00:00Z");
const batch = { id: "batch-1", drug: "Test medicine", lot: "LOT-1", qty: 10, expiry: "2027-12-31", status: "Available" };

test("uses inventory ID and linked medicine details", () => {
  const [stock] = listingStock([{ ...batch, medicine: { generic_name: "Drug", brand_name: "Brand", strength: "10 mg" } }], now);
  assert.equal(stock.id, "batch-1");
  assert.equal(stock.name, "Drug · Brand · 10 mg");
  assert.equal(stock.batch, "LOT-1");
});

test("uses unreserved availability ahead of total quantity", () => {
  assert.equal(listingStock([{ ...batch, availableQuantity: 3 }], now)[0].quantity, 3);
  assert.equal(listingStock([{ ...batch, availableQuantity: 0 }], now).length, 0);
});

test("rejects missing, invalid, and expired dates", () => {
  for (const expiry of [undefined, "invalid", "2026-01-01"]) {
    assert.equal(listingStock([{ ...batch, expiry }], now).length, 0);
  }
});

test("rejects unavailable quantities", () => {
  for (const qty of [0, -1, 1.5, Number.NaN, Infinity]) {
    assert.equal(listingStock([{ ...batch, qty }], now).length, 0);
  }
});

test("excludes blocked stock but keeps eligible near-expiry batches", () => {
  for (const status of ["Quarantined", "Expired", "Recalled", "Disposed", "Suspended"]) {
    assert.equal(listingStock([{ ...batch, status }], now).length, 0);
  }
  assert.equal(listingStock([{ ...batch, status: "Near Expiry" }], now).length, 1);
});

test("supports legacy batch fields and preserves distinct batch IDs", () => {
  const result = listingStock([
    batch,
    { id: 2, quantity: 5, expiry_date: "2027-01-01", batchNumber: "LOT-2" },
  ], now);
  assert.equal(result.length, 2);
  assert.equal(result[1].id, "2");
  assert.equal(result[1].batch, "LOT-2");
});

test("preserves each batch's selling unit rather than defaulting to vial", () => {
  assert.equal(listingStock([{ ...batch, unit: "box" }], now)[0].unit, "box");
  assert.equal(listingStock([{ ...batch, selling_unit: " PACK " }], now)[0].unit, "pack");
  assert.equal(listingStock([{ ...batch, sellingUnit: "bottle", unit: "vial" }], now)[0].unit, "bottle");
});

test("missing and unsupported units remain unconfigured", () => {
  assert.equal(listingStock([batch], now)[0].unit, null);
  assert.equal(listingStock([{ ...batch, unit: "tablet" }], now)[0].unit, null);
});

test("excludes stock linked to a removed medicine", () => {
  for (const medicine of [{ deleted_at: "2026-10-21" }, { deletedAt: "2026-10-21" }, { active: false }, { is_deleted: true }, { status: "DELETED" }]) {
    assert.equal(listingStock([{ ...batch, medicine }], now).length, 0);
  }
  assert.equal(listingStock([{ ...batch, medicine_deleted: true }], now).length, 0);
  assert.equal(listingStock([{ ...batch, medicine_active: false }], now).length, 0);
});

test("does not infer deletion from missing optional medicine metadata", () => {
  assert.equal(listingStock([{ ...batch, medicine: { active: true, deleted_at: null } }], now).length, 1);
  assert.equal(listingStock([batch], now).length, 1);
});

test("reads camelCase expiry and snake_case availability from inventory", () => {
  const result = listingStock([{ id: "new-batch", available_quantity: 8, expiresOn: "2027-12-31", batch_number: "NEW-1", unit: "box" }], now);
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 8);
  assert.equal(result[0].batch, "NEW-1");
  for (const field of ["expiryDate", "expires_on"]) {
    assert.equal(listingStock([{ id: "batch", qty: 1, [field]: "2027-12-31" }], now).length, 1);
  }
});

test("zero unreserved stock is not replaced with total quantity", () => {
  assert.equal(listingStock([{ ...batch, available_quantity: 0, quantity: 10 }], now).length, 0);
});

test("extracts nested inventory envelopes without selecting unrelated arrays", () => {
  assert.equal(inventoryBatchRows({ warnings: ["notice"], data: { items: [batch] } })[0].id, batch.id);
  assert.equal(inventoryBatchRows({ data: { inventory_items: [batch] } }).length, 1);
  assert.equal(inventoryBatchRows({ warnings: ["notice"] }).length, 0);
});

test("explains why returned inventory is unavailable instead of saying no stock exists", () => {
  const message = unavailableStockMessage([{ ...batch, expiry: "invalid" }, { ...batch, qty: 0 }], now);
  assert.match(message, /returned 2/);
  assert.match(message, /1 with a missing, invalid, or past expiry date/);
  assert.match(message, /1 without a positive whole-number/);
});

test("copies medicine storage requirements exactly without substituting temperature readings", () => {
  const value = "Store at 2–8°C. Do not freeze.";
  assert.equal(listingStock([{ ...batch, medicine: { storage_temperature: value } }], now)[0].storage, value);
  assert.equal(listingStock([{ ...batch, medicine: { storageTemperature: value } }], now)[0].storage, value);
  assert.equal(listingStock([batch], now)[0].storage, null);
  assert.equal(listingStock([{ ...batch, medicine: { storage_temperature: "  " } }], now)[0].storage, null);
});
