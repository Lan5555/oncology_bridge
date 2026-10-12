const COL = '[&_a]:mb-[9px] [&_a]:block [&_a]:text-[13px] [&_a]:text-white/40 [&_a]:transition-colors [&_a]:duration-200 [&_a:hover]:text-white';
const COL_TITLE = 'mb-3.5 text-[11px] font-bold tracking-[1px] text-white/25 uppercase';
const BADGE = 'rounded-md border border-white/7 bg-white/4 px-2 py-[3px] text-[10px] font-semibold tracking-[0.5px] text-white/30 uppercase';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020810] px-10 pt-12 pb-8">
      <div className="mx-auto grid max-w-[1100px] grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 max-[860px]:grid-cols-2 max-[600px]:grid-cols-1">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-linear-135 from-sky to-cyan">
              <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-white stroke-[2.2]"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <div className="font-display text-[15px] font-bold tracking-[-0.3px] text-white max-[860px]:text-sm">Oncosourz</div>
              <div className="text-[9px] font-semibold tracking-[1px] text-cyan uppercase max-[860px]:text-[8px]">Lagos–Ibadan Network</div>
            </div>
          </div>
          <p className="mt-3 max-w-[220px] text-[13px] leading-[1.7] text-white/30">
            A secure visibility and verification layer for high-value cancer therapeutics in
            Nigeria. Closing the access gap, one verified vial at a time.
          </p>
        </div>
        <div className={COL}>
          <div className={COL_TITLE}>Platform</div>
          <a href="#solution">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#roles">User Roles</a>
          <a href="#regulatory">Compliance</a>
        </div>
        <div className={COL}>
          <div className={COL_TITLE}>For Facilities</div>
          <a href="#">Donor Hubs</a>
          <a href="#">Recipient Hubs</a>
          <a href="#">Network Admins</a>
          <a href="#">Courier Partners</a>
        </div>
        <div className={COL}>
          <div className={COL_TITLE}>Company</div>
          <a href="#">About Us</a>
          <a href="#">White Paper</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/20 max-[600px]:flex-col max-[600px]:items-start">
        <div>© 2026 Oncosourz Platform. Lagos–Ibadan Oncology Corridor.</div>
        <div className="flex flex-wrap gap-2.5">
          <span className={BADGE}>NAFDAC L4</span>
          <span className={BADGE}>GS1 Certified</span>
          <span className={BADGE}>AES-256</span>
          <span className={BADGE}>NDPR</span>
        </div>
      </div>
    </footer>
  );
}
