export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020810] px-5 pt-12 pb-8 md:px-10">
      <div className={"mx-auto grid max-w-[1100px] grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]"}>
        <div className={"[&_p]:mt-3 [&_p]:max-w-[220px] [&_p]:text-[13px] [&_p]:leading-7 [&_p]:text-white/30"}>
          <div className={"flex items-center gap-2.5"} style={{ marginBottom: 0 }}>
            <div className={"flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-sky-500 to-cyan-500 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-[2.2]"}>
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <div className={"text-[15px] font-bold text-white [font-family:'Plus_Jakarta_Sans',sans-serif]"}>Oncology Bridge</div>
              <div className={"text-[9px] font-semibold uppercase tracking-[1px] text-cyan-400"}>Lagos–Ibadan Network</div>
            </div>
          </div>
          <p>
            A secure visibility and verification layer for high-value cancer therapeutics in
            Nigeria. Closing the access gap, one verified vial at a time.
          </p>
        </div>
        <div className={"[&_a]:mb-2 [&_a]:block [&_a]:text-[13px] [&_a]:text-white/40 [&_a]:transition hover:[&_a]:text-white"}>
          <div className={"mb-3.5 text-[11px] font-bold uppercase tracking-[1px] text-white/25"}>Platform</div>
          <a href="#solution">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#roles">User Roles</a>
          <a href="#regulatory">Compliance</a>
        </div>
        <div className={"[&_a]:mb-2 [&_a]:block [&_a]:text-[13px] [&_a]:text-white/40 [&_a]:transition hover:[&_a]:text-white"}>
          <div className={"mb-3.5 text-[11px] font-bold uppercase tracking-[1px] text-white/25"}>For Facilities</div>
          <a href="#">Donor Hubs</a>
          <a href="#">Recipient Hubs</a>
          <a href="#">Network Admins</a>
          <a href="#">Courier Partners</a>
        </div>
        <div className={"[&_a]:mb-2 [&_a]:block [&_a]:text-[13px] [&_a]:text-white/40 [&_a]:transition hover:[&_a]:text-white"}>
          <div className={"mb-3.5 text-[11px] font-bold uppercase tracking-[1px] text-white/25"}>Company</div>
          <a href="#">About Us</a>
          <a href="#">White Paper</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className={"mx-auto mt-10 flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/20 max-[600px]:flex-col max-[600px]:items-start"}>
        <div>© 2026 Oncology Bridge Platform. Lagos–Ibadan Oncology Corridor.</div>
        <div className={"flex flex-wrap gap-2.5"}>
          <span className={"rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-white/30"}>NAFDAC L4</span>
          <span className={"rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-white/30"}>GS1 Certified</span>
          <span className={"rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-white/30"}>AES-256</span>
          <span className={"rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-white/30"}>NDPR</span>
        </div>
      </div>
    </footer>
  );
}
