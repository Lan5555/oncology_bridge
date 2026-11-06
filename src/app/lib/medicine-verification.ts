export type ComparisonField = "brandName" | "genericName" | "manufacturer";
export type VerificationRequest = (
  | { rawBarcode: string; gtin?: never }
  | { gtin: string; rawBarcode?: never }
  | { nafdacNumber: string; rawBarcode?: never; gtin?: never }
) &
  VerificationFields;

export type VerificationFields = Partial<
  Record<ComparisonField | "productName" | "strength" | "nafdacNumber", string>
>;
export const VERIFICATION_TIMEOUT_MS = 95_000;
export const REGISTRATION_COMPARISON_LABELS = {
  productName: "Product name",
  manufacturer: "Manufacturer",
  strength: "Strength",
};
export const COMPARISON_STATUS_LABELS = {
  MATCH: "Match",
  MISMATCH: "Mismatch",
  NOT_PROVIDED: "Not provided",
  UNAVAILABLE: "Unavailable",
};

export interface RegistrationLookup {
  status:
    | "NOT_PROVIDED"
    | "NOT_CONFIGURED"
    | "FOUND"
    | "NO_EXACT_MATCH"
    | "AMBIGUOUS"
    | "UNAVAILABLE";
  reason: string | null;
  source: "NAFDAC_GREENBOOK_VIA_APIFY";
  officialApi: false;
  market: "NG";
  registrationNumber: string | null;
  retrievedAt: string | null;
  completeness: "NOT_GUARANTEED";
  barcodeLink: "NOT_ESTABLISHED";
  records: {
    productId: number;
    registrationNumber: string;
    productName: string;
    status: "Active" | "Inactive";
    applicant: string | null;
    manufacturer: string | null;
    activeIngredients: string[];
    strength: string | null;
    dosageForm: string | null;
    packSize: string | null;
    approvedAt: string | null;
    registrationExpiresAt: string | null;
    fetchedAt: string;
    sourceUrl: string;
    dataQualityNote: string | null;
  }[];
  comparisons: {
    field: keyof typeof REGISTRATION_COMPARISON_LABELS;
    observed: string | null;
    expected: string | null;
    status: keyof typeof COMPARISON_STATUS_LABELS;
  }[];
}

export interface MedicineAssessment {
  identifiers: {
    gtin: string | null;
    lot: string | null;
    serial: string | null;
    expiry: string | null;
  };
  checkedAt: string;
  authenticity: {
    status: "UNVERIFIED";
    provider: string | null;
    reason: string;
  };
  productLookup: {
    status:
      | "FOUND"
      | "NOT_FOUND"
      | "UNAVAILABLE"
      | "AMBIGUOUS"
      | "NOT_REQUESTED";
    source: "OPENFDA_DRUG_LABEL";
    market: "US";
    sourceUrl: string | null;
    labelId: string | null;
    labelEffectiveTime: string | null;
    official: Record<
      | "brandNames"
      | "genericNames"
      | "manufacturers"
      | "packageNdcs"
      | "activeIngredients"
      | "storageAndHandling"
      | "warnings",
      string[]
    > | null;
  };
  comparisons: {
    field: ComparisonField;
    observed: string | null;
    expected: string[];
    status: "MATCH" | "MISMATCH" | "NOT_PROVIDED" | "UNAVAILABLE";
  }[];
  registrationLookup?: RegistrationLookup;
  expiry: {
    status: "EXPIRED" | "NOT_EXPIRED" | "UNKNOWN";
    source: "BARCODE";
    verifiedByManufacturer: false;
  };
  recall: { status: "NOT_CHECKED" };
  guidance: string;
}

export const COMPARISON_LABELS: Record<ComparisonField, string> = {
  brandName: "Brand name",
  genericName: "Generic name",
  manufacturer: "Manufacturer",
};

export function verificationRequest(
  input: string,
  fields: VerificationFields,
): VerificationRequest {
  // Strip only outer whitespace: embedded ASCII group separators must survive.
  const value = input.trim();
  const comparisons = verificationMetadata(fields);
  if (!value) {
    if (!comparisons.nafdacNumber)
      throw new Error(
        "Enter a NAFDAC registration number or barcode to continue.",
      );
    return { ...comparisons, nafdacNumber: comparisons.nafdacNumber };
  }
  const identifiers = /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)
    ? { gtin: value.padStart(14, "0") }
    : { rawBarcode: value };
  return { ...identifiers, ...comparisons };
}

export function verificationMetadata(
  fields: VerificationFields,
): VerificationFields {
  const comparisons: VerificationFields = {};
  const labels = {
    ...COMPARISON_LABELS,
    ...REGISTRATION_COMPARISON_LABELS,
    nafdacNumber: "NAFDAC registration number",
  };
  for (const field of Object.keys(labels) as (keyof VerificationFields)[]) {
    const text = fields[field]?.trim() ?? "";
    if (field === "nafdacNumber") {
      if (text && !/^[A-Za-z0-9][A-Za-z0-9 /-]{1,49}$/.test(text))
        throw new Error(
          "Enter a NAFDAC registration number of 2–50 letters, numbers, spaces, slashes or hyphens.",
        );
      if (text) comparisons[field] = text.toUpperCase();
      continue;
    }
    if (text.length > 200)
      throw new Error(`${labels[field]} must be 200 characters or fewer.`);
    if (text) comparisons[field] = text;
  }
  return comparisons;
}

export function validateVerificationImage(image: Blob): string | null {
  if (!["image/jpeg", "image/png"].includes(image.type))
    return "Choose a JPEG or PNG image.";
  if (!image.size) return "This image is empty. Choose another photo.";
  if (image.size > 10 * 1024 * 1024)
    return "The image must be 10 MB or smaller.";
  return null;
}

export function verificationError(status?: number): string {
  switch (status) {
    case 400:
      return "Check the registration number, barcode and packaging fields, or try a clearer JPEG or PNG photo.";
    case 408:
      return "The check did not finish within 95 seconds. It has not been retried automatically. You can try again when ready.";
    case 401:
      return "Your session has expired. Sign in again to check this medicine.";
    case 403:
      return "Your account or facility cannot access verification. Contact your administrator.";
    case 413:
      return "The photo is too large. Choose an image up to 10 MB.";
    case 422:
      return "The decoded identifiers are unsupported. Use a GS1 DataMatrix with GTIN, batch, expiry and serial identifiers, or enter a GTIN.";
    case 429:
      return "Too many checks. Wait a minute before trying again (10 attempts per minute).";
    default:
      return "Verification is unavailable. Check your connection and try again.";
  }
}

export function officialSourceUrl(value: string | null): string | null {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" &&
      url.hostname === "api.fda.gov" &&
      !url.username &&
      !url.password &&
      !url.searchParams.has("api_key")
      ? url.href
      : null;
  } catch {
    return null;
  }
}
