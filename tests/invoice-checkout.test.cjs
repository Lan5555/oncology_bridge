const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

// Exercise the client effect with controlled session, visibility, and timer APIs.
function mount({ buyer = true, responses, saved = null } = {}) {
  const state = [];
  const hooks = [];
  const effects = [];
  const timers = new Map();
  const listeners = new Map();
  const calls = [];
  const storage = new Map(
    saved ? [["marketplaceCheckoutAttempt", JSON.stringify(saved)]] : [],
  );
  let slot = 0;
  let timerId = 0;
  const document = {
    visibilityState: "visible",
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  const react = {
    useState(initial) {
      const index = slot++;
      if (!(index in state))
        state[index] = typeof initial === "function" ? initial() : initial;
      return [
        state[index],
        (value) => {
          state[index] =
            typeof value === "function" ? value(state[index]) : value;
        },
      ];
    },
    useEffect(fn, deps) {
      const index = slot++;
      const previous = hooks[index];
      if (
        !previous ||
        deps.some((value, i) => !Object.is(value, previous.deps[i]))
      ) {
        previous?.cleanup?.();
        const entry = { deps };
        hooks[index] = entry;
        effects.push(() => {
          entry.cleanup = fn();
        });
      }
    },
  };
  const invoiceService = {
    findForBuyer: async (reference) => read("buyer", reference),
    find: async (reference) => read("public", reference),
  };
  function read(mode, reference) {
    calls.push({ mode, reference });
    return responses[Math.min(calls.length - 1, responses.length - 1)];
  }
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const scope = {
      exports: {},
      URL,
      Intl,
      Date,
      document,
      localStorage: {
        getItem: () =>
          buyer ? JSON.stringify({ token: "buyer-token" }) : null,
      },
      sessionStorage: {
        getItem: (key) => storage.get(key) ?? null,
        removeItem: (key) => storage.delete(key),
      },
      setTimeout: (fn, delay) => {
        const id = ++timerId;
        timers.set(id, { fn, delay });
        return id;
      },
      clearTimeout: (id) => timers.delete(id),
      window: { setInterval: () => 1, clearInterval() {} },
      require(name) {
        if (name === "react") return react;
        if (name === "react/jsx-runtime")
          return {
            jsx: (type, props) => ({ type, props }),
            jsxs: (type, props) => ({ type, props }),
            Fragment: "fragment",
          };
        if (name === "next/link") return { default: "link" };
        if (name.endsWith("/BrandLogo")) return { default: "logo" };
        if (name.endsWith("/InvoicePayment"))
          return { default: "legacy-payment" };
        if (name.endsWith("/invoice-service/invoice-service"))
          return { INVOICE_SERVICE: invoiceService };
        if (name === "@/app/lib/marketplace-payment")
          return load("src/app/lib/marketplace-payment.ts");
        throw new Error(`Unexpected import ${name}`);
      },
    };
    const code = ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText;
    vm.runInNewContext(code, scope);
    cache.set(file, scope.exports);
    return scope.exports;
  }
  const Component = load("src/app/components/InvoiceCheckout.tsx").default;
  let tree;
  function render() {
    slot = 0;
    tree = Component({ reference: "OB-test" });
    while (effects.length) effects.shift()();
    return tree;
  }
  render();
  return {
    calls,
    timers,
    storage,
    async settle() {
      await new Promise(setImmediate);
      render();
    },
    async tick() {
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      await timer.fn();
      await this.settle();
    },
    visibility(value) {
      document.visibilityState = value;
      listeners.get("visibilitychange")?.();
    },
    text() {
      const content = (node) =>
        typeof node === "string"
          ? node
          : Array.isArray(node)
            ? node.map(content).join("")
            : node?.props
              ? content(node.props.children)
              : "";
      return JSON.stringify(tree) + "\n" + content(tree);
    },
    unmount() {
      for (const hook of hooks) hook?.cleanup?.();
    },
  };
}

const invoice = (status) => ({
  success: true,
  status: 200,
  data: {
    reference: "OB-test",
    status,
    paymentProvider: "FLUTTERWAVE",
    items: [{ description: "Medicine", quantity: 1, unitPriceNaira: 20 }],
    totalNaira: 20,
    paymentMethods: ["Debit card"],
    authorizationUrl: "https://checkout.flutterwave.com/v3/hosted/pay/test",
  },
});

test("invoice return authenticates the path reference and polls with increasing delay", async () => {
  const page = mount({
    responses: [
      invoice("INITIALIZING"),
      invoice("INITIALIZATION_UNKNOWN"),
      invoice("PAID"),
    ],
  });
  await page.settle();
  assert.deepEqual(page.calls, [{ mode: "buyer", reference: "OB-test" }]);
  assert.equal([...page.timers.values()][0].delay, 3000);
  await page.tick();
  assert.equal([...page.timers.values()][0].delay, 4500);
  await page.tick();
  assert.match(page.text(), /Payment confirmed/);
  assert.equal(page.timers.size, 0);
  assert.doesNotMatch(page.text(), /Continue to Flutterwave/);
  page.unmount();
});

test("hidden pages pause polling and visible pages recheck", async () => {
  const page = mount({ responses: [invoice("AWAITING_PAYMENT")] });
  await page.settle();
  assert.equal(page.timers.size, 1);
  page.visibility("hidden");
  assert.equal(page.timers.size, 0);
  page.visibility("visible");
  await page.settle();
  assert.equal(page.calls.length, 2);
  assert.equal(page.timers.size, 1);
  page.unmount();
});

test("manual review and failed/expired payments stop polling without payment links", async () => {
  for (const status of ["PAID_REVIEW", "PAYMENT_FAILED", "EXPIRED"]) {
    const page = mount({ responses: [invoice(status)] });
    await page.settle();
    assert.equal(page.timers.size, 0);
    assert.doesNotMatch(
      page.text(),
      /Continue to Flutterwave|Payment confirmed/,
    );
    if (status === "PAID_REVIEW") {
      assert.match(page.text(), /Payment received; manual review required/);
      assert.doesNotMatch(page.text(), /Start a new marketplace checkout/);
    } else assert.match(page.text(), /Start a new marketplace checkout/);
    page.unmount();
  }
});

test("401 restores buyer login; 403 and mismatch stop with no public fallback", async () => {
  for (const result of [
    { status: 401 },
    { status: 403 },
    { status: 409, code: "PAYMENT_MISMATCH" },
  ]) {
    const page = mount({ responses: [{ success: false, ...result }] });
    await page.settle();
    assert.equal(page.calls.length, 1);
    assert.equal(page.calls[0].mode, "buyer");
    assert.equal(page.timers.size, 0);
    assert.doesNotMatch(page.text(), /Continue to Flutterwave/);
    if (result.status === 401)
      assert.match(page.text(), /returnTo=%2Fpay%2FOB-test/);
    if (result.status === 403) assert.match(page.text(), /Access denied/);
    if (result.code) assert.match(page.text(), /Do not make another payment/);
    page.unmount();
  }
});

test("provider outages retain pending state and suppress resume until reverified", async () => {
  const page = mount({
    responses: [
      invoice("AWAITING_PAYMENT"),
      { success: false, status: 502, message: "Verification unavailable" },
      invoice("PAID"),
    ],
  });
  await page.settle();
  assert.match(page.text(), /Continue to Flutterwave/);
  await page.tick();
  assert.match(page.text(), /Payment confirmation pending/);
  assert.doesNotMatch(page.text(), /Continue to Flutterwave/);
  assert.equal(page.timers.size, 1);
  await page.tick();
  assert.match(page.text(), /Payment confirmed/);
  page.unmount();
});

test("saved marketplace invoices require login; guest legacy invoices keep the public flow", async () => {
  const saved = {
    key: "key",
    body: { listingId: "listing", quantity: 1, paymentProvider: "PAYSTACK" },
    invoiceReference: "OB-test",
  };
  const page = mount({ buyer: false, saved, responses: [] });
  await page.settle();
  assert.equal(page.calls.length, 0);
  assert.match(page.text(), /Sign in to verify payment/);
  page.unmount();
  const legacy = mount({
    buyer: false,
    responses: [
      {
        success: true,
        status: 200,
        data: {
          reference: "OB-test",
          status: "AWAITING_PAYMENT",
          items: [],
          paymentMethods: ["Card"],
          paystackUrl: "https://checkout.paystack.com/test",
        },
      },
    ],
  });
  await legacy.settle();
  assert.equal(legacy.calls[0].mode, "public");
  assert.match(legacy.text(), /legacy-payment/);
  assert.equal(legacy.timers.size, 0);
  legacy.unmount();
});
