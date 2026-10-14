import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class NetworkService extends CoreService {
  async getNetwork() {
    return await this.get(Routes.NETWORK);
  }
}
export const NETWORK_SERVICE = new NetworkService();
