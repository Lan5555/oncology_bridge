import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class ReportService extends CoreService {
  async export(payload: unknown) {
    return await this.send(Routes.REPORT_EXPORT, payload);
  }
}
export const REPORT_SERVICE = new ReportService();
