const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");

function load(file, mocks = {}) {
  const scope = { exports: {}, require: (name) => name in mocks ? mocks[name] : require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, scope);
  return scope.exports;
}
const lib = load("src/app/lib/manifest-entry.ts");
const pack = { gtin: "09506000134352", lot: "Batch-A", serial: "000Abc", expiry: "2027-12-31" };
const header = "Barcode (GTIN),Batch number,Serial number,Expiry date\r\n";
const line = "09506000134352,Batch-A,000Abc,2027-12-31";

test("CSV preserves leading zeros, letter case and reordered quoted headers", () => {
  const rows = lib.parseManifestCsv(`\uFEFF"Serial number","Expiry date","Barcode (GTIN)","Batch number"\r\n"000Abc",2027-12-31,09506000134352,Batch-A\r\n`);
  assert.equal(JSON.stringify(rows), JSON.stringify([pack]));
  assert.equal(JSON.stringify(lib.validateManifestInput(" Delivery 1 ", rows)), JSON.stringify({ reference: "Delivery 1", packs: [pack] }));
});

test("CSV quoted delimiters and escaped quotes are parsed without splitting identifiers", () => {
  const rows = lib.parseManifestCsv(`${header}09506000134352,"Batch,A","Serial""A",2027-12-31`);
  assert.equal(rows[0].lot, "Batch,A");
  assert.equal(rows[0].serial, 'Serial"A');
});

test("CSV rejects malformed, missing, extra or ambiguous columns and unfinished quotes", () => {
  for (const source of ["gtin,lot,expiry\na,b,c", "gtin,lot,serial,serial\na,b,c,d", `${header}${line},extra`, `${header}"unfinished`, "gtin,lot,serial,expiry,quantity\na,b,c,d,2"]) {
    assert.throws(() => lib.parseManifestCsv(source));
  }
  assert.throws(() => lib.parseManifestCsv(lib.MANIFEST_CSV_TEMPLATE), /between 1 and 1,000/);
});

test("pack validation rejects altered barcodes, impossible dates, duplicate packs and batch-only records", () => {
  for (const patch of [{ gtin: "9506000134352" }, { gtin: "09506000134353" }, { gtin: "9.506e12" }, { expiry: "2027-02-29" }, { expiry: "03/04/27" }, { serial: "" }, { lot: "Batch A" }]) {
    assert.throws(() => lib.validateManifestInput("Delivery", [{ ...pack, ...patch }]));
  }
  assert.throws(() => lib.validateManifestInput("Delivery", [pack, pack]), /repeated pack/);
  assert.throws(() => lib.validateManifestInput("", [pack]), /delivery reference/);
  assert.throws(() => lib.validateManifestInput("Delivery", Array(1001).fill(pack)), /1,000/);
  assert.equal(lib.validateManifestInput("Delivery", [{ ...pack, expiry: "2028-02-29" }]).packs.length, 1);
});

test("delivery form uses pharmacy-facing fields and spreadsheet import with no JSON authoring", () => {
  const { default: Form } = load("src/app/components/pharmacy/ManifestEntryForm.tsx", {
    "@/app/lib/manifest-entry": lib,
    "@/app/pages/dashboard/ScanPage.module.css": { default: {} },
  });
  const html = renderToStaticMarkup(React.createElement(Form, { busy: false, onSave: async () => false }));
  for (const label of ["Delivery reference", "Barcode number (GTIN)", "Batch number", "Serial number", "Expiry date", "Add another pack", "Save delivery list", "Download blank template"]) assert.ok(html.includes(label));
  assert.match(html, /type="date"/);
  assert.match(html, /accept=".csv,text\/csv"/);
  assert.doesNotMatch(html, /JSON|packs array|facility ID/);
});
