import {
  BadgeCheck,
  Fingerprint,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "NDPA 2023 Compliant" },
  { icon: Fingerprint, label: "Role-Based Access Control (RBAC)" },
  { icon: BadgeCheck, label: "MDCN & PCN Verification" },
  { icon: ScanLine, label: "GS1 Batch Traceable" },
  { icon: LockKeyhole, label: "PCI-DSS Secured by Paystack" },
];
export default function TrustBar() {
  return (
    <section
      aria-label="Trust and security"
      className="border-y border-[var(--landing-border)] bg-[var(--landing-surface)] px-5 py-7"
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-8 gap-y-5">
        {badges.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-[11px] font-semibold text-[var(--landing-muted)]"
          >
            <Icon
              className="size-[18px] shrink-0 text-[var(--landing-accent)]"
              aria-hidden="true"
            />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
