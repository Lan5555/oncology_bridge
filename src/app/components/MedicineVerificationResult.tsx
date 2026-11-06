import { AlertTriangle, ExternalLink, ShieldQuestion } from "lucide-react";
import {
  COMPARISON_LABELS,
  type MedicineAssessment,
  officialSourceUrl,
} from "@/app/lib/medicine-verification";
import styles from "../pages/dashboard/ScanPage.module.css";
import RegistrationVerificationResult from "./RegistrationVerificationResult";

const lookupCopy = {
  NOT_REQUESTED: [
    "US label lookup not requested",
    "No barcode or GTIN was supplied. Nigerian registration evidence is shown separately.",
  ],
  FOUND: [
    "Official label found",
    "Product information is available from openFDA US drug labels.",
  ],
  NOT_FOUND: [
    "No official record found",
    "Coverage is incomplete. This is not evidence that the medicine is fake.",
  ],
  UNAVAILABLE: [
    "Official lookup unavailable",
    "The provider could not complete this lookup. Try again when the service is available.",
  ],
  AMBIGUOUS: [
    "More than one record found",
    "An exact product record could not be selected. Ask a pharmacist or manufacturer to review the packaging.",
  ],
};
const comparisonCopy = {
  MATCH: "Match",
  MISMATCH: "Mismatch",
  NOT_PROVIDED: "Not provided",
  UNAVAILABLE: "Unavailable",
};

export default function MedicineVerificationResult({
  assessment: data,
  photoResult,
  onRetry,
}: {
  assessment: MedicineAssessment;
  photoResult: boolean;
  onRetry: () => void;
}) {
  const mismatch = [
    ...data.comparisons,
    ...(data.registrationLookup?.comparisons ?? []),
  ].some((item) => item.status === "MISMATCH");
  const completeMatch =
    !mismatch &&
    data.productLookup.status === "FOUND" &&
    Object.keys(COMPARISON_LABELS).every((field) =>
      data.comparisons.some(
        (item) => item.field === field && item.status === "MATCH",
      ),
    );
  const official =
    data.productLookup.status === "FOUND" ? data.productLookup.official : null;
  const source = officialSourceUrl(data.productLookup.sourceUrl);
  const lookup = lookupCopy[data.productLookup.status] ?? [
    "Official information unavailable",
    "Try the lookup again.",
  ];
  const checked = new Date(data.checkedAt);
  return (
    <div className={styles.results}>
      <section className={styles.authenticity}>
        <ShieldQuestion size={27} aria-hidden="true" />
        <div>
          <span className={styles.eyebrow}>PACK AUTHENTICITY</span>
          <h2>Unverified</h2>
          <p>
            <strong>Pack authenticity unverified</strong>
          </p>
          <p>
            {completeMatch
              ? "Product details match; pack authenticity unverified"
              : "An official label match does not authenticate an individual pack."}
          </p>
          {data.authenticity.reason ? <p>{data.authenticity.reason}</p> : null}
        </div>
      </section>
      {data.expiry.status === "EXPIRED" || mismatch ? (
        <section className={styles.warning} role="alert">
          <AlertTriangle size={20} aria-hidden="true" />
          <div>
            {data.expiry.status === "EXPIRED" ? (
              <p>
                <strong>Expired barcode date.</strong> The expiry printed in
                this barcode has passed. Seek pharmacist review before use.
              </p>
            ) : null}
            {mismatch ? (
              <p>
                <strong>Packaging mismatch.</strong> Ask a pharmacist or the
                manufacturer to review these differences before relying on this
                product.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
      <RegistrationVerificationResult
        lookup={data.registrationLookup}
        checkedAt={data.checkedAt}
        onRetry={onRetry}
      />
      <section className={styles.card}>
        <div className={styles.resultTitle}>
          <h2>From the packaging</h2>
          <span className={styles.badge}>Barcode claims</span>
        </div>
        <p className={styles.caption}>
          Read from the code; not confirmed by the manufacturer.
        </p>
        <dl className={styles.identifiers}>
          {(
            [
              ["GTIN", data.identifiers.gtin],
              ["Batch / lot", data.identifiers.lot],
              ["Serial number", data.identifiers.serial],
              ["Expiry date", data.identifiers.expiry],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || "Unknown"}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.caption}>
          Barcode expiry:{" "}
          {data.expiry.status === "EXPIRED"
            ? "Expired"
            : data.expiry.status === "NOT_EXPIRED"
              ? "Date has not passed"
              : "Unknown"}
          . Manufacturer verification: not performed.
        </p>
      </section>
      <section className={styles.card}>
        <div className={styles.resultTitle}>
          <h2>{lookup[0]}</h2>
          <span className={styles.badge}>US label data</span>
        </div>
        <p className={styles.caption}>{lookup[1]}</p>
        {data.productLookup.status === "UNAVAILABLE" ? (
          <button className={styles.secondary} type="button" onClick={onRetry}>
            Retry official lookup
          </button>
        ) : null}
        {official ? (
          <dl className={styles.official}>
            {(
              [
                ["Brand", official.brandNames],
                ["Generic name", official.genericNames],
                ["Manufacturer", official.manufacturers],
                ["Package NDCs", official.packageNdcs],
                ["Active ingredients", official.activeIngredients],
              ] as const
            ).map(([label, values]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{values?.length ? values.join(" · ") : "Unavailable"}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {official
          ? (
              [
                ["Storage & handling", official.storageAndHandling],
                ["Label warnings", official.warnings],
              ] as const
            ).map(([label, values]) => (
              <details key={label} className={styles.labelDetail}>
                <summary>{label}</summary>
                {values?.length ? (
                  [...new Set(values)].map((text) => <p key={text}>{text}</p>)
                ) : (
                  <p>Unavailable in this record.</p>
                )}
              </details>
            ))
          : null}
        <div className={styles.provenance}>
          <span>Source: openFDA Drug Label · US</span>
          {data.productLookup.labelEffectiveTime ? (
            <span>
              Label effective date: {data.productLookup.labelEffectiveTime} (not
              pack expiry)
            </span>
          ) : null}
          {data.productLookup.labelId ? (
            <span>Label reference: {data.productLookup.labelId}</span>
          ) : null}
          {source ? (
            <a href={source} target="_blank" rel="noopener noreferrer">
              View official query <ExternalLink size={12} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </section>
      <section className={styles.card}>
        <h2>Packaging text comparison</h2>
        <p className={styles.caption}>
          {photoResult
            ? "Photo checks compare any packaging text supplied with the image. Missing text is not compared; you can also compare the pack manually."
            : "Exact text comparison with case and spacing normalized. A match is not pack authentication."}
        </p>
        <div className={styles.comparisons}>
          {(
            Object.keys(COMPARISON_LABELS) as (keyof typeof COMPARISON_LABELS)[]
          ).map((field) => {
            const item = data.comparisons.find(
              (entry) => entry.field === field,
            );
            const status = item?.status ?? "NOT_PROVIDED";
            return (
              <div key={field}>
                <div className={styles.resultTitle}>
                  <strong>{COMPARISON_LABELS[field]}</strong>
                  <span
                    className={
                      status === "MISMATCH" ? styles.mismatch : styles.badge
                    }
                  >
                    {comparisonCopy[status] ?? "Unavailable"}
                  </span>
                </div>
                <p>On pack: {item?.observed || "Not provided"}</p>
                <p>
                  Official:{" "}
                  {item?.expected?.length
                    ? item.expected.join(" · ")
                    : "Unavailable"}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      <section className={styles.guidance}>
        <h3>What to do next</h3>
        <p>
          {data.guidance ||
            "Review the available evidence with a pharmacist or manufacturer."}
        </p>
        <p>
          Recall status: not checked. This assessment does not establish
          composition, storage history, tamper integrity or suitability for
          patient use.
        </p>
        <span>
          Checked:{" "}
          {Number.isNaN(checked.getTime())
            ? "Unavailable"
            : `${checked.toLocaleString("en-NG", { timeZone: "UTC" })} UTC`}
        </span>
      </section>
    </div>
  );
}
