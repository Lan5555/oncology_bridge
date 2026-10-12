import { MonthlyScansChart } from "../../components/Charts";



import type React from 'react';
interface ScanPageProps {
  scanVisible: boolean;
  onSimulateScan: () => void;
}

const ScanPage: React.FC<ScanPageProps> = ({ scanVisible, onSimulateScan }) => {
  return (
    <div className="block animate-fade-up">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap max-md:flex-col max-md:items-stretch max-md:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]"><h1>GS1 DataMatrix Scanner</h1><p>NAFDAC-compliant pedigree verification · Offline-first with auto-sync</p></div>
  </div>

  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-lg:grid-cols-1">
    <div className="flex flex-col gap-4">
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Scan a Vial</div><div className="text-xs text-g500 mt-0.5">Point camera at GS1 DataMatrix barcode</div></div></div>
        <div className="border-2 border-dashed border-g200 rounded-xl p-6 text-center bg-g50 transition duration-200 cursor-pointer hover:border-p hover:bg-pll" onClick={onSimulateScan}>
          <div className="size-12 bg-pl rounded-xl flex items-center justify-center mx-auto mb-2.5 [&_svg]:size-[22px] [&_svg]:fill-none [&_svg]:stroke-p [&_svg]:stroke-2" style={{position: 'relative'}}>
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></svg>
            <div style={{position: 'absolute', inset: '-5px', border: '2px solid var(--p)', borderRadius: '14px', opacity: '0.4', animation: 'pulse 2s infinite'}}></div>
          </div>
          <div className="text-[13px] text-g600 font-medium mb-[3px]">Tap to activate camera</div>
          <div className="text-[11.5px] text-g400">Decodes GTIN · Batch No. · Expiry · Serial Number</div>
          <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px'}}>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={(e) => { e.stopPropagation(); onSimulateScan(); }}>
              <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Camera Scan
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={(e) => e.stopPropagation()}>
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Manual Entry
            </button>
          </div>
        </div>
        <div className="border border-[#a7f3d0] bg-[#f0fdf4] rounded-lg p-3 mt-2.5 dk:bg-[#064e3b] dk:border-[#059669] dk:[&_strong]:text-[#ecfdf5]" style={{marginTop: '10px', display: scanVisible ? 'block' : 'none', animation: 'fadeUp 0.4s ease'}}>
          <div className="flex items-center gap-[7px] mb-2 text-[11.5px] font-bold uppercase tracking-[0.5px] [&_svg]:size-[15px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5]"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>WAOAB Security — Clean Stock Cleared</div>
          <div className="grid grid-cols-2 gap-2 text-xs [&_span]:text-g400 [&_span]:block [&_span]:text-[10.5px] [&_span]:mb-px [&_strong]:text-g800">
            <div><span>GTIN</span><strong>0304817892</strong></div>
            <div><span>Batch No.</span><strong>TZ-2204-A</strong></div>
            <div><span>Expiry</span><strong>Jan 2027</strong></div>
            <div><span>Serial No.</span><strong>SN-8472901</strong></div>
          </div>
        </div>
      </div>

      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Log Scanned Item</div><div className="text-xs text-g500 mt-0.5">Confirm and submit to network ledger</div></div></div>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div className="mb-4"><label>Facility</label><select className="p-2"><option>Lagos University Teaching Hospital</option><option>EKO Hospital</option><option>UCH Ibadan</option><option>Lagos Island GH</option></select></div>
          <div className="mb-4"><label>Role Action</label><select className="p-2"><option>Flag as Available for Redistribution</option><option>Log as New Stock</option><option>Flag as Near-Expiry</option></select></div>
        </div>
        <div className="mb-4"><label>Notes (optional)</label><textarea className="p-2" placeholder="e.g. received from Pfizer distributor batch run"></textarea></div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" style={{flex: '1', justifyContent: 'center'}}><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>Submit to Ledger</button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p">Clear</button>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-4">
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Monthly Scans</div><div className="text-xs text-g500 mt-0.5">GS1 verifications completed</div></div></div>
        <div style={{position: 'relative', height: '150px'}}><MonthlyScansChart /></div>
      </div>
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Offline Queue</div><div className="text-xs text-g500 mt-0.5">Pending background sync</div></div></div>
        <div className="flex flex-wrap items-start gap-2.5 px-3.5 py-[11px] rounded-xl mb-6 text-[12.5px] border [&_p]:flex-1 [&_p]:min-w-0 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:mt-px [&_p_strong]:font-bold max-lg:flex-col max-lg:items-start max-lg:[&_svg]:mt-0 max-md:p-3 dk:[&_p]:text-white dk:[&_svg]:stroke-white bg-pll border-pl border-l-4 border-l-p text-g800 dk:bg-[#172554] dk:border-[#60a5fa] dk:text-[#dbeafe]" style={{marginBottom: '0'}}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>2 scans queued for sync. Connection restored — uploading now.</p>
        </div>
        <div style={{marginTop: '10px'}}>
          <div className="flex items-center gap-2.5 px-3 py-2.5 border border-g200 rounded-lg transition duration-150 mb-2 last:mb-0 hover:border-pl hover:shadow-[0_2px_8px_rgba(14,165,233,0.06)] max-md:flex-col max-md:items-start max-md:gap-3" style={{marginBottom: '0'}}>
            <div className="size-[34px] rounded-lg flex items-center justify-center shrink-0 [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-pl text-pd"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
            <div><div className="text-[13px] font-semibold text-g800">RX-1044-E · Rituximab</div><div className="text-[11px] text-g400 mt-px">Queued 14:22 · status: pending_sync</div></div>
            <span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7] before:hidden" style={{marginLeft: 'auto'}}>Syncing…</span>
          </div>
        </div>
      </div>
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Recent Scans</div><div className="text-xs text-g500 mt-0.5">Last 5 verifications</div></div></div>
        <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">TZ-2204-A · Trastuzumab · LUTH</div><div className="text-[11px] text-g400 mt-0.5">Clean · GTIN 0304817892</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">14:31</div></div>
        <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">BV-1103-C · Bevacizumab · UCH Ibadan</div><div className="text-[11px] text-g400 mt-0.5">Clean · GTIN 0519273447</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">13:58</div></div>
        <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--err)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">RX-1044-E · Rituximab · LASUTH</div><div className="text-[11px] text-g400 mt-0.5">Flagged — batch recalled</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">11:20</div></div>
        <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">CE-0310-B · Cetuximab · LUTH</div><div className="text-[11px] text-g400 mt-0.5">Clean · GTIN 0621847001</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">09:45</div></div>
        <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0" style={{border: 'none'}}><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">PT-0707-D · Pertuzumab · Lagos Island GH</div><div className="text-[11px] text-g400 mt-0.5">Clean · Near expiry flagged</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">09:12</div></div>
      </div>
    </div>
  </div>
    </div>
  );
}

export default ScanPage;
