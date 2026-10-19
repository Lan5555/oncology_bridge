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
    licenseLabel: "Professional licence / folio number",
    licensePlaceholder: "Enter the number shown on your licence",
    workspace: "Clinical",
  },
  {
    id: "PHARMACIST",
    label: "Pharmacist",
    blurb: "Clinical pharmacy: prescriptions, cold chain and expiry.",
    registry: "PCN",
    licenseLabel: "Professional registration number",
    licensePlaceholder: "Enter the number shown on your licence",
    workspace: "Clinical",
  },
  {
    id: "PHARMACY_STORE",
    label: "Pharmacy Store",
    blurb: "Inventory, GS1 scanning, redistribution and near-expiry stock.",
    registry: "PCN_PREMISES",
    licenseLabel: "Premises licence number",
    licensePlaceholder: "Enter the number shown on your licence",
    workspace: "Pharmacy Tools",
  },
];

export const getAccountInfo = (type?: AccountType) =>
  ACCOUNT_TYPES.find((a) => a.id === type);

/** Display server registry metadata without inferring a council from account type. */
export function getRegistryLabel(...records: unknown[]): string {
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const data = record as Record<string, unknown>;
    const registry = data.registry;
    const metadata =
      registry && typeof registry === "object"
        ? (registry as Record<string, unknown>)
        : {};
    for (const value of [
      data.registry_name,
      data.registryName,
      metadata.name,
      metadata.label,
    ]) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const registry = (record as Record<string, unknown>).registry;
    const code =
      registry && typeof registry === "object"
        ? (registry as Record<string, unknown>).code
        : registry;
    if (typeof code === "string" && code.trim()) return code.trim();
  }
  return "Not provided";
}

const ALWAYS: PageId[] = ["pg-dashboard", "pg-settings"];

const VERIFIED_BY_TYPE: Record<AccountType, PageId[]> = {
  DOCTOR: ["pg-marketplace", "pg-prescriptions", "pg-coldchain", "pg-expiry"],
  PHARMACIST: [
    "pg-marketplace",
    "pg-prescriptions",
    "pg-coldchain",
    "pg-expiry",
    "pg-medicines",
  ],
  PHARMACY_STORE: [
    "pg-marketplace",
    "pg-scan",
    "pg-inventory",
    "pg-medicines",
    "pg-transfers",
    "pg-expiry",
  ],
};

/** Resolve visible workspaces from server grants, with least-privilege legacy defaults. */
export function allowedPages(
  type?: AccountType,
  status?: VerificationStatus,
  serverAllowedPages?: string[],
  permissions: string[] = [],
  canManageFacilityUsers = permissions.includes("facility.users.manage"),
): PageId[] | null {
  if (type && status !== "VERIFIED") return ALWAYS;
  const knownPages = new Set<PageId>([
    "pg-marketplace",
    "pg-dashboard",
    "pg-inventory",
    "pg-medicines",
    "pg-scan",
    "pg-transfers",
    "pg-prescriptions",
    "pg-coldchain",
    "pg-expiry",
    "pg-network",
    "pg-facilities",
    "pg-users",
    "pg-audit",
    "pg-settings",
  ]);
  const rolePages = type ? VERIFIED_BY_TYPE[type] : [];
  const backendPages =
    serverAllowedPages?.filter((page): page is PageId =>
      knownPages.has(page as PageId),
    ) ?? [];
  // Preserve the standard workspace tools for each verified account type even
  // when an older backend response omits them from allowed_pages. Server page
  // grants can add facility tools outside the account type's default workspace.
  // A pharmacist facility admin, for example, may also manage inventory.
  // Privileged network pages still require their separate permissions below.
  const pages = [...new Set([...ALWAYS, ...rolePages, ...backendPages])];
  const inventoryPages: PageId[] = permissions.includes("inventory.manage")
    ? ["pg-inventory", "pg-scan", "pg-medicines"]
    : [];
  const requiredPermission: Partial<Record<PageId, string>> = {
    "pg-network": "network.read",
    "pg-facilities": "facility.read",
    "pg-audit": "audit.read",
  };
  const permissionPages = (
    Object.entries(requiredPermission) as [PageId, string][]
  )
    .filter(([, permission]) => permissions.includes(permission))
    .map(([page]) => page);
  const grantedPages = [
    ...new Set([...pages, ...inventoryPages, ...permissionPages]),
  ];
  return grantedPages.filter((page) => {
    if (page === "pg-users") return canManageFacilityUsers;
    const required = requiredPermission[page];
    return !required || permissions.includes(required);
  });
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
