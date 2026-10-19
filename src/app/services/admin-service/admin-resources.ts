import {
  Boxes,
  CalendarClock,
  ClipboardList,
  FileText,
  FlaskConical,
  Map as MapIcon,
  Pill,
  ScanLine,
  ShoppingBag,
  Snowflake,
  Thermometer,
  Truck,
} from "lucide-react";
import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

type Column = { label: string; paths: string[]; money?: boolean };
type Resource = {
  label: string;
  description: string;
  icon: typeof Pill;
  permission: string;
  endpoint: string;
  columns: Column[];
};
const drug: Column = {
  label: "Medicine",
  paths: ["name", "generic_name", "drug", "medicine.generic_name", "drugName"],
};
const facility: Column = {
  label: "Facility",
  paths: [
    "facility.name",
    "hospital.name",
    "seller.name",
    "facilityName",
    "facility",
  ],
};
const status: Column = {
  label: "Status",
  paths: ["status", "order_stage", "orderStage", "auth_status"],
};

export const ADMIN_RESOURCES = {
  medicines: {
    label: "Drug catalogue",
    description:
      "Review medicine identities, brands, strengths, and GTINs across the network.",
    icon: Pill,
    permission: "medicine.read",
    endpoint: Routes.MEDICINES,
    columns: [
      drug,
      { label: "Brand", paths: ["brand"] },
      { label: "Strength", paths: ["strength"] },
      { label: "GTIN", paths: ["gtin"] },
    ],
  },
  inventory: {
    label: "Inventory",
    description:
      "Inspect stock, batches, quantities, and expiry dates across all facilities.",
    icon: Boxes,
    permission: "inventory.read",
    endpoint: Routes.INVENTORY(),
    columns: [
      drug,
      facility,
      { label: "Batch", paths: ["lot", "batchNumber"] },
      { label: "Quantity", paths: ["qty", "quantity", "availableQuantity"] },
      { label: "Expiry", paths: ["expiry", "expiry_date", "expiresOn"] },
      status,
    ],
  },
  marketplace: {
    label: "Marketplace",
    description:
      "Review pharmacy listings, product images, seller details, prices, and publication status.",
    icon: ShoppingBag,
    permission: "marketplace.read",
    endpoint: "/admin/api/marketplace/listings",
    columns: [
      drug,
      facility,
      {
        label: "Unit price",
        paths: ["unitPriceNaira", "unit_price_naira"],
        money: true,
      },
      { label: "Available", paths: ["availableQuantity", "quantity"] },
      status,
    ],
  },
  prescriptions: {
    label: "Prescriptions & orders",
    description:
      "Review network orders, authorization status, and fulfillment progress.",
    icon: ClipboardList,
    permission: "prescription.read",
    endpoint: Routes.PRESCRIPTIONS(),
    columns: [
      { label: "Order", paths: ["display_id", "reference", "id"] },
      drug,
      facility,
      { label: "Quantity", paths: ["qty", "quantity"] },
      status,
    ],
  },
  invoices: {
    label: "Invoices & payments",
    description:
      "Review invoice references, payment status, and billed amounts across the network.",
    icon: FileText,
    permission: "invoice.read",
    endpoint: Routes.INVOICES,
    columns: [
      { label: "Reference", paths: ["reference", "id"] },
      facility,
      { label: "Total", paths: ["totalNaira", "total_naira"], money: true },
      status,
      { label: "Paid at", paths: ["paidAt", "paid_at"] },
    ],
  },
  transfers: {
    label: "Redistribution",
    description:
      "Follow stock transfers between supplying and receiving facilities.",
    icon: Truck,
    permission: "transfer.read",
    endpoint: Routes.TRANSFERS(),
    columns: [
      { label: "Transfer", paths: ["reference", "id"] },
      {
        label: "From",
        paths: [
          "donorFacility.name",
          "donor_facility.name",
          "fromFacility",
          "from",
        ],
      },
      {
        label: "To",
        paths: [
          "recipientFacility.name",
          "recipient_facility.name",
          "toFacility",
          "to",
        ],
      },
      { label: "Quantity", paths: ["qty", "quantity"] },
      status,
    ],
  },
  scans: {
    label: "GS1 scan records",
    description:
      "Inspect recorded product identifiers and scan activity without adding stock.",
    icon: ScanLine,
    permission: "scan.read",
    endpoint: Routes.SCANS,
    columns: [
      { label: "GTIN", paths: ["gtin"] },
      { label: "Batch", paths: ["lot", "batchNumber"] },
      facility,
      { label: "Action", paths: ["action"] },
      { label: "Result", paths: ["result", "status"] },
      { label: "Recorded", paths: ["created_at", "createdAt", "clientTs"] },
    ],
  },
  storage: {
    label: "Storage units",
    description:
      "Review facility storage units, current temperatures, and operating ranges.",
    icon: Snowflake,
    permission: "coldchain.read",
    endpoint: Routes.STORAGE_UNITS,
    columns: [
      { label: "Storage unit", paths: ["name", "label", "id"] },
      facility,
      {
        label: "Temperature (C)",
        paths: ["tempC", "currentTempC", "current_temp", "temperature"],
      },
      status,
    ],
  },
  coldchain: {
    label: "Cold chain events",
    description:
      "Review temperature incidents, affected storage units, and resolution status.",
    icon: Thermometer,
    permission: "coldchain.read",
    endpoint: Routes.COLD_CHAIN_EVENTS(),
    columns: [
      {
        label: "Storage unit",
        paths: ["unit.name", "storageUnit.name", "unitId", "unit_id"],
      },
      facility,
      { label: "Severity", paths: ["severity"] },
      status,
      {
        label: "Started",
        paths: ["startedAt", "started_at", "createdAt", "created_at"],
      },
    ],
  },
  expiry: {
    label: "Near-expiry stock",
    description: "Review stock approaching expiry within the next 60 days.",
    icon: CalendarClock,
    permission: "inventory.read",
    endpoint: Routes.EXPIRY(60),
    columns: [
      drug,
      facility,
      { label: "Batch", paths: ["lot", "batchNumber"] },
      { label: "Expiry", paths: ["expiry", "expiry_date", "expiresOn"] },
      { label: "Quantity", paths: ["qty", "quantity"] },
      status,
    ],
  },
  network: {
    label: "Network directory",
    description:
      "Inspect connected facilities, locations, and network records.",
    icon: MapIcon,
    permission: "network.read",
    endpoint: Routes.NETWORK,
    columns: [
      { label: "Facility", paths: ["name"] },
      { label: "Type", paths: ["type", "facility_type"] },
      { label: "City", paths: ["city"] },
      { label: "State", paths: ["state"] },
      status,
    ],
  },
  research: {
    label: "Research inquiries",
    description:
      "Review submitted research inquiries and collaboration requests.",
    icon: FlaskConical,
    permission: "research.read",
    endpoint: Routes.RESEARCH_INQUIRIES,
    columns: [
      { label: "Contact", paths: ["name", "fullName", "email"] },
      { label: "Organization", paths: ["organization", "institution"] },
      { label: "Subject", paths: ["subject", "topic", "interest"] },
      status,
      { label: "Submitted", paths: ["createdAt", "created_at"] },
    ],
  },
} satisfies Record<string, Resource>;

export type AdminResourceId = keyof typeof ADMIN_RESOURCES;
export function isAdminResource(value: string): value is AdminResourceId {
  return Object.hasOwn(ADMIN_RESOURCES, value);
}

class AdminResourceService extends CoreService {
  list(resource: AdminResourceId, page: number, search: string) {
    const url = new URL(
      ADMIN_RESOURCES[resource].endpoint,
      "https://local.invalid",
    );
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "25");
    if (search) url.searchParams.set("q", search);
    return this.get(url.pathname + url.search, { admin: true });
  }
}
export const ADMIN_RESOURCE_SERVICE = new AdminResourceService();
