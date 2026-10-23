import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

class PrescriptionService extends CoreService {
  pharmacies(page = 1) {
    return this.get(Routes.PRESCRIPTION_PHARMACIES(page), {
      facilityOnly: true,
    });
  }
  async checkoutOptions(page = 1) {
    return await this.get(
      `${Routes.PRESCRIPTIONS("active")}&page=${page}&limit=25`,
    );
  }
  async list(tab: string) {
    return await this.get(Routes.PRESCRIPTIONS(tab));
  }
  async create(payload: Record<string, unknown>) {
    return await this.send(
      Routes.PRESCRIPTIONS(),
      this.normalizeClinicalFields(payload),
      { facilityOnly: true },
    );
  }
  async update(id: string, payload: Record<string, unknown>) {
    return await super.update(
      Routes.PRESCRIPTION_ITEM(id),
      this.normalizeClinicalFields(payload),
      { facilityOnly: true },
    );
  }
  private normalizeClinicalFields(payload: Record<string, unknown>) {
    return {
      ...payload,
      ...(typeof payload.icd10 === "string"
        ? { icd10: payload.icd10.trim().toUpperCase() }
        : {}),
    };
  }
  async searchStock(q = "", location = "") {
    return await this.get(Routes.STOCK_SEARCH(q, location), { auth: false });
  }
}
export const PRESCRIPTION_SERVICE = new PrescriptionService();
