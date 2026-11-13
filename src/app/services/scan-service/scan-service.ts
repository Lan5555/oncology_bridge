import { CoreService } from "@/app/hooks/service/core-service";
import {
  VERIFICATION_TIMEOUT_MS,
  type VerificationFields,
  type VerificationRequest,
} from "@/app/lib/medicine-verification";
import { Routes } from "../api-routes";

class ScanService extends CoreService {
  async verify(payload: VerificationRequest) {
    return await this.send(Routes.SCANS_VERIFY, payload, {
      facilityOnly: true,
      timeoutMs: VERIFICATION_TIMEOUT_MS,
      retryAuth: false,
    });
  }

  async verifyImage(image: Blob, fields: VerificationFields = {}) {
    const body = new FormData();
    body.append(
      "image",
      image,
      image.type === "image/png" ? "medicine.png" : "medicine.jpg",
    );
    for (const [field, value] of Object.entries(fields)) {
      if (value) body.append(field, value);
    }
    return await this.send(Routes.SCANS_VERIFY_IMAGE, body, {
      facilityOnly: true,
      timeoutMs: VERIFICATION_TIMEOUT_MS,
      retryAuth: false,
    });
  }

  async decode(
    image: Blob,
    metadata: {
      facilityId: string;
      action: string;
      notes?: string;
      clientUuid: string;
      clientTs: string;
    },
  ) {
    const body = new FormData();
    body.append("image", image, "gs1-datamatrix.jpg");
    body.append("facilityId", metadata.facilityId);
    body.append("action", metadata.action);
    body.append("notes", metadata.notes ?? "");
    body.append("clientUuid", metadata.clientUuid);
    body.append("clientTs", metadata.clientTs);
    return await this.send(Routes.SCANS_DECODE, body, {
      facilityOnly: true,
      retryAuth: false,
      timeoutMs: 30000,
    });
  }

  async create(payload: unknown) {
    return await this.send(Routes.SCANS, payload);
  }
  async batch(scans: unknown[]) {
    return await this.send(Routes.SCANS_BATCH, { scans });
  }
  async recent(limit = 5) {
    return await this.get(Routes.SCANS_RECENT(limit));
  }
  async monthly() {
    return await this.get(Routes.SCANS_MONTHLY);
  }
  async lookup(gtin: string) {
    return await this.get(Routes.GS1_LOOKUP(gtin), { auth: false });
  }
}
export const SCAN_SERVICE = new ScanService();
