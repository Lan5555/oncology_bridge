import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

class SettingsService extends CoreService {
  async getSettings() {
    return await this.get(Routes.SETTINGS);
  }
  async save(payload: unknown) {
    return await this.put(Routes.SETTINGS, payload);
  }
  async me() {
    return await this.get(Routes.ME);
  }
  async updateMe(payload: unknown) {
    return await super.update(Routes.ME, payload);
  }
}
export const SETTINGS_SERVICE = new SettingsService();
