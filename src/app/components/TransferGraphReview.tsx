"use client";

import { useEffect, useRef } from "react";
import type { RequestPayload } from "@/app/lib/transfer-graph";
import styles from "./TransferGraph.module.css";

export type TransferReview = {
  payload: RequestPayload;
  medicine: string;
  batch: string;
  expiry: string;
  available: number;
  unit: string;
  recipient: string;
  city: string | null;
  condition: string;
};

export default function TransferGraphReview({
  review,
  saving,
  error,
  onClose,
  onConfirm,
}: {
  review: TransferReview;
  saving: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    modal.showModal();
    backButton.current?.focus();
    return () => modal.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.reviewDialog}
      aria-labelledby="transfer-review-title"
      aria-describedby="transfer-review-description"
      aria-busy={saving}
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <header className={styles.reviewHeader}>
        <span>FINAL REVIEW</span>
        <h2 id="transfer-review-title">Confirm transfer request</h2>
        <p id="transfer-review-description">
          Review the details from your connected nodes. Confirming sends this
          request for approval.
        </p>
      </header>
      <dl className={styles.reviewDetails}>
        <div>
          <dt>Medicine</dt>
          <dd>{review.medicine}</dd>
        </div>
        <div>
          <dt>Batch</dt>
          <dd>{review.batch}</dd>
        </div>
        <div>
          <dt>Expiry</dt>
          <dd>{review.expiry.slice(0, 10)}</dd>
        </div>
        <div>
          <dt>Recipient facility</dt>
          <dd>
            {review.recipient}
            {review.city ? ` · ${review.city}` : ""}
          </dd>
        </div>
        <div>
          <dt>Transfer quantity</dt>
          <dd>
            {review.payload.quantity} {review.unit}
          </dd>
        </div>
        <div>
          <dt>Available stock</dt>
          <dd>
            {review.available} {review.unit}
          </dd>
        </div>
        <div>
          <dt>Graph condition</dt>
          <dd>{review.condition}</dd>
        </div>
      </dl>
      <p className={styles.reviewNote}>
        The backend will recheck your permissions, stock and recipient
        eligibility. Sending a request does not confirm approval, dispatch or
        delivery.
      </p>
      {error && (
        <p role="alert" className={styles.reviewError}>
          {error}
        </p>
      )}
      <footer className={styles.reviewFooter}>
        <button
          ref={backButton}
          type="button"
          disabled={saving}
          onClick={onClose}
        >
          Back to graph
        </button>
        <button
          type="button"
          disabled={saving}
          className={styles.send}
          onClick={onConfirm}
        >
          {saving ? "Sending request…" : "Confirm and send request"}
        </button>
      </footer>
    </dialog>
  );
}
