"use client";

import {
  ArrowRight,
  Camera as CameraIcon,
  FileSearch,
  Info,
  LoaderCircle,
  ScanLine,
  ShieldQuestion,
  Upload,
  X,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import Camera from "@/app/components/Camera/camera";
import MedicineVerificationResult from "@/app/components/MedicineVerificationResult";
import PharmacyDispensing from "@/app/components/pharmacy/PharmacyDispensing";
import {
  COMPARISON_LABELS,
  type ComparisonField,
  type MedicineAssessment,
  type VerificationFields,
  type VerificationRequest,
  validateVerificationImage,
  verificationError,
  verificationMetadata,
  verificationRequest,
} from "@/app/lib/medicine-verification";
import { SCAN_SERVICE } from "@/app/services/scan-service/scan-service";
import styles from "./ScanPage.module.css";

type Attempt =
  | { image: Blob; fields?: VerificationFields }
  | { payload: VerificationRequest };

export default function ScanPage() {
  const [mode, setMode] = useState<"dispensing" | "records">("dispensing");
  return (
    <div className={styles.page}>
      <nav className={styles.modeSwitch} aria-label="Scan workflow">
        <button
          type="button"
          className={mode === "dispensing" ? styles.primary : styles.secondary}
          aria-pressed={mode === "dispensing"}
          onClick={() => setMode("dispensing")}
        >
          Deliveries & dispensing
        </button>
        <button
          type="button"
          className={mode === "records" ? styles.primary : styles.secondary}
          aria-pressed={mode === "records"}
          onClick={() => setMode("records")}
        >
          Product records
        </button>
      </nav>
      <div hidden={mode !== "dispensing"}>
        <PharmacyDispensing />
      </div>
      {mode === "records" ? <ProductRecordScan /> : null}
    </div>
  );
}

function ProductRecordScan() {
  const [barcode, setBarcode] = useState("");
  const [nafdacNumber, setNafdacNumber] = useState("");
  const [fields, setFields] = useState<
    Record<ComparisonField | "productName" | "strength", string>
  >({
    productName: "",
    strength: "",
    brandName: "",
    genericName: "",
    manufacturer: "",
  });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [assessment, setAssessment] = useState<MedicineAssessment | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [photoResult, setPhotoResult] = useState(false);
  const lock = useRef(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const result = useRef<HTMLDivElement>(null);

  const run = async (next: Attempt) => {
    if (lock.current) return;
    if ("image" in next && !next.fields) {
      try {
        next = {
          ...next,
          fields: verificationMetadata({ ...fields, nafdacNumber }),
        };
      } catch (problem) {
        setError(
          problem instanceof Error
            ? problem.message
            : "Check the packaging fields.",
        );
        setCameraOpen(false);
        return;
      }
    }
    if ("image" in next) {
      const problem = validateVerificationImage(next.image);
      if (problem) {
        setAssessment(null);
        setAttempt(null);
        setError(problem);
        setCameraOpen(false);
        return;
      }
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setAssessment(null);
    setAttempt(next);
    try {
      const response =
        "image" in next
          ? await SCAN_SERVICE.verifyImage(next.image, next.fields)
          : await SCAN_SERVICE.verify(next.payload);
      if (!response.success) {
        setError(verificationError(response.status));
        return;
      }
      const data = response.data as MedicineAssessment | null;
      if (
        !data?.identifiers ||
        !["VALID", "WARNING"].includes(data.validation?.status) ||
        typeof data.validation?.reason !== "string" ||
        !Array.isArray(data.validation?.reasons) ||
        !data.authenticity ||
        !data.productLookup ||
        !data.expiry ||
        !Array.isArray(data.comparisons)
      ) {
        setError(
          "The server returned an incomplete assessment. Please try again.",
        );
        return;
      }
      setAssessment(data);
      setPhotoResult("image" in next);
      setCameraOpen(false);
      requestAnimationFrame(() => result.current?.focus());
    } catch {
      setError(verificationError());
    } finally {
      lock.current = false;
      setBusy(false);
      setCameraOpen(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    try {
      void run({
        payload: verificationRequest(barcode, { ...fields, nafdacNumber }),
      });
    } catch (problem) {
      setAssessment(null);
      setAttempt(null);
      setError(
        problem instanceof Error
          ? problem.message
          : "Check the barcode and try again.",
      );
    }
  };
  const clear = () => {
    setAssessment(null);
    setError("");
    setAttempt(null);
    setBarcode("");
    setNafdacNumber("");
    setFields({
      brandName: "",
      genericName: "",
      manufacturer: "",
      productName: "",
      strength: "",
    });
    input.current?.focus();
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            <ScanLine size={15} aria-hidden="true" /> SCAN VIAL / MEDICINE
            VERIFICATION
          </span>
          <h1>
            A closer look.
            <br />
            <span>A more informed decision.</span>
          </h1>
          <p>
            Read the pack. Check the product details. Understand what the
            evidence can tell you.
          </p>
        </div>
        <div className={styles.heroNote}>
          <ShieldQuestion size={29} aria-hidden="true" />
          <strong>Evidence, with clarity</strong>
          <p>
            Label information can support product identification. Individual
            pack authenticity remains unverified.
          </p>
        </div>
      </header>
      <div className={styles.steps}>
        {[
          "Capture the barcode",
          "Check the official record",
          "Review the evidence",
        ].map((text, i) => (
          <div key={text}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {text}
          </div>
        ))}
      </div>
      <div className={styles.workspace}>
        <div className={styles.entry}>
          <section className={styles.card}>
            <div className={styles.sectionHeading}>
              <span className={styles.icon}>
                <CameraIcon size={20} aria-hidden="true" />
              </span>
              <div>
                <h2>Start with the pack</h2>
                <p>Capture a clear, close-up view of its GS1 DataMatrix.</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.scanTarget}
              disabled={busy}
              onClick={() => setCameraOpen(true)}
            >
              <span className={styles.scanFrame}>
                <ScanLine size={48} strokeWidth={1.3} aria-hidden="true" />
              </span>
              <strong>Open camera scanner</strong>
              <span>Position the square code inside the frame</span>
            </button>
            <div className={styles.captureActions}>
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={() => setCameraOpen(true)}
              >
                <CameraIcon size={16} aria-hidden="true" /> Use camera
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={busy}
                onClick={() => upload.current?.click()}
              >
                <Upload size={16} aria-hidden="true" /> Upload photo
              </button>
            </div>
            <input
              ref={upload}
              className={styles.fileInput}
              type="file"
              accept="image/jpeg,image/png"
              aria-label="Upload a medicine barcode photo"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void run({ image: file });
              }}
            />
            <p className={styles.caption}>
              JPEG or PNG · Up to 10 MB · Good lighting, no glare
            </p>
          </section>
          <form className={styles.card} onSubmit={submit}>
            <div className={styles.sectionHeading}>
              <span className={styles.icon}>
                <ScanLine size={20} aria-hidden="true" />
              </span>
              <div>
                <h2>Check a Nigerian registration</h2>
                <p>
                  Enter the NAFDAC number printed on the pack. A barcode is
                  optional.
                </p>
              </div>
            </div>
            <fieldset disabled={busy} className={styles.fieldset}>
              <label className={styles.label} htmlFor="verification-nafdac">
                NAFDAC registration number
                <input
                  id="verification-nafdac"
                  type="text"
                  maxLength={50}
                  value={nafdacNumber}
                  placeholder="Enter the number printed on the pack"
                  aria-describedby="nafdac-help"
                  onChange={(event) => {
                    setNafdacNumber(event.target.value);
                    setAssessment(null);
                    setAttempt(null);
                    setError("");
                  }}
                />
              </label>
              <p id="nafdac-help" className={styles.caption}>
                Copy this number from the pack; it is never derived from the
                barcode. Include both identifiers for the combined record check.
              </p>
              <label className={styles.label} htmlFor="verification-barcode">
                Barcode or GTIN (optional with a NAFDAC number)
              </label>
              <textarea
                ref={input}
                id="verification-barcode"
                className={styles.barcode}
                rows={3}
                value={barcode}
                onChange={(event) => {
                  setBarcode(event.target.value);
                  setAssessment(null);
                  setAttempt(null);
                  setError("");
                }}
                placeholder="Scan or paste the full GS1 code, or type a GTIN"
                aria-describedby="barcode-help"
              />
              <p id="barcode-help" className={styles.caption}>
                Full GS1 data preserves batch, serial and expiry. A GTIN-only
                check retrieves product information.
              </p>
              <details className={styles.optional}>
                <summary>
                  Compare the text on your packaging <span>Optional</span>
                </summary>
                <p className={styles.caption}>
                  Enter exactly what is printed on the pack. Product name,
                  manufacturer and strength are compared with the Nigerian
                  registration record. Brand and generic name use US label data
                  when a barcode is available.
                </p>
                {(
                  Object.entries({
                    productName: "Product name",
                    manufacturer: "Manufacturer",
                    strength: "Strength",
                    brandName: COMPARISON_LABELS.brandName,
                    genericName: COMPARISON_LABELS.genericName,
                  }) as [keyof typeof fields, string][]
                ).map(([field, label]) => (
                  <label className={styles.label} key={field}>
                    {label}
                    <input
                      type="text"
                      maxLength={200}
                      value={fields[field]}
                      onChange={(event) => {
                        setFields((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }));
                        setAssessment(null);
                        setAttempt(null);
                      }}
                    />
                  </label>
                ))}
              </details>
              <button
                className={styles.primary}
                disabled={busy || (!barcode.trim() && !nafdacNumber.trim())}
                type="submit"
              >
                {busy ? (
                  <LoaderCircle
                    size={17}
                    className={styles.spin}
                    aria-hidden="true"
                  />
                ) : (
                  <FileSearch size={17} aria-hidden="true" />
                )}
                {busy ? "Checking medicine…" : "Check medicine details"}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </fieldset>
          </form>
          <p className={styles.intakeNote}>
            <Info size={16} aria-hidden="true" /> This check does not add stock
            or create a scan-history record. Add stock separately in Inventory.
          </p>
          <p className={styles.intakeNote}>
            <ShieldQuestion size={16} aria-hidden="true" /> Pack authenticity
            unverified. Registration and label matches do not authenticate the
            physical pack.
          </p>
        </div>
        <section
          className={styles.evidence}
          ref={result}
          tabIndex={-1}
          aria-label="Medicine assessment"
        >
          {busy ? (
            <output className={`${styles.card} ${styles.empty}`}>
              <LoaderCircle
                className={styles.spin}
                size={34}
                aria-hidden="true"
              />
              <h2>Checking the evidence</h2>
              <p>
                Reading identifiers and requesting official product information.
                Nigerian registration checks can take approximately 110 seconds.
                Please keep this page open; requests are not retried
                automatically.
              </p>
            </output>
          ) : null}
          {error ? (
            <section className={styles.error} role="alert">
              <h2>We couldn’t complete this check</h2>
              <p>{error}</p>
              {attempt ? (
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => void run(attempt)}
                >
                  Try again
                </button>
              ) : null}
            </section>
          ) : null}
          {assessment && !busy ? (
            <>
              <div className={styles.resultHeading}>
                <span>ASSESSMENT RESULTS</span>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={clear}
                >
                  <X size={14} aria-hidden="true" /> Clear & start again
                </button>
              </div>
              <MedicineVerificationResult
                assessment={assessment}
                photoResult={photoResult}
                onRetry={() => {
                  if (attempt) void run(attempt);
                }}
              />
            </>
          ) : !busy && !error ? (
            <section className={`${styles.card} ${styles.empty}`}>
              <span className={styles.emptyIcon}>
                <FileSearch size={38} strokeWidth={1.3} aria-hidden="true" />
              </span>
              <span className={styles.eyebrow}>FROM CODE TO CONTEXT</span>
              <h2>Your evidence, in one place</h2>
              <p>
                Enter a NAFDAC number or scan a pack to see its identifiers,
                available registration and label details and any differences
                that need a closer look.
              </p>
              <div className={styles.previewRows}>
                {[
                  "Packaging identifiers",
                  "Nigerian registration records",
                  "Official product information",
                  "Label comparisons",
                  "Pack authenticity status",
                ].map((text) => (
                  <div key={text}>
                    <span />
                    {text}
                    <ArrowRight size={14} aria-hidden="true" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <aside className={styles.scope}>
            <Info size={18} aria-hidden="true" />
            <div>
              <h3>Review before use</h3>
              <p>
                Compare the results with the product name, manufacturer and
                NAFDAC number printed on your pack. Missing records or
                differences need further review; they do not prove a medicine is
                counterfeit.
              </p>
              <p>
                Matching records do not confirm physical-pack authenticity. If
                anything is unclear, ask a pharmacist or the manufacturer for
                help. Do not use an expired pack.
              </p>
            </div>
          </aside>
        </section>
      </div>
      {cameraOpen ? (
        <Camera
          busy={busy}
          onCapture={(image) => run({ image })}
          onClose={() => setCameraOpen(false)}
        />
      ) : null}
    </div>
  );
}
