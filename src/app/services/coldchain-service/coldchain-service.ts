import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class ColdChainService extends CoreService {
  async storageUnits() {
    return await this.get(Routes.STORAGE_UNITS);
  }
  async createStorageUnit(payload: unknown) {
    return await this.send(Routes.STORAGE_UNITS, payload);
  }
  async updateStorageUnit(id: string, payload: unknown) {
    return await super.update(Routes.STORAGE_UNIT(id), payload);
  }
  async coldChainEvents(
    params: {
      unitId?: string;
      status?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    return await this.get(Routes.COLD_CHAIN_EVENTS(params));
  }
  async history(hours = 24, unitId?: string) {
    return await this.get(Routes.COLDCHAIN_HISTORY(hours, unitId));
  }
}
export const COLDCHAIN_SERVICE = new ColdChainService();
