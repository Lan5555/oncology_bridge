import { CoreService } from "@/app/hooks/service/core-service";
import type { ManifestInput } from "@/app/lib/manifest-entry";
import type { DispenseRequest } from "@/app/lib/pharmacy-dispensing";
import { Routes } from "../api-routes";

const options = { facilityOnly: true, retryAuth: false, timeoutMs: 30000 };

class ManifestService extends CoreService {
  create(body: ManifestInput) {
    return this.send(Routes.MANIFESTS, body, options);
  }
  list() {
    return this.get(Routes.MANIFESTS, options);
  }
  detail(id: string) {
    return this.get(Routes.MANIFEST(id), options);
  }
  upload(file: File) {
    const body = new FormData();
    body.append("manifest", file);
    return this.send(Routes.MANIFESTS_UPLOAD, body, options);
  }
  check(rawBarcode: string) {
    return this.send(Routes.SCANS_MANIFEST_CHECK, { rawBarcode }, options);
  }
  dispense(body: DispenseRequest) {
    return this.send(Routes.SCANS_DISPENSE, body, options);
  }
}

export const MANIFEST_SERVICE = new ManifestService();
