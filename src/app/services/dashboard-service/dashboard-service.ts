import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

class DashboardService extends CoreService {
  async summary(admin = false) {
    return await this.get(Routes.DASHBOARD_SUMMARY, { admin });
  }
  async charts(admin = false) {
    return await this.get(Routes.DASHBOARD_CHARTS, { admin });
  }
  async publicStats() {
    return await this.get(Routes.PUBLIC_STATS, { auth: false });
  }
}
export const DASHBOARD_SERVICE = new DashboardService();
