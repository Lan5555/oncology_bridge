import type { LicenseRegistry, VerificationStatus } from '@/app/lib/accounts';

export interface VerificationResult {
  status: VerificationStatus;
  registryResult: 'MATCH' | 'NO_MATCH' | 'UNAVAILABLE';
}

class VerificationService {
  /** Registry lookup is owned by the backend; falls back to manual review if unreachable. */
  public async verifyLicense(payload: { licenseNumber: string; registry: LicenseRegistry; lastName?: string }): Promise<VerificationResult> {
    try {
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) return json.data as VerificationResult;
    } catch (e) {
      console.error(e);
    }
    return { status: 'MANUAL_REVIEW', registryResult: 'UNAVAILABLE' };
  }
}

export const VERIFICATION_SERVICE = new VerificationService();
