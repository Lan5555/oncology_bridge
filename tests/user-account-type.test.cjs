const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(name) {
  const scope = { exports: {}, require: () => load("accounts") };
  const source = fs.readFileSync(path.join(__dirname, `../src/app/lib/${name}.ts`), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  return scope.exports;
}
const { accountTypeChangePayload, accountTypeChangeConfirmed, canReclassifyUser } = load("user-account-type");

test("self-reclassification, administrator targets and incomplete identity stay read-only", () => {
  assert.equal(canReclassifyUser("actor", "actor", "ONCOLOGIST"), false);
  assert.equal(canReclassifyUser("", "target", "PHARMACIST"), false);
  assert.equal(canReclassifyUser("actor", "target", null), false);
  for (const role of ["ADMIN", "SUPERADMIN", "FACILITY_ADMIN", "Facility administrator", "Network admin"]) {
    assert.equal(canReclassifyUser("actor", "target", role), false);
  }
  assert.equal(canReclassifyUser("actor", "target", "ONCOLOGIST"), true);
  assert.equal(canReclassifyUser("actor", "target", "PHARMACIST"), true);
});

test("account-type choices select the profession-specific registry", () => {
  const { getAccountInfo } = load("accounts");
  assert.equal(getAccountInfo("DOCTOR").registry, "MDCN");
  assert.equal(getAccountInfo("PHARMACIST").registry, "PCN");
  assert.equal(getAccountInfo("PHARMACY_STORE").registry, "PCN_PREMISES");
});

test("contact-only editing omits account-type mutation fields", () => {
  assert.equal(Object.keys(accountTypeChangePayload("DOCTOR", "DOCTOR", "", false)).length, 0);
  assert.equal(Object.keys(accountTypeChangePayload(null, "", "", false)).length, 0);
});
test("professional changes require explicit authorization, a valid type and audit reason", () => {
  assert.throws(() => accountTypeChangePayload("DOCTOR", "PHARMACIST", "Correction", false), /permission/);
  for (const next of ["ADMIN", "SUPERADMIN", "", "UNKNOWN"]) {
    assert.throws(() => accountTypeChangePayload("DOCTOR", next, "Correction", true), /valid account type/);
  }
  for (const reason of ["", "   ", "a".repeat(1001)]) {
    assert.throws(() => accountTypeChangePayload("DOCTOR", "PHARMACIST", reason, true), /reason/);
  }
});
test("updates preserve the expected value for concurrency and trim the reason", () => {
  for (const next of ["DOCTOR", "PHARMACIST", "PHARMACY_STORE"]) {
    const payload = accountTypeChangePayload(null, next, "  Reviewed evidence  ", true);
    assert.equal(payload.account_type, next);
    assert.equal(payload.expected_account_type, null);
    assert.equal(payload.account_type_change_reason, "Reviewed evidence");
  }
  assert.equal(accountTypeChangePayload("DOCTOR", "PHARMACIST", "Correction", true).expected_account_type, "DOCTOR");
});
test("ignored or missing account-type updates never count as confirmed", () => {
  for (const data of [null, {}, "PHARMACIST", { account_type: "DOCTOR" }, { accountType: "PHARMACIST" }]) {
    assert.equal(accountTypeChangeConfirmed(data, "PHARMACIST"), false);
  }
  assert.equal(accountTypeChangeConfirmed({ account_type: "PHARMACIST" }, "PHARMACIST"), true);
});
