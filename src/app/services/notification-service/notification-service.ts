import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class NotificationService extends CoreService {
  async list() {
    return await this.get(Routes.NOTIFICATIONS);
  }
  async markRead(id: string) {
    return await super.update(Routes.NOTIFICATION_READ(id), {});
  }
}
export const NOTIFICATION_SERVICE = new NotificationService();
