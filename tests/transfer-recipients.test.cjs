const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {} };
const source = fs.readFileSync(path.join(__dirname, "../src/app/lib/transfer-recipients.ts"), "utf8");
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, scope);
const { transferRecipients } = scope.exports;
const plain = (value) => JSON.parse(JSON.stringify(value));

test("recipient selection preserves backend IDs and recorded distances", () => {
  assert.deepEqual(plain(transferRecipients({ suggestions: [
    { facility: { id: "facility-a", name: "Recipient hospital", city: "Abuja" }, distanceKm: 12 },
    { facilityId: "facility-b", name: "Recipient pharmacy" },
  ] })), [
    { id: "facility-a", name: "Recipient hospital", city: "Abuja", distanceKm: 12 },
    { id: "facility-b", name: "Recipient pharmacy", city: null, distanceKm: null },
  ]);
});

test("missing recipient details fail instead of offering fabricated facilities", () => {
  for (const data of [null, {}, { suggestions: [{ id: "missing-name" }] }, [{ name: "Missing ID" }]]) {
    assert.throws(() => transferRecipients(data));
  }
  assert.deepEqual(plain(transferRecipients({ recipients: [] })), []);
});

test("duplicate facilities are collapsed and invalid distances are not invented", () => {
  const entries = transferRecipients([{ id: "a", name: "Facility", distanceKm: -1 }, { id: "a", name: "Facility" }]);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].distanceKm, null);
});
