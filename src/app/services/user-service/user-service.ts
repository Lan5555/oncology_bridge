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
  async rolePermissions(id: string | number, admin = false) {
    return await this.get(`${Routes.ROLE_ITEM(id)}/permissions`, { admin });
  }
  async updateRolePermissions(
    id: string | number,
    payload: unknown,
    admin = false,
  ) {
    return await this.put(`${Routes.ROLE_ITEM(id)}/permissions`, payload, {
      admin,
    });
  }
  async list(params = "", admin = false) {
    return await this.get(Routes.USERS(params), { admin });
  }
  async createUser(payload: unknown, admin = false) {
    return await this.send(Routes.USERS_CREATE, payload, { admin });
  }
  async facilityMembershipRequests(status = "PENDING", admin = false) {
    return await this.get(Routes.FACILITY_MEMBERSHIP_REQUESTS(status), { admin });
  }
  async decideFacilityMembership(
    id: string,
    decision: "approve" | "reject",
    payload: unknown = {},
    admin = false,
  ) {
    return await this.send(
      Routes.FACILITY_MEMBERSHIP_DECISION(id, decision),
      payload,
      { admin },
    );
  }
  async checkFacilityMembershipLicense(id: string, admin = false) {
    return await this.send(
      Routes.FACILITY_MEMBERSHIP_LICENSE_CHECK(id),
      {},
      { admin },
    );
  }
  async updateUser(id: string, payload: unknown, admin = false) {
    return await super.update(Routes.USER_UPDATE(id), payload, { admin });
  }
  async deactivate(id: string, admin = false) {
    return await this.updateUser(id, { is_active: false }, admin);
  }
  async deleteUser(id: string, admin = false) {
    return await this.delete(Routes.USER_DELETE(id), undefined, { admin });
  }
}
export const USER_SERVICE = new UserService();
