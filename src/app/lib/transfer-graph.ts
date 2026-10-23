export type ValueType =
  | "batch"
  | "facility"
  | "number"
  | "boolean"
  | "text"
  | "allocation";
export type NodeKind =
  | "batch"
  | "recipient"
  | "quantity"
  | "request"
  | "number"
  | "text"
  | "boolean"
  | "compare"
  | "equals"
  | "and"
  | "or"
  | "not"
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "result";
export type RequestPayload = {
  inventoryItemId: string;
  recipientFacilityId: string;
  quantity: number;
};
export type GraphValue = number | boolean | string | RequestPayload | null;
export function isAllocation(
  value: GraphValue | undefined,
): value is RequestPayload {
  return (
    !!value &&
    typeof value === "object" &&
    typeof value.inventoryItemId === "string" &&
    typeof value.recipientFacilityId === "string" &&
    typeof value.quantity === "number"
  );
}
export function sameTransferRequest(
  a: RequestPayload | null,
  b: RequestPayload | null,
): boolean {
  return (
    !!a &&
    !!b &&
    a.inventoryItemId === b.inventoryItemId &&
    a.recipientFacilityId === b.recipientFacilityId &&
    a.quantity === b.quantity
  );
}
export type GraphNode = {
  id: string;
  kind: NodeKind;
  label: string;
  x: number;
  y: number;
  value?: GraphValue;
};
export type GraphEdge = { from: string; to: string; input: number };
export type TransferGraph = { nodes: GraphNode[]; edges: GraphEdge[] };
export const NODE_DEFINITIONS: Record<
  NodeKind,
  { label: string; inputs: ValueType[]; output: ValueType }
> = {
  batch: { label: "Medicine batch", inputs: [], output: "batch" },
  recipient: {
    label: "Recipient facility",
    inputs: ["batch"],
    output: "facility",
  },
  quantity: {
    label: "Transfer quantity",
    inputs: ["facility", "number"],
    output: "allocation",
  },
  request: {
    label: "Review transfer request",
    inputs: ["allocation", "boolean"],
    output: "boolean",
  },
  number: { label: "Number variable", inputs: [], output: "number" },
  text: { label: "Text variable", inputs: [], output: "text" },
  boolean: { label: "Boolean variable", inputs: [], output: "boolean" },
  compare: {
    label: "Greater than or equal",
    inputs: ["number", "number"],
    output: "boolean",
  },
  equals: { label: "Text equals", inputs: ["text", "text"], output: "boolean" },
  and: { label: "AND", inputs: ["boolean", "boolean"], output: "boolean" },
  or: { label: "OR", inputs: ["boolean", "boolean"], output: "boolean" },
  not: { label: "NOT", inputs: ["boolean"], output: "boolean" },
  add: { label: "Add", inputs: ["number", "number"], output: "number" },
  subtract: {
    label: "Subtract",
    inputs: ["number", "number"],
    output: "number",
  },
  multiply: {
    label: "Multiply",
    inputs: ["number", "number"],
    output: "number",
  },
  divide: { label: "Divide", inputs: ["number", "number"], output: "number" },
  result: { label: "Preview boolean", inputs: ["boolean"], output: "boolean" },
};
export function inputLabel(kind: NodeKind, input: number): string {
  if (kind === "request") return ["Transfer", "Condition (optional)"][input];
  if (kind === "recipient") return "Batch";
  if (kind === "quantity") return ["Recipient", "Amount"][input];
  return ["A", "B"][input];
}
export function initialTransferGraph(): TransferGraph {
  return { nodes: [], edges: [] };
}

export function connectionError(
  nodes: GraphNode[],
  edges: GraphEdge[],
  edge: GraphEdge,
): string | null {
  const source = nodes.find((node) => node.id === edge.from);
  const target = nodes.find((node) => node.id === edge.to);
  if (!source || !target) return "Choose an existing node.";
  if (source.kind === "request") return "The request node is the final node.";
  if (
    target.kind === "request" &&
    edge.input === 0 &&
    source.kind !== "quantity"
  )
    return "Connect Transfer quantity to the request. Feed its Recipient and Amount inputs first.";
  if (
    NODE_DEFINITIONS[source.kind].output !==
    NODE_DEFINITIONS[target.kind].inputs[edge.input]
  )
    return "Connect ports with matching types.";
  const visit = (id: string, seen = new Set<string>()): boolean => {
    if (id === edge.from) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return edges.some((link) => link.from === id && visit(link.to, seen));
  };
  return visit(edge.to) ? "This connection would create a cycle." : null;
}

export function evaluateGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): Map<string, GraphValue> {
  const values = new Map<string, GraphValue>();
  const active = new Set<string>();
  const evaluate = (id: string): GraphValue => {
    if (values.has(id)) return values.get(id) ?? null;
    if (active.has(id)) return null;
    const node = nodes.find((item) => item.id === id);
    if (!node) return null;
    active.add(id);
    const args = NODE_DEFINITIONS[node.kind].inputs.map((type, input) => {
      const edge = edges.find((link) => link.to === id && link.input === input);
      const value = edge ? evaluate(edge.from) : null;
      const nativeType = ["text", "batch", "facility"].includes(type)
        ? "string"
        : type;
      if (type === "allocation") return isAllocation(value) ? value : null;
      return typeof value === nativeType &&
        !(typeof value === "number" && !Number.isFinite(value))
        ? value
        : null;
    });
    let value: GraphValue = null;
    switch (node.kind) {
      case "batch":
      case "text":
        value = typeof node.value === "string" ? node.value : null;
        break;
      case "recipient":
        value = args[0] && typeof node.value === "string" ? node.value : null;
        break;
      case "quantity": {
        const recipientEdge = edges.find(
          (edge) => edge.to === id && edge.input === 0,
        );
        const recipient = nodes.find(
          (item) =>
            item.id === recipientEdge?.from && item.kind === "recipient",
        );
        const batchEdge = edges.find(
          (edge) => edge.to === recipient?.id && edge.input === 0,
        );
        const batchId = batchEdge ? evaluate(batchEdge.from) : null;
        value =
          typeof args[0] === "string" &&
          typeof args[1] === "number" &&
          typeof batchId === "string"
            ? {
                inventoryItemId: batchId,
                recipientFacilityId: args[0],
                quantity: args[1],
              }
            : null;
        break;
      }
      case "number":
        value =
          typeof node.value === "number" && Number.isFinite(node.value)
            ? node.value
            : null;
        break;
      case "boolean":
        value = typeof node.value === "boolean" ? node.value : null;
        break;
      case "compare":
        value = args.every((arg) => arg !== null)
          ? (args[0] as number) >= (args[1] as number)
          : null;
        break;
      case "equals":
        value = args.every((arg) => arg !== null) ? args[0] === args[1] : null;
        break;
      case "and":
        value = args.includes(null) ? null : args.every((arg) => arg === true);
        break;
      case "or":
        value = args.includes(null) ? null : args.includes(true);
        break;
      case "not":
        value = args[0] === null ? null : !args[0];
        break;
      case "add":
      case "subtract":
      case "multiply":
      case "divide": {
        if (
          args.every((arg) => typeof arg === "number" && Number.isFinite(arg))
        ) {
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
        }
        break;
      }
      case "result":
        value = args[0];
        break;
    }
    active.delete(id);
    values.set(id, value);
    return value;
  };
  for (const node of nodes) evaluate(node.id);
  return values;
}

export function validateTransferGraph(
  graph: TransferGraph,
  stock: { id: string; quantity: number; expiry: string }[],
  recipients: { id: string }[],
  recipientsForBatch: string,
  now = Date.now(),
): { errors: string[]; payload: RequestPayload | null } {
  const errors: string[] = [];
  const requests = graph.nodes.filter((node) => node.kind === "request");
  if (requests.length !== 1)
    return { errors: ["Add one Review transfer request node."], payload: null };
  const request = requests[0];
  for (const edge of graph.edges) {
    const error = connectionError(
      graph.nodes,
      graph.edges.filter((link) => link !== edge),
      edge,
    );
    if (error && !errors.includes(error)) errors.push(error);
  }
  const incoming = (id: string, input: number) =>
    graph.edges.find((edge) => edge.to === id && edge.input === input);
  if (
    new Set(graph.edges.map((edge) => `${edge.to}:${edge.input}`)).size !==
    graph.edges.length
  )
    errors.push("Each input must have only one connection.");
  const source = (input: number) =>
    graph.nodes.find((node) => node.id === incoming(request.id, input)?.from);
  const quantityNode = source(0);
  const recipient = graph.nodes.find(
    (node) => node.id === incoming(quantityNode?.id ?? "", 0)?.from,
  );
  const batch = graph.nodes.find(
    (node) => node.id === incoming(recipient?.id ?? "", 0)?.from,
  );
  const values = evaluateGraph(graph.nodes, graph.edges);
  const visited = new Set<string>();
  const checkInputs = (node: GraphNode) => {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    NODE_DEFINITIONS[node.kind].inputs.forEach((type, input) => {
      const edge = incoming(node.id, input);
      if (!edge) {
        if (!(node.kind === "request" && input === 1))
          errors.push(
            `${node.label || NODE_DEFINITIONS[node.kind].label}: connect ${inputLabel(node.kind, input)} (${type}).`,
          );
        return;
      }
      const parent = graph.nodes.find((item) => item.id === edge.from);
      if (parent) checkInputs(parent);
    });
  };
  checkInputs(request);
  const selectedStock =
    batch?.kind === "batch"
      ? stock.find((item) => item.id === batch.value)
      : undefined;
  if (!selectedStock)
    errors.push("Connect a Medicine batch node and select available stock.");
  else if (!(Date.parse(selectedStock.expiry) > now))
    errors.push(
      "The selected batch has expired. Refresh stock and select another batch.",
    );
  const allocation = quantityNode ? values.get(quantityNode.id) : null;
  const recipientId = isAllocation(allocation)
    ? allocation.recipientFacilityId
    : null;
  if (recipient?.kind !== "recipient" || batch?.kind !== "batch")
    errors.push(
      "Connect Medicine batch → Recipient facility → Transfer quantity → Review transfer request.",
    );
  if (
    !selectedStock ||
    recipientsForBatch !== selectedStock.id ||
    typeof recipientId !== "string" ||
    !recipients.some((item) => item.id === recipientId)
  )
    errors.push("Select a recipient returned for the connected batch.");
  if (quantityNode?.kind !== "quantity")
    errors.push(
      "Connect a Transfer quantity node to the request's Transfer input.",
    );
  const quantity = isAllocation(allocation) ? allocation.quantity : null;
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    !selectedStock ||
    quantity > selectedStock.quantity
  )
    errors.push(
      "Connect a whole-number quantity between 1 and the available stock.",
    );
  const gate = source(1);
  if (incoming(request.id, 1) && (!gate || values.get(gate.id) !== true))
    errors.push(
      "The connected condition must evaluate to true before sending.",
    );
  return {
    errors,
    payload:
      !errors.length &&
      selectedStock &&
      typeof recipientId === "string" &&
      typeof quantity === "number"
        ? {
            inventoryItemId: selectedStock.id,
            recipientFacilityId: recipientId,
            quantity,
          }
        : null,
  };
}
