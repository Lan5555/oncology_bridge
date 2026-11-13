"use client";

import { useEffect, useRef, useState } from "react";
import Camera from "@/app/components/Camera/camera";
import { validateVerificationImage } from "@/app/lib/medicine-verification";
import {
  DISPENSING_REASONS,
  type DispenseRequest,
  type DispenseResult,
  dispensingError,
  dispensingStorageKey,
  isDispenseResult,
  isPackAssessment,
  type Manifest,
  type PackAssessment,
  readDispenseRequest,
} from "@/app/lib/pharmacy-dispensing";
import styles from "@/app/pages/dashboard/ScanPage.module.css";
import { useProvider } from "@/app/providers/provider";
import { MANIFEST_SERVICE } from "@/app/services/manifest-service/manifest-service";
import { SCAN_SERVICE } from "@/app/services/scan-service/scan-service";
import PharmacyManifests from "./PharmacyManifests";

export default function PharmacyDispensing() {
  const { userData, sessionReady } = useProvider();
  const user = userData.user;
  const facilityId =
    user?.hospital?.id ??
    user?.facility?.id ??
    user?.facilityId ??
    user?.facility_id;
  if (!sessionReady) return <output>Loading your session…</output>;
  if (
    !userData.token ||
    !user?.id ||
    !facilityId ||
    !user.permissions.includes("inventory.manage")
  ) {
    return (
      <section className={styles.card}>
        <h2>Pharmacy dispensing</h2>
        <p>
          Sign in with a facility account that has inventory management
          permission. The server also requires active, verified membership.
        </p>
      </section>
    );
  }
  return (
    <DispensingWorkspace
      key={`${user.id}:${facilityId}`}
      userId={user.id}
      facilityId={facilityId}
    />
  );
}

function DispensingWorkspace({
  userId,
  facilityId,
}: {
  userId: string;
  facilityId: string;
}) {
  const storageKey = dispensingStorageKey(userId, facilityId);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [rawBarcode, setRawBarcode] = useState("");
  const [assessment, setAssessment] = useState<PackAssessment | null>(null);
  const [checkedBarcode, setCheckedBarcode] = useState("");
  const [recorded, setRecorded] = useState<DispenseResult | null>(null);
  const [pending, setPending] = useState<DispenseRequest | null>(null);
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [camera, setCamera] = useState(false);
  const lock = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const request = readDispenseRequest(saved);
        setPending(request);
        setRawBarcode(request.rawBarcode);
      }
      setReady(true);
    } catch {
      setStorageError(
        "Saved dispensing data is unavailable. Restore browser storage or ask the pharmacist to reconcile the previous operation before continuing.",
      );
    }
  }, [storageKey]);

  const run = async (work: () => Promise<void>) => {
    if (lock.current || !ready || storageError) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "The check could not be completed. Try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      setCamera(false);
    }
  };

  const preview = async (raw: string) => {
    setAssessment(null);
    setReference("");
    setCheckedBarcode("");
    const response = await MANIFEST_SERVICE.check(raw);
    if (!response.success) throw new Error(dispensingError(response.status));
    if (!isPackAssessment(response.data))
      throw new Error(
        "The server returned an incomplete assessment. Dispensing remains blocked.",
      );
    setAssessment(response.data);
    setCheckedBarcode(raw);
    if (response.data.manifestId) {
      const manifest = await MANIFEST_SERVICE.detail(response.data.manifestId);
      if (
        manifest.success &&
        typeof (manifest.data as Manifest)?.reference === "string"
      )
        setReference(manifest.data.reference);
    }
  };

  const photo = (image: Blob) =>
    run(async () => {
      setAssessment(null);
      setCheckedBarcode("");
      setReference("");
      const invalid = validateVerificationImage(image);
      if (invalid) throw new Error(invalid);
      const response = await SCAN_SERVICE.decode(image, {
        facilityId,
        action: "NEW",
        clientUuid: crypto.randomUUID(),
        clientTs: new Date().toISOString(),
      });
      if (!response.success) throw new Error(dispensingError(response.status));
      if (
        typeof response.data?.rawBarcode !== "string" ||
        !response.data.rawBarcode.trim()
      )
        throw new Error(
          "No complete barcode was decoded. Use a clearer photo or a hardware scanner.",
        );
      setRawBarcode(response.data.rawBarcode);
      await preview(response.data.rawBarcode);
    });

  const confirm = () =>
    run(async () => {
      let request = pending;
      if (!request) {
        if (
          assessment?.canDispense !== true ||
          checkedBarcode !== rawBarcode ||
          recorded
        )
          return;
        request = { rawBarcode, clientUuid: crypto.randomUUID() };
        // Persist before sending. Never mint a new UUID after an uncertain result.
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const previous = readDispenseRequest(saved);
            setPending(previous);
            setRawBarcode(previous.rawBarcode);
            setAssessment(null);
            setCheckedBarcode("");
            throw new Error("An existing operation must be resolved first.");
          }
          localStorage.setItem(storageKey, JSON.stringify(request));
        } catch {
          throw new Error(
            "The dispensing request has not been sent. Resolve any saved operation and ensure browser storage is available before continuing.",
          );
        }
        setPending(request);
      }
      const response = await MANIFEST_SERVICE.dispense(request);
      if (!response.success) throw new Error(dispensingError(response.status));
      if (!isDispenseResult(response.data))
        throw new Error(
          "The dispensing outcome is incomplete. Retry the saved operation; do not hand over the pack yet.",
        );
      setRecorded(response.data);
      setAssessment(response.data);
    });

  const next = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      setError(
        "Could not clear the saved operation. Restore browser storage before starting another pack.",
      );
      return;
    }
    setPending(null);
    setRecorded(null);
    setAssessment(null);
    setRawBarcode("");
    setCheckedBarcode("");
    setReference("");
    setError("");
  };

  const frozen = busy || !ready || Boolean(storageError) || Boolean(pending);
  return (
    <>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>PHARMACY · SERIALIZED PACKS</span>
          <h1>
            Check your delivery.
            <br />
            <span>Confirm before dispensing.</span>
          </h1>
          <p>
            Compare each pack with your pharmacy's uploaded data, then record
            the dispensing decision.
          </p>
        </div>
        <aside className={styles.heroNote}>
          <strong>Pack authenticity unverified</strong>
          <p>
            Matching data does not prove the physical pack is authentic. This
            workflow uses your pharmacy's saved delivery list.
          </p>
        </aside>
      </header>
      <div className={styles.steps}>
        {[
          "Add your delivery list",
          "Preview the pack",
          "Confirm dispensing",
        ].map((label, i) => (
          <div key={label}>
            <span>{i + 1}</span>
            {label}
          </div>
        ))}
      </div>
      <div className={styles.workspace}>
        <div className={styles.entry}>
          <PharmacyManifests />
          <section className={styles.card}>
            <h2>Scan a pack for dispensing</h2>
            <p className={styles.caption}>
              Use the complete GS1 barcode with GTIN (01), batch (10), expiry
              (17) and serial (21). Preserve group separators. Parenthesized GS1
              text is also supported.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void run(() => preview(rawBarcode));
              }}
            >
              <label className={styles.label} htmlFor="dispensing-barcode">
                Complete decoded GS1 barcode
              </label>
              <textarea
                id="dispensing-barcode"
                className={styles.barcode}
                rows={4}
                value={rawBarcode}
                disabled={frozen}
                onChange={(event) => {
                  setRawBarcode(event.target.value);
                  setAssessment(null);
                  setCheckedBarcode("");
                  setReference("");
                  setError("");
                }}
              />
              <div className={styles.captureActions}>
                <button
                  className={styles.primary}
                  type="submit"
                  disabled={frozen || !rawBarcode.trim()}
                >
                  Check this pack
                </button>
                <button
                  className={styles.secondary}
                  type="button"
                  disabled={frozen}
                  onClick={() => setCamera(true)}
                >
                  Use camera
                </button>
                <button
                  className={styles.secondary}
                  type="button"
                  disabled={frozen}
                  onClick={() => fileInput.current?.click()}
                >
                  Upload barcode photo
                </button>
              </div>
            </form>
            <input
              ref={fileInput}
              className={styles.fileInput}
              type="file"
              accept="image/jpeg,image/png"
              aria-label="Upload a GS1 barcode photo"
              disabled={frozen}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void photo(file);
              }}
            />
            <p className={styles.caption}>
              JPEG/PNG · Up to 10 MB. Preview and photo decoding do not dispense
              or change stock.
            </p>
          </section>
        </div>
        <section
          className={styles.results}
          aria-label="Dispensing assessment"
          aria-busy={busy}
        >
          {busy ? (
            <output className={styles.card}>
              Checking your pharmacy records…
            </output>
          ) : null}
          {storageError || error ? (
            <p role="alert" className={styles.error}>
              {storageError || error}
            </p>
          ) : null}
          {pending && !recorded ? (
            <section className={styles.warning}>
              <div>
                <h2>Saved dispensing operation</h2>
                <p>
                  Its outcome needs confirmation. Retry the same operation
                  before handing over the pack or starting another. This may
                  retrieve an operation already recorded.
                </p>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={busy || !ready || Boolean(storageError)}
                  onClick={confirm}
                >
                  Retry saved operation
                </button>
              </div>
            </section>
          ) : null}
          {assessment ? (
            <section className={styles.card}>
              <span
                className={
                  assessment.canDispense
                    ? styles.validBadge
                    : styles.reviewBadge
                }
              >
                {recorded ? "Recorded decision" : "Preview only"} ·{" "}
                {assessment.canDispense ? "Eligible" : "Dispensing blocked"}
              </span>
              <h2 className={styles.assessmentTitle}>
                {recorded?.replay
                  ? "Existing operation already recorded"
                  : recorded
                    ? assessment.canDispense
                      ? "Dispensing accepted"
                      : "Blocked attempt recorded"
                    : "Review this pack"}
              </h2>
              {recorded?.replay ? (
                <p role="alert" className={styles.warning}>
                  Do not trigger a second physical handoff. This is the existing
                  operation's stored assessment.
                </p>
              ) : null}
              {assessment.duplicate || assessment.suspectedCounterfeit ? (
                <p role="alert" className={styles.expiredWarning}>
                  Suspected duplicate pack — dispensing blocked. Review with the
                  pharmacist.
                </p>
              ) : null}
              <dl className={styles.identifiers}>
                {Object.entries(assessment.identifiers).map(([key, value]) => (
                  <div key={key}>
                    <dt>
                      {(
                        {
                          gtin: "GTIN",
                          lot: "Batch",
                          serial: "Serial",
                          expiry: "Expiry",
                        } as Record<string, string>
                      )[key] ?? key}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.caption}>
                Delivery:{" "}
                {reference ||
                  (assessment.manifestId
                    ? "Reference unavailable"
                    : "No matching pack")}{" "}
                · {assessment.manifestMatch.replaceAll("_", " ")}
              </p>
              {assessment.mismatches.length ? (
                <p className={styles.warning}>
                  Different fields: {assessment.mismatches.join(", ")}
                </p>
              ) : null}
              <ul className={styles.validationReasons}>
                {assessment.reasons.map((reason) => (
                  <li key={reason}>
                    {DISPENSING_REASONS[reason] ?? `Review required: ${reason}`}
                  </li>
                ))}
              </ul>
              <p className={styles.caption}>
                Authenticity: unverified. Missing, expired or mismatched records
                block dispensing; these findings alone do not establish
                counterfeiting.
              </p>
              {!recorded && !pending ? (
                <>
                  <p className={styles.caption}>
                    Preview is advisory. Confirmation checks the pack again and
                    records the result. Continue only when dispensing is
                    accepted.
                  </p>
                  <button
                    className={styles.primary}
                    type="button"
                    disabled={
                      busy ||
                      assessment.canDispense !== true ||
                      checkedBarcode !== rawBarcode
                    }
                    onClick={confirm}
                  >
                    Confirm dispensing
                  </button>
                </>
              ) : null}
              {recorded ? (
                <>
                  <p className={styles.caption}>
                    Both accepted and blocked decisions are recorded. After
                    resolving a blocked attempt, start a new operation for a
                    fresh assessment.
                  </p>
                  <button
                    className={styles.secondary}
                    disabled={busy}
                    type="button"
                    onClick={next}
                  >
                    Start a new pack / assessment
                  </button>
                </>
              ) : null}
            </section>
          ) : !pending && !busy ? (
            <section className={`${styles.card} ${styles.empty}`}>
              <h2>Ready for a pack</h2>
              <p>
                Add a delivery list, then scan or paste the complete GS1 code.
                You will review the preview before confirming dispensing.
              </p>
            </section>
          ) : null}
          <aside className={styles.scope}>
            <div>
              <h3>Review with the pharmacist</h3>
              <p>
                A repeated scan may be the same vial. Identical barcode contents
                cannot distinguish two physical packs or identify which is fake.
                Serial reuse across different GTINs is not a duplicate identity.
              </p>
              <p>
                This records dispensing identity and blocks reuse. Inventory
                quantities and prescriptions are managed separately. Returns and
                reversals are not supported.
              </p>
            </div>
          </aside>
        </section>
      </div>
      {camera ? (
        <Camera
          busy={busy}
          onCapture={photo}
          onClose={() => setCamera(false)}
        />
      ) : null}
    </>
  );
}
