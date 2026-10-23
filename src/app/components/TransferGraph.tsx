"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useGraphWireDrag } from "@/app/hooks/useGraphWireDrag";
import {
  EMPTY_RECIPIENT_MESSAGE,
  useTransferRequestOptions,
} from "@/app/hooks/useTransferRequestOptions";
import {
  edgeBetweenPorts,
  GRAPH_NODE_WIDTH,
  type GraphPort,
  portPoint,
  wireCurve,
} from "@/app/lib/graph-wires";
import {
  connectionError,
  evaluateGraph,
  type GraphEdge,
  type GraphNode,
  initialTransferGraph,
  inputLabel,
  isAllocation,
  NODE_DEFINITIONS,
  type NodeKind,
  sameTransferRequest,
  type ValueType,
  validateTransferGraph,
} from "@/app/lib/transfer-graph";
import { TRANSFER_SERVICE } from "@/app/services/transfer-service/transfer-service";
import styles from "./TransferGraph.module.css";
import TransferGraphReview, {
  type TransferReview,
} from "./TransferGraphReview";

const WIDTH = GRAPH_NODE_WIDTH;
const singletons: NodeKind[] = ["batch", "recipient", "request"];
const NODE_HELP: Partial<Record<NodeKind, string>> = {
  boolean:
    "Toggle true or false. Connect to AND, OR, NOT or the request's Condition input.",
  number:
    "Enter a number. Connect it to Transfer quantity's Amount input, a math node or a comparison.",
  text: "Enter text and connect to Text equals. Its boolean output can control the request condition.",
  quantity:
    "Connect Recipient facility to Recipient and a Number or math output to Amount. The output combines batch, recipient and quantity; connect it to the final request's Transfer input.",
  compare:
    "Requires two numeric connections: A and B. Returns true when A is greater than or equal to B.",
  equals:
    "Returns true when text A matches text B exactly, including capitalization.",
  and: "Connect both boolean inputs A and B. Returns true when both are true. Missing or unknown inputs produce Unknown.",
  or: "Connect both boolean inputs A and B. Returns true when either is true. Missing or unknown inputs produce Unknown.",
  not: "Reverses a boolean: true becomes false and false becomes true. Unknown stays unknown.",
  add: "Adds A and B. The numeric result can supply the transfer quantity.",
  subtract:
    "Subtracts B from A. The numeric result can supply the transfer quantity.",
  multiply:
    "Multiplies A by B. The numeric result can supply the transfer quantity.",
  divide:
    "Divides A by B. Division by zero produces Unknown. Transfer quantity must still be a positive whole number.",
  result:
    "Displays a boolean value. Connect its output to the request condition to use it when sending.",
};
const colors: Record<ValueType, string> = {
  batch: "#83e4b5",
  facility: "#f7cd80",
  number: "#66d9ef",
  boolean: "#f39aa8",
  text: "#dbb4ff",
  allocation: "#9baaff",
};
const valueLabel = (value: unknown) =>
  value === null || value === undefined
    ? "Unknown"
    : typeof value === "object" && "quantity" in value
      ? `${value.quantity} units allocated`
      : String(value);

export default function TransferGraph({
  onSubmitted,
}: {
  onSubmitted: () => void;
}) {
  const [graph, setGraph] = useState(initialTransferGraph);
  const [selectedNode, setSelectedNode] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<TransferReview | null>(null);
  const submitting = useRef(false);
  const [kind, setKind] = useState<NodeKind>("batch");
  const [zoom, setZoom] = useState(0.75);
  const canvas = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const [selectedWire, setSelectedWire] = useState<GraphEdge | null>(null);
  const drag = useRef<{
    id: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const batchNode = graph.nodes.find((node) => node.kind === "batch");
  const stockId = typeof batchNode?.value === "string" ? batchNode.value : "";
  const options = useTransferRequestOptions(stockId);
  const selectedStock = options.stock.find((item) => item.id === stockId);
  const values = evaluateGraph(graph.nodes, graph.edges);
  const validation = validateTransferGraph(
    graph,
    options.stock,
    options.recipients,
    options.recipientsForBatch,
  );
  const canSubmit =
    !!validation.payload &&
    !options.stockLoading &&
    !options.stockError &&
    !options.recipientLoading &&
    !options.recipientError;
  const inspected = graph.nodes.find((node) => node.id === selectedNode);
  const updateNode = (id: string, patch: Partial<GraphNode>) => {
    if (submitting.current || review) return;
    setSubmitError("");
    setGraph((current) => ({
      ...current,
      nodes: current.nodes.map((node) => {
        if (node.id === id) return { ...node, ...patch };
        // A new batch must never retain the previous batch's recipient selection.
        if (
          id === batchNode?.id &&
          "value" in patch &&
          node.kind === "recipient"
        )
          return { ...node, value: null };
        return node;
      }),
    }));
  };
  const commitConnection = (edge: GraphEdge, original?: GraphEdge) => {
    if (submitting.current || review) return;
    const error = connectionError(
      graph.nodes,
      graph.edges.filter((link) => link !== original),
      edge,
    );
    if (error) {
      setMessage(error);
      return;
    }
    setGraph((current) => ({
      ...current,
      edges: [
        ...current.edges.filter(
          (link) =>
            link !== original &&
            (link.to !== edge.to || link.input !== edge.input),
        ),
        edge,
      ],
    }));
    setSubmitError("");
    setConnecting(null);
    setSelectedWire(edge);
    setMessage("Connection added. Values updated.");
  };
  const wires = useGraphWireDrag({
    graph,
    world,
    zoom,
    disabled: saving || !!review,
    commit: commitConnection,
    announce: setMessage,
  });
  const connect = (to: string, input: number) => {
    if (submitting.current) return;
    if (wires.suppressClick()) return;
    if (!connecting) {
      setMessage("Click an output port first, then the matching input port.");
      return;
    }
    commitConnection({ from: connecting, to, input });
  };
  const addNode = (nodeKind: NodeKind = kind) => {
    if (submitting.current) return;
    const existing = graph.nodes.find((node) => node.kind === nodeKind);
    if (singletons.includes(nodeKind) && existing) {
      setSelectedNode(existing.id);
      setMessage(
        `This request already has a ${NODE_DEFINITIONS[nodeKind].label} node.`,
      );
      return;
    }
    const id = crypto.randomUUID();
    const index = graph.nodes.length;
    const next: GraphNode = {
      id,
      kind: nodeKind,
      label: NODE_DEFINITIONS[nodeKind].label,
      x: 40 + (index % 3) * 330,
      y: 60 + Math.floor(index / 3) * 380,
      value:
        nodeKind === "boolean"
          ? false
          : nodeKind === "number"
            ? 0
            : nodeKind === "text"
              ? ""
              : null,
    };
    setGraph((current) => ({ ...current, nodes: [...current.nodes, next] }));
    setSelectedNode(id);
    setSelectedWire(null);
    setSubmitError("");
    window.requestAnimationFrame(() =>
      canvas.current?.scrollTo({
        left: Math.max(0, next.x * zoom - 40),
        top: Math.max(0, next.y * zoom - 40),
      }),
    );
  };
  const removeNode = () => {
    if (submitting.current) return;
    setGraph((current) => ({
      nodes: current.nodes
        .filter((node) => node.id !== selectedNode)
        .map((node) =>
          selectedNode === batchNode?.id && node.kind === "recipient"
            ? { ...node, value: null }
            : node,
        ),
      edges: current.edges.filter(
        (edge) => edge.from !== selectedNode && edge.to !== selectedNode,
      ),
    }));
    if (connecting === selectedNode) setConnecting(null);
    setSelectedNode("");
    setSubmitError("");
  };
  const openReview = () => {
    const checked = validateTransferGraph(
      graph,
      options.stock,
      options.recipients,
      options.recipientsForBatch,
    );
    const stock = options.stock.find(
      (item) => item.id === checked.payload?.inventoryItemId,
    );
    const recipient = options.recipients.find(
      (item) => item.id === checked.payload?.recipientFacilityId,
    );
    if (!checked.payload || !canSubmit || !stock || !recipient) {
      setSubmitError(
        checked.errors.join(" ") ||
          "Wait for stock and recipient checks to finish.",
      );
      return;
    }
    wires.cancel();
    setConnecting(null);
    setSubmitError("");
    const request = graph.nodes.find((node) => node.kind === "request");
    setReview({
      payload: { ...checked.payload },
      medicine: stock.name,
      batch: stock.batch,
      expiry: stock.expiry,
      available: stock.quantity,
      unit: stock.unit ?? "units (unit unrecorded)",
      recipient: recipient.name,
      city: recipient.city,
      condition: graph.edges.some(
        (edge) => edge.to === request?.id && edge.input === 1,
      )
        ? "Passed (true)"
        : "Not connected (optional)",
    });
  };
  const sendRequest = async () => {
    if (submitting.current) return;
    if (!review) {
      setSubmitError("Preview and confirm the transfer before sending.");
      return;
    }
    const checked = validateTransferGraph(
      graph,
      options.stock,
      options.recipients,
      options.recipientsForBatch,
    );
    if (
      !checked.payload ||
      !canSubmit ||
      !sameTransferRequest(checked.payload, review.payload)
    ) {
      setSubmitError(
        checked.errors.join(" ") ||
          "The transfer changed after preview. Go back to the graph and review it again.",
      );
      return;
    }
    submitting.current = true;
    setSaving(true);
    setSubmitError("");
    try {
      const response = await TRANSFER_SERVICE.create(review.payload);
      if (!response.success)
        throw new Error(
          response.message || "Transfer request could not be submitted.",
        );
      const success =
        response.message ||
        "Transfer request submitted. Review it in Pending approval.";
      toast.success(success);
      setMessage(success);
      setReview(null);
      // Preserve the user's layout, but clear request selections to prevent accidental re-sending.
      setGraph((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          ["batch", "recipient"].includes(node.kind)
            ? { ...node, value: null }
            : node,
        ),
      }));
      void options.loadStock(1);
      onSubmitted();
    } catch (failure) {
      setSubmitError(
        failure instanceof Error
          ? failure.message
          : "Transfer request could not be submitted.",
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const worldWidth = Math.max(
    1280,
    ...graph.nodes.map((node) => node.x + WIDTH + 100),
  );
  const worldHeight = Math.max(680, ...graph.nodes.map((node) => node.y + 500));
  const displayNodeValue = (node: GraphNode) =>
    node.kind === "batch"
      ? (selectedStock?.name ?? "Select a batch")
      : node.kind === "recipient"
        ? (options.recipients.find((item) => item.id === node.value)?.name ??
          "Select a recipient")
        : valueLabel(values.get(node.id));
  const portState = (port: GraphPort) => {
    if (!wires.draft) return undefined;
    const edge = edgeBetweenPorts(wires.draft.anchor, port);
    if (!edge) return undefined;
    const error = connectionError(
      graph.nodes,
      graph.edges.filter((link) => link !== wires.draft?.original),
      edge,
    );
    const hovered =
      wires.draft.target?.node === port.node &&
      wires.draft.target.direction === port.direction &&
      wires.draft.target.input === port.input;
    return hovered
      ? error
        ? "invalid"
        : "target"
      : error
        ? undefined
        : "compatible";
  };

  return (
    <section
      className={styles.editor}
      aria-label="Transfer request graph"
      aria-busy={saving}
    >
      <fieldset disabled={saving || !!review} className={styles.controls}>
        <legend className={styles.srOnly}>Build a transfer request</legend>
        <div className={styles.toolbar}>
          <div>
            <strong>Build a transfer request</strong>
            <span className={styles.badge}>REQUEST BUILDER</span>
          </div>
          <div className={styles.tools}>
            <label className={styles.srOnly} htmlFor="graph-node-type">
              Node type
            </label>
            <select
              id="graph-node-type"
              value={kind}
              onChange={(event) => setKind(event.target.value as NodeKind)}
            >
              {Object.entries(NODE_DEFINITIONS).map(([value, definition]) => (
                <option key={value} value={value}>
                  {definition.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => addNode()}>
              + Add node
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  graph.nodes.length &&
                  !window.confirm("Clear all nodes and start a new graph?")
                )
                  return;
                setGraph(initialTransferGraph());
                setSelectedNode("");
                setConnecting(null);
                wires.cancel();
                setSelectedWire(null);
                setMessage("Graph cleared.");
                setSubmitError("");
              }}
            >
              Clear graph
            </button>
          </div>
        </div>
        <p className={styles.explainer}>
          Connect Batch → Recipient → Transfer quantity → Review transfer
          request. Connect Number or math output to Quantity's Amount input.
          Review the completed transfer and confirm it in the final modal before
          sending.
        </p>
        <nav className={styles.quickAdd} aria-label="Add request nodes">
          {(
            ["batch", "recipient", "number", "quantity", "request"] as const
          ).map((nodeKind) => (
            <button
              type="button"
              key={nodeKind}
              onClick={() => addNode(nodeKind)}
            >
              + {NODE_DEFINITIONS[nodeKind].label}
            </button>
          ))}
        </nav>
        <nav className={styles.quickAdd} aria-label="Add variables and logic">
          {(
            [
              "boolean",
              "number",
              "text",
              "and",
              "or",
              "not",
              "compare",
              "equals",
              "add",
              "subtract",
              "multiply",
              "divide",
              "result",
            ] as const
          ).map((nodeKind) => (
            <button
              type="button"
              key={nodeKind}
              onClick={() => addNode(nodeKind)}
            >
              + {NODE_DEFINITIONS[nodeKind].label}
            </button>
          ))}
        </nav>
        <div className={styles.workspace}>
          <div className={styles.canvasColumn}>
            <div className={styles.canvasTools}>
              <span>
                Drag ports to connect · Drag a wire to reroute · Esc cancels
              </span>
              <div className={styles.tools}>
                {selectedWire && graph.edges.includes(selectedWire) && (
                  <button
                    type="button"
                    onClick={() => {
                      setGraph((current) => ({
                        ...current,
                        edges: current.edges.filter(
                          (edge) => edge !== selectedWire,
                        ),
                      }));
                      setSelectedWire(null);
                    }}
                  >
                    Disconnect wire
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Zoom out"
                  disabled={zoom <= 0.4}
                  onClick={() => setZoom((value) => Math.max(0.4, value - 0.1))}
                >
                  −
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  disabled={zoom >= 1.4}
                  onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(0.75);
                    canvas.current?.scrollTo(0, 0);
                  }}
                >
                  Home
                </button>
              </div>
            </div>
            <div
              className={styles.canvas}
              ref={canvas}
              onPointerMove={wires.track}
              onPointerUp={wires.finish}
              onPointerCancel={wires.cancel}
            >
              {!graph.nodes.length && (
                <div className={styles.empty}>
                  <strong>Your graph starts here</strong>
                  <p>
                    Add a Medicine batch, Recipient facility, Number variable,
                    Transfer quantity and Review transfer request node using the
                    buttons above.
                  </p>
                  <p>You choose the nodes and their connections.</p>
                </div>
              )}
              <div
                style={{
                  width: worldWidth * zoom,
                  height: worldHeight * zoom,
                  position: "relative",
                }}
              >
                <div
                  ref={world}
                  className={styles.world}
                  style={{
                    width: worldWidth,
                    height: worldHeight,
                    transform: `scale(${zoom})`,
                  }}
                >
                  <svg
                    className={styles.wires}
                    width={worldWidth}
                    height={worldHeight}
                    aria-hidden="true"
                  >
                    {graph.edges.map((edge) => {
                      const from = graph.nodes.find(
                        (node) => node.id === edge.from,
                      );
                      const to = graph.nodes.find(
                        (node) => node.id === edge.to,
                      );
                      if (!from || !to) return null;
                      const start = portPoint(graph.nodes, {
                        node: edge.from,
                        direction: "output",
                        input: 0,
                      });
                      const end = portPoint(graph.nodes, {
                        node: edge.to,
                        direction: "input",
                        input: edge.input,
                      });
                      if (!start || !end) return null;
                      const d = wireCurve(start, end);
                      return (
                        <g key={`${edge.to}-${edge.input}`}>
                          <path
                            d={d}
                            fill="none"
                            stroke={colors[NODE_DEFINITIONS[from.kind].output]}
                            strokeWidth={selectedWire === edge ? 4 : 2.5}
                            opacity={wires.draft?.original === edge ? 0.25 : 1}
                          />
                          <path
                            className={styles.wireHit}
                            d={d}
                            fill="none"
                            stroke="transparent"
                            strokeWidth="18"
                            onPointerDown={(event) => {
                              setSelectedWire(edge);
                              setConnecting(null);
                              wires.start(
                                event,
                                {
                                  node: edge.from,
                                  direction: "output",
                                  input: 0,
                                },
                                edge,
                              );
                            }}
                          >
                            <title>
                              Drag this wire to a new input; use the input port
                              to change its source.
                            </title>
                          </path>
                        </g>
                      );
                    })}
                    {wires.draft &&
                      (() => {
                        const anchor = portPoint(
                          graph.nodes,
                          wires.draft.anchor,
                        );
                        if (!anchor) return null;
                        const target = wires.draft.target
                          ? portPoint(graph.nodes, wires.draft.target)
                          : null;
                        const point =
                          target && !wires.draft.error
                            ? target
                            : wires.draft.point;
                        const sourceNode = graph.nodes.find(
                          (node) => node.id === wires.draft?.anchor.node,
                        );
                        const type = sourceNode
                          ? wires.draft.anchor.direction === "output"
                            ? NODE_DEFINITIONS[sourceNode.kind].output
                            : NODE_DEFINITIONS[sourceNode.kind].inputs[
                                wires.draft.anchor.input
                              ]
                          : "boolean";
                        return (
                          <path
                            d={
                              wires.draft.anchor.direction === "output"
                                ? wireCurve(anchor, point)
                                : wireCurve(point, anchor)
                            }
                            fill="none"
                            stroke={
                              wires.draft.error ? "#ff6f86" : colors[type]
                            }
                            strokeWidth="3"
                            strokeDasharray="7 4"
                          />
                        );
                      })()}
                  </svg>
                  {graph.nodes.map((node) => {
                    const definition = NODE_DEFINITIONS[node.kind];
                    const value = values.get(node.id);
                    const recipientConnected = graph.edges.some(
                      (edge) =>
                        edge.from === batchNode?.id &&
                        edge.to === node.id &&
                        edge.input === 0,
                    );
                    return (
                      <article
                        key={node.id}
                        className={`${styles.node} ${selectedNode === node.id ? styles.selected : ""}`}
                        style={{ left: node.x, top: node.y, width: WIDTH }}
                      >
                        <button
                          type="button"
                          className={styles.nodeHeader}
                          data-type={definition.output}
                          aria-label={`Select or move ${node.label}`}
                          onClick={() => {
                            setSelectedNode(node.id);
                            setSelectedWire(null);
                          }}
                          onKeyDown={(event) => {
                            const moves: Record<string, [number, number]> = {
                              ArrowLeft: [-20, 0],
                              ArrowRight: [20, 0],
                              ArrowUp: [0, -20],
                              ArrowDown: [0, 20],
                            };
                            const move = moves[event.key];
                            if (move) {
                              event.preventDefault();
                              updateNode(node.id, {
                                x: Math.max(10, node.x + move[0]),
                                y: Math.max(10, node.y + move[1]),
                              });
                            }
                          }}
                          onPointerDown={(event) => {
                            if (event.button !== 0 || submitting.current)
                              return;
                            event.currentTarget.setPointerCapture(
                              event.pointerId,
                            );
                            setSelectedNode(node.id);
                            drag.current = {
                              id: node.id,
                              x: event.clientX,
                              y: event.clientY,
                              startX: node.x,
                              startY: node.y,
                            };
                          }}
                          onPointerMove={(event) => {
                            const current = drag.current;
                            if (current?.id === node.id)
                              updateNode(node.id, {
                                x: Math.max(
                                  10,
                                  current.startX +
                                    (event.clientX - current.x) / zoom,
                                ),
                                y: Math.max(
                                  10,
                                  current.startY +
                                    (event.clientY - current.y) / zoom,
                                ),
                              });
                          }}
                          onPointerUp={() => {
                            drag.current = null;
                          }}
                          onPointerCancel={() => {
                            drag.current = null;
                          }}
                        >
                          <small>
                            {node.kind === "request"
                              ? "SUBMIT TO BACKEND"
                              : node.kind === "batch" ||
                                  node.kind === "recipient"
                                ? "TRANSFER INPUT"
                                : definition.inputs.length
                                  ? "LOGIC"
                                  : "VARIABLE"}
                          </small>
                          {node.label}
                        </button>
                        <div className={styles.ports}>
                          <div>
                            {definition.inputs.map((type, input) => (
                              <button
                                key={inputLabel(node.kind, input)}
                                type="button"
                                className={styles.inputPort}
                                data-type={type}
                                data-graph-port="input"
                                data-node={node.id}
                                data-input={input}
                                data-drop={portState({
                                  node: node.id,
                                  direction: "input",
                                  input,
                                })}
                                onPointerDown={(event) => {
                                  wires.start(
                                    event,
                                    {
                                      node: node.id,
                                      direction: "input",
                                      input,
                                    },
                                    graph.edges.find(
                                      (edge) =>
                                        edge.to === node.id &&
                                        edge.input === input,
                                    ),
                                  );
                                }}
                                onClick={() => connect(node.id, input)}
                                aria-label={`Connect ${node.label} input ${inputLabel(node.kind, input)} (${type})`}
                              >
                                <i style={{ top: 16 + input * 32 }} />
                                {inputLabel(node.kind, input)}{" "}
                                <small>{type}</small>
                              </button>
                            ))}
                          </div>
                          {node.kind !== "request" && (
                            <button
                              type="button"
                              className={`${styles.outputPort} ${connecting === node.id ? styles.armed : ""}`}
                              data-type={definition.output}
                              data-graph-port="output"
                              data-node={node.id}
                              data-input="0"
                              data-drop={portState({
                                node: node.id,
                                direction: "output",
                                input: 0,
                              })}
                              onPointerDown={(event) => {
                                wires.start(event, {
                                  node: node.id,
                                  direction: "output",
                                  input: 0,
                                });
                              }}
                              aria-label={`Connect from ${node.label} output (${definition.output})`}
                              aria-pressed={connecting === node.id}
                              onClick={() => {
                                if (wires.suppressClick()) return;
                                setConnecting(
                                  connecting === node.id ? null : node.id,
                                );
                                setMessage(
                                  `Output: ${node.label}. Choose a ${definition.output} input.`,
                                );
                              }}
                            >
                              Out <i />
                            </button>
                          )}
                        </div>
                        <div className={styles.nodeValue}>
                          {!["request", "recipient", "quantity"].includes(
                            node.kind,
                          ) &&
                            definition.inputs.map((type, input) => {
                              const edge = graph.edges.find(
                                (link) =>
                                  link.to === node.id && link.input === input,
                              );
                              return (
                                <div
                                  key={inputLabel(node.kind, input)}
                                  className={styles.inputReadout}
                                >
                                  <span>
                                    {inputLabel(node.kind, input)} ? {type}
                                  </span>
                                  <output>
                                    {edge
                                      ? valueLabel(values.get(edge.from))
                                      : "Not connected"}
                                  </output>
                                </div>
                              );
                            })}
                          {node.kind === "batch" ? (
                            <>
                              <select
                                aria-label="Medicine and batch"
                                value={stockId}
                                disabled={options.stockLoading}
                                onChange={(event) =>
                                  updateNode(node.id, {
                                    value: event.target.value || null,
                                  })
                                }
                              >
                                <option value="">
                                  {options.stockLoading
                                    ? "Loading stock…"
                                    : "Select a medicine batch"}
                                </option>
                                {options.stock.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} · {item.batch} · {item.quantity}{" "}
                                    {item.unit ?? "units (unrecorded)"} ·
                                    expires {item.expiry.slice(0, 10)}
                                  </option>
                                ))}
                              </select>
                              {selectedStock && (
                                <small>
                                  Available: {selectedStock.quantity}{" "}
                                  {selectedStock.unit ??
                                    "units (unit unrecorded)"}
                                  <br />
                                  Batch: {selectedStock.batch}
                                  <br />
                                  Expires: {selectedStock.expiry.slice(0, 10)}
                                </small>
                              )}
                              {options.stockError && (
                                <p role="alert">{options.stockError}</p>
                              )}
                              {!options.stockLoading &&
                                !options.stockError &&
                                !options.stock.length && (
                                  <small>
                                    No available, unexpired stock on this page.
                                    Review inventory or load more stock.
                                  </small>
                                )}
                              <button
                                type="button"
                                disabled={options.stockLoading}
                                onClick={() => void options.loadStock(1)}
                              >
                                Refresh stock
                              </button>
                              {options.hasMore && (
                                <button
                                  type="button"
                                  disabled={options.stockLoading}
                                  onClick={() =>
                                    void options.loadStock(options.page + 1)
                                  }
                                >
                                  Load more stock
                                </button>
                              )}
                            </>
                          ) : node.kind === "recipient" ? (
                            <>
                              <select
                                aria-label="Recipient facility"
                                value={
                                  options.recipients.some(
                                    (item) => item.id === node.value,
                                  )
                                    ? String(node.value)
                                    : ""
                                }
                                disabled={
                                  !recipientConnected ||
                                  !selectedStock ||
                                  options.recipientLoading ||
                                  !!options.recipientError
                                }
                                onChange={(event) =>
                                  updateNode(node.id, {
                                    value: event.target.value || null,
                                  })
                                }
                              >
                                <option value="">
                                  {options.recipientLoading
                                    ? "Finding recipients…"
                                    : "Select a recipient"}
                                </option>
                                {options.recipients.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                    {item.city ? ` · ${item.city}` : ""}
                                    {item.distanceKm !== null
                                      ? ` · ${item.distanceKm} km`
                                      : ""}
                                  </option>
                                ))}
                              </select>
                              {!recipientConnected ? (
                                <small>
                                  Connect the Medicine batch output to this
                                  node's Batch input.
                                </small>
                              ) : !selectedStock ? (
                                <small>Select a medicine batch first.</small>
                              ) : (
                                <>
                                  {options.recipientError && (
                                    <p role="alert">{options.recipientError}</p>
                                  )}
                                  {!options.recipientLoading &&
                                    !options.recipientError &&
                                    !options.recipients.length && (
                                      <small>{EMPTY_RECIPIENT_MESSAGE}</small>
                                    )}
                                  <button
                                    type="button"
                                    disabled={options.recipientLoading}
                                    onClick={options.retryRecipients}
                                  >
                                    Retry suggestions
                                  </button>
                                </>
                              )}
                            </>
                          ) : node.kind === "request" ? (
                            <>
                              <strong>
                                {canSubmit
                                  ? "Ready to review"
                                  : "Complete the connections"}
                              </strong>
                              <small>
                                {selectedStock
                                  ? `${selectedStock.name} · batch ${selectedStock.batch}`
                                  : "No batch selected"}
                              </small>
                              <button
                                type="button"
                                className={styles.send}
                                disabled={!canSubmit || saving}
                                onClick={openReview}
                              >
                                Review transfer request
                              </button>
                              <small>
                                Opens the final confirmation preview. Nothing is
                                sent until you confirm.
                              </small>
                            </>
                          ) : node.kind === "boolean" ? (
                            <label>
                              <input
                                type="checkbox"
                                aria-label={`${node.label} value`}
                                checked={node.value === true}
                                onChange={(event) =>
                                  updateNode(node.id, {
                                    value: event.target.checked,
                                  })
                                }
                              />
                              {valueLabel(node.value)}
                            </label>
                          ) : node.kind === "quantity" ? (
                            <>
                              <output>
                                {isAllocation(value)
                                  ? `${value.quantity} ${selectedStock?.unit ?? "units"} → ${options.recipients.find((item) => item.id === value.recipientFacilityId)?.name ?? "Recipient"}`
                                  : "Unknown"}
                              </output>
                              <small>
                                Connect Recipient facility and a Number or math
                                output. Whole units only
                                {selectedStock
                                  ? `; available ${selectedStock.quantity} ${selectedStock.unit ?? "(unit unrecorded)"}`
                                  : ""}
                                .
                              </small>
                            </>
                          ) : node.kind === "number" || node.kind === "text" ? (
                            <input
                              aria-label={`${node.label} value`}
                              type={node.kind === "text" ? "text" : "number"}
                              step={node.kind === "number" ? "any" : undefined}
                              value={
                                node.value == null ? "" : String(node.value)
                              }
                              onChange={(event) =>
                                updateNode(node.id, {
                                  value:
                                    node.kind === "text"
                                      ? event.target.value
                                      : event.target.value === ""
                                        ? null
                                        : Number(event.target.value),
                                })
                              }
                            />
                          ) : (
                            <output
                              data-value={
                                value === true
                                  ? "true"
                                  : value === false
                                    ? "false"
                                    : "unknown"
                              }
                            >
                              {valueLabel(value)}
                            </output>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.statusBar}>
              {Object.entries(colors).map(([type, color]) => (
                <span key={type} style={{ color }}>
                  ● {type}
                </span>
              ))}
              <span>
                {graph.nodes.length} nodes · {graph.edges.length} connections
              </span>
            </div>
          </div>
          <aside className={styles.inspector} aria-label="Node details">
            <h3>Node details</h3>
            {inspected ? (
              <>
                <label>
                  Node name
                  <input
                    value={inspected.label}
                    maxLength={60}
                    onChange={(event) =>
                      updateNode(inspected.id, { label: event.target.value })
                    }
                  />
                </label>
                <p>{NODE_DEFINITIONS[inspected.kind].label}</p>
                {NODE_HELP[inspected.kind] && (
                  <p>{NODE_HELP[inspected.kind]}</p>
                )}
                <div className={styles.readout}>
                  <small>CURRENT VALUE</small>
                  <strong>
                    {inspected.kind === "request"
                      ? canSubmit
                        ? "Ready"
                        : "Incomplete"
                      : displayNodeValue(inspected)}
                  </strong>
                </div>
                <h4>Input connections</h4>
                {!NODE_DEFINITIONS[inspected.kind].inputs.length && (
                  <p>This node has no inputs.</p>
                )}
                {NODE_DEFINITIONS[inspected.kind].inputs.map((type, input) => {
                  const edge = graph.edges.find(
                    (link) => link.to === inspected.id && link.input === input,
                  );
                  return (
                    <div
                      className={styles.connection}
                      key={inputLabel(inspected.kind, input)}
                    >
                      <span>
                        {inputLabel(inspected.kind, input)} · {type}
                        <br />
                        {graph.nodes.find((node) => node.id === edge?.from)
                          ?.label ?? "Unconnected"}
                      </span>
                      {edge && (
                        <button
                          type="button"
                          aria-label={`Disconnect ${inputLabel(inspected.kind, input)}`}
                          onClick={() => {
                            setSubmitError("");
                            setGraph((current) => ({
                              ...current,
                              edges: current.edges.filter(
                                (link) => link !== edge,
                              ),
                            }));
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  className={styles.delete}
                  onClick={removeNode}
                >
                  Delete selected node
                </button>
              </>
            ) : (
              <p>
                Select a node header to rename, inspect or delete it. Arrow keys
                on the header move the node.
              </p>
            )}
            <h4>Request checks</h4>
            {validation.errors.length ? (
              <ul className={styles.checks}>
                {validation.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : (
              <p>
                Connections and values are valid. The backend rechecks
                eligibility and stock when sent.
              </p>
            )}
            {options.stockLoading && <p>Loading stock…</p>}
            {options.recipientLoading && <p>Loading recipients…</p>}
            <p>
              Draft stays while switching views. Leaving the page resets it.
            </p>
          </aside>
        </div>
        {submitError && (
          <p role="alert" className={styles.error}>
            {submitError}
          </p>
        )}
        <output className={styles.feedback}>
          {connecting ? (
            <>
              <span>{message}</span>
              <button
                type="button"
                onClick={() => {
                  setConnecting(null);
                  setMessage("Connection cancelled.");
                }}
              >
                Cancel connection
              </button>
            </>
          ) : (
            message ||
            "Connections never send automatically. Review the completed request, then confirm in the preview modal."
          )}
        </output>
        {validation.payload && (
          <div className={styles.actions}>
            <div>
              <strong>Request summary</strong>
              <p>
                {selectedStock?.name} · batch {selectedStock?.batch} →{" "}
                {
                  options.recipients.find(
                    (item) =>
                      item.id === validation.payload?.recipientFacilityId,
                  )?.name
                }{" "}
                · {validation.payload.quantity}{" "}
                {selectedStock?.unit ?? "units (unrecorded)"}
              </p>
            </div>
            <button
              type="button"
              disabled={!canSubmit || saving}
              className={styles.send}
              onClick={openReview}
            >
              Review transfer request
            </button>
          </div>
        )}
      </fieldset>
      {review && (
        <TransferGraphReview
          review={review}
          saving={saving}
          error={submitError}
          onClose={() => {
            if (!submitting.current) setReview(null);
          }}
          onConfirm={() => void sendRequest()}
        />
      )}
    </section>
  );
}
