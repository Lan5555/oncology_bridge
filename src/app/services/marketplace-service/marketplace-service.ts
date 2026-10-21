import { CoreService } from "@/app/hooks/service/core-service";
import type { MedicineState } from "@/app/lib/medicine-availability";

export interface DrugListing {
  medicine?: (MedicineState & { id?: string }) | null;
  medicineId?: string;
  medicine_id?: string;
  drug_id?: string;
  medicine_deleted?: boolean;
  medicine_active?: boolean;
  id: string;
  inventoryItemId: string;
  name: string;
  brand: string;
  strength: string;
  category: string;
  description: string;
  unit: string;
  unitPriceNaira: number;
  availableQuantity: number;
  batchNumber: string;
  expiresOn: string;
  storage: string;
  prescriptionRequired: boolean;
  images: { id: string; url: string; alt: string }[];
  seller: { id: string; name: string; city: string; verified: boolean };
}

class MarketplaceService extends CoreService {
  list(params: URLSearchParams) {
    return this.get(`/api/marketplace/listings?${params}`);
  }
  createListing(payload: FormData) {
    return this.send("/api/marketplace/listings", payload);
  }
  checkout(
    listingId: string,
    quantity: number,
    prescriptionId: string,
    key: string,
  ) {
    return this.send(
      "/api/marketplace/checkout",
      {
        listingId,
        quantity,
        prescriptionId: prescriptionId || undefined,
      },
      { headers: { "Idempotency-Key": key } },
    );
  }
}

export const MARKETPLACE_SERVICE = new MarketplaceService();
