import type { PageId } from "./types";

export type AccountType = "DOCTOR" | "PHARMACIST" | "PHARMACY_STORE";

export type VerificationStatus =
  | "PENDING"
  | "MANUAL_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type LicenseRegistry = "MDCN" | "PCN" | "PCN_PREMISES";

export interface AccountTypeInfo {
  id: AccountType;
  label: string;
  blurb: string;
  registry: LicenseRegistry;
  registryName: string;
  licenseLabel: string;
  licensePlaceholder: string;
  /** Sidebar group this account type works in. */
  workspace: "Clinical" | "Pharmacy Tools";
}

export const ACCOUNT_TYPES: AccountTypeInfo[] = [
  {
    id: "DOCTOR",
    label: "Doctor",
    blurb: "Prescribe, track orders and monitor clinical supply.",
    registry: "MDCN",
    registryName: "Medical and Dental Council of Nigeria (MDCN)",
    licenseLabel: "MDCN Licence / Folio Number",
    licensePlaceholder: "e.g. MDCN/R/12345",
    workspace: "Clinical",
  },
  {
    id: "PHARMACIST",
    label: "Pharmacist",
    blurb: "Clinical pharmacy: prescriptions, cold chain and expiry.",
    registry: "PCN",
    registryName: "Pharmacists Council of Nigeria (PCN)",
    licenseLabel: "PCN Registration Number",
    licensePlaceholder: "e.g. PCN/12345",
    workspace: "Clinical",
  },
  {
    id: "PHARMACY_STORE",
    label: "Pharmacy Store",
    blurb: "Inventory, GS1 scanning, redistribution and near-expiry stock.",
    registry: "PCN_PREMISES",
    registryName: "Pharmacists Council of Nigeria (PCN) premises register",
    licenseLabel: "PCN Premises Licence Number",
    licensePlaceholder: "e.g. PCN/PREM/12345",
    workspace: "Pharmacy Tools",
  },
];

export const getAccountInfo = (type?: AccountType) =>
  ACCOUNT_TYPES.find((a) => a.id === type);

const ALWAYS: PageId[] = ["pg-dashboard", "pg-settings"];

const VERIFIED_BY_TYPE: Record<AccountType, PageId[]> = {
  DOCTOR: ["pg-network", "pg-prescriptions", "pg-coldchain", "pg-expiry"],
  PHARMACIST: [
    "pg-network",
    "pg-prescriptions",
    "pg-coldchain",
    "pg-expiry",
    "pg-medicines",
  ],
  PHARMACY_STORE: [
    "pg-network",
    "pg-scan",
    "pg-inventory",
    "pg-medicines",
    "pg-transfers",
    "pg-expiry",
  ],
};

/** Returns null for legacy accounts with no account type (full access). */
export function allowedPages(
  type?: AccountType,
  status?: VerificationStatus,
): PageId[] | null {
  if (!type) return null;
  return status === "VERIFIED"
    ? [...ALWAYS, ...VERIFIED_BY_TYPE[type]]
    : ALWAYS;
}

export const VERIFICATION_COPY: Record<
  VerificationStatus,
  { title: string; body: string }
> = {
  PENDING: {
    title: "Verification in progress",
    body: "We are checking your licence against the public registry.",
  },
  MANUAL_REVIEW: {
    title: "Awaiting administrator review",
    body: "Your licence needs a manual check. You will get full access as soon as it is approved.",
  },
  VERIFIED: { title: "Verified", body: "Your licence has been verified." },
  REJECTED: {
    title: "Verification unsuccessful",
    body: "We could not confirm your licence. Contact support to resubmit your details.",
  },
};
