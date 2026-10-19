import { CoreService } from "@/app/hooks/service/core-service";

export interface DrugListing {
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
