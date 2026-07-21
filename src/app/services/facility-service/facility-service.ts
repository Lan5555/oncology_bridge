import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
 class FacilityService extends CoreService {
    public async registerFacility(payload: Record<string, any>){
        return await this.send(Routes.REGISTER_FACILITY, payload);
    }
    public async findAllFacilities() {
        return await this.get(Routes.FIND_ALL_FACILITIES);
    }
    public async findOneFacility(id: string){
        return await this.get(`${Routes.FIND_ONE_FACILITY}/${id}`);
    }
    public async updateOneFacility(id: string, payload: Record<string,any>){
        return await this.update(`${Routes.UPDATE_ONE_FACILITY}/${id}`, payload);
    }
    public async deleteOneFacility(id: string){
        return await this.delete(`${Routes.DELETE_ONE_FACILITY}/${id}`);
    }
}
export const FACILITY_SERVICE: FacilityService = new FacilityService();