import { ExternalLink } from "lucide-react";
import {
  COMPARISON_STATUS_LABELS,
  REGISTRATION_COMPARISON_LABELS,
  type RegistrationLookup,
} from "@/app/lib/medicine-verification";
import styles from "../pages/dashboard/ScanPage.module.css";

const statuses = {
  FOUND: [
    "Nigerian registration record found",
    "Compare this registration record with the text printed on your pack.",
  ],
  AMBIGUOUS: [
    "Multiple Nigerian registration matches",
    "All returned records are shown below. No record has been selected and comparisons cannot establish a unique match. Ask a pharmacist or manufacturer to review.",
  ],
  NO_EXACT_MATCH: [
    "No exact Nigerian registration match",
    "The retrieved data contains no exact registration-number match. Coverage is not guaranteed; this does not prove the medicine is fake.",
  ],
  NOT_CONFIGURED: [
    "Nigerian registration lookup unavailable",
    "The registration lookup service is not enabled or configured.",
  ],
  UNAVAILABLE: [
    "Nigerian registration lookup unavailable",
    "The provider could not complete this check. You may try again manually.",
  ],
  NOT_PROVIDED: [
    "Nigerian registration not checked",
    "Enter the NAFDAC number printed on the packaging to request a registration check.",
  ],
};

function recordLink(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "greenbook.nafdac.gov.ng" &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default function RegistrationVerificationResult({
  lookup,
  checkedAt,
  onRetry,
}: {
  lookup?: RegistrationLookup;
  checkedAt: string;
  onRetry: () => void;
}) {
  const [title, description] = lookup
    ? (statuses[lookup.status] ?? [
        "Nigerian registration unavailable",
        "The server returned an unsupported registration status.",
      ])
    : [
        "Nigerian registration unavailable",
        "No registration evidence was returned by the server.",
      ];
  return (
    <section
      className={styles.card}
      aria-label="Nigerian registration evidence"
    >
      <div className={styles.resultTitle}>
        <h2>{title}</h2>
        <span className={styles.badge}>Nigeria · Registration evidence</span>
      </div>
      <p className={styles.caption}>{description}</p>
      {lookup?.registrationNumber ? (
        <p className={styles.caption}>
          Requested NAFDAC number: {lookup.registrationNumber}
        </p>
      ) : null}
      {lookup?.reason ? (
        <p className={styles.caption}>{lookup.reason}</p>
      ) : null}
      {lookup?.status === "UNAVAILABLE" ? (
        <button type="button" className={styles.secondary} onClick={onRetry}>
          Retry registration check
        </button>
      ) : null}
      {lookup?.records.map((record) => {
        const link = recordLink(record.sourceUrl);
        const expired =
          record.registrationExpiresAt &&
          record.registrationExpiresAt < checkedAt.slice(0, 10);
        return (
          <article className={styles.registrationRecord} key={record.productId}>
            <div className={styles.resultTitle}>
              <h3>{record.productName}</h3>
              <span
                className={
                  record.status === "Inactive" ? styles.mismatch : styles.badge
                }
              >
                Registration: {record.status}
              </span>
            </div>
            {record.status === "Inactive" || expired ? (
              <p className={styles.warning}>
                Registration is{" "}
                {record.status === "Inactive"
                  ? "inactive"
                  : "past its recorded expiry"}
                . Ask a pharmacist to confirm the current regulatory status.
              </p>
            ) : null}
            <dl className={styles.official}>
              {(
                [
                  ["NAFDAC number", record.registrationNumber],
                  ["Product name", record.productName],
                  ["Manufacturer", record.manufacturer],
                  ["Strength", record.strength],
                  ["Applicant", record.applicant],
                  ["Active ingredients", record.activeIngredients?.join(" · ")],
                  ["Dosage form", record.dosageForm],
                  ["Pack size", record.packSize],
                  ["Registration approval date", record.approvedAt],
                  [
                    "Registration expiry (not pack expiry)",
                    record.registrationExpiresAt,
                  ],
                  ["Record retrieved", record.fetchedAt],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || "Unavailable"}</dd>
                </div>
              ))}
            </dl>
            {record.dataQualityNote ? (
              <p className={styles.caption}>
                Data quality note: {record.dataQualityNote}
              </p>
            ) : null}
            {link ? (
              <div className={styles.provenance}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  View Greenbook record{" "}
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
            ) : null}
          </article>
        );
      })}
      <h3>Source record comparisons</h3>
      <p className={styles.caption}>
        Greenbook product and manufacturer compared with the barcode-linked
        openFDA label by the backend. These matches do not authenticate the
        pack.
      </p>
      {lookup?.crossSourceComparisons?.length ? (
        <div className={styles.comparisons}>
          {lookup.crossSourceComparisons.map((comparison) => (
            <div key={comparison.field}>
              <div className={styles.resultTitle}>
                <strong>
                  {REGISTRATION_COMPARISON_LABELS[comparison.field] ??
                    comparison.field}
                </strong>
                <span
                  className={
                    comparison.status === "MISMATCH"
                      ? styles.mismatch
                      : styles.badge
                  }
                >
                  {COMPARISON_STATUS_LABELS[comparison.status] ?? "Unavailable"}
                </span>
              </div>
              <p>NAFDAC Greenbook: {comparison.observed || "Unavailable"}</p>
              <p>
                openFDA:{" "}
                {comparison.expected?.length
                  ? comparison.expected.join(" · ")
                  : "Unavailable"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.caption}>
          No source record comparisons available. No match is inferred.
        </p>
      )}
      <h3>Registration text comparisons</h3>
      {lookup?.comparisons?.length ? (
        <div className={styles.comparisons}>
          {lookup.comparisons.map((comparison) => (
            <div key={comparison.field}>
              <div className={styles.resultTitle}>
                <strong>
                  {REGISTRATION_COMPARISON_LABELS[comparison.field] ??
                    comparison.field}
                </strong>
                <span
                  className={
                    comparison.status === "MISMATCH"
                      ? styles.mismatch
                      : styles.badge
                  }
                >
                  {COMPARISON_STATUS_LABELS[comparison.status] ?? "Unavailable"}
                </span>
              </div>
              <p>On pack: {comparison.observed || "Not provided"}</p>
              <p>Registration record: {comparison.expected || "Unavailable"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.caption}>
          Unavailable — no unique registration record was compared. No match is
          inferred.
        </p>
      )}
      <div className={styles.provenance}>
        <span>
          Source: NAFDAC Greenbook via Apify · Third-party retrieval, not an
          official API
        </span>
        <span>Coverage and completeness are not guaranteed.</span>
        {lookup?.retrievedAt ? (
          <span>Lookup retrieved: {lookup.retrievedAt}</span>
        ) : null}
        <span>Link between registration and barcode: not established.</span>
      </div>
      <p className={styles.caption}>
        <strong>Pack authenticity unverified.</strong> A registration match does
        not authenticate the physical pack.
      </p>
    </section>
  );
}
