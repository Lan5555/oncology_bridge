const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function mount({ storage = new Map(), listings = true, checkout } = {}) {
  const state = [];
  const initializedEffects = new Set();
  const effects = [];
  const calls = [];
  const redirects = [];
  let index = 0;
  let uuid = 0;
  let tree;
  const react = {
    useState(value) {
      const slot = index++;
      if (!(slot in state)) state[slot] = value;
      return [
        state[slot],
        (next) => {
          state[slot] = typeof next === "function" ? next(state[slot]) : next;
        },
      ];
    },
    useRef(value) {
      const slot = index++;
      if (!state[slot]) state[slot] = { current: value };
      return state[slot];
    },
    useEffect(fn) {
      const slot = index++;
      if (!initializedEffects.has(slot)) {
        initializedEffects.add(slot);
        effects.push(fn);
      }
    },
  };
  const product = {
    id: "listing",
    name: "Medicine",
    brand: "Brand",
    strength: "10mg",
    category: "Oncology",
    description: "",
    unit: "pack",
    unitPriceNaira: 20,
    availableQuantity: 2,
    expiresOn: "2099-01-01",
    prescriptionRequired: false,
    images: [],
    seller: { name: "Pharmacy", city: "Lagos" },
  };
  const service = {
    list: async () => ({
      success: true,
      data: { items: listings ? [product] : [], total: listings ? 1 : 0 },
    }),
    checkout: async (...args) => {
      calls.push(args);
      return await checkout(...args);
    },
  };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const scope = {
      exports: {},
      URL,
      URLSearchParams,
      Intl,
      Date,
      crypto: { randomUUID: () => `uuid-${++uuid}` },
      sessionStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
      window: {
        setInterval: () => 1,
        clearInterval() {},
        requestAnimationFrame: () => 1,
        cancelAnimationFrame() {},
        location: {
          assign(url) {
            redirects.push({
              url,
              saved: JSON.parse(storage.get("marketplaceCheckoutAttempt")),
            });
          },
        },
      },
      require(name) {
        if (name === "react") return react;
        if (name === "react/jsx-runtime")
          return {
            jsx: (type, props) => ({ type, props }),
            jsxs: (type, props) => ({ type, props }),
            Fragment: "fragment",
          };
        if (name === "lucide-react")
          return new Proxy({}, { get: (_, key) => String(key) });
        if (name === "sonner") return { toast: { error() {} } };
        if (name.endsWith(".module.css")) return { default: {} };
        if (name.startsWith("@/app/components/")) return { default: name };
        if (name.endsWith("/medicine-availability"))
          return { linkedMedicineUnavailable: () => false };
        if (name.endsWith("/checkout-prescriptions"))
          return { isPrescriptionUuid: () => true };
        if (name.endsWith("/marketplace-service/marketplace-service"))
          return { MARKETPLACE_SERVICE: service };
        if (name.endsWith("/marketplace-payment"))
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
  const Component = load("src/app/pages/dashboard/MarketplacePage.tsx").default;
  const render = () => {
    index = 0;
    tree = Component({});
    while (effects.length) effects.shift()();
  };
  render();
  return {
    calls,
    redirects,
    storage,
    async settle() {
      await new Promise(setImmediate);
      render();
    },
    find(predicate) {
      const visit = (node) => {
        if (!node || typeof node !== "object") return null;
        if (Array.isArray(node)) {
          for (const child of node) {
            const found = visit(child);
            if (found) return found;
          }
          return null;
        }
        if (predicate(node)) return node;
        return visit(node.props?.children);
      };
      return visit(tree);
    },
  };
}

test("checkout blocks duplicates, freezes uncertain input, and recovers the same attempt after stock disappears", async () => {
  let resolve;
  const pending = new Promise((done) => {
    resolve = done;
  });
  const page = mount({ checkout: () => pending });
  await page.settle();
  page
    .find((node) => node.props?.["aria-label"] === "View Medicine")
    .props.onClick();
  await page.settle();
  page
    .find((node) => node.type === "input" && node.props.type === "number")
    .props.onChange({ target: { value: "2" } });
  page
    .find((node) => node.type === "select" && node.props.value === "PAYSTACK")
    .props.onChange({ target: { value: "FLUTTERWAVE" } });
  await page.settle();
  const form = page.find(
    (node) => node.type === "form" && node.props.className === "mt-5 space-y-4",
  );
  const first = form.props.onSubmit({ preventDefault() {} });
  const duplicate = form.props.onSubmit({ preventDefault() {} });
  assert.equal(page.calls.length, 1);
  resolve({ success: false, status: 502 });
  await Promise.all([first, duplicate]);
  await page.settle();
  assert.equal(
    page.find(
      (node) => node.type === "select" && node.props.value === "FLUTTERWAVE",
    ).props.disabled,
    true,
  );
  const original = page.calls[0];
  assert.equal(original[1], 2);
  assert.equal(original[4], "FLUTTERWAVE");

  const recovered = mount({
    storage: page.storage,
    listings: false,
    checkout: async () => ({
      success: true,
      data: {
        paymentProvider: "FLUTTERWAVE",
        invoiceReference: "OB-test",
        orderId: "order",
        authorizationUrl: "https://checkout.flutterwave.com/v3/hosted/pay/test",
        expiresAt: "2099-01-01",
      },
    }),
  });
  await recovered.settle();
  await recovered
    .find(
      (node) =>
        node.type === "button" &&
        node.props.children === "Retry saved checkout",
    )
    .props.onClick();
  await recovered.settle();
  assert.deepEqual(recovered.calls[0], original);
  assert.equal(recovered.redirects.length, 1);
  assert.equal(recovered.redirects[0].saved.invoiceReference, "OB-test");
  assert.equal(recovered.redirects[0].saved.orderId, "order");
});
