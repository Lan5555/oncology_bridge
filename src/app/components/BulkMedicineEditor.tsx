"use client";

import { GitBranch, Grip, List, Plus, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  BULK_MEDICINE_FIELDS,
  type BulkMedicine,
  type BulkMedicineError,
  bulkApiErrors,
  bulkFailureMessage,
  bulkMedicinePayload,
  emptyBulkMedicine,
  validateBulkMedicines,
} from "@/app/lib/bulk-medicines";
import { MEDICINE_SERVICE } from "@/app/services/medicine-service/medicine-service";
import styles from "./BulkMedicineEditor.module.css";

type MedicineNode = { id: number; value: BulkMedicine; x: number; y: number };

export default function BulkMedicineEditor({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (count: number) => void;
}) {
  const prefix = useId();
  const [nodes, setNodes] = useState<MedicineNode[]>([]);
  const [graph, setGraph] = useState(true);
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<BulkMedicineError[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const submitting = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    pointerId: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  useEffect(() => {
    // Start with full-width cards on phones; Graph remains available on demand.
    if (window.matchMedia("(max-width: 767px)").matches) setGraph(false);
  }, []);
  const showErrors = (issues: BulkMedicineError[], text: string) => {
    setErrors(issues);
    setMessage(text);
    requestAnimationFrame(() => errorSummary.current?.focus());
  };
  const move = (id: number, x: number, y: number) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === id
          ? { ...node, x: Math.max(24, x), y: Math.max(24, y) }
          : node,
      ),
    );
  };
  const preview = () => {
    const issues = validateBulkMedicines(nodes.map((node) => node.value));
    if (issues.length) {
      showErrors(
        issues,
        "Check the highlighted rows before reviewing this batch.",
      );
      return;
    }
    setErrors([]);
    setMessage("");
    setReview(true);
  };
  const save = async () => {
    if (submitting.current || !review) return;
    const payload = bulkMedicinePayload(nodes.map((node) => node.value));
    const issues = validateBulkMedicines(payload);
    if (issues.length) {
      setReview(false);
      showErrors(issues, "Check the medicine details.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setErrors([]);
    setMessage("");
    try {
      const response = await MEDICINE_SERVICE.createBulk(payload);
      if (!response.success || response.status !== 201) {
        setReview(false);
        showErrors(
          bulkApiErrors(response.data),
          response.message || bulkFailureMessage(response.status),
        );
        return;
      }
      const data = response.data;
      if (
        !data ||
        !Number.isInteger(data.count) ||
        data.count !== payload.length ||
        !Array.isArray(data.medicines) ||
        data.medicines.length !== data.count
      ) {
        setReview(false);
        showErrors(
          [],
          "The server returned an unexpected confirmation. Your rows have been kept. Refresh the catalog before retrying to check whether they were created.",
        );
        return;
      }
      setNodes([]);
      setReview(false);
      onCreated(data.count);
    } catch (failure) {
      setReview(false);
      showErrors(
        [],
        failure instanceof Error ? failure.message : bulkFailureMessage(),
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  const canvasView = graph && !review;
  const width = Math.max(1040, ...nodes.map((node) => node.x + 390));
  const height = Math.max(600, ...nodes.map((node) => node.y + 690));

  return (
    <section
      hidden={!open}
      className={styles.editor}
      aria-labelledby={`${prefix}-title`}
      aria-busy={saving}
    >
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Catalog creation · One atomic batch
          </span>
          <h2 id={`${prefix}-title`}>
            {review ? "Review medicines" : "Bulk add medicines"}
          </h2>
          <p>
            All medicines succeed or fail together. Add inventory quantities,
            batches and expiry dates separately through inventory intake.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close bulk medicine editor"
        >
          <X size={18} />
        </button>
      </header>
      <div className={styles.toolbar}>
        <strong>{nodes.length} / 100 medicines</strong>
        {!review && (
          <>
            <div className={styles.views}>
              <button
                type="button"
                aria-pressed={graph}
                disabled={saving}
                onClick={() => setGraph(true)}
              >
                <GitBranch size={15} />
                Graph
              </button>
              <button
                type="button"
                aria-pressed={!graph}
                disabled={saving}
                onClick={() => setGraph(false)}
              >
                <List size={15} />
                Rows
              </button>
            </div>
            <button
              type="button"
              disabled={saving || nodes.length >= 100}
              onClick={() => {
                const id = nextId.current++;
                setNodes((current) => [
                  ...current,
                  {
                    id,
                    value: emptyBulkMedicine(),
                    x: 32 + (current.length % 2) * 410,
                    y: Math.max(150, ...current.map((item) => item.y + 690)),
                  },
                ]);
                setErrors([]);
                setMessage("");
                requestAnimationFrame(() =>
                  document.getElementById(`${prefix}-${id}-gtin`)?.focus(),
                );
              }}
            >
              <Plus size={15} />
              Add medicine node
            </button>
            {graph && (
              <button
                type="button"
                disabled={saving || !nodes.length}
                onClick={() => {
                  setNodes((current) =>
                    current.map((node, index) => ({
                      ...node,
                      x: 32 + (index % 2) * 410,
                      y: 150 + Math.floor(index / 2) * 690,
                    })),
                  );
                }}
              >
                Arrange nodes
              </button>
            )}
          </>
        )}
      </div>
      {message && (
        <div
          className={styles.error}
          role="alert"
          tabIndex={-1}
          ref={errorSummary}
        >
          <strong>{message}</strong>
          <p>Your entered rows are kept.</p>
          {errors.length > 0 && (
            <ul>
              {errors.map((error, index) => {
                const node = nodes[error.index];
                const knownField = BULK_MEDICINE_FIELDS.some(
                  ([field]) => field === error.field,
                );
                return (
                  <li key={`${error.index}-${error.field}-${index}`}>
                    {node && knownField ? (
                      <a
                        href={`#${prefix}-${node.id}-${error.field}`}
                        onClick={(event) => {
                          event.preventDefault();
                          setSelected(node.id);
                          const input = document.getElementById(
                            `${prefix}-${node.id}-${error.field}`,
                          );
                          input?.focus({ preventScroll: true });
                          input?.scrollIntoView({
                            block: "nearest",
                            inline: "nearest",
                          });
                        }}
                      >
                        Row {error.index + 1} · {error.field}: {error.message}
                      </a>
                    ) : (
                      `${error.index >= 0 ? `Row ${error.index + 1} · ` : ""}${error.field}: ${error.message}`
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      <p className={styles.help}>
        {review
          ? "Confirm the seven fields for every row before creating the batch."
          : canvasView
            ? "Each medicine node connects to the batch automatically. Drag a node by its header, or focus the handle and use arrow keys to move it. All seven fields are required."
            : "All seven fields are required. GTINs stay as text to preserve leading zeros."}
      </p>
      {canvasView && (
        <p className={styles.mobileHint}>
          Swipe the canvas to explore. Drag a title bar to move a node, or
          choose Rows for full-width editing.
        </p>
      )}
      <div
        ref={viewport}
        className={canvasView ? styles.viewport : styles.rows}
      >
        <div
          className={canvasView ? styles.canvas : styles.rowGrid}
          style={canvasView ? { width, height } : undefined}
        >
          {canvasView && (
            <>
              <svg
                className={styles.wires}
                width={width}
                height={height}
                aria-hidden="true"
              >
                {nodes.map((node) => (
                  <path
                    key={node.id}
                    d={`M 465 108 C 465 ${node.y - 20}, ${node.x + 175} ${node.y - 20}, ${node.x + 175} ${node.y}`}
                  />
                ))}
              </svg>
              <div className={styles.batch}>
                <GitBranch size={19} />
                <div>
                  <strong>Medicine batch</strong>
                  <span>
                    {nodes.length} connected medicines · Review below to save
                  </span>
                </div>
              </div>
            </>
          )}
          {!nodes.length && (
            <p className={styles.empty}>
              Start with “Add medicine node” to build your batch.
            </p>
          )}
          {nodes.map((node, index) => (
            <article
              key={node.id}
              className={styles.node}
              data-selected={selected === node.id}
              data-dragging={dragging === node.id}
              onFocusCapture={() => setSelected(node.id)}
              style={
                canvasView
                  ? {
                      position: "absolute",
                      left: node.x,
                      top: node.y,
                      width: 350,
                      height: 640,
                      zIndex: selected === node.id ? 2 : 1,
                    }
                  : undefined
              }
              aria-label={`Medicine row ${index + 1}`}
            >
              <div className={styles.nodeHeader}>
                {canvasView && (
                  <button
                    type="button"
                    className={styles.handle}
                    disabled={saving}
                    aria-label={`Move row ${index + 1} with drag or arrow keys`}
                    onPointerDown={(event) => {
                      if (saving || event.button !== 0 || drag.current) return;
                      event.preventDefault();
                      event.currentTarget.focus({ preventScroll: true });
                      setSelected(node.id);
                      setDragging(node.id);
                      drag.current = {
                        id: node.id,
                        x: event.clientX,
                        y: event.clientY,
                        originX: node.x,
                        originY: node.y,
                        pointerId: event.pointerId,
                        scrollLeft: viewport.current?.scrollLeft ?? 0,
                        scrollTop: viewport.current?.scrollTop ?? 0,
                      };
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      const start = drag.current;
                      if (
                        start?.id === node.id &&
                        start.pointerId === event.pointerId
                      )
                        move(
                          node.id,
                          start.originX +
                            event.clientX -
                            start.x +
                            (viewport.current?.scrollLeft ?? 0) -
                            start.scrollLeft,
                          start.originY +
                            event.clientY -
                            start.y +
                            (viewport.current?.scrollTop ?? 0) -
                            start.scrollTop,
                        );
                    }}
                    onPointerUp={(event) => {
                      if (drag.current?.pointerId !== event.pointerId) return;
                      drag.current = null;
                      setDragging(null);
                      if (
                        event.currentTarget.hasPointerCapture(event.pointerId)
                      )
                        event.currentTarget.releasePointerCapture(
                          event.pointerId,
                        );
                    }}
                    onPointerCancel={() => {
                      drag.current = null;
                      setDragging(null);
                    }}
                    onLostPointerCapture={() => {
                      drag.current = null;
                      setDragging(null);
                    }}
                    onKeyDown={(event) => {
                      const step = event.shiftKey ? 50 : 10;
                      const offsets: Record<string, [number, number]> = {
                        ArrowLeft: [-step, 0],
                        ArrowRight: [step, 0],
                        ArrowUp: [0, -step],
                        ArrowDown: [0, step],
                      };
                      const offset = offsets[event.key];
                      if (offset) {
                        event.preventDefault();
                        move(node.id, node.x + offset[0], node.y + offset[1]);
                      }
                    }}
                  >
                    <Grip size={16} />
                    <strong>
                      Row {index + 1}
                      {node.value.generic_name.trim()
                        ? ` · ${node.value.generic_name}`
                        : " · New medicine"}
                    </strong>
                  </button>
                )}
                {!canvasView && (
                  <strong>
                    Row {index + 1}
                    {node.value.generic_name.trim()
                      ? ` · ${node.value.generic_name}`
                      : " · New medicine"}
                  </strong>
                )}
                {!review && (
                  <button
                    type="button"
                    disabled={saving}
                    aria-label={`Remove row ${index + 1}`}
                    onClick={() => {
                      setNodes((current) =>
                        current.filter((item) => item.id !== node.id),
                      );
                      setErrors([]);
                      setMessage("");
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className={styles.nodeBody}>
                {errors.some((error) => error.index === index) && (
                  <p className={styles.nodeError}>
                    {errors.filter((error) => error.index === index).length}{" "}
                    issues in this medicine. Check the fields below.
                    {errors
                      .filter(
                        (error) =>
                          error.index === index &&
                          !BULK_MEDICINE_FIELDS.some(
                            ([field]) => field === error.field,
                          ),
                      )
                      .map((error) => ` ${error.message}`)
                      .join("")}
                  </p>
                )}
                <fieldset disabled={saving || review} className={styles.fields}>
                  <legend className={styles.srOnly}>
                    Row {index + 1} medicine details
                  </legend>
                  {BULK_MEDICINE_FIELDS.map(([field, label]) => {
                    const id = `${prefix}-${node.id}-${field}`;
                    const issues = errors.filter(
                      (error) => error.index === index && error.field === field,
                    );
                    return (
                      <label key={field} htmlFor={id}>
                        <span>{label} *</span>
                        <input
                          id={id}
                          type="text"
                          required
                          value={node.value[field]}
                          inputMode={field === "gtin" ? "numeric" : undefined}
                          aria-invalid={issues.length > 0}
                          aria-describedby={
                            issues.length ? `${id}-error` : undefined
                          }
                          onChange={(event) => {
                            const value = event.target.value;
                            setNodes((current) =>
                              current.map((item) =>
                                item.id === node.id
                                  ? {
                                      ...item,
                                      value: { ...item.value, [field]: value },
                                    }
                                  : item,
                              ),
                            );
                            setErrors((current) =>
                              current.filter(
                                (error) =>
                                  error.index !== index ||
                                  error.field !== field,
                              ),
                            );
                          }}
                        />
                        {issues.length > 0 && (
                          <span
                            className={styles.fieldError}
                            id={`${id}-error`}
                          >
                            {issues.map((issue) => issue.message).join(" ")}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </fieldset>
              </div>
            </article>
          ))}
        </div>
      </div>
      <footer className={styles.footer}>
        <span>Draft kept while this page stays open. No stock is created.</span>
        {review ? (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={() => setReview(false)}
            >
              Back to editing
            </button>
            <button
              type="button"
              className={styles.primary}
              disabled={saving}
              onClick={() => void save()}
            >
              {saving
                ? "Saving batch…"
                : `Confirm and create ${nodes.length} medicines`}
            </button>
          </>
        ) : (
          <button
            type="button"
            className={styles.primary}
            disabled={saving || nodes.length === 0}
            onClick={preview}
          >
            Review batch
          </button>
        )}
      </footer>
    </section>
  );
}
