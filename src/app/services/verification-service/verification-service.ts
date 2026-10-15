import { CoreService } from "@/app/hooks/service/core-service";
import type { LicenseRegistry, VerificationStatus } from "@/app/lib/accounts";
import { Routes } from "../api-routes";

export interface VerificationResult {
  status: VerificationStatus;
  registryResult: "MATCH" | "NO_MATCH" | "UNAVAILABLE";
}

class VerificationService extends CoreService {
  /** Registry lookup is owned by the backend; unavailable registries remain in manual review. */
  public async verifyLicense(payload: {
    licenseNumber: string;
    registry: LicenseRegistry;
    lastName?: string;
  }): Promise<VerificationResult> {
    const response = await this.send(Routes.VERIFY_LICENSE, payload, {
      auth: false,
    });
    if (response.success && response.data)
      return response.data as VerificationResult;
    return { status: "MANUAL_REVIEW", registryResult: "UNAVAILABLE" };
  }
  public async createApplication(payload: unknown) {
    return await this.send(Routes.VERIFICATION_APPLICATIONS(""), payload, {
      auth: false,
    });
  }
  public async applications(status = "MANUAL_REVIEW") {
    return await this.get(Routes.VERIFICATION_APPLICATIONS(status));
  }
  public async decideApplication(id: string, payload: unknown) {
    return await this.send(Routes.VERIFICATION_APPLICATION_DECISION(id), payload);
  }
}

export const VERIFICATION_SERVICE = new VerificationService();
