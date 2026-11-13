export type PackIdentifiers = {
  gtin: string;
  lot: string;
  serial: string;
  expiry: string;
};
export type Manifest = {
  id: string;
  reference: string;
  created_at?: string;
  packs?: PackIdentifiers[];
};
export type PackAssessment = {
  identifiers: PackIdentifiers;
  manifestId: string | null;
  manifestMatch: "MATCH" | "NOT_FOUND" | "MISMATCH";
  mismatches: string[];
  duplicate: boolean;
  suspectedCounterfeit: boolean;
  canDispense: boolean;
  reasons: string[];
  authenticity: "UNVERIFIED";
};
export type DispenseRequest = { rawBarcode: string; clientUuid: string };
export type DispenseResult = PackAssessment & { id: string; replay: boolean };

export const DISPENSING_REASONS: Record<string, string> = {
  PACK_NOT_IN_MANIFEST: "This pack is missing from your pharmacy's manifests.",
  MANIFEST_MISMATCH: "The pack details differ from the uploaded manifest.",
  PACK_EXPIRED: "This pack has expired. Do not dispense it.",
  SERIAL_ALREADY_DISPENSED:
    "Suspected duplicate pack — dispensing blocked. Review with the pharmacist.",
};

// Fail closed when an endpoint returns an incomplete or inconsistent decision.
export function isPackAssessment(value: unknown): value is PackAssessment {
  if (!value || typeof value !== "object") return false;
  const data = value as PackAssessment;
  return Boolean(
    data.identifiers &&
      ["gtin", "lot", "serial", "expiry"].every(
        (key) =>
          typeof data.identifiers[key as keyof PackIdentifiers] === "string" &&
          data.identifiers[key as keyof PackIdentifiers].length > 0,
      ) &&
      (data.manifestId === null || typeof data.manifestId === "string") &&
      ["MATCH", "NOT_FOUND", "MISMATCH"].includes(data.manifestMatch) &&
      Array.isArray(data.mismatches) &&
      data.mismatches.every((v) => typeof v === "string") &&
      Array.isArray(data.reasons) &&
      data.reasons.every((v) => typeof v === "string") &&
      typeof data.canDispense === "boolean" &&
      typeof data.duplicate === "boolean" &&
      typeof data.suspectedCounterfeit === "boolean" &&
      data.authenticity === "UNVERIFIED" &&
      (!data.canDispense ||
        (data.manifestMatch === "MATCH" &&
          Boolean(data.manifestId) &&
          !data.duplicate &&
          !data.suspectedCounterfeit &&
          !data.reasons.length &&
          !data.mismatches.length)),
  );
}

export function isDispenseResult(value: unknown): value is DispenseResult {
  return (
    isPackAssessment(value) &&
    typeof (value as DispenseResult).id === "string" &&
    Boolean((value as DispenseResult).id) &&
    typeof (value as DispenseResult).replay === "boolean"
  );
}

export function dispensingStorageKey(userId: string, facilityId: string) {
  return `pharmacy-dispense:${encodeURIComponent(userId)}:${encodeURIComponent(facilityId)}`;
}

export function readDispenseRequest(raw: string): DispenseRequest {
  const value = JSON.parse(raw);
  if (
    !value ||
    typeof value.rawBarcode !== "string" ||
    !value.rawBarcode.trim() ||
    typeof value.clientUuid !== "string" ||
    !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
      value.clientUuid,
    )
  ) {
    throw new Error(
      "Saved dispensing operation cannot be read. Ask the pharmacist to reconcile it before continuing.",
    );
  }
  return { rawBarcode: value.rawBarcode, clientUuid: value.clientUuid };
}

export function dispensingError(status?: number): string {
  if (status === 401)
    return "Your session has expired. Sign in again, then retry the saved operation.";
  if (status === 403)
    return "Access denied. Active, verified facility membership with inventory management permission is required.";
  if (status === 409)
    return "This reference, pack identity or operation conflicts with an existing record. Review it with the pharmacist.";
  if (status === 400 || status === 422)
    return "Check the supplied data. Each pack needs a valid 14-digit GTIN, batch, serial and expiry; scan the complete GS1 code.";
  if (status === 413) return "The manifest exceeds the 1 MiB upload limit.";
  return "The request could not be confirmed. For dispensing, retry the saved operation to retrieve its recorded outcome.";
}
