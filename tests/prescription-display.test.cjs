const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/lib/prescription-display.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, scope);
const { prescriptionDisplayRow } = scope.exports;
const { prescriptionLocalTime } = scope.exports;

test("saved descriptions preserve multiple lines and null stays missing", () => {
  assert.equal(prescriptionDisplayRow({ description: "First line\nSecond line" }).description, "First line\nSecond line");
  assert.equal(prescriptionDisplayRow({ description: null }).description, null);
  assert.equal(prescriptionDisplayRow({ description: "   " }).description, null);
});

test("preserves creation author and timestamp without substituting a patient or facility name", () => {
  const created_at = "2026-10-23T10:15:00Z";
  const row = prescriptionDisplayRow({ prescriber: { name: "Dr Example" }, created_at, patient_ref: "CARE-042" });
  assert.equal(row.createdBy, "Dr Example");
  assert.equal(row.createdAt, created_at);
  const older = prescriptionDisplayRow({ patient_name: "Do not use", facility: { name: "Do not use" } });
  assert.equal(older.createdBy, "Not provided");
  assert.equal(older.createdAt, null);
});

test("creation times convert equivalent timezone-qualified instants to the same local display", () => {
  assert.equal(prescriptionLocalTime("2026-10-23T10:15:00Z"), prescriptionLocalTime("2026-10-23T11:15:00+01:00"));
  for (const invalid of [null, undefined, "", "invalid"]) assert.equal(prescriptionLocalTime(invalid), "Not provided");
});

test("renders the saved pharmacy name and insurer without rendering an object", () => {
  const row = prescriptionDisplayRow({ id: "internal-id", patient_ref: "CARE-042", icd10: "E11.9", insurer: "Saved insurer", pharmacy: { id: "selected-pharmacy", name: "Chosen Pharmacy", city: "Lagos", state: "Lagos", status: "ACTIVE" }, pharmacy_name: "Fallback name", facility: { name: "Different facility" }, auth_status: "Pending", order_stage: "Waiting" });
  assert.equal(row.pharmacy, "Chosen Pharmacy");
  assert.equal(row.insurer, "Saved insurer");
  assert.equal(row.patientRef, "CARE-042");
  assert.equal(row.id, "internal-id");
  assert.equal(row.status, "Pending");
  assert.equal(row.order, "Waiting");
});

test("falls back to pharmacy_name and never substitutes an unrelated facility", () => {
  assert.equal(prescriptionDisplayRow({ pharmacy: { id: "selected" }, pharmacy_name: "Saved display name", facility: { name: "Other facility" } }).pharmacy, "Saved display name");
  assert.equal(prescriptionDisplayRow({ facility: { name: "Other facility" } }).pharmacy, "Not provided");
});

test("patient reference never falls back to internal IDs or patient names", () => {
  const row = prescriptionDisplayRow({ id: "internal-id", display_id: "display-id", patient_name: "Patient name" });
  assert.equal(row.patientRef, "Not provided");
});

test("authorization and dispensing statuses use exact fields without assuming approval or purchase", () => {
  const row = prescriptionDisplayRow({ status: "PAID", order: "DELIVERED", auth_status: "Pending", order_stage: "Waiting" });
  assert.equal(row.status, "Pending");
  assert.equal(row.order, "Waiting");
  const missing = prescriptionDisplayRow({ status: "APPROVED", order: "PAID" });
  assert.equal(missing.status, "Not provided");
  assert.equal(missing.order, "Not provided");
});
