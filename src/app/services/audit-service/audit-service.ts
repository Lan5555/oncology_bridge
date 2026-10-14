import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class AuditService extends CoreService {
  async list(params = "", admin = false) {
    return await this.get(Routes.AUDIT(params), { admin });
  }
  async verify(admin = false) {
    return await this.get(Routes.AUDIT_VERIFY, { admin });
  }
  async exportCsv(admin = false) {
    return await this.get(Routes.AUDIT_EXPORT, { admin });
  }
}
export const AUDIT_SERVICE = new AuditService();
