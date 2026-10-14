import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

class MedicineService extends CoreService {
  async list() {
    return await this.get(Routes.MEDICINES);
  }
  async findByGtin(gtin: string) {
    return await this.get(Routes.MEDICINE_BY_GTIN(gtin));
  }
  async create(payload: unknown) {
    return await this.send(Routes.MEDICINES, payload);
  }
  async update(id: string, payload: unknown) {
    return await super.update(Routes.MEDICINE_ITEM(id), payload);
  }
  async remove(id: string) {
    return await this.delete(Routes.MEDICINE_ITEM(id));
  }
}

export const MEDICINE_SERVICE = new MedicineService();
