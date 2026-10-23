import { CoreService } from "@/app/hooks/service/core-service";
import { NetResponse } from "@/app/hooks/service/net-response";
import { Routes } from "../api-routes";

export type PrescriptionDecision = "APPROVE" | "REJECT";
export interface ReviewPrescription {
  id: string;
  patient_ref: string;
  description: string | null;
  icd10: string;
  tnm_stage: string | null;
  insurer: string;
  qty: number;
  auth_status: string;
  order_stage: string;
  pharmacy: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    status: string;
  } | null;
  pharmacy_name: string | null;
  medicine: {
    id: string;
    name: string;
    generic_name?: string;
    strength: string | null;
  } | null;
  prescriber: { id: string; name: string } | null;
  created_at: string;
}
export interface PrescriptionReviewDetail extends ReviewPrescription {
  version: number;
  allowedDecisions: PrescriptionDecision[];
  events: {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    actorName: string | null;
  }[];
}
export interface PrescriptionReviewPage {
  items: ReviewPrescription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
class AdminPrescriptionService extends CoreService {
  list(params: URLSearchParams) {
    return this.get(Routes.ADMIN_PRESCRIPTIONS(params.toString()), {
      admin: true,
    });
  }
  detail(id: string) {
    return this.get(Routes.ADMIN_PRESCRIPTION(id), { admin: true });
  }
  decide(
    id: string,
    payload: {
      decision: PrescriptionDecision;
      expectedVersion: number;
      reason: string;
    },
  ) {
    return this.send(Routes.ADMIN_PRESCRIPTION_DECISION(id), payload, {
      admin: true,
    });
  }
  async decideCurrent(
    id: string,
    payload: {
      decision: PrescriptionDecision;
      expectedVersion: number;
      reason: string;
    },
  ) {
    const response = await this.detail(id);
    if (!response.success) return response;
    const latest = response.data as PrescriptionReviewDetail;
    if (
      latest?.id !== id ||
      !Number.isInteger(latest.version) ||
      !Array.isArray(latest.allowedDecisions)
    )
      return new NetResponse({
        success: false,
        status: 502,
        message:
          "The latest prescription review could not be verified. Reload before deciding.",
        data: null,
      });
    if (
      latest.version !== payload.expectedVersion ||
      !latest.allowedDecisions.includes(payload.decision)
    )
      return new NetResponse({
        success: false,
        status: 409,
        message:
          "This prescription changed. Review the latest details before deciding again.",
        data: latest,
      });
    return this.decide(id, payload);
  }
}
export const ADMIN_PRESCRIPTION_SERVICE = new AdminPrescriptionService();
