"use client";

import { Loader2, Package, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import styles from "./StockListingDialog.module.css";

export type EditableInventoryBatch = {
  id: string;
  medicineName: string;
  batchNumber: string;
  expiry: string;
  quantity: number | null;
  unit: string;
};

export default function InventoryEditDialog({
  batch,
  onClose,
  onSaved,
}: {
  batch: EditableInventoryBatch;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const savingRef = useRef(false);
  const [batchNumber, setBatchNumber] = useState(batch.batchNumber);
  const [expiry, setExpiry] = useState(batch.expiry);
  const [quantity, setQuantity] = useState(
    batch.quantity == null ? "" : String(batch.quantity),
  );
  const [unit, setUnit] = useState(batch.unit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (dialogRef.current && !dialogRef.current.open)
      dialogRef.current.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;
    const count = Number(quantity);
    if (
      !batchNumber.trim() ||
      !expiry ||
      !quantity.trim() ||
      !Number.isInteger(count) ||
      count < 0 ||
      !["vial", "pack", "bottle", "box"].includes(unit)
    ) {
      setError(
        "Enter a batch number, expiry date, selling unit, and a whole-number quantity of zero or more.",
      );
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await INVENTORY_SERVICE.update(batch.id, {
        batchNumber: batchNumber.trim(),
        expiry,
        quantity: count,
        unit,
      });
      if (!response.success) {
        setError(
          response.message ||
            "Inventory could not be updated. Your changes have been kept.",
        );
        return;
      }
      onSaved(response.message || "Inventory details updated.");
    } catch {
      setError("Inventory could not be updated. Try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles.compact}`}
      aria-labelledby="edit-inventory-title"
      aria-describedby="edit-inventory-description"
      onClose={onClose}
      onCancel={(event) => {
        if (saving) event.preventDefault();
      }}
    >
      <form className={styles.layout} onSubmit={save} aria-busy={saving}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Package size={22} />
          </div>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Inventory / Edit batch</p>
            <h2 id="edit-inventory-title">Edit inventory details</h2>
            <p id="edit-inventory-description">
              Update the recorded details for this stock batch.
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            disabled={saving}
            onClick={onClose}
            aria-label="Close inventory editor"
          >
            <X size={20} />
          </button>
        </header>
        <div className={styles.body}>
          <fieldset disabled={saving} className={styles.editFields}>
            <legend className={styles.srOnly}>Batch details</legend>
            <p className={styles.summaryName}>{batch.medicineName}</p>
            <label className={styles.label}>
              Batch number
              <input
                className={styles.input}
                required
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
              />
            </label>
            <div className={styles.grid}>
              <label className={styles.label}>
                Expiry date
                <input
                  className={styles.input}
                  type="date"
                  required
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                />
              </label>
              <label className={styles.label}>
                Selling unit
                <select
                  className={styles.input}
                  required
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  <option value="vial">Vial</option>
                  <option value="pack">Pack</option>
                  <option value="bottle">Bottle</option>
                  <option value="box">Box</option>
                </select>
              </label>
            </div>
            <label className={styles.label}>
              Quantity{unit ? ` (${unit})` : ""}
              <input
                className={styles.input}
                type="number"
                required
                min="0"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            <p className={styles.hint}>
              Quantity is counted in the selected unit. Changes affecting listed
              or reserved stock may require review before they can be saved.
            </p>
          </fieldset>
        </div>
        <footer className={styles.footer}>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <div className={styles.footerRow}>
            <p>
              Medicine identity and temperature readings are managed separately.
            </p>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.secondary}
                disabled={saving}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.primary}
                disabled={saving}
              >
                {saving && <Loader2 size={16} className={styles.spin} />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
