import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class AdminService extends CoreService {
  async login(payload: unknown) {
    return await this.send(Routes.ADMIN_LOGIN, payload, { auth: false });
  }
  async verifications(status = "MANUAL_REVIEW") {
    return await this.get(Routes.ADMIN_VERIFICATIONS(status), { admin: true });
  }
  async decide(id: string, payload: unknown) {
    return await this.send(Routes.ADMIN_VERIFICATION_DECISION(id), payload, {
      admin: true,
    });
  }
  async recheck(payload: unknown) {
    return await this.send(Routes.VERIFY_LICENSE, payload, { auth: false });
  }
  async settlements() {
    return await this.get(Routes.SETTLEMENTS_SUMMARY, { admin: true });
  }
}
export const ADMIN_SERVICE = new AdminService();
