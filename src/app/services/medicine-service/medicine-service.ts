import { CoreService } from "@/app/hooks/service/core-service";
import { MEDICINE_CATALOGUE_CHANGED } from "@/app/lib/medicine-availability";
import { Routes } from "../api-routes";

export type MedicinePayload = {
  generic_name: string;
  brand_name: string;
  manufacturer: string;
  dosage_form: string;
  storage_temperature: string;
  strength?: string | null;
  gtin?: string | null;
};

class MedicineService extends CoreService {
  async list(params = "") {
    return await this.get(`${Routes.MEDICINES}${params ? `?${params}` : ""}`);
  }
  async findByGtin(gtin: string) {
    return await this.get(Routes.MEDICINE_BY_GTIN(gtin));
  }
  async create(payload: MedicinePayload) {
    return await this.send(Routes.MEDICINES, payload);
  }
  async update(id: string, payload: MedicinePayload) {
    return await super.update(Routes.MEDICINE_ITEM(id), payload);
  }
  async remove(id: string) {
    const response = await this.delete(Routes.MEDICINE_ITEM(id));
    if (response.success && typeof window !== "undefined") {
      window.dispatchEvent(new Event(MEDICINE_CATALOGUE_CHANGED));
    }
    return response;
  }
}

export const MEDICINE_SERVICE = new MedicineService();
