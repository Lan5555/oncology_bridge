import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class FacilityService extends CoreService {
  public async registerFacility(payload: Record<string, any>) {
    return await this.send(Routes.REGISTER_FACILITY, payload, { auth: false });
  }
  public async findAllFacilities(
    params: Record<string, string | number | undefined> = {},
    admin = false,
  ) {
    return await this.get(Routes.FACILITIES(params), { admin });
  }
  public async findOneFacility(id: string, admin = false) {
    return await this.get(Routes.FACILITY(id), { admin });
  }
  public async updateOneFacility(
    id: string,
    payload: Record<string, any>,
    admin = false,
  ) {
    return await super.update(Routes.FACILITY(id), payload, { admin });
  }
  public async deleteOneFacility(id: string, admin = false) {
    return await this.delete(Routes.FACILITY(id), undefined, { admin });
  }
}
export const FACILITY_SERVICE: FacilityService = new FacilityService();
