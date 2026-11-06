const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function setup({
  buyer = true,
  status = 200,
  data = { reference: "OB-test", status: "AWAITING_PAYMENT" },
} = {}) {
  const requests = [];
  const storage = new Map([
    ["adminSession", JSON.stringify({ token: "admin-token" })],
  ]);
  const session = new Map();
  if (buyer)
    storage.set("userSession", JSON.stringify({ token: "buyer-token" }));
  const cache = new Map();
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(__dirname, "..", relative);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    const scope = {
      exports: {},
      URL,
      URLSearchParams,
      encodeURIComponent,
      FormData,
      Event,
      process: { env: { NEXT_PUBLIC_BASE_URL: "https://backend.test" } },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        removeItem: (key) => storage.delete(key),
      },
      sessionStorage: { getItem: (key) => session.get(key) ?? null },
      window: { dispatchEvent() {} },
      fetch: async (url, options) => {
        requests.push({ url, ...options });
        return {
          status,
          ok: status < 400,
          text: async () => JSON.stringify(data),
        };
      },
      require(name) {
        const files = {
          "@/app/hooks/service/core-service":
            "src/app/hooks/service/core-service.ts",
          "@/app/services/api-routes": "src/app/services/api-routes.ts",
          "../api-routes": "src/app/services/api-routes.ts",
          "./net-response": "src/app/hooks/service/net-response.ts",
        };
        if (!files[name]) throw new Error(`Unexpected import ${name}`);
        return load(files[name]);
      },
    };
    vm.runInNewContext(code, scope, { filename });
    cache.set(relative, scope.exports);
    return scope.exports;
  }
  return { load, requests, session };
}

test("checkout defaults to Paystack and submits only allowed fields with the buyer token", async () => {
  const { load, requests } = setup();
  await load(
    "src/app/services/marketplace-service/marketplace-service.ts",
  ).MARKETPLACE_SERVICE.checkout("listing", 2, "", "attempt-key");
  assert.deepEqual(JSON.parse(requests[0].body), {
    listingId: "listing",
    quantity: 2,
    paymentProvider: "PAYSTACK",
  });
  assert.equal(requests[0].headers.Authorization, "Bearer buyer-token");
  assert.equal(requests[0].headers["Idempotency-Key"], "attempt-key");
});

test("Flutterwave retries retain the exact body and idempotency key", async () => {
  const { load, requests } = setup({ status: 502 });
  const service = load(
    "src/app/services/marketplace-service/marketplace-service.ts",
  ).MARKETPLACE_SERVICE;
  for (let i = 0; i < 2; i++)
    await service.checkout(
      "listing",
      2,
      "prescription",
      "same-key",
      "FLUTTERWAVE",
    );
  assert.equal(requests[0].body, requests[1].body);
  assert.deepEqual(JSON.parse(requests[0].body), {
    listingId: "listing",
    quantity: 2,
    prescriptionId: "prescription",
    paymentProvider: "FLUTTERWAVE",
  });
  assert.equal(requests[1].headers["Idempotency-Key"], "same-key");
});

test("marketplace checkout and invoice reads never use the administrator session", async () => {
  const { load, requests } = setup({ buyer: false });
  await load(
    "src/app/services/marketplace-service/marketplace-service.ts",
  ).MARKETPLACE_SERVICE.checkout("listing", 1, "", "key");
  await load(
    "src/app/services/invoice-service/invoice-service.ts",
  ).INVOICE_SERVICE.findForBuyer("OB-test");
  assert.ok(requests.every((request) => !request.headers.Authorization));
});

test("buyer invoice uses the path reference and accepts a direct response; legacy lookup stays public", async () => {
  const { load, requests } = setup();
  const service = load(
    "src/app/services/invoice-service/invoice-service.ts",
  ).INVOICE_SERVICE;
  const result = await service.findForBuyer("OB-test");
  assert.equal(result.data.reference, "OB-test");
  assert.equal(requests[0].headers.Authorization, "Bearer buyer-token");
  assert.ok(requests[0].url.endsWith("/api/invoices/OB-test"));
  await service.find("legacy/ref");
  assert.equal(requests[1].headers.Authorization, undefined);
  assert.ok(requests[1].url.endsWith("/api/invoices/legacy%2Fref"));
});

test("hosted URLs are HTTPS, credential-free, and matched to their exact provider host", () => {
  const { hostedPaymentUrl } = setup().load(
    "src/app/lib/marketplace-payment.ts",
  );
  assert.equal(
    hostedPaymentUrl(
      "https://checkout.flutterwave.com/v3/hosted/pay/example",
      "FLUTTERWAVE",
    ),
    "https://checkout.flutterwave.com/v3/hosted/pay/example",
  );
  assert.equal(
    hostedPaymentUrl("https://checkout.paystack.com/example", "PAYSTACK"),
    "https://checkout.paystack.com/example",
  );
  for (const url of [
    "http://checkout.flutterwave.com/pay",
    "https://checkout.flutterwave.com.evil.test/pay",
    "https://checkout.flutterwave.com@evil.test/pay",
    "https://user@checkout.flutterwave.com/pay",
    "https://checkout.flutterwave.com:8443/pay",
    "javascript:alert(1)",
    "https://checkout.paystack.com/pay",
  ])
    assert.equal(hostedPaymentUrl(url, "FLUTTERWAVE"), null);
  assert.equal(
    hostedPaymentUrl("https://checkout.flutterwave.com/pay", "PAYSTACK"),
    null,
  );
});

test("polling only continues for pending statuses; review and failure are terminal", () => {
  const { pendingInvoice } = setup().load("src/app/lib/marketplace-payment.ts");
  for (const status of [
    "INITIALIZING",
    "INITIALIZATION_UNKNOWN",
    "AWAITING_PAYMENT",
  ])
    assert.equal(pendingInvoice(status), true);
  for (const status of [
    "PAID",
    "PAID_REVIEW",
    "EXPIRED",
    "PAYMENT_FAILED",
    "unknown",
  ])
    assert.equal(pendingInvoice(status), false);
});

test("switching providers needs a known elapsed reservation; unknown expiry remains locked", () => {
  const { newCheckoutAllowed } = setup().load(
    "src/app/lib/marketplace-payment.ts",
  );
  const attempt = {
    key: "key",
    body: { listingId: "listing", quantity: 1, paymentProvider: "PAYSTACK" },
  };
  assert.equal(newCheckoutAllowed(attempt, 1000), false);
  assert.equal(
    newCheckoutAllowed({ ...attempt, expiresAt: "invalid" }, 1000),
    false,
  );
  assert.equal(
    newCheckoutAllowed(
      { ...attempt, expiresAt: new Date(2000).toISOString() },
      1000,
    ),
    false,
  );
  assert.equal(
    newCheckoutAllowed(
      { ...attempt, expiresAt: new Date(1000).toISOString() },
      1000,
    ),
    true,
  );
});

test("saved attempts recover their exact key and body and reject corrupt state", () => {
  const { load, session } = setup();
  const { CHECKOUT_ATTEMPT_STORAGE, readCheckoutAttempt } = load(
    "src/app/lib/marketplace-payment.ts",
  );
  const attempt = {
    key: "key",
    body: {
      listingId: "listing",
      quantity: 2,
      prescriptionId: "rx",
      paymentProvider: "FLUTTERWAVE",
    },
    invoiceReference: "OB-test",
    orderId: "order",
  };
  session.set(CHECKOUT_ATTEMPT_STORAGE, JSON.stringify(attempt));
  assert.equal(JSON.stringify(readCheckoutAttempt()), JSON.stringify(attempt));
  session.set(CHECKOUT_ATTEMPT_STORAGE, "{}");
  assert.throws(() => readCheckoutAttempt());
});

test("provider uncertainty and payment mismatch never recommend a new payment", () => {
  const { checkoutErrorMessage } = setup().load(
    "src/app/lib/marketplace-payment.ts",
  );
  assert.match(checkoutErrorMessage(502), /same attempt/);
  assert.match(checkoutErrorMessage(0), /same provider/);
  assert.match(
    checkoutErrorMessage(409, "PAYMENT_MISMATCH"),
    /Do not make another payment/,
  );
  assert.match(checkoutErrorMessage(403), /Access denied/);
});
