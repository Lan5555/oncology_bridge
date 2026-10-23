import type { MedicinePayload } from "@/app/services/medicine-service/medicine-service";
import type { GraphEdge } from "./transfer-graph";

export type RecordGraphMode = "medicine" | "inventory";
export type RecordPortType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "unit"
  | "medicine"
  | "identity"
  | "details"
  | "batch"
  | "stock";
export type RecordNodeKind =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "unit"
  | "medicine"
  | "identity"
  | "details"
  | "medicineCreate"
  | "batch"
  | "stock"
  | "inventoryCreate"
  | "and"
  | "or"
  | "not"
  | "compare"
  | "add"
  | "subtract"
  | "multiply"
  | "divide";
export type RecordNode = {
  id: string;
  kind: RecordNodeKind;
  label: string;
  x: number;
  y: number;
  value?: string | number | boolean | null;
};
export type RecordGraph = { nodes: RecordNode[]; edges: GraphEdge[] };
export type InputPort = {
  name: string;
  type: RecordPortType;
  optional?: boolean;
};
const input = (
  name: string,
  type: RecordPortType,
  optional = false,
): InputPort => ({ name, type, optional });
export const RECORD_NODES: Record<
  RecordNodeKind,
  { label: string; inputs: InputPort[]; output: RecordPortType | null }
> = {
  text: { label: "Text variable", inputs: [], output: "text" },
  number: { label: "Number variable", inputs: [], output: "number" },
  boolean: { label: "Boolean variable", inputs: [], output: "boolean" },
  date: { label: "Expiry date", inputs: [], output: "date" },
  unit: { label: "Selling unit", inputs: [], output: "unit" },
  medicine: { label: "Catalog medicine", inputs: [], output: "medicine" },
  identity: {
    label: "Medicine identity",
    inputs: [
      input("Generic name", "text"),
      input("Brand name", "text"),
      input("Strength", "text", true),
      input("GTIN", "text", true),
    ],
    output: "identity",
  },
  details: {
    label: "Medicine details",
    inputs: [
      input("Manufacturer", "text"),
      input("Dosage form", "text"),
      input("Storage requirement", "text"),
    ],
    output: "details",
  },
  medicineCreate: {
    label: "Review medicine",
    inputs: [
      input("Identity", "identity"),
      input("Details", "details"),
      input("Condition", "boolean", true),
    ],
    output: null,
  },
  batch: {
    label: "Batch details",
    inputs: [
      input("Medicine", "medicine"),
      input("Batch number", "text"),
      input("Expiry", "date"),
    ],
    output: "batch",
  },
  stock: {
    label: "Stock quantity",
    inputs: [
      input("Batch", "batch"),
      input("Quantity", "number"),
      input("Unit", "unit"),
    ],
    output: "stock",
  },
  inventoryCreate: {
    label: "Review inventory intake",
    inputs: [input("Stock", "stock"), input("Condition", "boolean", true)],
    output: null,
  },
  and: {
    label: "AND",
    inputs: [input("A", "boolean"), input("B", "boolean")],
    output: "boolean",
  },
  or: {
    label: "OR",
    inputs: [input("A", "boolean"), input("B", "boolean")],
    output: "boolean",
  },
  not: { label: "NOT", inputs: [input("A", "boolean")], output: "boolean" },
  compare: {
    label: "Greater than or equal",
    inputs: [input("A", "number"), input("B", "number")],
    output: "boolean",
  },
  add: {
    label: "Add",
    inputs: [input("A", "number"), input("B", "number")],
    output: "number",
  },
  subtract: {
    label: "Subtract",
    inputs: [input("A", "number"), input("B", "number")],
    output: "number",
  },
  multiply: {
    label: "Multiply",
    inputs: [input("A", "number"), input("B", "number")],
    output: "number",
  },
  divide: {
    label: "Divide",
    inputs: [input("A", "number"), input("B", "number")],
    output: "number",
  },
};
const common: RecordNodeKind[] = [
  "text",
  "number",
  "boolean",
  "and",
  "or",
  "not",
  "compare",
  "add",
  "subtract",
  "multiply",
  "divide",
];
export const RECORD_PALETTES: Record<RecordGraphMode, RecordNodeKind[]> = {
  medicine: ["identity", "details", "medicineCreate", ...common],
  inventory: [
    "medicine",
    "batch",
    "stock",
    "date",
    "unit",
    "inventoryCreate",
    ...common,
  ],
};
export const RECORD_COLORS: Record<RecordPortType, string> = {
  text: "#dbb4ff",
  number: "#66d9ef",
  boolean: "#f39aa8",
  date: "#96d8cb",
  unit: "#f3c786",
  medicine: "#83e4b5",
  identity: "#9baaff",
  details: "#b5a4ef",
  batch: "#83e4b5",
  stock: "#9baaff",
};
export function recordConnectionError(
  graph: RecordGraph,
  edge: GraphEdge,
  original?: GraphEdge,
): string | null {
  const from = graph.nodes.find((node) => node.id === edge.from);
  const to = graph.nodes.find((node) => node.id === edge.to);
  if (!from || !to) return "Choose an existing node.";
  if (
    !RECORD_NODES[from.kind].output ||
    RECORD_NODES[from.kind].output !==
      RECORD_NODES[to.kind].inputs[edge.input]?.type
  )
    return "Connect ports with matching types.";
  const edges = graph.edges.filter((link) => link !== original);
  const visit = (id: string, seen = new Set<string>()): boolean => {
    if (id === edge.from) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return edges.some((link) => link.from === id && visit(link.to, seen));
  };
  return visit(edge.to) ? "This connection would create a cycle." : null;
}
type Fields = Record<string, string | number>;
export type RecordValue =
  | string
  | number
  | boolean
  | { type: RecordPortType; fields: Fields }
  | null;
export const recordValueLabel = (value: RecordValue | undefined): string =>
  value == null
    ? "Unknown"
    : typeof value === "object"
      ? "Connected record"
      : String(value);
export type InventoryGraphPayload = {
  medicineId: string;
  batchNumber: string;
  expiry: string;
  quantity: number;
  unit: string;
  facilityId: string;
};
export type RecordGraphContext = {
  medicines: { id: string; name: string }[];
  facilityId?: string;
  now?: number;
};
const data = (type: RecordPortType, fields: Fields): RecordValue => ({
  type,
  fields,
});
const fields = (value: RecordValue): Fields =>
  value && typeof value === "object" ? value.fields : {};
export function evaluateRecordGraph(
  graph: RecordGraph,
  context: RecordGraphContext,
): Map<string, RecordValue> {
  const values = new Map<string, RecordValue>();
  const active = new Set<string>();
  const evaluate = (id: string): RecordValue => {
    if (values.has(id)) return values.get(id) ?? null;
    if (active.has(id)) return null;
    const node = graph.nodes.find((item) => item.id === id);
    if (!node) return null;
    active.add(id);
    const definition = RECORD_NODES[node.kind];
    const args = definition.inputs.map((port, index) => {
      const edge = graph.edges.find(
        (link) => link.to === id && link.input === index,
      );
      const value = edge ? evaluate(edge.from) : null;
      if (value === null) return null;
      if (["text", "date", "unit"].includes(port.type))
        return typeof value === "string" ? value : null;
      if (port.type === "number")
        return typeof value === "number" && Number.isFinite(value)
          ? value
          : null;
      if (port.type === "boolean")
        return typeof value === "boolean" ? value : null;
      return typeof value === "object" && value.type === port.type
        ? value
        : null;
    });
    const complete = definition.inputs.every(
      (port, index) =>
        (port.optional &&
          !graph.edges.some(
            (edge) => edge.to === id && edge.input === index,
          )) ||
        args[index] !== null,
    );
    let value: RecordValue = null;
    if (definition.inputs.length && !complete) {
      active.delete(id);
      values.set(id, null);
      return null;
    }
    switch (node.kind) {
      case "text":
      case "date":
      case "unit":
        value = typeof node.value === "string" ? node.value.trim() : null;
        break;
      case "number":
        value =
          typeof node.value === "number" && Number.isFinite(node.value)
            ? node.value
            : null;
        break;
      case "boolean":
        value = typeof node.value === "boolean" ? node.value : null;
        break;
      case "medicine":
        value = context.medicines.some((item) => item.id === node.value)
          ? data("medicine", { medicineId: String(node.value) })
          : null;
        break;
      case "identity":
        value = data("identity", {
          generic_name: String(args[0]),
          brand_name: String(args[1]),
          ...(args[2] ? { strength: String(args[2]) } : {}),
          ...(args[3] ? { gtin: String(args[3]) } : {}),
        });
        break;
      case "details":
        value = data("details", {
          manufacturer: String(args[0]),
          dosage_form: String(args[1]),
          storage_temperature: String(args[2]),
        });
        break;
      case "medicineCreate":
        value =
          args[2] === false
            ? null
            : data("identity", { ...fields(args[0]), ...fields(args[1]) });
        break;
      case "batch":
        value = data("batch", {
          ...fields(args[0]),
          batchNumber: String(args[1]),
          expiry: String(args[2]),
        });
        break;
      case "stock":
        value = data("stock", {
          ...fields(args[0]),
          quantity: args[1] as number,
          unit: String(args[2]),
        });
        break;
      case "inventoryCreate":
        value = args[1] === false ? null : data("stock", fields(args[0]));
        break;
      case "and":
        value = args.every((arg) => arg === true);
        break;
      case "or":
        value = args.includes(true);
        break;
      case "not":
        value = !args[0];
        break;
      case "compare":
        value = (args[0] as number) >= (args[1] as number);
        break;
      case "add":
      case "subtract":
      case "multiply":
      case "divide": {
        const a = args[0] as number;
        const b = args[1] as number;
        const result =
          node.kind === "add"
            ? a + b
            : node.kind === "subtract"
              ? a - b
              : node.kind === "multiply"
                ? a * b
                : b === 0
                  ? NaN
                  : a / b;
        value = Number.isFinite(result) ? result : null;
        break;
      }
    }
    active.delete(id);
    values.set(id, value);
    return value;
  };
  for (const node of graph.nodes) evaluate(node.id);
  return values;
}
export function validateRecordGraph(
  mode: RecordGraphMode,
  graph: RecordGraph,
  context: RecordGraphContext,
): {
  errors: string[];
  payload: MedicinePayload | InventoryGraphPayload | null;
} {
  const errors: string[] = [];
  const finals = graph.nodes.filter(
    (node) =>
      node.kind ===
      (mode === "medicine" ? "medicineCreate" : "inventoryCreate"),
  );
  if (finals.length !== 1)
    return {
      errors: [
        `Add one ${mode === "medicine" ? "Review medicine" : "Review inventory intake"} node.`,
      ],
      payload: null,
    };
  if (new Set(graph.nodes.map((node) => node.id)).size !== graph.nodes.length)
    errors.push("Each node needs a unique ID.");
  if (graph.nodes.some((node) => !RECORD_PALETTES[mode].includes(node.kind)))
    errors.push("Use nodes from this workflow's palette.");
  for (const edge of graph.edges) {
    const error = recordConnectionError(graph, edge, edge);
    if (error && !errors.includes(error)) errors.push(error);
  }
  if (
    new Set(graph.edges.map((edge) => `${edge.to}:${edge.input}`)).size !==
    graph.edges.length
  )
    errors.push("Each input accepts one wire.");
  const visited = new Set<string>();
  const check = (node: RecordNode) => {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    RECORD_NODES[node.kind].inputs.forEach((port, index) => {
      const edge = graph.edges.find(
        (link) => link.to === node.id && link.input === index,
      );
      if (!edge && !port.optional)
        errors.push(`${node.label}: connect ${port.name}.`);
      const parent = graph.nodes.find((item) => item.id === edge?.from);
      if (parent) check(parent);
    });
  };
  check(finals[0]);
  const values = evaluateRecordGraph(graph, context);
  const result = values.get(finals[0].id);
  const output = result && typeof result === "object" ? result.fields : null;
  if (!output)
    errors.push(
      "Complete all required values and make the connected condition true.",
    );
  let payload: MedicinePayload | InventoryGraphPayload | null = null;
  if (output && mode === "medicine") {
    const required = [
      "generic_name",
      "brand_name",
      "manufacturer",
      "dosage_form",
      "storage_temperature",
    ];
    if (
      required.some(
        (key) => typeof output[key] !== "string" || !String(output[key]).trim(),
      )
    )
      errors.push(
        "Provide generic name, brand, manufacturer, dosage form and storage requirement using Text nodes.",
      );
    else payload = output as MedicinePayload;
  }
  if (output && mode === "inventory") {
    if (!context.medicines.some((item) => item.id === output.medicineId))
      errors.push("Choose an available catalog medicine.");
    if (!String(output.batchNumber ?? "").trim())
      errors.push("Connect a nonempty batch number Text node.");
    const expiry = String(output.expiry ?? "");
    const parsed = Date.parse(`${expiry}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(expiry) ||
      !Number.isFinite(parsed) ||
      new Date(parsed).toISOString().slice(0, 10) !== expiry ||
      expiry < new Date(context.now ?? Date.now()).toISOString().slice(0, 10)
    )
      errors.push("Choose a valid expiry date today or later.");
    if (
      typeof output.quantity !== "number" ||
      !Number.isInteger(output.quantity) ||
      output.quantity < 1
    )
      errors.push("Quantity must be a positive whole number.");
    if (!["vial", "pack", "bottle", "box"].includes(String(output.unit)))
      errors.push("Choose vial, pack, bottle or box in a Selling unit node.");
    if (!context.facilityId)
      errors.push("Your session must identify the owning facility.");
    payload = {
      ...output,
      facilityId: context.facilityId ?? "",
    } as InventoryGraphPayload;
  }
  return { errors, payload: errors.length ? null : payload };
}
