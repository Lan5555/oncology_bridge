"use client";

import { X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  type PrescriptionDisplayRow,
  prescriptionLocalTime,
} from "../lib/prescription-display";
import { PRESCRIPTION_SERVICE } from "../services/prescription-service/prescription-service";
import management from "./Management.module.css";
import styles from "./OrdersScreen.module.css";
import PrescriptionDescriptionField from "./PrescriptionDescriptionField";

export default function PrescriptionDetailsDialog({
  record,
  canEdit,
  onClose,
  onSaved,
}: {
  record: PrescriptionDisplayRow;
  canEdit: boolean;
  onClose: () => void;
  onSaved: (description: string | null) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const savingLock = useRef(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(record.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const eligible =
    canEdit &&
    record.status.trim().toUpperCase() === "PENDING" &&
    record.order.trim().toUpperCase() === "WAITING";
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!eligible || savingLock.current || draft.length > 2000) return;
    savingLock.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await PRESCRIPTION_SERVICE.update(record.id, {
        description: draft,
      });
      if (!response.success)
        throw new Error(
          response.status === 409
            ? "This prescription changed or is no longer editable. Close and refresh the list before trying again."
            : response.message || "Description could not be saved.",
        );
      const saved = response.data?.description;
      if (saved !== null && typeof saved !== "string")
        throw new Error(
          "The server did not return the saved description. Close and refresh to confirm the update.",
        );
      onSaved(saved);
      setDraft(saved ?? "");
      setEditing(false);
      setNotice("Description saved.");
      window.dispatchEvent(new Event("prescriptions:updated"));
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Description could not be saved.",
      );
    } finally {
      savingLock.current = false;
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className={management.recordDialog}
      aria-labelledby="prescription-details-title"
      onClose={onClose}
      onCancel={(event) => {
        if (savingLock.current) event.preventDefault();
      }}
    >
      <header className={management.dialogHeader}>
        <div>
          <p className={styles.eyebrow}>Saved prescription</p>
          <h2 id="prescription-details-title">Prescription details</h2>
          <p className={styles.muted}>Patient reference: {record.patientRef}</p>
        </div>
        <button
          type="button"
          aria-label="Close prescription details"
          className={styles.button}
          disabled={saving}
          onClick={() => dialog.current?.close()}
        >
          <X size={18} />
        </button>
      </header>
      <div className={management.dialogBody}>
        <dl className="mb-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Created by", record.createdBy],
            ["Created at", prescriptionLocalTime(record.createdAt)],
            ["Diagnosis", record.code],
            ["Medicine", record.drug],
            ["Insurer / payment", record.insurer],
            ["Pharmacy", record.pharmacy],
            ["Authorization", record.status],
            ["Dispensing stage", record.order],
          ].map(([label, value]) => (
            <div className={management.recordField} key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <section aria-label="Prescription description">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-g800">Description</h3>
            {eligible && !editing && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setDraft(record.description ?? "");
                  setEditing(true);
                  setError("");
                  setNotice("");
                }}
              >
                Edit description
              </button>
            )}
          </div>
          {editing && eligible ? (
            <form onSubmit={(event) => void save(event)}>
              <PrescriptionDescriptionField
                value={draft}
                onChange={setDraft}
                disabled={saving}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className={styles.button}
                  disabled={saving}
                  onClick={() => setEditing(false)}
                >
                  Cancel edit
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.primary}`}
                  disabled={saving || draft.length > 2000}
                >
                  {saving ? "Saving…" : "Save description"}
                </button>
              </div>
            </form>
          ) : (
            <p className="whitespace-pre-wrap break-words rounded-xl border border-g200 bg-g50 p-4 text-sm text-g800">
              {record.description ?? "No description provided"}
            </p>
          )}
          {!eligible && (
            <p className="mt-3 text-xs text-g500">
              The prescribing doctor can edit the description while
              authorization is Pending and dispensing is Waiting.
            </p>
          )}
        </section>
        {error && (
          <p role="alert" className={`${styles.error} mt-4`}>
            {error}
          </p>
        )}
        {notice && (
          <output className={`${styles.notice} mt-4 block`}>{notice}</output>
        )}
      </div>
      <footer className={management.dialogFooter}>
        <span className={styles.muted}>Saved clinical record</span>
        <button
          type="button"
          className={styles.button}
          disabled={saving}
          onClick={() => dialog.current?.close()}
        >
          Close details
        </button>
      </footer>
    </dialog>
  );
}
