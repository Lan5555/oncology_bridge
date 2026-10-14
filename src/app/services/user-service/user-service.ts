import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class UserService extends CoreService {
  async roles(admin = false) {
    return await this.get(Routes.ROLES, { admin });
  }
  async createRole(payload: unknown, admin = false) {
    return await this.send(Routes.ROLES, payload, { admin });
  }
  async updateRole(id: string | number, payload: unknown, admin = false) {
    return await super.update(Routes.ROLE_ITEM(id), payload, { admin });
  }
  async deleteRole(id: string | number, admin = false) {
    return await this.delete(Routes.ROLE_ITEM(id), undefined, { admin });
  }
  async list(params = "", admin = false) {
    return await this.get(Routes.USERS(params), { admin });
  }
  async update(id: string, payload: unknown, admin = false) {
    return await super.update(Routes.USER_UPDATE(id), payload, { admin });
  }
  async deactivate(id: string, admin = false) {
    return await this.update(id, { is_active: false }, admin);
  }
}
export const USER_SERVICE = new UserService();
