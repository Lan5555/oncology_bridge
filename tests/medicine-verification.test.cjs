const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function load(file, mocks = {}, globals = {}) {
  const scope = {
    exports: {},
    URL,
    FormData,
    Blob,
    ...globals,
    require: (name) => {
      if (name in mocks) return mocks[name];
      if (name.endsWith(".module.css"))
        return {
          __esModule: true,
          default: new Proxy({}, { get: (_, key) => String(key) }),
        };
      return require(name);
    },
  };
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      },
    ).outputText,
    scope,
  );
  return scope.exports;
}
const lib = load("src/app/lib/medicine-verification.ts");
const empty = { brandName: "", genericName: "", manufacturer: "" };

test("NAFDAC-only lookup submits optional packaging fields without inventing a barcode", () => {
  const body = lib.verificationRequest("", {
    nafdacNumber: " a4-1234 ",
    productName: " Tablets ",
    manufacturer: " Maker ",
    strength: " 10 mg ",
  });
  assert.deepEqual(JSON.parse(JSON.stringify(body)), {
    nafdacNumber: "A4-1234",
    productName: "Tablets",
    manufacturer: "Maker",
    strength: "10 mg",
  });
  const combined = lib.verificationRequest("12345678", {
    nafdacNumber: "A4-1234",
  });
  assert.equal(combined.gtin, "00000012345678");
  assert.equal(combined.nafdacNumber, "A4-1234");
  assert.throws(
    () => lib.verificationRequest("", { nafdacNumber: "x" }),
    /2–50/,
  );
  assert.throws(
    () =>
      lib.verificationRequest("", {
        nafdacNumber: "A4-1234",
        strength: "x".repeat(201),
      }),
    /200/,
  );
});

test("normalizes EAN/UPC to GTIN14 and sends exactly one identifier", () => {
  for (const gtin of [
    "12345678",
    "123456789012",
    "1234567890123",
    "12345678901234",
  ]) {
    const body = lib.verificationRequest(gtin, empty);
    assert.equal(body.gtin, gtin.padStart(14, "0"));
    assert.equal(Object.keys(body).join(), "gtin");
  }
});
test("preserves GS1 data including actual group separators and delegates validation", () => {
  const raw = "]d2010950600013435210LOT1\u001d21SERIAL1\u001d17271231";
  assert.equal(lib.verificationRequest(raw, empty).rawBarcode, raw);
  assert.equal(
    lib.verificationRequest("(01)09506000134352(17)271231", empty).rawBarcode,
    "(01)09506000134352(17)271231",
  );
  assert.throws(() => lib.verificationRequest("  ", empty), /barcode/);
});
test("optional packaging text is trimmed, bounded and never turns into name lookup", () => {
  const body = lib.verificationRequest("12345678", {
    ...empty,
    brandName: " Label ",
  });
  assert.equal(body.brandName, "Label");
  assert.equal(body.manufacturer, undefined);
  assert.throws(
    () =>
      lib.verificationRequest("12345678", {
        ...empty,
        genericName: "x".repeat(201),
      }),
    /200/,
  );
  assert.throws(
    () => lib.verificationRequest("", { ...empty, brandName: "Label" }),
    /barcode/,
  );
});
test("rejects empty, unsupported and excessive photos", () => {
  assert.equal(
    lib.validateVerificationImage(new Blob(["photo"], { type: "image/png" })),
    null,
  );
  assert.match(
    lib.validateVerificationImage(new Blob([], { type: "image/jpeg" })),
    /empty/,
  );
  assert.match(
    lib.validateVerificationImage(new Blob(["photo"], { type: "image/webp" })),
    /JPEG or PNG/,
  );
  assert.match(
    lib.validateVerificationImage({
      type: "image/jpeg",
      size: 10 * 1024 * 1024 + 1,
    }),
    /10 MB/,
  );
});
test("verification service uses user authentication and multipart image only", async () => {
  const calls = [];
  class CoreService {
    async send(...args) {
      calls.push(args);
      return {};
    }
  }
  const { SCAN_SERVICE } = load(
    "src/app/services/scan-service/scan-service.ts",
    {
      "@/app/hooks/service/core-service": { CoreService },
      "@/app/lib/medicine-verification": lib,
      "../api-routes": {
        Routes: {
          SCANS_VERIFY: "/api/scans/verify",
          SCANS_VERIFY_IMAGE: "/api/scans/verify-image",
        },
      },
    },
  );
  const body = lib.verificationRequest("12345678", empty);
  await SCAN_SERVICE.verify(body);
  await SCAN_SERVICE.verifyImage(new Blob(["photo"], { type: "image/png" }));
  assert.equal(calls[0][0], "/api/scans/verify");
  assert.equal(calls[0][1], body);
  assert.equal(calls[0][2].facilityOnly, true);
  assert.equal(calls[0][2].timeoutMs, 110000);
  assert.equal(calls[0][2].retryAuth, false);
  assert.equal(calls[1][0], "/api/scans/verify-image");
  assert.deepEqual([...calls[1][1].keys()], ["image"]);
  assert.equal(calls[1][1].get("image").name, "medicine.png");
  assert.equal(calls[1][2].facilityOnly, true);
  assert.equal(calls[1][2].timeoutMs, 110000);
  assert.equal(calls[1][2].retryAuth, false);
  await SCAN_SERVICE.verifyImage(new Blob(["photo"], { type: "image/jpeg" }), {
    nafdacNumber: "A4-1234",
  });
  assert.equal(calls[2][1].get("nafdacNumber"), "A4-1234");
  assert.deepEqual([...calls[2][1].keys()], ["image", "nafdacNumber"]);
});
test("error states cover authentication, restrictions, decoding, throttling and outages", () => {
  for (const status of [400, 401, 403, 413, 422, 429, 0, 503])
    assert.ok(lib.verificationError(status).length > 20);
  assert.match(lib.verificationError(429), /Wait a minute/);
  assert.match(lib.verificationError(403), /administrator/);
});
test("official links reject untrusted domains and credentials", () => {
  assert.ok(
    lib.officialSourceUrl("https://api.fda.gov/drug/label.json?search=example"),
  );
  for (const value of [
    null,
    "javascript:alert(1)",
    "https://api.fda.gov.evil.test/",
    "https://api.fda.gov/?api_key=secret",
    "https://user:password@api.fda.gov/",
  ])
    assert.equal(lib.officialSourceUrl(value), null);
});

const registrationComponent = load(
  "src/app/components/RegistrationVerificationResult.tsx",
  { "@/app/lib/medicine-verification": lib },
);
const { default: Result } = load(
  "src/app/components/MedicineVerificationResult.tsx",
  {
    "@/app/lib/medicine-verification": lib,
    "./RegistrationVerificationResult": registrationComponent,
  },
);
function assessment(overrides = {}) {
  return {
    identifiers: {
      gtin: "09506000134352",
      lot: "LOT1",
      serial: null,
      expiry: null,
    },
    checkedAt: "2026-11-06T12:00:00Z",
    validation: {
      status: "WARNING",
      scope: "PRODUCT_RECORD_CHECK",
      reason: "Review the evidence.",
      reasons: [],
    },
    authenticity: {
      status: "UNVERIFIED",
      provider: null,
      reason: "No pack authentication provider.",
    },
    productLookup: {
      status: "FOUND",
      source: "OPENFDA_DRUG_LABEL",
      market: "US",
      official: null,
      sourceUrl: null,
      labelEffectiveTime: null,
      labelId: null,
    },
    comparisons: [],
    expiry: {
      status: "UNKNOWN",
      source: "BARCODE",
      verifiedByManufacturer: false,
    },
    recall: { status: "NOT_CHECKED" },
    guidance: "Review the evidence.",
    ...overrides,
  };
}
const render = (data, photoResult = false) =>
  renderToStaticMarkup(
    React.createElement(Result, {
      assessment: data,
      photoResult,
      onRetry() {},
    }),
  );
test("only the backend VALID status produces the green product record badge", () => {
  const html = render(
    assessment({
      validation: {
        status: "VALID",
        scope: "PRODUCT_RECORD_CHECK",
        reason: "Both source records match.",
        reasons: [],
      },
      comparisons: [],
    }),
  );
  assert.match(html, /Product record check/);
  assert.match(html, /class="validBadge">Product records match/);
  assert.match(html, /Both source records match/);
  assert.match(html, /Physical-pack authenticity unverified/);
  assert.doesNotMatch(html, /Verification needs review/);

  const warning = render(
    assessment({
      comparisons: Object.keys(empty).map((field) => ({
        field,
        observed: "Label",
        expected: ["Label"],
        status: "MATCH",
      })),
    }),
  );
  assert.match(warning, /class="reviewBadge">Verification needs review/);
  assert.doesNotMatch(warning, /Product records match/);
});
test("every backend reason is displayed with its code and pack expiry is prominent", () => {
  const reasons = [
    {
      code: "NAFDAC_UNAVAILABLE",
      message: "Registration service unavailable.",
    },
    { code: "CROSS_SOURCE_PRODUCT_MISMATCH", message: "Product names differ." },
    { code: "NAFDAC_DATA_QUALITY", message: "Review source quality." },
    {
      code: "PACK_EXPIRED",
      message: "The encoded pack expiry date has passed.",
    },
  ];
  const html = render(
    assessment({
      validation: {
        status: "WARNING",
        reason: "Review all evidence.",
        reasons,
      },
    }),
  );
  assert.match(html, /Review all evidence/);
  for (const { code, message } of reasons) {
    assert.ok(html.includes(message));
    assert.ok(html.includes(`data-reason-code="${code}"`));
  }
  assert.match(html, /class="expiredWarning" role="alert"/);
  assert.match(html, /Pack expired — do not use/);
  assert.doesNotMatch(html, /Product records match/);
});
test("missing combined validation never implies a passed check", () => {
  const html = render(assessment({ validation: undefined }));
  assert.match(html, /No pass can be established/);
  assert.doesNotMatch(html, /Product records match/);
});
test("cross-source comparisons use backend Greenbook and openFDA values and source links", () => {
  const html = render(
    assessment({
      productLookup: {
        ...assessment().productLookup,
        sourceUrl: "https://api.fda.gov/drug/label.json?search=example",
        official: {
          brandNames: ["US tablets"],
          manufacturers: ["US manufacturer"],
        },
      },
      registrationLookup: registration({
        crossSourceComparisons: [
          {
            field: "productName",
            observed: "Example tablets",
            expected: ["US tablets"],
            status: "MISMATCH",
          },
          {
            field: "manufacturer",
            observed: "Example manufacturer",
            expected: ["US manufacturer"],
            status: "MATCH",
          },
        ],
      }),
    }),
  );
  for (const text of [
    "Source record comparisons",
    "NAFDAC Greenbook: Example tablets",
    "openFDA: US tablets",
    "NAFDAC Greenbook: Example manufacturer",
    "openFDA: US manufacturer",
    "Mismatch",
    "Match",
  ])
    assert.ok(html.includes(text), text);
  assert.match(
    html,
    /href="https:\/\/greenbook.nafdac.gov.ng\/products\/details\/1"/,
  );
  assert.match(
    html,
    /href="https:\/\/api.fda.gov\/drug\/label.json\?search=example"/,
  );
});
test("complete text match still says pack authenticity unverified", () => {
  const html = render(
    assessment({
      comparisons: Object.keys(empty).map((field) => ({
        field,
        observed: "Label",
        expected: ["Label"],
        status: "MATCH",
      })),
    }),
  );
  assert.match(html, /Physical-pack authenticity unverified/);
  assert.match(html, /Recall status: not checked/);
  assert.doesNotMatch(html, /Original|Genuine|FDA approved/);
});
test("expired dates and packaging mismatches require visible review warnings", () => {
  const html = render(
    assessment({
      expiry: { status: "EXPIRED" },
      comparisons: [
        {
          field: "brandName",
          status: "MISMATCH",
          observed: "Other",
          expected: ["Label"],
        },
      ],
    }),
  );
  assert.match(html, /Pack expired — do not use/);
  assert.match(html, /Packaging mismatch/);
  assert.match(html, /role="alert"/);
  assert.match(html, /Mismatch/);
});
test("missing, ambiguous and unavailable records do not claim authentication", () => {
  for (const status of ["NOT_FOUND", "AMBIGUOUS", "UNAVAILABLE"]) {
    const html = render(
      assessment({ productLookup: { status, official: null } }),
    );
    assert.match(html, /Unverified/);
    if (status === "NOT_FOUND")
      assert.match(html, /not evidence that the medicine is fake/);
    if (status === "UNAVAILABLE") assert.match(html, /Retry official lookup/);
  }
});
test("photo results retain pack identifiers and explain manual comparison", () => {
  const html = render(assessment(), true);
  assert.match(html, /LOT1/);
  assert.match(html, /Photo checks compare any packaging text supplied/);
  assert.match(html, /Unknown/);
});
test("verification page cannot submit inventory or replay an old offline stock queue", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/app/pages/dashboard/ScanPage.tsx"),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /SCAN_SERVICE\.(create|decode|batch|lookup|recent)|localStorage|pendingGs1Scans|gs1Verified/,
  );
});
test("verified clinical users can check medicines without inventory permission", () => {
  const accounts = load("src/app/lib/accounts.ts");
  for (const type of ["DOCTOR", "PHARMACIST", "PHARMACY_STORE"])
    assert.ok(
      accounts.allowedPages(type, "VERIFIED", [], []).includes("pg-scan"),
    );
  assert.ok(
    !accounts.allowedPages("DOCTOR", "PENDING", [], []).includes("pg-scan"),
  );
});

function registration(overrides = {}) {
  return {
    status: "FOUND",
    reason: null,
    registrationNumber: "A4-1234",
    retrievedAt: "2026-11-06T12:00:00Z",
    source: "NAFDAC_GREENBOOK_VIA_APIFY",
    officialApi: false,
    completeness: "NOT_GUARANTEED",
    barcodeLink: "NOT_ESTABLISHED",
    comparisons: [],
    records: [
      {
        productId: 1,
        registrationNumber: "A4-1234",
        productName: "Example tablets",
        manufacturer: "Example manufacturer",
        strength: "10 mg",
        status: "Active",
        activeIngredients: ["Example ingredient"],
        registrationExpiresAt: "2027-12-31",
        fetchedAt: "2026-11-06T12:00:00Z",
        sourceUrl: "https://greenbook.nafdac.gov.ng/products/details/1",
      },
    ],
    ...overrides,
  };
}
test("NAFDAC-only results render Nigerian evidence and distinguish it from pack authenticity", () => {
  const html = render(
    assessment({
      identifiers: { gtin: null },
      productLookup: { status: "NOT_REQUESTED" },
      registrationLookup: registration(),
    }),
  );
  for (const text of [
    "Example tablets",
    "Example manufacturer",
    "10 mg",
    "A4-1234",
    "US label lookup not requested",
    "Pack authenticity unverified",
    "not an official API",
    "not established",
    "not pack expiry",
  ])
    assert.ok(html.includes(text), text);
});
test("all ambiguous records render without selecting one or inferring comparisons", () => {
  const first = registration().records[0];
  const html = render(
    assessment({
      registrationLookup: registration({
        status: "AMBIGUOUS",
        records: [
          first,
          { ...first, productId: 2, productName: "Another product" },
        ],
      }),
    }),
  );
  assert.match(html, /Multiple Nigerian registration matches/);
  assert.match(html, /Example tablets/);
  assert.match(html, /Another product/);
  assert.match(html, /no unique registration record/);
  assert.match(html, /Pack authenticity unverified/);
});
test("registration comparisons use backend scalar expected values and all comparison statuses", () => {
  for (const [status, text] of Object.entries(lib.COMPARISON_STATUS_LABELS)) {
    const html = render(
      assessment({
        registrationLookup: registration({
          comparisons: [
            { field: "strength", status, observed: "20 mg", expected: "10 mg" },
          ],
        }),
      }),
    );
    assert.match(html, /On pack: 20 mg/);
    assert.match(html, /Registration record: 10 mg/);
    assert.ok(html.includes(text));
    if (status === "MISMATCH") assert.match(html, /Packaging mismatch/);
  }
});
test("registration no-match, unavailable and configuration states stay explicit", () => {
  for (const status of [
    "NO_EXACT_MATCH",
    "UNAVAILABLE",
    "NOT_CONFIGURED",
    "NOT_PROVIDED",
  ]) {
    const html = render(
      assessment({
        registrationLookup: registration({
          status,
          records: [],
          reason: "Provider reason",
        }),
      }),
    );
    assert.match(html, /Provider reason/);
    assert.match(html, /Pack authenticity unverified/);
    if (status === "NO_EXACT_MATCH")
      assert.match(html, /does not prove the medicine is fake/);
    if (status === "UNAVAILABLE")
      assert.match(html, /Retry registration check/);
  }
});
test("inactive and expired registrations require review without confusing registration expiry and pack expiry", () => {
  const record = registration().records[0];
  for (const row of [
    { ...record, status: "Inactive" },
    { ...record, registrationExpiresAt: "2025-01-01" },
  ]) {
    const html = render(
      assessment({ registrationLookup: registration({ records: [row] }) }),
    );
    assert.match(html, /confirm the current regulatory status/);
    assert.match(html, /not pack expiry/);
    assert.match(html, /Pack authenticity unverified/);
  }
});

function timedClient(fetch) {
  let timer,
    delay,
    cleared = false;
  const net = load("src/app/hooks/service/net-response.ts");
  const { CoreService } = load(
    "src/app/hooks/service/core-service.ts",
    {
      "@/app/services/api-routes": { Routes: { REFRESH: "/refresh" } },
      "./net-response": net,
    },
    {
      process: { env: { NEXT_PUBLIC_BASE_URL: "https://backend.test" } },
      AbortController,
      fetch,
      window: { dispatchEvent() {} },
      Event,
      localStorage: {
        getItem(key) {
          return key === "userSession"
            ? JSON.stringify({
                token: "test-token",
                refreshToken: "test-refresh",
              })
            : null;
        },
      },
      setTimeout(fn, ms) {
        timer = fn;
        delay = ms;
        return 1;
      },
      clearTimeout() {
        cleared = true;
      },
    },
  );
  return {
    client: new CoreService(),
    fire: () => timer(),
    delay: () => delay,
    cleared: () => cleared,
  };
}
test("110-second request timeout aborts exactly once and never retries", async () => {
  let count = 0,
    settled = false;
  const harness = timedClient((_url, options) => {
    count++;
    return new Promise((_resolve, reject) =>
      options.signal.addEventListener("abort", () =>
        reject(new Error("Aborted")),
      ),
    );
  });
  const pending = harness.client
    .send(
      "/api/scans/verify",
      { nafdacNumber: "A4-1234" },
      { timeoutMs: lib.VERIFICATION_TIMEOUT_MS, retryAuth: false },
    )
    .then((result) => {
      settled = true;
      return result;
    });
  await Promise.resolve();
  assert.equal(harness.delay(), 110000);
  assert.equal(settled, false);
  harness.fire();
  const response = await pending;
  assert.equal(response.status, 408);
  assert.equal(count, 1);
  assert.equal(harness.cleared(), true);
  assert.match(
    lib.verificationError(response.status),
    /not been retried automatically/,
  );
});
test("verification authentication failures do not refresh a token or replay the request", async () => {
  const calls = [];
  const harness = timedClient(async (url) => {
    calls.push(url);
    return {
      status: 401,
      ok: false,
      text: async () =>
        JSON.stringify({ success: false, message: "Expired token" }),
    };
  });
  const response = await harness.client.send(
    "/api/scans/verify",
    { nafdacNumber: "A4-1234" },
    { timeoutMs: lib.VERIFICATION_TIMEOUT_MS, retryAuth: false },
  );
  assert.equal(response.status, 401);
  assert.equal(calls.length, 1);
  assert.ok(!calls.some((url) => url.endsWith("/refresh")));
  assert.equal(harness.cleared(), true);
});
