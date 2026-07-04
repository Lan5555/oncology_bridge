import { MonthlyScansChart } from "../../components/Charts";



import type React from 'react';
interface ScanPageProps {
  scanVisible: boolean;
  onSimulateScan: () => void;
}

const ScanPage: React.FC<ScanPageProps> = ({ scanVisible, onSimulateScan }) => {
  return (
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500"><h1>GS1 DataMatrix Scanner</h1><p>NAFDAC-compliant pedigree verification · Offline-first with auto-sync</p></div>
  </div>

  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-[960px]:grid-cols-1">
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Scan a Vial</div><div className="mt-0.5 text-xs text-slate-500">Point camera at GS1 DataMatrix barcode</div></div></div>
        <div className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-100 p-6 text-center transition hover:border-blue-800 hover:bg-slate-50" onClick={onSimulateScan}>
          <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800 [&_svg]:h-[22px] [&_svg]:w-[22px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2" style={{position: 'relative'}}>
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></svg>
            <div style={{position: 'absolute', inset: '-5px', border: '2px solid var(--p)', borderRadius: '14px', opacity: '0.4', animation: 'pulse 2s infinite'}}></div>
          </div>
          <div className="mb-1 text-[13px] font-medium text-slate-600">Tap to activate camera</div>
          <div className="text-[11.5px] text-slate-400">Decodes GTIN · Batch No. · Expiry · Serial Number</div>
          <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px'}}>
            <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={(e) => { e.stopPropagation(); onSimulateScan(); }}>
              <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Camera Scan
            </button>
            <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Manual Entry
            </button>
          </div>
        </div>
        <div className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3" style={{marginTop: '10px', display: scanVisible ? 'block' : 'none', animation: 'fadeUp 0.4s ease'}}>
          <div className="mb-2 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5]"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>WAOAB Security — Clean Stock Cleared</div>
          <div className="grid grid-cols-2 gap-2 text-xs [&_span]:mb-0.5 [&_span]:block [&_span]:text-[10.5px] [&_span]:text-slate-400 [&_strong]:text-slate-800">
            <div><span>GTIN</span><strong>0304817892</strong></div>
            <div><span>Batch No.</span><strong>TZ-2204-A</strong></div>
            <div><span>Expiry</span><strong>Jan 2027</strong></div>
            <div><span>Serial No.</span><strong>SN-8472901</strong></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Log Scanned Item</div><div className="mt-0.5 text-xs text-slate-500">Confirm and submit to network ledger</div></div></div>
        <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1">
          <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Facility</label><select><option>Lagos University Teaching Hospital</option><option>EKO Hospital</option><option>UCH Ibadan</option><option>Lagos Island GH</option></select></div>
          <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Role Action</label><select><option>Flag as Available for Redistribution</option><option>Log as New Stock</option><option>Flag as Near-Expiry</option></select></div>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Notes (optional)</label><textarea placeholder="e.g. received from Pfizer distributor batch run"></textarea></div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" style={{flex: '1', justifyContent: 'center'}}><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>Submit to Ledger</button>
          <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800">Clear</button>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Monthly Scans</div><div className="mt-0.5 text-xs text-slate-500">GS1 verifications completed</div></div></div>
        <div style={{position: 'relative', height: '150px'}}><MonthlyScansChart /></div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Offline Queue</div><div className="mt-0.5 text-xs text-slate-500">Pending background sync</div></div></div>
        <div className="mb-6 flex flex-wrap items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12.5px] text-slate-800 [&_p]:min-w-0 [&_p]:flex-1 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-blue-200 border-l-4 border-l-blue-800 bg-slate-50 text-slate-800" style={{marginBottom: '0'}}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>2 scans queued for sync. Connection restored — uploading now.</p>
        </div>
        <div style={{marginTop: '10px'}}>
          <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-blue-200 hover:shadow-md hover:shadow-sky-500/10 last:mb-0 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-3" style={{marginBottom: '0'}}>
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-100 text-blue-900"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
            <div><div className="text-[13px] font-semibold text-slate-800">RX-1044-E · Rituximab</div><div className="mt-0.5 text-[11px] text-slate-400">Queued 14:22 · status: pending_sync</div></div>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-amber-50 text-amber-700 before:hidden" style={{marginLeft: 'auto'}}>Syncing…</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Recent Scans</div><div className="mt-0.5 text-xs text-slate-500">Last 5 verifications</div></div></div>
        <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">TZ-2204-A · Trastuzumab · LUTH</div><div className="mt-0.5 text-[11px] text-slate-400">Clean · GTIN 0304817892</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">14:31</div></div>
        <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">BV-1103-C · Bevacizumab · UCH Ibadan</div><div className="mt-0.5 text-[11px] text-slate-400">Clean · GTIN 0519273447</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">13:58</div></div>
        <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--err)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">RX-1044-E · Rituximab · LASUTH</div><div className="mt-0.5 text-[11px] text-slate-400">Flagged — batch recalled</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">11:20</div></div>
        <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">CE-0310-B · Cetuximab · LUTH</div><div className="mt-0.5 text-[11px] text-slate-400">Clean · GTIN 0621847001</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">09:45</div></div>
        <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0" style={{border: 'none'}}><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">PT-0707-D · Pertuzumab · Lagos Island GH</div><div className="mt-0.5 text-[11px] text-slate-400">Clean · Near expiry flagged</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">09:12</div></div>
      </div>
    </div>
  </div>
    </div>
  );
}

export default ScanPage;
