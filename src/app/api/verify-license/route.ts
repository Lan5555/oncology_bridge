import type { LicenseRegistry, VerificationStatus } from '@/app/lib/accounts';

const LICENSE_PATTERN = /^[A-Za-z0-9/\-]{4,24}$/;
const NAME_PATTERN = /^[\p{L}\s.'-]{1,60}$/u;

// Registry lookup URLs are server-side config; `{license}` is replaced with the encoded number.
const REGISTRY_URLS: Record<LicenseRegistry, string | undefined> = {
  MDCN: process.env.MDCN_REGISTRY_URL,
  PCN: process.env.PCN_REGISTRY_URL,
  PCN_PREMISES: process.env.PCN_PREMISES_REGISTRY_URL ?? process.env.PCN_REGISTRY_URL,
};

const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return Response.json({ success: false, message: 'Too many attempts. Try again in a minute.' }, { status: 429 });
  }

  let body: { licenseNumber?: string; registry?: string; lastName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: 'Invalid request.' }, { status: 400 });
  }

  const licenseNumber = String(body.licenseNumber ?? '').trim();
  const registry = body.registry as LicenseRegistry;
  const lastName = String(body.lastName ?? '').trim();

  if (!LICENSE_PATTERN.test(licenseNumber) || !(registry in REGISTRY_URLS) || (lastName && !NAME_PATTERN.test(lastName))) {
    return Response.json({ success: false, message: 'Enter a valid licence number.' }, { status: 400 });
  }

  const template = REGISTRY_URLS[registry];
  let registryResult: 'MATCH' | 'NO_MATCH' | 'UNAVAILABLE' = 'UNAVAILABLE';

  if (template) {
    try {
      const res = await fetch(template.replace('{license}', encodeURIComponent(licenseNumber)), {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/json,text/html' },
        cache: 'no-store',
      });
      if (res.ok) {
        const text = normalise(await res.text());
        const licenceFound = text.includes(normalise(licenseNumber));
        const nameFound = !lastName || text.includes(normalise(lastName));
        registryResult = licenceFound && nameFound ? 'MATCH' : 'NO_MATCH';
      }
    } catch {
      registryResult = 'UNAVAILABLE';
    }
  }

  // Registries are often stale, so a miss never rejects; only an admin can reject.
  const autoApprove = process.env.VERIFICATION_AUTO_APPROVE === 'true';
  const status: VerificationStatus = registryResult === 'MATCH' && autoApprove ? 'VERIFIED' : 'MANUAL_REVIEW';

  return Response.json({
    success: true,
    message: status === 'VERIFIED' ? 'Licence verified.' : 'Licence submitted for review.',
    data: { status, registryResult },
  });
}
