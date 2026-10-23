"use client";

import { ClipboardCheck, RefreshCw, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import management from "@/app/components/Management.module.css";
import styles from "@/app/components/OrdersScreen.module.css";
import { useDashboardRefresh } from "@/app/hooks/useDashboardRefresh";
import { prescriptionLocalTime as date } from "@/app/lib/prescription-display";
import {
  ADMIN_PRESCRIPTION_SERVICE,
  type PrescriptionDecision,
  type PrescriptionReviewDetail,
  type PrescriptionReviewPage,
} from "@/app/services/admin-service/admin-prescription-service";

const medicineName = (item: PrescriptionReviewDetail["medicine"]) =>
  item?.name || item?.generic_name || "Not provided";

export default function AdminPrescriptionsPage({
  canReview,
}: {
  canReview: boolean;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Pending");
  const [data, setData] = useState<PrescriptionReviewPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<PrescriptionReviewDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailRevision, setDetailRevision] = useState(0);
  const [decision, setDecision] = useState<PrescriptionDecision | "">("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const saveLock = useRef(false);
  const { refreshVersion, refresh } = useDashboardRefresh(!selected && !saving);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshVersion requests a fresh persisted queue after refresh or decisions.
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (query) params.set("q", query);
    if (status) params.set("authStatus", status);
    void ADMIN_PRESCRIPTION_SERVICE.list(params)
      .then((response) => {
        if (!current) return;
        if (!response.success)
          throw new Error(
            response.message ||
              "Prescription review queue could not be loaded.",
          );
        const result = response.data as PrescriptionReviewPage;
        if (
          !Array.isArray(result?.items) ||
          !result.pagination ||
          !Number.isInteger(result.pagination.total)
        )
          throw new Error(
            "Prescription review returned an unexpected response.",
          );
        setData(result);
      })
      .catch((failure) => {
        if (current) {
          setData(null);
          setError(
            failure instanceof Error
              ? failure.message
              : "Prescriptions are unavailable.",
          );
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [page, query, status, refreshVersion]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: detailRevision reloads the server version after a conflict or retry.
  useEffect(() => {
    if (!selected) return;
    let current = true;
    setDetail(null);
    setDetailLoading(true);
    setDetailError("");
    setDecision("");
    setReason("");
    void ADMIN_PRESCRIPTION_SERVICE.detail(selected)
      .then((response) => {
        if (!current) return;
        if (!response.success)
          throw new Error(
            response.message || "Prescription details could not be loaded.",
          );
        const result = response.data as PrescriptionReviewDetail;
        if (
          result?.id !== selected ||
          !Number.isInteger(result.version) ||
          !Array.isArray(result.allowedDecisions) ||
          !Array.isArray(result.events)
        )
          throw new Error("Prescription review details are unavailable.");
        setDetail(result);
      })
      .catch((failure) => {
        if (current)
          setDetailError(
            failure instanceof Error
              ? failure.message
              : "Prescription details are unavailable.",
          );
      })
      .finally(() => {
        if (current) setDetailLoading(false);
      });
    return () => {
      current = false;
    };
  }, [selected, detailRevision]);

  function open(id: string) {
    setSelected(id);
    setDecisionError("");
    setNotice("");
    dialog.current?.showModal();
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !detail ||
      !canReview ||
      !decision ||
      !detail.allowedDecisions.includes(decision) ||
      !reason.trim() ||
      saveLock.current
    )
      return;
    saveLock.current = true;
    setSaving(true);
    setDecisionError("");
    try {
      const response = await ADMIN_PRESCRIPTION_SERVICE.decideCurrent(
        detail.id,
        {
          decision,
          expectedVersion: detail.version,
          reason: reason.trim(),
        },
      );
      if (!response.success) {
        if (response.status === 409) {
          setDetailRevision((value) => value + 1);
          throw new Error(
            "This prescription changed. Review the latest details before deciding again.",
          );
        }
        throw new Error(
          response.message || "The review decision could not be saved.",
        );
      }
      setNotice(
        decision === "APPROVE"
          ? "Prescription authorization approved."
          : "Prescription authorization rejected.",
      );
      dialog.current?.close();
      setSelected(null);
      refresh();
      window.dispatchEvent(new Event("prescriptions:updated"));
    } catch (failure) {
      setDecisionError(
        failure instanceof Error
          ? failure.message
          : "The decision could not be saved.",
      );
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Network / Clinical authorization</p>
          <h1>Prescription review</h1>
          <p className={styles.muted}>
            Review the saved prescription before approving or rejecting
            authorization.
          </p>
        </div>
        <button
          type="button"
          className={styles.button}
          disabled={loading}
          onClick={refresh}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </header>
      {notice && <output className={styles.notice}>{notice}</output>}
      <section
        className={styles.panel}
        aria-label="Prescription review queue"
        aria-busy={loading}
      >
        <form
          className={styles.toolbar}
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
            setPage(1);
          }}
        >
          <label>
            Search prescriptions
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Patient code, medicine, pharmacy or prescriber"
            />
          </label>
          <label>
            Authorization
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
          <button
            type="submit"
            className={`${styles.button} ${styles.primary}`}
          >
            Search
          </button>
        </form>
        {loading ? (
          <output className={styles.empty}>Loading prescription queue…</output>
        ) : error ? (
          <div className={styles.empty}>
            <p role="alert" className={styles.error}>
              {error}
            </p>
            <button type="button" className={styles.button} onClick={refresh}>
              Try again
            </button>
          </div>
        ) : data?.items.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Patient reference</th>
                    <th scope="col">Created by</th>
                    <th scope="col">Created at</th>
                    <th scope="col">Medicine</th>
                    <th scope="col">Insurer / payment</th>
                    <th scope="col">Pharmacy</th>
                    <th scope="col">Authorization</th>
                    <th scope="col">Dispensing stage</th>
                    <th scope="col">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.patient_ref || "Not provided"}</strong>
                      </td>
                      <td>{item.prescriber?.name || "Not provided"}</td>
                      <td className="whitespace-nowrap">
                        {date(item.created_at)}
                      </td>
                      <td>
                        {medicineName(item.medicine)}
                        <p className={styles.muted}>
                          {item.medicine?.strength} · Quantity:{" "}
                          {item.qty ?? "Not provided"}
                        </p>
                      </td>
                      <td>{item.insurer || "Not provided"}</td>
                      <td>
                        {item.pharmacy?.name ||
                          item.pharmacy_name ||
                          "Not provided"}
                      </td>
                      <td>
                        <span className={styles.badge}>
                          {item.auth_status || "Not provided"}
                        </span>
                      </td>
                      <td>{item.order_stage || "Not provided"}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.button}
                          onClick={() => open(item.id)}
                        >
                          <ClipboardCheck size={15} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className={styles.pagination}>
              <span className={styles.muted}>
                {data.pagination.total} prescriptions
              </span>
              <div>
                <button
                  type="button"
                  className={styles.button}
                  disabled={page <= 1}
                  onClick={() => setPage((v) => v - 1)}
                >
                  Previous
                </button>
                <span className={styles.muted}>
                  Page {page} of {data.pagination.totalPages}
                </span>
                <button
                  type="button"
                  className={styles.button}
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((v) => v + 1)}
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className={styles.empty}>
            <ClipboardCheck size={30} />
            <h2>No matching prescriptions</h2>
            <p className={styles.muted}>
              Try another authorization status or search.
            </p>
          </div>
        )}
      </section>

      <dialog
        ref={dialog}
        className={`${management.recordDialog} ${styles.screen}`}
        aria-labelledby="prescription-review-title"
        onCancel={(event) => {
          if (saveLock.current) event.preventDefault();
        }}
        onClose={() => {
          setSelected(null);
          setDetail(null);
        }}
      >
        <header className={management.dialogHeader}>
          <div>
            <p className={styles.eyebrow}>Prescription authorization</p>
            <h2 id="prescription-review-title">Review prescription</h2>
            <p className={styles.muted}>
              Approval records authorization. It does not take payment or place
              a purchase.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close prescription review"
            className={styles.button}
            disabled={saving}
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </button>
        </header>
        <div className={management.dialogBody} aria-busy={detailLoading}>
          {detailLoading ? (
            <output className={styles.empty}>
              Loading saved prescription…
            </output>
          ) : detailError ? (
            <div className={styles.empty}>
              <p role="alert" className={styles.error}>
                {detailError}
              </p>
              <button
                type="button"
                className={styles.button}
                onClick={() => setDetailRevision((v) => v + 1)}
              >
                Try again
              </button>
            </div>
          ) : (
            detail && (
              <>
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className={styles.badge}>
                    Authorization: {detail.auth_status}
                  </span>
                  <span className={styles.badge}>
                    Dispensing: {detail.order_stage}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <section className={management.reviewSection}>
                    <h3>Patient &amp; clinical record</h3>
                    <dl className={styles.facts}>
                      <div>
                        <dt>Patient reference</dt>
                        <dd>{detail.patient_ref || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Diagnosis</dt>
                        <dd>{detail.icd10 || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>TNM stage</dt>
                        <dd>{detail.tnm_stage || "Not recorded"}</dd>
                      </div>
                      <div>
                        <dt>Created by</dt>
                        <dd>{detail.prescriber?.name || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Created at</dt>
                        <dd>{date(detail.created_at)}</dd>
                      </div>
                    </dl>
                  </section>
                  <section className={management.reviewSection}>
                    <h3>Medicine &amp; dispensing</h3>
                    <dl className={styles.facts}>
                      <div>
                        <dt>Medicine</dt>
                        <dd>{medicineName(detail.medicine)}</dd>
                      </div>
                      <div>
                        <dt>Strength</dt>
                        <dd>{detail.medicine?.strength || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Quantity</dt>
                        <dd>{detail.qty ?? "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Insurer / payment</dt>
                        <dd>{detail.insurer || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Pharmacy</dt>
                        <dd>
                          {detail.pharmacy?.name ||
                            detail.pharmacy_name ||
                            "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>
                          {[detail.pharmacy?.city, detail.pharmacy?.state]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
                <section className="mt-6">
                  <h3>Description</h3>
                  <p className="mb-6 mt-3 whitespace-pre-wrap break-words rounded-xl border border-g200 bg-g50 p-4 text-sm text-g800">
                    {detail.description?.trim()
                      ? detail.description
                      : "No description provided"}
                  </p>
                  <h3>Review history</h3>
                  {detail.events.length ? (
                    <ol className="mt-3 space-y-3">
                      {detail.events.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-xl border border-g200 p-3 text-sm"
                        >
                          <p>{item.message}</p>
                          <p className={styles.muted}>
                            {item.actorName?.trim() || "Actor not recorded."} ·{" "}
                            {date(item.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className={styles.muted}>No review events recorded.</p>
                  )}
                </section>
                {canReview && detail.allowedDecisions.length > 0 ? (
                  <form
                    className={`${styles.form} mt-6`}
                    onSubmit={(e) => void submit(e)}
                  >
                    <h3>Record a decision</h3>
                    <label>
                      Decision
                      <select
                        required
                        disabled={saving}
                        value={decision}
                        onChange={(e) =>
                          setDecision(e.target.value as PrescriptionDecision)
                        }
                      >
                        <option value="">Choose a decision</option>
                        {detail.allowedDecisions
                          .filter((v) => v === "APPROVE" || v === "REJECT")
                          .map((value) => (
                            <option key={value} value={value}>
                              {value === "APPROVE"
                                ? "Approve authorization"
                                : "Reject authorization"}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Review reason
                      <textarea
                        required
                        maxLength={1000}
                        rows={3}
                        disabled={saving}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain the decision for the prescription audit record"
                      />
                    </label>
                    <p className={styles.muted}>
                      Confirm the saved clinical and dispensing details before
                      submitting. Your identity and reason will be recorded.
                    </p>
                    <button
                      type="submit"
                      className={`${styles.button} ${styles.primary}`}
                      disabled={saving || !decision || !reason.trim()}
                    >
                      {saving
                        ? "Saving decision…"
                        : decision === "APPROVE"
                          ? "Confirm approval"
                          : decision === "REJECT"
                            ? "Confirm rejection"
                            : "Confirm decision"}
                    </button>
                  </form>
                ) : (
                  <p className="mt-6 rounded-xl bg-g50 p-4 text-sm text-g600">
                    {canReview
                      ? "No authorization decisions are currently permitted for this prescription."
                      : "You have read-only access. Prescription review permission is required to record a decision."}
                  </p>
                )}
              </>
            )
          )}
          {decisionError && (
            <p role="alert" className={`${styles.error} mt-4`}>
              {decisionError}
            </p>
          )}
        </div>
        <footer className={management.dialogFooter}>
          <span className={styles.muted}>
            Clinical review record · Protected admin access
          </span>
          <button
            type="button"
            className={styles.button}
            disabled={saving}
            onClick={() => dialog.current?.close()}
          >
            Close review
          </button>
        </footer>
      </dialog>
    </div>
  );
}
