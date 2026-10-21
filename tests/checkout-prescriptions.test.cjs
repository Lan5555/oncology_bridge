const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "../src/app/lib/checkout-prescriptions.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, scope);
const { checkoutPrescriptions, isPrescriptionUuid } = scope.exports;
const id = "d9428888-122b-41e1-b85c-61cd3cbb3210";
test("uses record UUIDs instead of display references", () => {
  assert.equal(isPrescriptionUuid("#0492"), false);
  const [option] = checkoutPrescriptions([{ id, display_id: "#0492", auth_status: "APPROVED" }]);
  assert.equal(option.id, id);
  assert.equal(option.label, "#0492");
  assert.equal(checkoutPrescriptions([{ id: "#0492", status: "APPROVED" }]).length, 0);
});
test("only offers approved authorization and excludes completed orders", () => {
  assert.equal(checkoutPrescriptions([{ id, auth_status: "Cleared" }]).length, 1);
  for (const auth_status of ["Pending", "API Routing", "Paid", "Rejected"]) {
    assert.equal(checkoutPrescriptions([{ id, auth_status }]).length, 0);
  }
  for (const order_stage of ["Dispensed", "Delivered", "Completed", "Cancelled"]) {
    assert.equal(checkoutPrescriptions([{ id, auth_status: "APPROVED", order_stage }]).length, 0);
  }
});
test("uses authorization status and matches explicit medicine IDs", () => {
  assert.equal(checkoutPrescriptions([{ id, auth_status: "Pending", status: "APPROVED" }]).length, 0);
  assert.equal(checkoutPrescriptions([{ id, auth_status: "APPROVED", drug_id: "other" }], "medicine").length, 0);
  assert.equal(checkoutPrescriptions([{ id, auth_status: "APPROVED", drug_id: "medicine" }], "medicine").length, 1);
});
