"use client";

import { useRef, useState } from "react";
import {
  MANIFEST_CSV_TEMPLATE,
  parseManifestCsv,
  validateManifestInput,
} from "@/app/lib/manifest-entry";
import type { PackIdentifiers } from "@/app/lib/pharmacy-dispensing";
import styles from "@/app/pages/dashboard/ScanPage.module.css";

type PackRow = PackIdentifiers & { key: number };
const blankPack = (key: number): PackRow => ({
  key,
  gtin: "",
  lot: "",
  serial: "",
  expiry: "",
});

export default function ManifestEntryForm({
  busy,
  onSave,
}: {
  busy: boolean;
  onSave: (reference: string, packs: PackIdentifiers[]) => Promise<boolean>;
}) {
  const [reference, setReference] = useState("");
  const [rows, setRows] = useState<PackRow[]>([blankPack(0)]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [importing, setImporting] = useState(false);
  const nextKey = useRef(1);
  const fileInput = useRef<HTMLInputElement>(null);
  const disabled = busy || importing;

  const downloadTemplate = () => {
    const url = URL.createObjectURL(
      new Blob([MANIFEST_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "pharmacy-delivery-template.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importCsv = async (file: File) => {
    setError("");
    setNotice("");
    setImporting(true);
    try {
      if (file.size > 1024 * 1024)
        throw new Error("Choose a spreadsheet smaller than 1 MB.");
      if (!file.name.toLowerCase().endsWith(".csv"))
        throw new Error("Save your Excel sheet as CSV, then choose that file.");
      const packs = parseManifestCsv(await file.text());
      // Validate packs before replacing the draft; the reference is entered separately.
      validateManifestInput("CSV import", packs);
      const current = rows.filter(
        (row) => row.gtin || row.lot || row.serial || row.expiry,
      );
      if (current.length + packs.length > 1000)
        throw new Error(
          "A delivery can contain up to 1,000 packs. Use a separate delivery for the remaining packs.",
        );
      const merged = [...current, ...packs];
      validateManifestInput("CSV import", merged);
      setRows([
        ...current,
        ...packs.map((pack) => ({ ...pack, key: nextKey.current++ })),
      ]);
      setNotice(
        `${packs.length} packs added for review. Nothing has been saved yet.`,
      );
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "The spreadsheet could not be read.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled) return;
        setError("");
        setNotice("");
        try {
          const input = validateManifestInput(
            reference,
            rows.map(({ gtin, lot, serial, expiry }) => ({
              gtin,
              lot,
              serial,
              expiry,
            })),
          );
          if (await onSave(input.reference, input.packs)) {
            setReference("");
            setRows([blankPack(nextKey.current++)]);
          }
        } catch (problem) {
          setError(
            problem instanceof Error
              ? problem.message
              : "Check the delivery details.",
          );
        }
      }}
    >
      <fieldset disabled={disabled} className={styles.fieldset}>
        <label className={styles.label}>
          Delivery reference
          <input
            required
            maxLength={120}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Enter the supplier's delivery or invoice reference"
          />
        </label>
        <p className={styles.caption}>
          Use the reference on your delivery note so you can find these packs
          later.
        </p>
        <div className={styles.importPanel}>
          <strong>Have a list from your supplier?</strong>
          <p className={styles.caption}>
            Import a CSV spreadsheet, then review the packs below. In Excel,
            save the sheet as CSV first. Barcode and serial columns must be
            formatted as text to keep leading zeros.
          </p>
          <div className={styles.captureActions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => fileInput.current?.click()}
            >
              Import spreadsheet (CSV)
            </button>
            <button
              type="button"
              className={styles.textButton}
              onClick={downloadTemplate}
            >
              Download blank template
            </button>
          </div>
          <input
            ref={fileInput}
            className={styles.fileInput}
            aria-label="Import delivery spreadsheet"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void importCsv(file);
            }}
          />
        </div>
        <div className={styles.resultHeading}>
          <h3>Pack details</h3>
          <span>{rows.length} / 1,000 packs</span>
        </div>
        <p className={styles.caption}>
          Add one row per individual pack or vial. Copy each pack's own serial
          number; a batch number alone is not enough.
        </p>
        <div className={styles.packEditor}>
          {rows.map((row, index) => (
            <fieldset key={row.key} className={styles.packEntry}>
              <legend>Pack {index + 1}</legend>
              <div className={styles.packFields}>
                <label className={styles.label}>
                  Barcode number (GTIN)
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{14}"
                    minLength={14}
                    maxLength={14}
                    value={row.gtin}
                    placeholder="14 digits printed on the pack"
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((pack) =>
                          pack.key === row.key
                            ? { ...pack, gtin: event.target.value }
                            : pack,
                        ),
                      )
                    }
                  />
                </label>
                <label className={styles.label}>
                  Batch number
                  <input
                    required
                    maxLength={20}
                    value={row.lot}
                    placeholder="Printed batch / lot number"
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((pack) =>
                          pack.key === row.key
                            ? { ...pack, lot: event.target.value }
                            : pack,
                        ),
                      )
                    }
                  />
                </label>
                <label className={styles.label}>
                  Serial number
                  <input
                    required
                    maxLength={20}
                    value={row.serial}
                    placeholder="Unique number on this pack"
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((pack) =>
                          pack.key === row.key
                            ? { ...pack, serial: event.target.value }
                            : pack,
                        ),
                      )
                    }
                  />
                </label>
                <label className={styles.label}>
                  Expiry date
                  <input
                    required
                    type="date"
                    value={row.expiry}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((pack) =>
                          pack.key === row.key
                            ? { ...pack, expiry: event.target.value }
                            : pack,
                        ),
                      )
                    }
                  />
                </label>
              </div>
              <button
                type="button"
                className={styles.textButton}
                disabled={rows.length === 1}
                aria-label={`Remove pack ${index + 1}`}
                onClick={() =>
                  setRows((current) =>
                    current.filter((pack) => pack.key !== row.key),
                  )
                }
              >
                Remove pack
              </button>
            </fieldset>
          ))}
        </div>
        <div className={styles.captureActions}>
          <button
            type="button"
            className={styles.secondary}
            disabled={rows.length >= 1000}
            onClick={() =>
              setRows((current) => [...current, blankPack(nextKey.current++)])
            }
          >
            + Add another pack
          </button>
          <button type="submit" className={styles.primary}>
            {busy
              ? "Saving delivery…"
              : importing
                ? "Reading spreadsheet…"
                : "Save delivery list"}
          </button>
        </div>
        <p className={styles.caption}>
          Review all packs before saving. Saving this list does not add stock or
          dispense a pack.
        </p>
      </fieldset>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {notice ? <output className={styles.caption}>{notice}</output> : null}
    </form>
  );
}
