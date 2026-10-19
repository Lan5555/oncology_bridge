import type { AccountType, VerificationStatus } from "@/app/lib/accounts";
import { INVOICE_SERVICE } from "@/app/services/invoice-service/invoice-service";
import { PRESCRIPTION_SERVICE } from "@/app/services/prescription-service/prescription-service";
import { RESEARCH_SERVICE } from "@/app/services/research-service/research-service";
import { unwrapArray } from "@/app/services/response-utils";

export type RegistryResult = "MATCH" | "NO_MATCH" | "UNAVAILABLE";
export interface InvoiceData {
  reference: string;
  pharmacy: string;
  status: "AWAITING_PAYMENT" | "PAID";
  items: Array<{
    description: string;
    quantity: number;
    unitPriceNaira: number;
  }>;
  paymentMethods: string[];
  paystackUrl?: string;
  isDemo?: boolean;
}
export interface StockItem {
  id: string;
  drug: string;
  brand: string;
  location: string;
  availableQuantity: number;
  unitPriceNaira: number;
  batchNumber: string;
  expiresOn: string;
  status: "Available" | "Near expiry" | "Reserved";
}
export interface InventoryRecord {
  id: string;
  drug: string;
  gtin: string;
  lot: string;
  facility: string;
  qty: number;
  expiry: string;
  temp: string;
  status: string;
  statusStyle: string;
  actionLabel: string;
  actionClass: string;
  category: string;
}
export interface OrderRecord {
  id: string;
  code: string;
  drug: string;
  insurer: string;
  pharmacy: string;
  status: string;
  order: string;
  statusClass: string;
  orderClass: string;
}
export interface VerificationApplication {
  registry?: string;
  registry_name?: string | null;
  id: string;
  name: string;
  accountType: AccountType;
  license: string;
  workplace: string;
  submitted: string;
  registryResult: RegistryResult;
  status: VerificationStatus;
}
export interface PartnershipInquiry {
  organization: string;
  name: string;
  projectScope: string;
  email: string;
}

/** Adapts backend response shapes to the page-level data currently used by the UI. */
class BridgeDataService {
  async findInvoiceByReference(reference: string): Promise<InvoiceData | null> {
    const response = await INVOICE_SERVICE.find(reference);
    return response.success ? (response.data as InvoiceData) : null;
  }

  async createInvoice(
    orderId: string,
    quantity = 1,
    unitPriceNaira = 0,
  ): Promise<{ reference: string; url?: string } | null> {
    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(unitPriceNaira) ||
      unitPriceNaira < 0 ||
      typeof window === "undefined"
    )
      return null;
    let session: any = {};
    try {
      session = JSON.parse(window.localStorage.getItem("userSession") ?? "{}");
    } catch {
      session = {};
    }
    const user = session.user ?? {};
    const facilityId =
      user.facility_id ??
      user.facility?.id ??
      user.hospital?.id ??
      session.facilityId;
    if (!facilityId) return null;
    const response = await INVOICE_SERVICE.create({
      order_id: orderId,
      pharmacy_facility_id: facilityId,
      total_naira: Math.round(quantity * unitPriceNaira),
    });
    return response.success
      ? (response.data as { reference: string; url?: string })
      : null;
  }

  async searchStock(query: string, location = ""): Promise<StockItem[]> {
    const response = await PRESCRIPTION_SERVICE.searchStock(
      query.trim(),
      location.trim(),
    );
    return response.success ? (unwrapArray(response.data) as StockItem[]) : [];
  }

  async submitPartnershipInquiry(
    inquiry: PartnershipInquiry,
  ): Promise<{ reference?: string; success: boolean; message: string }> {
    const response = await RESEARCH_SERVICE.submitInquiry({
      name: inquiry.name,
      organisation: inquiry.organization,
      email: inquiry.email,
      message: inquiry.projectScope,
    });
    return {
      reference: (response.data as any)?.reference,
      success: response.success,
      message: response.message,
    };
  }
}

export const BRIDGE_DATA_SERVICE = new BridgeDataService();
