"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGraphWireDrag } from "@/app/hooks/useGraphWireDrag";
import {
  edgeBetweenPorts,
  GRAPH_NODE_WIDTH,
  type GraphPort,
  portPoint,
  wireCurve,
} from "@/app/lib/graph-wires";
import {
  evaluateRecordGraph,
  type InventoryGraphPayload,
  RECORD_COLORS,
  RECORD_NODES,
  RECORD_PALETTES,
  type RecordGraph as RecordGraphData,
  type RecordGraphMode,
  type RecordNodeKind,
  recordConnectionError,
  recordValueLabel,
  validateRecordGraph,
} from "@/app/lib/record-graph";
import type { GraphEdge } from "@/app/lib/transfer-graph";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import {
  MEDICINE_SERVICE,
  type MedicinePayload,
} from "@/app/services/medicine-service/medicine-service";
import styles from "./TransferGraph.module.css";

type Props = {
  mode: RecordGraphMode;
  medicines?: { id: string; name: string }[];
  facilityId?: string;
  canCreate?: boolean;
  optionsLoading?: boolean;
  optionsError?: string;
  hasMore?: boolean;
  onReloadOptions?: () => void;
  onLoadMore?: () => void;
  onCreated: () => void;
};
type Review = {
  payload: MedicinePayload | InventoryGraphPayload;
  rows: [string, string][];
};

function ReviewDialog({
  review,
  saving,
  error,
  mode,
  onClose,
  onConfirm,
}: {
  review: Review;
  saving: boolean;
  error: string;
  mode: RecordGraphMode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    modal.showModal();
    back.current?.focus();
    return () => modal.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.reviewDialog}
      aria-labelledby={`record-review-${mode}`}
      aria-busy={saving}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <header className={styles.reviewHeader}>
        <span>FINAL REVIEW</span>
        <h2 id={`record-review-${mode}`}>
          {mode === "medicine"
            ? "Confirm medicine creation"
            : "Confirm inventory intake"}
        </h2>
        <p>Check the values from your connected nodes before saving.</p>
      </header>
      <dl className={styles.reviewDetails}>
        {review.rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.reviewNote}>
        The backend will validate your permissions and these values before
        saving.
      </p>
      {error && (
        <p role="alert" className={styles.reviewError}>
          {error}
        </p>
      )}
      <footer className={styles.reviewFooter}>
        <button ref={back} type="button" disabled={saving} onClick={onClose}>
          Back to graph
        </button>
        <button
          type="button"
          disabled={saving}
          className={styles.send}
          onClick={onConfirm}
        >
          {saving ? "Saving…" : "Confirm and save"}
        </button>
      </footer>
    </dialog>
  );
}

export default function RecordGraph({
  mode,
  medicines = [],
  facilityId,
  canCreate = true,
  optionsLoading = false,
  optionsError = "",
  hasMore = false,
  onReloadOptions,
  onLoadMore,
  onCreated,
}: Props) {
  const [graph, setGraph] = useState<RecordGraphData>({ nodes: [], edges: [] });
  const [kind, setKind] = useState<RecordNodeKind>(
    mode === "medicine" ? "text" : "medicine",
  );
  const [selected, setSelected] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const world = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.75);
  const move = useRef<{
    id: string;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const context = { medicines, facilityId };
  const values = evaluateRecordGraph(graph, context);
  const checked = validateRecordGraph(mode, graph, context);
  const ready =
    !!checked.payload && canCreate && !optionsLoading && !optionsError;
  const inspected = graph.nodes.find((node) => node.id === selected);
  const locked = saving || !!review;
  const validateWire = (edge: GraphEdge, original?: GraphEdge) =>
    recordConnectionError(graph, edge, original);
  const commit = (edge: GraphEdge, original?: GraphEdge) => {
    if (submitting.current || review) return;
    const issue = validateWire(edge, original);
    if (issue) {
      setMessage(issue);
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
    setConnecting(null);
    setError("");
    setMessage("Connected. Values updated.");
  };
  const wires = useGraphWireDrag({
    graph,
    world,
    zoom,
    disabled: locked,
    commit,
    announce: setMessage,
    validate: validateWire,
  });
  const updateNode = (
    id: string,
    patch: Partial<RecordGraphData["nodes"][number]>,
  ) => {
    if (submitting.current || review) return;
    setGraph((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === id ? { ...node, ...patch } : node,
      ),
    }));
    setError("");
  };
  const addNode = (nodeKind: RecordNodeKind) => {
    if (locked) return;
    if (
      ["medicineCreate", "inventoryCreate"].includes(nodeKind) &&
      graph.nodes.some((node) => node.kind === nodeKind)
    ) {
      setMessage("This graph already has its final review node.");
      return;
    }
    const id = crypto.randomUUID();
    const index = graph.nodes.length;
    const next = {
      id,
      kind: nodeKind,
      label: RECORD_NODES[nodeKind].label,
      x: 40 + (index % 3) * 340,
      y: 50 + Math.floor(index / 3) * 430,
      value: nodeKind === "boolean" ? false : null,
    };
    setGraph((current) => ({ ...current, nodes: [...current.nodes, next] }));
    setSelected(id);
    setError("");
    window.requestAnimationFrame(() =>
      canvas.current?.scrollTo({
        left: Math.max(0, next.x * zoom - 30),
        top: Math.max(0, next.y * zoom - 30),
      }),
    );
  };
  const portState = (port: GraphPort) => {
    if (!wires.draft) return undefined;
    const edge = edgeBetweenPorts(wires.draft.anchor, port);
    if (!edge) return undefined;
    const issue = validateWire(edge, wires.draft.original);
    const hover =
      wires.draft.target?.node === port.node &&
      wires.draft.target.direction === port.direction &&
      wires.draft.target.input === port.input;
    return hover
      ? issue
        ? "invalid"
        : "target"
      : issue
        ? undefined
        : "compatible";
  };
  const preview = () => {
    if (!ready || !checked.payload) return;
    const payload = { ...checked.payload };
    let rows: [string, string][];
    if (mode === "medicine") {
      const medicine = payload as MedicinePayload;
      rows = [
        ["Generic name", medicine.generic_name],
        ["Brand name", medicine.brand_name],
        ["Manufacturer", medicine.manufacturer],
        ["Dosage form", medicine.dosage_form],
        ["Storage requirement", medicine.storage_temperature],
        ["Strength", medicine.strength || "Not provided"],
        ["GTIN", medicine.gtin || "Not provided"],
      ];
    } else {
      const batch = payload as InventoryGraphPayload;
      rows = [
        [
          "Medicine",
          medicines.find((item) => item.id === batch.medicineId)?.name ??
            "Unavailable",
        ],
        ["Batch number", batch.batchNumber],
        ["Expiry", batch.expiry],
        ["Quantity", `${batch.quantity} ${batch.unit}`],
        ["Facility", "Your current facility"],
      ];
    }
    rows.push([
      "Condition",
      graph.edges.some((edge) => {
        const target = graph.nodes.find((node) => node.id === edge.to);
        return (
          target &&
          RECORD_NODES[target.kind].inputs[edge.input]?.optional &&
          RECORD_NODES[target.kind].inputs[edge.input]?.type === "boolean"
        );
      })
        ? "Passed (true)"
        : "Not connected (optional)",
    ]);
    wires.cancel();
    setConnecting(null);
    setError("");
    setReview({ payload, rows });
  };
  const confirm = async () => {
    if (submitting.current || !review) return;
    const current = validateRecordGraph(mode, graph, context);
    if (
      !canCreate ||
      optionsLoading ||
      optionsError ||
      !current.payload ||
      JSON.stringify(current.payload) !== JSON.stringify(review.payload)
    ) {
      setError(
        current.errors.join(" ") ||
          "The record changed. Return to the graph and review it again.",
      );
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      const response =
        mode === "medicine"
          ? await MEDICINE_SERVICE.create(review.payload as MedicinePayload)
          : await INVENTORY_SERVICE.create(review.payload);
      if (!response.success)
        throw new Error(response.message || "The record could not be saved.");
      const success =
        response.message ||
        (mode === "medicine"
          ? "Medicine created."
          : "Batch added to inventory.");
      toast.success(success);
      setMessage(success);
      setReview(null);
      setGraph((currentGraph) => ({
        ...currentGraph,
        nodes: currentGraph.nodes.map((node) => ({
          ...node,
          value: node.kind === "boolean" ? false : null,
        })),
      }));
      onCreated();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "The record could not be saved.",
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const width = Math.max(
    1280,
    ...graph.nodes.map((node) => node.x + GRAPH_NODE_WIDTH + 100),
  );
  const height = Math.max(650, ...graph.nodes.map((node) => node.y + 500));
  return (
    <section className={styles.editor} aria-label={`${mode} graph builder`}>
      <fieldset className={styles.controls} disabled={locked}>
        <legend className={styles.srOnly}>
          {mode === "medicine"
            ? "Create a catalog medicine"
            : "Add inventory stock"}
        </legend>
        <header className={styles.toolbar}>
          <strong>
            {mode === "medicine"
              ? "Medicine catalog graph"
              : "Inventory intake graph"}
          </strong>
          <div className={styles.tools}>
            <select
              aria-label="Node type"
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as RecordNodeKind)
              }
            >
              {RECORD_PALETTES[mode].map((item) => (
                <option key={item} value={item}>
                  {RECORD_NODES[item].label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => addNode(kind)}>
              + Add node
            </button>
            <button
              type="button"
              onClick={() => {
                if (graph.nodes.length && !window.confirm("Clear this graph?"))
                  return;
                wires.cancel();
                setGraph({ nodes: [], edges: [] });
                setSelected("");
                setConnecting(null);
                setError("");
              }}
            >
              Clear graph
            </button>
          </div>
        </header>
        <p className={styles.explainer}>
          {mode === "medicine"
            ? "Connect Text variables to Medicine identity and Medicine details, then connect both records to Review medicine. Strength and GTIN are optional."
            : "Connect Catalog medicine, a Text batch number and Expiry date to Batch details. Connect that batch, a Number quantity and Selling unit to Stock quantity, then connect to Review inventory intake."}{" "}
          Boolean logic can supply an optional condition. Nothing is saved until
          you review and confirm.
        </p>
        <nav className={styles.quickAdd} aria-label="Add workflow nodes">
          {RECORD_PALETTES[mode].map((item) => (
            <button key={item} type="button" onClick={() => addNode(item)}>
              + {RECORD_NODES[item].label}
            </button>
          ))}
        </nav>
        {!canCreate && (
          <p className={styles.error}>
            Your account needs inventory.manage to save stock. You can still
            explore the graph.
          </p>
        )}
        {optionsError && (
          <p role="alert" className={styles.error}>
            {optionsError}
          </p>
        )}
        <div className={styles.workspace}>
          <div className={styles.canvasColumn}>
            <div className={styles.canvasTools}>
              <span>
                Drag ports to connect · Click ports for keyboard access · Escape
                cancels
              </span>
              <div className={styles.tools}>
                <button
                  type="button"
                  aria-label="Zoom out"
                  disabled={zoom <= 0.4}
                  onClick={() => setZoom((v) => Math.max(0.4, v - 0.1))}
                >
                  −
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  disabled={zoom >= 1.4}
                  onClick={() => setZoom((v) => Math.min(1.4, v + 0.1))}
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
                  <strong>Build your own graph</strong>
                  <p>
                    Add source variables and processing nodes using the palette
                    above. Required ports need wires; only source nodes accept
                    typed values.
                  </p>
                </div>
              )}
              <div
                style={{
                  width: width * zoom,
                  height: height * zoom,
                  position: "relative",
                }}
              >
                <div
                  ref={world}
                  className={styles.world}
                  style={{ width, height, transform: `scale(${zoom})` }}
                >
                  <svg
                    className={styles.wires}
                    width={width}
                    height={height}
                    aria-hidden="true"
                  >
                    {graph.edges.map((edge) => {
                      const from = graph.nodes.find(
                        (node) => node.id === edge.from,
                      );
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
                      const output = from
                        ? RECORD_NODES[from.kind].output
                        : null;
                      if (!start || !end || !output) return null;
                      const d = wireCurve(start, end);
                      return (
                        <g key={`${edge.to}-${edge.input}`}>
                          <path
                            d={d}
                            fill="none"
                            stroke={RECORD_COLORS[output]}
                            strokeWidth="2.5"
                            opacity={wires.draft?.original === edge ? 0.25 : 1}
                          />
                          <path
                            className={styles.wireHit}
                            d={d}
                            fill="none"
                            stroke="transparent"
                            strokeWidth="18"
                            onPointerDown={(event) =>
                              wires.start(
                                event,
                                {
                                  node: edge.from,
                                  direction: "output",
                                  input: 0,
                                },
                                edge,
                              )
                            }
                          >
                            <title>Drag to reroute this connection</title>
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
                        return (
                          <path
                            d={
                              wires.draft.anchor.direction === "output"
                                ? wireCurve(anchor, point)
                                : wireCurve(point, anchor)
                            }
                            fill="none"
                            stroke={wires.draft.error ? "#ff8ca6" : "#9baaff"}
                            strokeWidth="3"
                            strokeDasharray="6 4"
                          />
                        );
                      })()}
                  </svg>
                  {graph.nodes.map((node) => {
                    const definition = RECORD_NODES[node.kind];
                    const value = values.get(node.id);
                    const final = definition.output === null;
                    return (
                      <article
                        key={node.id}
                        className={`${styles.node} ${selected === node.id ? styles.selected : ""}`}
                        style={{
                          left: node.x,
                          top: node.y,
                          width: GRAPH_NODE_WIDTH,
                        }}
                      >
                        <button
                          type="button"
                          className={styles.nodeHeader}
                          style={{
                            background: definition.output
                              ? `${RECORD_COLORS[definition.output]}44`
                              : "#245b48",
                          }}
                          onClick={() => setSelected(node.id)}
                          aria-label={`Select or move ${node.label}`}
                          onPointerDown={(event) => {
                            if (event.button !== 0 || locked) return;
                            event.currentTarget.setPointerCapture(
                              event.pointerId,
                            );
                            setSelected(node.id);
                            move.current = {
                              id: node.id,
                              x: event.clientX,
                              y: event.clientY,
                              left: node.x,
                              top: node.y,
                            };
                          }}
                          onPointerMove={(event) => {
                            const current = move.current;
                            if (current?.id === node.id)
                              updateNode(node.id, {
                                x: Math.max(
                                  10,
                                  current.left +
                                    (event.clientX - current.x) / zoom,
                                ),
                                y: Math.max(
                                  10,
                                  current.top +
                                    (event.clientY - current.y) / zoom,
                                ),
                              });
                          }}
                          onPointerUp={() => {
                            move.current = null;
                          }}
                          onPointerCancel={() => {
                            move.current = null;
                          }}
                          onKeyDown={(event) => {
                            const delta: Record<string, [number, number]> = {
                              ArrowLeft: [-20, 0],
                              ArrowRight: [20, 0],
                              ArrowUp: [0, -20],
                              ArrowDown: [0, 20],
                            };
                            if (delta[event.key]) {
                              event.preventDefault();
                              updateNode(node.id, {
                                x: Math.max(10, node.x + delta[event.key][0]),
                                y: Math.max(10, node.y + delta[event.key][1]),
                              });
                            }
                          }}
                        >
                          <small>
                            {final
                              ? "REVIEW & CONFIRM"
                              : definition.inputs.length
                                ? "PROCESS"
                                : "SOURCE VARIABLE"}
                          </small>
                          {node.label}
                        </button>
                        <div className={styles.ports}>
                          <div>
                            {definition.inputs.map((port, index) => (
                              <button
                                type="button"
                                key={port.name}
                                className={styles.inputPort}
                                data-graph-port="input"
                                data-node={node.id}
                                data-input={index}
                                data-drop={portState({
                                  node: node.id,
                                  direction: "input",
                                  input: index,
                                })}
                                onPointerDown={(event) =>
                                  wires.start(
                                    event,
                                    {
                                      node: node.id,
                                      direction: "input",
                                      input: index,
                                    },
                                    graph.edges.find(
                                      (edge) =>
                                        edge.to === node.id &&
                                        edge.input === index,
                                    ),
                                  )
                                }
                                onClick={() => {
                                  if (wires.suppressClick()) return;
                                  if (connecting)
                                    commit({
                                      from: connecting,
                                      to: node.id,
                                      input: index,
                                    });
                                  else
                                    setMessage(
                                      "Choose an output first, or drag this input onto an output.",
                                    );
                                }}
                                aria-label={`Connect ${node.label} ${port.name}`}
                              >
                                <i
                                  style={{
                                    top: 16 + index * 32,
                                    borderColor: RECORD_COLORS[port.type],
                                  }}
                                />
                                {port.name}
                                {port.optional ? " (optional)" : ""}
                              </button>
                            ))}
                          </div>
                          {definition.output && (
                            <button
                              type="button"
                              className={`${styles.outputPort} ${connecting === node.id ? styles.armed : ""}`}
                              data-graph-port="output"
                              data-node={node.id}
                              data-input="0"
                              data-drop={portState({
                                node: node.id,
                                direction: "output",
                                input: 0,
                              })}
                              onPointerDown={(event) =>
                                wires.start(event, {
                                  node: node.id,
                                  direction: "output",
                                  input: 0,
                                })
                              }
                              onClick={() => {
                                if (!wires.suppressClick())
                                  setConnecting(
                                    connecting === node.id ? null : node.id,
                                  );
                              }}
                              aria-label={`Connect from ${node.label}`}
                              aria-pressed={connecting === node.id}
                            >
                              Out
                              <i
                                style={{
                                  borderColor: RECORD_COLORS[definition.output],
                                }}
                              />
                            </button>
                          )}
                        </div>
                        <div className={styles.nodeValue}>
                          {node.kind === "text" ||
                          node.kind === "number" ||
                          node.kind === "date" ? (
                            <input
                              aria-label={`${node.label} value`}
                              type={
                                node.kind === "text"
                                  ? "text"
                                  : node.kind === "date"
                                    ? "date"
                                    : "number"
                              }
                              step={node.kind === "number" ? "any" : undefined}
                              min={
                                node.kind === "date"
                                  ? new Date().toISOString().slice(0, 10)
                                  : undefined
                              }
                              value={
                                node.value == null ? "" : String(node.value)
                              }
                              onChange={(event) =>
                                updateNode(node.id, {
                                  value:
                                    node.kind === "number"
                                      ? event.target.value === ""
                                        ? null
                                        : Number(event.target.value)
                                      : event.target.value,
                                })
                              }
                            />
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
                              {String(node.value === true)}
                            </label>
                          ) : node.kind === "unit" ? (
                            <select
                              aria-label="Selling unit"
                              value={String(node.value ?? "")}
                              onChange={(event) =>
                                updateNode(node.id, {
                                  value: event.target.value,
                                })
                              }
                            >
                              <option value="">Select a unit</option>
                              {["vial", "pack", "bottle", "box"].map((unit) => (
                                <option key={unit}>{unit}</option>
                              ))}
                            </select>
                          ) : node.kind === "medicine" ? (
                            <>
                              <select
                                aria-label="Catalog medicine"
                                disabled={optionsLoading}
                                value={
                                  medicines.some(
                                    (item) => item.id === node.value,
                                  )
                                    ? String(node.value)
                                    : ""
                                }
                                onChange={(event) =>
                                  updateNode(node.id, {
                                    value: event.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  {optionsLoading
                                    ? "Loading medicines…"
                                    : "Select a medicine"}
                                </option>
                                {medicines.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                              {onReloadOptions && (
                                <button
                                  type="button"
                                  disabled={optionsLoading}
                                  onClick={onReloadOptions}
                                >
                                  Refresh medicines
                                </button>
                              )}
                              {hasMore && onLoadMore && (
                                <button
                                  type="button"
                                  disabled={optionsLoading}
                                  onClick={onLoadMore}
                                >
                                  Load more medicines
                                </button>
                              )}
                            </>
                          ) : final ? (
                            <>
                              <strong>
                                {ready
                                  ? "Ready for review"
                                  : "Complete required connections"}
                              </strong>
                              <button
                                type="button"
                                className={styles.send}
                                disabled={!ready}
                                onClick={preview}
                              >
                                Review{" "}
                                {mode === "medicine"
                                  ? "medicine"
                                  : "inventory intake"}
                              </button>
                              <small>
                                Preview first. Confirm in the final modal to
                                save.
                              </small>
                            </>
                          ) : (
                            <>
                              <output>{recordValueLabel(value)}</output>
                              {definition.inputs.map((port, index) => {
                                const edge = graph.edges.find(
                                  (link) =>
                                    link.to === node.id && link.input === index,
                                );
                                return (
                                  <small key={port.name}>
                                    {port.name}:{" "}
                                    {edge
                                      ? recordValueLabel(values.get(edge.from))
                                      : port.optional
                                        ? "Optional"
                                        : "Not connected"}
                                  </small>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.statusBar}>
              <span>
                {graph.nodes.length} nodes · {graph.edges.length} wires
              </span>
              <span>Source variables → processing → review</span>
            </div>
          </div>
          <aside className={styles.inspector} aria-label="Graph node details">
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
                <p>
                  Current output: {recordValueLabel(values.get(inspected.id))}
                </p>
                {RECORD_NODES[inspected.kind].inputs.map((port, index) => {
                  const edge = graph.edges.find(
                    (link) => link.to === inspected.id && link.input === index,
                  );
                  return (
                    <div className={styles.connection} key={port.name}>
                      <span>
                        {port.name}
                        <br />
                        {graph.nodes.find((item) => item.id === edge?.from)
                          ?.label ?? "Unconnected"}
                      </span>
                      {edge && (
                        <button
                          type="button"
                          aria-label={`Disconnect ${port.name}`}
                          onClick={() =>
                            setGraph((current) => ({
                              ...current,
                              edges: current.edges.filter(
                                (link) => link !== edge,
                              ),
                            }))
                          }
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
                  onClick={() => {
                    setGraph((current) => ({
                      nodes: current.nodes.filter(
                        (node) => node.id !== selected,
                      ),
                      edges: current.edges.filter(
                        (edge) =>
                          edge.from !== selected && edge.to !== selected,
                      ),
                    }));
                    if (connecting === selected) setConnecting(null);
                    setSelected("");
                  }}
                >
                  Delete node
                </button>
              </>
            ) : (
              <p>
                Select a header to rename, inspect or delete a node. Arrow keys
                on a header move it.
              </p>
            )}
            <h4>Validation</h4>
            {checked.errors.length ? (
              <ul className={styles.checks}>
                {checked.errors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Graph values are valid. Review and confirm before saving.</p>
            )}
            <p>
              Draft stays when switching views and resets when leaving the page.
            </p>
          </aside>
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <output className={styles.feedback}>
          {message ||
            "Add nodes and connect matching ports. Processing nodes have no typed-value overrides."}
          {connecting && (
            <button
              type="button"
              onClick={() => {
                setConnecting(null);
                wires.cancel();
              }}
            >
              Cancel connection
            </button>
          )}
        </output>
      </fieldset>
      {review && (
        <ReviewDialog
          review={review}
          mode={mode}
          saving={saving}
          error={error}
          onClose={() => {
            if (!submitting.current) setReview(null);
          }}
          onConfirm={() => void confirm()}
        />
      )}
    </section>
  );
}
