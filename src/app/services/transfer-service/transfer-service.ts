import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class TransferService extends CoreService {
  dispatch(id: string) {
    return this.send(Routes.TRANSFER_DISPATCH(id), {}, { facilityOnly: true });
  }
  deliver(id: string) {
    return this.send(Routes.TRANSFER_DELIVER(id), {}, { facilityOnly: true });
  }
  async list(status?: string) {
    return await this.get(Routes.TRANSFERS(status));
  }
  async stats() {
    return await this.get(Routes.TRANSFER_STATS);
  }
  async activeOrder() {
    return await this.get(Routes.TRANSFER_ACTIVE_ORDER);
  }
  async suggest(inventoryItemId: string) {
    return await this.get(Routes.TRANSFER_SUGGEST(inventoryItemId));
  }
  async create(payload: unknown) {
    return await this.send(Routes.TRANSFERS(), payload);
  }
  async approve(id: string) {
    return await this.send(Routes.TRANSFER_APPROVE(id), {});
  }
  async reject(id: string, reason?: string) {
    return await this.send(
      Routes.TRANSFER_REJECT(id),
      reason ? { reason } : {},
    );
  }
}
export const TRANSFER_SERVICE = new TransferService();
