const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(relative, mocks = {}) {
  const scope = {
    exports: {},
    requestAnimationFrame: (fn) => fn(),
    document: { getElementById: () => null },
    require: (name) => {
      if (name in mocks) return mocks[name];
      throw new Error(`Unexpected import ${name}`);
    },
  };
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", relative), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText,
    scope,
  );
  return scope.exports;
}
const lib = load("src/app/lib/bulk-medicines.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));
const medicine = (gtin = "01234567890128") => ({
  gtin,
  generic_name: "Generic",
  brand_name: "Brand",
  manufacturer: "Maker",
  strength: "10 mg",
  dosage_form: "Tablet",
  storage_temperature: "Store below 25°C",
});
function gtinFor(index) {
  const prefix = String(index).padStart(13, "0");
  const sum = [...prefix].reduce(
    (total, digit, i) => total + Number(digit) * (i % 2 ? 1 : 3),
    0,
  );
  return prefix + ((10 - (sum % 10)) % 10);
}

test("GTIN-14 validation preserves zeros and rejects incorrect digits or formatting", () => {
  for (const gtin of ["01234567890128", "12345678901231", gtinFor(25)])
    assert.equal(lib.validGtin14(gtin), true);
  for (const gtin of [
    "01234567890123",
    "1234567890128",
    "012345678901280",
    "0123456789012a",
    " 01234567890128",
  ])
    assert.equal(lib.validGtin14(gtin), false);
});
test("batch accepts 1 and 100 rows but rejects 0 and 101", () => {
  assert.equal(lib.validateBulkMedicines([medicine()]).length, 0);
  const rows = Array.from({ length: 101 }, (_, i) => medicine(gtinFor(i)));
  assert.equal(lib.validateBulkMedicines(rows.slice(0, 100)).length, 0);
  assert.match(lib.validateBulkMedicines(rows)[0].message, /1 and 100/);
  assert.equal(lib.validateBulkMedicines([])[0].index, -1);
});
test("every field must be nonblank and duplicate errors identify both rows", () => {
  for (const [field] of lib.BULK_MEDICINE_FIELDS) {
    const errors = lib.validateBulkMedicines([
      { ...medicine(), [field]: " \t " },
    ]);
    assert.ok(
      errors.some((error) => error.index === 0 && error.field === field),
    );
  }
  const errors = lib.validateBulkMedicines([
    medicine(),
    medicine(" 01234567890128 "),
  ]);
  assert.deepEqual(plain(errors.map((error) => error.index)), [0, 1]);
});
test("payload picks only seven fields, trims strings, and never mutates entered rows", () => {
  const row = {
    ...medicine(),
    generic_name: " Generic ",
    facilityId: "never-send",
    quantity: 10,
    batchNumber: "never-send",
    expiry: "never-send",
  };
  assert.deepEqual(plain(lib.bulkMedicinePayload([row])), [medicine()]);
  assert.equal(row.generic_name, " Generic ");
});
test("structured errors retain zero-based indexes and message-only responses remain supported", () => {
  const issue = { index: 0, field: "gtin", message: "Already exists" };
  assert.deepEqual(
    plain(lib.bulkApiErrors({ errors: [issue, null, { index: "1" }] })),
    [issue],
  );
  for (const data of [null, { message: "Forbidden" }, { errors: "Invalid" }])
    assert.equal(lib.bulkApiErrors(data).length, 0);
  for (const status of [400, 401, 403, 409, 0])
    assert.ok(lib.bulkFailureMessage(status).length);
});

function mount(response) {
  const state = [];
  const calls = [];
  const created = [];
  let slot = 0;
  let tree;
  const react = {
    useEffect() {},
    useId: () => "bulk",
    useState(initial) {
      const index = slot++;
      if (!(index in state)) state[index] = initial;
      return [
        state[index],
        (value) => {
          state[index] =
            typeof value === "function" ? value(state[index]) : value;
        },
      ];
    },
    useRef(initial) {
      const index = slot++;
      if (!(index in state)) state[index] = { current: initial };
      return state[index];
    },
  };
  const component = load("src/app/components/BulkMedicineEditor.tsx", {
    react,
    "react/jsx-runtime": {
      jsx: (type, props) => ({ type, props }),
      jsxs: (type, props) => ({ type, props }),
      Fragment: "fragment",
    },
    "lucide-react": {},
    "@/app/lib/bulk-medicines": lib,
    "./BulkMedicineEditor.module.css": { default: {} },
    "@/app/services/medicine-service/medicine-service": {
      MEDICINE_SERVICE: {
        createBulk: async (rows) => {
          calls.push(plain(rows));
          return typeof response === "function" ? response() : response;
        },
      },
    },
  }).default;
  function render(open = true) {
    slot = 0;
    tree = component({
      open,
      onClose() {},
      onCreated: (count) => created.push(count),
    });
    return tree;
  }
  function elements(value) {
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value)) return value.flatMap(elements);
    return [value, ...elements(value.props?.children)];
  }
  function text(value) {
    if (Array.isArray(value)) return value.map(text).join("");
    if (value && typeof value === "object") return text(value.props?.children);
    return value == null || value === false ? "" : String(value);
  }
  function button(label) {
    return elements(tree).find(
      (item) => item.type === "button" && text(item).includes(label),
    );
  }
  function fill() {
    button("Add medicine node").props.onClick();
    render();
    for (const [field, value] of Object.entries(medicine())) {
      elements(tree)
        .find(
          (item) =>
            item.type === "input" && item.props.id.endsWith(`-${field}`),
        )
        .props.onChange({ target: { value } });
      render();
    }
  }
  render();
  return {
    render,
    elements: () => elements(tree),
    text: () => text(tree),
    button,
    fill,
    calls,
    created,
  };
}

test("review never writes; confirmation submits once and locks controls while pending", async () => {
  let finish;
  const mounted = mount(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  mounted.fill();
  mounted.button("Review batch").props.onClick();
  mounted.render();
  assert.equal(mounted.calls.length, 0);
  const confirm = mounted.button("Confirm and create").props.onClick;
  const pending = confirm();
  confirm();
  mounted.render();
  assert.equal(mounted.calls.length, 1);
  assert.equal(mounted.button("Saving batch").props.disabled, true);
  assert.ok(
    mounted
      .elements()
      .filter((item) => item.type === "fieldset")
      .every((item) => item.props.disabled),
  );
  finish({
    success: true,
    status: 201,
    data: { count: 1, medicines: [{ id: "created" }] },
  });
  // onClick deliberately schedules the async operation without returning its promise.
  await pending;
  await new Promise(setImmediate);
  mounted.render();
  assert.deepEqual(mounted.calls, [[medicine()]]);
  assert.deepEqual(mounted.created, [1]);
  assert.equal(
    mounted.elements().filter((item) => item.type === "input").length,
    0,
  );
});
test("400, 401, 403 and 409 preserve rows, show API messages and use one-based row labels", async () => {
  for (const status of [400, 401, 403, 409]) {
    const mounted = mount({
      success: false,
      status,
      message: `Rejected ${status}`,
      data:
        status === 400
          ? {
              errors: [
                { index: 0, field: "gtin", message: "Invalid identifier" },
              ],
            }
          : null,
    });
    mounted.fill();
    mounted.button("Review batch").props.onClick();
    mounted.render();
    mounted.button("Confirm and create").props.onClick();
    await new Promise(setImmediate);
    mounted.render();
    assert.match(mounted.text(), new RegExp(`Rejected ${status}`));
    if (status === 400)
      assert.match(mounted.text(), /Row 1 · gtin: Invalid identifier/);
    assert.equal(
      mounted
        .elements()
        .find(
          (item) => item.type === "input" && item.props.id.endsWith("-gtin"),
        ).props.value,
      "01234567890128",
    );
    assert.deepEqual(mounted.created, []);
    mounted.render(false);
    mounted.render(true);
    assert.equal(
      mounted.elements().filter((item) => item.type === "input").length,
      7,
    );
  }
});
test("network failures and malformed success confirmations preserve the draft", async () => {
  for (const response of [
    () => {
      throw new Error("Connection interrupted");
    },
    { success: true, status: 201, data: { count: 2, medicines: [] } },
  ]) {
    const mounted = mount(response);
    mounted.fill();
    mounted.button("Review batch").props.onClick();
    mounted.render();
    mounted.button("Confirm and create").props.onClick();
    await new Promise(setImmediate);
    mounted.render();
    assert.deepEqual(mounted.created, []);
    assert.equal(
      mounted.elements().filter((item) => item.type === "input").length,
      7,
    );
    assert.ok(mounted.elements().some((item) => item.props?.role === "alert"));
  }
});
test("invalid rows block review and row removal clears outdated API indexes", () => {
  const mounted = mount({});
  mounted.button("Add medicine node").props.onClick();
  mounted.render();
  mounted.button("Review batch").props.onClick();
  mounted.render();
  assert.equal(mounted.calls.length, 0);
  assert.match(mounted.text(), /GTIN-14 is required/);
  mounted
    .elements()
    .find((item) => item.props?.["aria-label"] === "Remove row 1")
    .props.onClick();
  mounted.render();
  assert.equal(mounted.button("Review batch").props.disabled, true);
  assert.ok(!mounted.text().includes("GTIN-14 is required"));
});
test("bulk service uses the authenticated shared client and dedicated endpoint", async () => {
  const calls = [];
  class CoreService {
    async send(...args) {
      calls.push(args);
      return { success: true };
    }
  }
  const routes = load("src/app/services/api-routes.ts").Routes;
  const service = load(
    "src/app/services/medicine-service/medicine-service.ts",
    {
      "@/app/hooks/service/core-service": { CoreService },
      "@/app/lib/medicine-availability": {},
      "../api-routes": { Routes: routes },
    },
  ).MEDICINE_SERVICE;
  await service.createBulk([medicine()]);
  assert.deepEqual(plain(calls), [
    ["/api/medicines/bulk", { medicines: [medicine()] }],
  ]);
});

test("medicine title bar drags with pointer capture and releases without moving again", () => {
  const mounted = mount({});
  mounted.fill();
  const handle = () =>
    mounted
      .elements()
      .find(
        (item) =>
          item.props?.["aria-label"] === "Move row 1 with drag or arrow keys",
      );
  const node = () => mounted.elements().find((item) => item.type === "article");
  let captured;
  const target = {
    focus() {},
    setPointerCapture(id) {
      captured = id;
    },
    hasPointerCapture(id) {
      return captured === id;
    },
    releasePointerCapture() {
      captured = undefined;
    },
  };
  const event = {
    button: 0,
    pointerId: 7,
    clientX: 100,
    clientY: 200,
    currentTarget: target,
    preventDefault() {},
  };
  handle().props.onPointerDown(event);
  mounted.render();
  assert.equal(captured, 7);
  assert.equal(node().props["data-dragging"], true);
  assert.equal(node().props["data-selected"], true);
  handle().props.onPointerMove({ ...event, pointerId: 8, clientX: 200 });
  mounted.render();
  assert.equal(node().props.style.left, 32);
  handle().props.onPointerMove({ ...event, clientX: 240, clientY: 250 });
  mounted.render();
  assert.equal(node().props.style.left, 172);
  assert.equal(node().props.style.top, 200);
  handle().props.onPointerUp(event);
  mounted.render();
  assert.equal(captured, undefined);
  assert.equal(node().props["data-dragging"], false);
  handle().props.onPointerMove({ ...event, clientX: 900 });
  mounted.render();
  assert.equal(node().props.style.left, 172);
  handle().props.onKeyDown({
    key: "ArrowLeft",
    shiftKey: true,
    preventDefault() {},
  });
  mounted.render();
  assert.equal(node().props.style.left, 122);
  mounted.button("Arrange nodes").props.onClick();
  mounted.render();
  assert.equal(node().props.style.left, 32);
  assert.equal(node().props.style.top, 150);
});

test("long server field errors stay associated with the input and clear when edited", async () => {
  const message = `Duplicate identifier: ${"detail".repeat(200)}`;
  const mounted = mount({
    success: false,
    status: 409,
    message: "Check medicines",
    data: { errors: [{ index: 0, field: "gtin", message }] },
  });
  mounted.fill();
  mounted.button("Review batch").props.onClick();
  mounted.render();
  mounted.button("Confirm and create").props.onClick();
  await new Promise(setImmediate);
  mounted.render();
  const field = () =>
    mounted
      .elements()
      .find((item) => item.type === "input" && item.props.id.endsWith("-gtin"));
  assert.equal(field().props["aria-invalid"], true);
  assert.equal(
    mounted.elements().find((item) => item.type === "article").props.style
      .height,
    640,
  );
  const error = mounted
    .elements()
    .find((item) => item.props?.id === field().props["aria-describedby"]);
  assert.equal(error.props.children, message);
  field().props.onChange({ target: { value: "12345678901231" } });
  mounted.render();
  assert.equal(field().props["aria-invalid"], false);
  assert.equal(field().props["aria-describedby"], undefined);
  assert.ok(!mounted.text().includes(message));
});
