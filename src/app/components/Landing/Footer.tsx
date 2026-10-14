import Link from "next/link";

const COL =
  "[&_a]:mb-[9px] [&_a]:block [&_a]:text-[13px] [&_a]:text-white/40 [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-white";
const COL_TITLE =
  "mb-3.5 text-[11px] font-bold tracking-[1px] text-white/25 uppercase";
const BADGE =
  "rounded-md border border-white/7 bg-white/4 px-2 py-[3px] text-[10px] font-semibold tracking-[0.5px] text-white/30 uppercase";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020810] px-10 pt-12 pb-8">
      <div className="mx-auto grid max-w-[1100px] grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 max-[860px]:grid-cols-2 max-[600px]:grid-cols-1">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-linear-135 from-sky to-cyan">
              <svg
                viewBox="0 0 24 24"
                className="size-[18px] fill-none stroke-white stroke-[2.2]"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="font-display text-[15px] font-bold tracking-[-0.3px] text-white max-[860px]:text-sm">
                Oncosourz
              </div>
              <div className="text-[9px] font-semibold tracking-[1px] text-cyan uppercase max-[860px]:text-[8px]">
                Lagos–Ibadan Network
              </div>
            </div>
          </div>
          <p className="mt-3 max-w-[260px] text-[13px] leading-[1.7] text-white/45">
            Oncosourz Ltd.
            <br />
            Issued share capital: ₦10,000,000
          </p>
        </div>
        <div className={COL}>
          <div className={COL_TITLE}>Platform</div>
          <Link href="/">Home</Link>
          <Link href="/portal">Portal Login</Link>
          <Link href="/research">Enterprise &amp; Research</Link>
          <a href="#quick-pay">Quick Pay</a>
        </div>
        <div className={COL}>
          <div className={COL_TITLE}>Privacy &amp; Legal</div>
          <Link href="/legal#privacy-policy">Privacy Policy (NDPA 2023)</Link>
          <Link href="/legal#terms-of-service">Terms of Service</Link>
          <a href="/research#partnership-inquiry">DPO Contact</a>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/20 max-[600px]:flex-col max-[600px]:items-start">
        <div>© 2026 Oncosourz Ltd. All rights reserved.</div>
        <div className="flex flex-wrap gap-2.5">
          <span className={BADGE}>NDPA 2023</span>
          <span className={BADGE}>MDCN &amp; PCN</span>
          <span className={BADGE}>GS1 Traceable</span>
        </div>
      </div>
    </footer>
  );
}
