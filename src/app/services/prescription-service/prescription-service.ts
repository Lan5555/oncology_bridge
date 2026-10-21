import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

class PrescriptionService extends CoreService {
  async checkoutOptions(page = 1) {
    return await this.get(
      `${Routes.PRESCRIPTIONS("active")}&page=${page}&limit=25`,
    );
  }
  async list(tab: string) {
    return await this.get(Routes.PRESCRIPTIONS(tab));
  }
  async create(payload: unknown) {
    return await this.send(Routes.PRESCRIPTIONS(), payload);
  }
  async update(id: string, payload: unknown) {
    return await super.update(Routes.PRESCRIPTION_ITEM(id), payload);
  }
  async searchStock(q = "", location = "") {
    return await this.get(Routes.STOCK_SEARCH(q, location), { auth: false });
  }
}
export const PRESCRIPTION_SERVICE = new PrescriptionService();
