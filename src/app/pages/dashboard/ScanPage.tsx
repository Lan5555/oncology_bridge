import { MonthlyScansChart } from "../../components/Charts";



import type React from 'react';
interface ScanPageProps {
  scanVisible: boolean;
  onSimulateScan: () => void;
}

const ScanPage: React.FC<ScanPageProps> = ({ scanVisible, onSimulateScan }) => {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>GS1 DataMatrix Scanner</h1><p>NAFDAC-compliant pedigree verification · Offline-first with auto-sync</p></div>
  </div>

  <div className="g-main">
    <div className="g-stack">
      <div className="card">
        <div className="ch"><div><div className="ct">Scan a Vial</div><div className="cs">Point camera at GS1 DataMatrix barcode</div></div></div>
        <div className="scan-drop" onClick={onSimulateScan}>
          <div className="scan-ico-wrap" style={{position: 'relative'}}>
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></svg>
            <div style={{position: 'absolute', inset: '-5px', border: '2px solid var(--p)', borderRadius: '14px', opacity: '0.4', animation: 'pulse 2s infinite'}}></div>
          </div>
          <div className="scan-label">Tap to activate camera</div>
          <div className="scan-hint">Decodes GTIN · Batch No. · Expiry · Serial Number</div>
          <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px'}}>
            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); onSimulateScan(); }}>
              <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Camera Scan
            </button>
            <button className="btn btn-outline" onClick={(e) => e.stopPropagation()}>
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Manual Entry
            </button>
          </div>
        </div>
        <div className="result-ok" style={{marginTop: '10px', display: scanVisible ? 'block' : 'none', animation: 'fadeUp 0.4s ease'}}>
          <div className="result-head"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>WAOAB Security — Clean Stock Cleared</div>
          <div className="result-grid">
            <div><span>GTIN</span><strong>0304817892</strong></div>
            <div><span>Batch No.</span><strong>TZ-2204-A</strong></div>
            <div><span>Expiry</span><strong>Jan 2027</strong></div>
            <div><span>Serial No.</span><strong>SN-8472901</strong></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="ch"><div><div className="ct">Log Scanned Item</div><div className="cs">Confirm and submit to network ledger</div></div></div>
        <div className="form-row">
          <div className="form-group"><label>Facility</label><select className="p-2"><option>Lagos University Teaching Hospital</option><option>EKO Hospital</option><option>UCH Ibadan</option><option>Lagos Island GH</option></select></div>
          <div className="form-group"><label>Role Action</label><select className="p-2"><option>Flag as Available for Redistribution</option><option>Log as New Stock</option><option>Flag as Near-Expiry</option></select></div>
        </div>
        <div className="form-group"><label>Notes (optional)</label><textarea className="p-2" placeholder="e.g. received from Pfizer distributor batch run"></textarea></div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="btn btn-primary" style={{flex: '1', justifyContent: 'center'}}><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>Submit to Ledger</button>
          <button className="btn btn-outline">Clear</button>
        </div>
      </div>
    </div>

    <div className="g-stack">
      <div className="card">
        <div className="ch"><div><div className="ct">Monthly Scans</div><div className="cs">GS1 verifications completed</div></div></div>
        <div style={{position: 'relative', height: '150px'}}><MonthlyScansChart /></div>
      </div>
      <div className="card">
        <div className="ch"><div><div className="ct">Offline Queue</div><div className="cs">Pending background sync</div></div></div>
        <div className="alert info" style={{marginBottom: '0'}}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>2 scans queued for sync. Connection restored — uploading now.</p>
        </div>
        <div style={{marginTop: '10px'}}>
          <div className="xfer" style={{marginBottom: '0'}}>
            <div className="xfer-icon b"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
            <div><div className="xfer-drug">RX-1044-E · Rituximab</div><div className="xfer-meta">Queued 14:22 · status: pending_sync</div></div>
            <span className="badge a no-dot" style={{marginLeft: 'auto'}}>Syncing…</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="ch"><div><div className="ct">Recent Scans</div><div className="cs">Last 5 verifications</div></div></div>
        <div className="log-item"><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">TZ-2204-A · Trastuzumab · LUTH</div><div className="log-meta">Clean · GTIN 0304817892</div></div><div className="log-time">14:31</div></div>
        <div className="log-item"><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">BV-1103-C · Bevacizumab · UCH Ibadan</div><div className="log-meta">Clean · GTIN 0519273447</div></div><div className="log-time">13:58</div></div>
        <div className="log-item"><div className="log-dot" style={{background: 'var(--err)'}}></div><div className="log-content"><div className="log-action">RX-1044-E · Rituximab · LASUTH</div><div className="log-meta">Flagged — batch recalled</div></div><div className="log-time">11:20</div></div>
        <div className="log-item"><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">CE-0310-B · Cetuximab · LUTH</div><div className="log-meta">Clean · GTIN 0621847001</div></div><div className="log-time">09:45</div></div>
        <div className="log-item" style={{border: 'none'}}><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">PT-0707-D · Pertuzumab · Lagos Island GH</div><div className="log-meta">Clean · Near expiry flagged</div></div><div className="log-time">09:12</div></div>
      </div>
    </div>
  </div>
    </div>
  );
}

export default ScanPage;
