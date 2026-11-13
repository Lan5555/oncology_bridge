"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dispensingError, type Manifest } from "@/app/lib/pharmacy-dispensing";
import styles from "@/app/pages/dashboard/ScanPage.module.css";
import { MANIFEST_SERVICE } from "@/app/services/manifest-service/manifest-service";
import ManifestEntryForm from "./ManifestEntryForm";

export default function PharmacyManifests() {
  const [manifests, setManifests] = useState<Manifest[] | null>(null);
  const [detail, setDetail] = useState<Manifest | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const load = useCallback(async () => {
    const response = await MANIFEST_SERVICE.list();
    if (!response.success) throw new Error(dispensingError(response.status));
    if (
      !Array.isArray(response.data) ||
      !response.data.every(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.reference === "string",
      )
    ) {
      throw new Error(
        "We could not load your saved deliveries. Please refresh.",
      );
    }
    setManifests(response.data);
  }, []);

  const run = useCallback(async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Your saved deliveries are unavailable. Try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void run(load);
  }, [run, load]);

  return (
    <section className={styles.card} aria-label="Pharmacy deliveries">
      <div className={styles.sectionHeading}>
        <div>
          <h2>Add a pharmacy delivery</h2>
          <p>
            Record the packs you received so you can check them before
            dispensing.
          </p>
        </div>
      </div>
      <ManifestEntryForm
        busy={busy}
        onSave={async (reference, packs) => {
          let saved = false;
          await run(async () => {
            const response = await MANIFEST_SERVICE.create({
              reference,
              packs,
            });
            if (!response.success) {
              if (response.status === 409)
                throw new Error(
                  "This delivery reference or one of its packs has already been saved. Check Saved deliveries before trying again.",
                );
              if (response.status === 400 || response.status === 422)
                throw new Error(
                  "Some pack details were not accepted. Check barcode, batch, serial number and expiry against the packaging. No packs were saved.",
                );
              if (
                !response.status ||
                response.status === 408 ||
                response.status >= 500
              )
                throw new Error(
                  "We could not confirm whether this delivery was saved. Refresh Saved deliveries and check the reference before trying again.",
                );
              throw new Error(dispensingError(response.status));
            }
            saved = true;
            setNotice(
              "Delivery list saved. You can now scan these packs before dispensing. Pack authenticity remains unverified.",
            );
            try {
              await load();
            } catch {
              setError(
                "Your delivery was saved, but the delivery list could not be refreshed. Use Refresh deliveries to see it.",
              );
            }
          });
          return saved;
        }}
      />
      <div className={styles.resultHeading}>
        <h3>Saved deliveries</h3>
        <span>Latest 100</span>
      </div>
      <button
        className={styles.secondary}
        type="button"
        disabled={busy}
        onClick={() => void run(load)}
      >
        {busy ? "Loading…" : "Refresh deliveries"}
      </button>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
      {notice ? <output className={styles.caption}>{notice}</output> : null}
      {manifests?.length === 0 ? (
        <p className={styles.caption}>
          Your first delivery starts here. Add the reference and pack details
          above, or import your supplier's spreadsheet.
        </p>
      ) : null}
      {manifests?.length ? (
        <label className={styles.label}>
          Find a saved delivery
          <select
            className={styles.barcode}
            disabled={busy}
            value={detail?.id ?? ""}
            onChange={(event) => {
              const id = event.target.value;
              setDetail(null);
              if (id)
                void run(async () => {
                  const response = await MANIFEST_SERVICE.detail(id);
                  if (!response.success)
                    throw new Error(dispensingError(response.status));
                  if (
                    !response.data ||
                    typeof response.data.reference !== "string" ||
                    !Array.isArray(response.data.packs)
                  )
                    throw new Error(
                      "Delivery details are unavailable. Try again.",
                    );
                  setDetail(response.data);
                });
            }}
          >
            <option value="">Select a reference</option>
            {manifests.map((manifest) => (
              <option value={manifest.id} key={manifest.id}>
                {manifest.reference}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {detail ? (
        <div>
          <h3>{detail.reference}</h3>
          <div className={styles.tableScroll}>
            <table className={styles.packTable}>
              <caption>{detail.packs?.length} serialized packs</caption>
              <thead>
                <tr>
                  <th>GTIN</th>
                  <th>Batch</th>
                  <th>Serial</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {detail.packs?.map((pack) => (
                  <tr key={`${pack.gtin}:${pack.serial}`}>
                    <td>{pack.gtin}</td>
                    <td>{pack.lot}</td>
                    <td>{pack.serial}</td>
                    <td>{pack.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
