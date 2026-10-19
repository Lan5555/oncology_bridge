import Link from "next/link";
import BrandLogo from "../BrandLogo";
export default function Footer() {
  return (
    <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)] px-6 py-12 text-[var(--landing-text)]">
      <div className="mx-auto grid max-w-[1100px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            aria-label="Oncosourz home"
            className="inline-block rounded-lg bg-white p-2"
          >
            <BrandLogo className="h-14 w-36" />
          </Link>
          <p className="mt-4 text-sm font-semibold">Oncosourz Ltd.</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--landing-muted)]">
            Connecting oncology care, medicine supply and research across West
            Africa.
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest">
            Explore
          </h2>
          <div className="flex flex-col gap-3 text-sm text-[var(--landing-muted)]">
            <Link href="/">Home</Link>
            <Link href="/portal">Oncosourz Bridge Portal</Link>
            <Link href="/research">Enterprise &amp; Research</Link>
            <Link href="/#quick-pay">Quick Pay</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest">
            Privacy &amp; support
          </h2>
          <div className="flex flex-col gap-3 text-sm text-[var(--landing-muted)]">
            <Link href="/legal#privacy-policy">Privacy Policy (NDPA 2023)</Link>
            <Link href="/legal#terms-of-service">Terms of Service</Link>
            <Link href="/legal#dpo-contact">DPO Contact</Link>
            <Link href="/login">Portal Login</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1100px] border-t border-[var(--landing-border)] pt-6 text-xs text-[var(--landing-muted)]">
        Copyright {new Date().getFullYear()} Oncosourz Ltd. All rights reserved.
      </div>
    </footer>
  );
}
