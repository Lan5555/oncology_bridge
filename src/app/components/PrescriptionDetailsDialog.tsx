"use client";

import {
  Check,
  ClipboardList,
  Edit2,
  FileText,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  type PrescriptionDisplayRow,
  prescriptionLocalTime,
} from "../lib/prescription-display";
import { PRESCRIPTION_SERVICE } from "../services/prescription-service/prescription-service";
import PrescriptionDescriptionField from "./PrescriptionDescriptionField";
import styles from "./PrescriptionDetailsDialog.module.css";
import PrescriptionStatusBadge from "./PrescriptionStatusBadge";

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
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
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
      className={styles.dialog}
      aria-labelledby="prescription-details-title"
      onClose={onClose}
      onCancel={(event) => {
        if (savingLock.current) event.preventDefault();
      }}
    >
      <header className={styles.header}>
        <span className={styles.headerIcon}>
          <ClipboardList size={23} strokeWidth={1.6} />
        </span>
        <div>
          <p className={styles.eyebrow}>Saved prescription</p>
          <h2 id="prescription-details-title">Prescription details</h2>
        </div>
        <button
          type="button"
          aria-label="Close prescription details"
          className={styles.close}
          disabled={saving}
          onClick={() => dialog.current?.close()}
        >
          <X size={18} />
        </button>
      </header>
      <div className={styles.body}>
        <section className={styles.patient} aria-label="Patient reference">
          <span className={styles.patientIcon}>
            <FileText size={21} strokeWidth={1.6} />
          </span>
          <div>
            <p>Patient reference</p>
            <h3>{record.patientRef}</h3>
          </div>
          <span className={styles.recordTag}>Clinical record</span>
        </section>
        <section className={styles.statuses} aria-label="Prescription workflow">
          <div>
            <p>Authorization</p>
            <PrescriptionStatusBadge status={record.status} />
          </div>
          <div>
            <p>Dispensing stage</p>
            <PrescriptionStatusBadge status={record.order} kind="dispensing" />
          </div>
        </section>
        <section
          className={styles.information}
          aria-labelledby="prescription-information-title"
        >
          <h3 id="prescription-information-title">Prescription information</h3>
          <dl className={styles.fields}>
            {[
              ["Medicine", record.drug],
              ["Diagnosis / ICD-10", record.code],
              ["Selected pharmacy", record.pharmacy],
              ["Insurer / payment", record.insurer],
              ["Created by", record.createdBy],
              ["Created at", prescriptionLocalTime(record.createdAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section
          className={styles.description}
          aria-label="Prescription description"
        >
          <div className={styles.descriptionHeading}>
            <h3>
              <FileText size={16} />
              Description
            </h3>
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
                <Edit2 size={13} />
                Edit description
              </button>
            )}
          </div>
          {editing && eligible ? (
            <form
              className={styles.descriptionForm}
              onSubmit={(event) => void save(event)}
            >
              <PrescriptionDescriptionField
                value={draft}
                onChange={setDraft}
                disabled={saving}
              />
              <div className={styles.editActions}>
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
                  {saving ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <Check size={14} />
                  )}
                  {saving ? "Saving…" : "Save description"}
                </button>
              </div>
            </form>
          ) : (
            <p className={styles.descriptionText}>
              {record.description ?? "No description provided"}
            </p>
          )}
          {!eligible && (
            <p className={styles.editHint}>
              <Info size={13} />
              The prescribing doctor can edit the description while
              authorization is Pending and dispensing is Waiting.
            </p>
          )}
        </section>
        {error && (
          <p role="alert" className={styles.error}>
            <Info size={15} />
            {error}
          </p>
        )}
        {notice && (
          <output className={styles.notice}>
            <Check size={15} />
            {notice}
          </output>
        )}
        <aside className={styles.workflowNote}>
          <Info size={15} />
          <p>
            Authorization and dispensing are separate stages. This record does
            not confirm marketplace payment or delivery.
          </p>
        </aside>
      </div>
      <footer className={styles.footer}>
        <span>Times shown in your local timezone</span>
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
