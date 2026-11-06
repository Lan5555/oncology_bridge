export const BULK_MEDICINE_FIELDS = [
  ["gtin", "GTIN-14"],
  ["generic_name", "Generic name"],
  ["brand_name", "Brand name"],
  ["manufacturer", "Manufacturer"],
  ["strength", "Strength"],
  ["dosage_form", "Dosage form"],
  ["storage_temperature", "Approved storage wording"],
] as const;

export type BulkMedicineField = (typeof BULK_MEDICINE_FIELDS)[number][0];
export type BulkMedicine = Record<BulkMedicineField, string>;
export type BulkMedicineError = {
  index: number;
  field: string;
  message: string;
};

export function emptyBulkMedicine(): BulkMedicine {
  return {
    gtin: "",
    generic_name: "",
    brand_name: "",
    manufacturer: "",
    strength: "",
    dosage_form: "",
    storage_temperature: "",
  };
}

export function validGtin14(value: string): boolean {
  if (!/^\d{14}$/.test(value)) return false;
  const sum = [...value.slice(0, 13)].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1),
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(value[13]);
}

/** Pick only contract fields, trim text, and keep GTIN as a string. */
export function bulkMedicinePayload(rows: BulkMedicine[]): BulkMedicine[] {
  return rows.map(
    (row) =>
      Object.fromEntries(
        BULK_MEDICINE_FIELDS.map(([field]) => [field, row[field].trim()]),
      ) as BulkMedicine,
  );
}

export function validateBulkMedicines(
  rows: BulkMedicine[],
): BulkMedicineError[] {
  if (rows.length < 1 || rows.length > 100) {
    return [
      {
        index: -1,
        field: "medicines",
        message: "Add between 1 and 100 medicines.",
      },
    ];
  }
  const errors: BulkMedicineError[] = [];
  const gtins = new Map<string, number[]>();
  rows.forEach((row, index) => {
    for (const [field, label] of BULK_MEDICINE_FIELDS) {
      if (!row[field].trim())
        errors.push({ index, field, message: `${label} is required.` });
    }
    const gtin = row.gtin.trim();
    if (gtin && !validGtin14(gtin))
      errors.push({
        index,
        field: "gtin",
        message: "Enter 14 digits with a valid GTIN check digit.",
      });
    if (gtin) gtins.set(gtin, [...(gtins.get(gtin) ?? []), index]);
  });
  for (const indexes of gtins.values()) {
    if (indexes.length > 1)
      for (const index of indexes)
        errors.push({
          index,
          field: "gtin",
          message: "This GTIN appears more than once in the batch.",
        });
  }
  return errors;
}

export function bulkApiErrors(data: unknown): BulkMedicineError[] {
  if (
    !data ||
    typeof data !== "object" ||
    !("errors" in data) ||
    !Array.isArray(data.errors)
  )
    return [];
  return data.errors.filter(
    (error): error is BulkMedicineError =>
      error !== null &&
      typeof error === "object" &&
      Number.isInteger(error.index) &&
      error.index >= 0 &&
      typeof error.field === "string" &&
      typeof error.message === "string",
  );
}

export function bulkFailureMessage(status?: number): string {
  switch (status) {
    case 400:
      return "The batch was rejected. Check the medicine details.";
    case 401:
      return "Your session could not be authenticated. Sign in again before retrying.";
    case 403:
      return "You do not have permission to create medicines.";
    case 409:
      return "A GTIN conflicts with an existing medicine. Check the batch before retrying.";
    default:
      return "The batch could not be confirmed. Your rows have been kept. Refresh the catalog before retrying if the connection was interrupted.";
  }
}
