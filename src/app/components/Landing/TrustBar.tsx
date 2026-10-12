const ITEM = 'flex items-center gap-2 text-[12.5px] font-medium whitespace-nowrap text-white/45';
const ICON = 'size-[15px] shrink-0 fill-none stroke-cyan stroke-2';

export default function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-12 border-y border-white/6 bg-navy-2 px-10 py-5 max-[600px]:gap-6 max-[600px]:p-5">
      <div className={ITEM}>
        <svg viewBox="0 0 24 24" className={ICON}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        NAFDAC Maturity Level 4
      </div>
      <div className={ITEM}>
        <svg viewBox="0 0 24 24" className={ICON}><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 2v20M2 12h5M7 7h14M7 17h14" /></svg>
        GS1 DataMatrix Verified
      </div>
      <div className={ITEM}>
        <svg viewBox="0 0 24 24" className={ICON}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
        AES-256 Encrypted
      </div>
      <div className={ITEM}>
        <svg viewBox="0 0 24 24" className={ICON}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
        NHIA Subsidy Compatible
      </div>
      <div className={ITEM}>
        <svg viewBox="0 0 24 24" className={ICON}><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
        Offline-First Architecture
      </div>
    </div>
  );
}
