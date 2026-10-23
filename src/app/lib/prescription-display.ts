export interface PrescriptionDisplayRow {
  id: string;
  patientRef: string;
  createdBy: string;
  createdAt: string | null;
  description: string | null;
  prescriberId: string | null;
  code: string;
  drug: string;
  insurer: string;
  pharmacy: string;
  status: string;
  order: string;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

/** Use the browser's local timezone rather than forcing a server or facility timezone. */
export function prescriptionLocalTime(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    Number.isNaN(Date.parse(value))
  )
    return "Not provided";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Keep patient references and clinical/dispensing states distinct from purchase orders. */
export function prescriptionDisplayRow(
  row: Record<string, unknown>,
): PrescriptionDisplayRow {
  const medicine =
    text(row.drug) ??
    text(object(row.medicine).generic_name) ??
    text(object(row.medicine).name) ??
    text(row.drugName);
  const quantity = row.qty ?? row.quantity;
  return {
    id: text(row.id) ?? "",
    patientRef: text(row.patient_ref) ?? "Not provided",
    createdBy: text(object(row.prescriber).name) ?? "Not provided",
    createdAt: text(row.created_at) ?? null,
    description: text(row.description) ?? null,
    prescriberId: text(object(row.prescriber).id) ?? null,
    code: text(row.icd10) ?? "Not provided",
    drug:
      text(row.drug) ??
      (medicine
        ? `${medicine}${typeof quantity === "number" && Number.isFinite(quantity) ? ` · Quantity: ${quantity}` : ""}`
        : "Medicine not provided"),
    insurer: text(row.insurer) ?? "Not provided",
    pharmacy:
      text(object(row.pharmacy).name) ??
      text(row.pharmacy_name) ??
      "Not provided",
    status: text(row.auth_status) ?? "Not provided",
    order: text(row.order_stage) ?? "Not provided",
  };
}
