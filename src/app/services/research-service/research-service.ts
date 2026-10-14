import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";
class ResearchService extends CoreService {
  async submitInquiry(payload: unknown) {
    return await this.send(Routes.RESEARCH_INQUIRIES, payload, { auth: false });
  }
  async stats() {
    return await this.get(Routes.RESEARCH_STATS, { auth: false });
  }
}
export const RESEARCH_SERVICE = new ResearchService();
