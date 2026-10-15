import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class AdminService extends CoreService {
  async login(payload: unknown) {
    return await this.send(Routes.ADMIN_LOGIN, payload, { auth: false });
  }
  async verifications(status = "MANUAL_REVIEW") {
    return await this.get(Routes.ADMIN_VERIFICATIONS(status), { admin: true });
  }
  async decide(
    id: string,
    status: "VERIFIED" | "REJECTED",
    payload: unknown,
  ) {
    return await this.send(
      Routes.ADMIN_VERIFICATION_DECISION(
        id,
        status === "VERIFIED" ? "approve" : "reject",
      ),
      payload,
      {
        admin: true,
      },
    );
  }
  async recheck(id: string) {
    return await this.send(
      Routes.ADMIN_VERIFICATION_RECHECK(id),
      {},
      {
        admin: true,
      },
    );
  }
  async settlements() {
    return await this.get(Routes.SETTLEMENTS_SUMMARY, { admin: true });
  }
  async integrationsHealth() {
    return await this.get(Routes.ADMIN_INTEGRATIONS_HEALTH, { admin: true });
  }
  async integrationConfiguration(key: string) {
    return await this.get(Routes.ADMIN_INTEGRATION_CONFIG(key), { admin: true });
  }
  async saveIntegrationConfiguration(key: string, values: Record<string, unknown>) {
    return await this.put(Routes.ADMIN_INTEGRATION_CONFIG(key), { values }, { admin: true });
  }
  async testIntegration(key: string) {
    return await this.send(Routes.ADMIN_INTEGRATION_TEST(key), {}, { admin: true });
  }
  async syncIntegration(key: string) {
    return await this.send(Routes.ADMIN_INTEGRATION_SYNC(key), {}, { admin: true });
  }
}
export const ADMIN_SERVICE = new AdminService();
