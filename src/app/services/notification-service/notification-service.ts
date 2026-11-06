import { CoreService } from "@/app/hooks/service/core-service";
import { NOTIFICATIONS_CHANGED } from "@/app/lib/notification-state";
import { Routes } from "../api-routes";

class NotificationService extends CoreService {
  async list(userId?: string) {
    return await this.get(
      userId ? Routes.NOTIFICATIONS_FOR_USER(userId) : Routes.NOTIFICATIONS,
    );
  }
  async markRead(id: string) {
    const response = await super.update(Routes.NOTIFICATION_READ(id), {});
    if (response.success && typeof window !== "undefined") {
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    }
    return response;
  }
}
export const NOTIFICATION_SERVICE = new NotificationService();
