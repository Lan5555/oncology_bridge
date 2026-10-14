import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class InventoryService extends CoreService {
  async list(params = "") {
    return await this.get(Routes.INVENTORY(params));
  }
  async create(payload: unknown) {
    return await this.send(Routes.INVENTORY(), payload);
  }
  async update(id: string, payload: unknown) {
    return await super.update(Routes.INVENTORY_ITEM(id), payload);
  }
  async remove(id: string) {
    return await this.delete(Routes.INVENTORY_ITEM(id));
  }
  async nearExpiry(limit = 7) {
    return await this.get(Routes.INVENTORY_NEAR_EXPIRY(limit));
  }
  async quarantine(id: string) {
    return await this.send(Routes.INVENTORY_QUARANTINE(id), {});
  }
  async dispose(id: string) {
    return await this.send(Routes.INVENTORY_DISPOSE(id), {});
  }
  async exportCsv() {
    return await this.get(Routes.INVENTORY_EXPORT);
  }
  async expiry(withinDays = 60) {
    return await this.get(Routes.EXPIRY(withinDays));
  }
}
export const INVENTORY_SERVICE = new InventoryService();
