import { ModalId, PageId } from "../../lib/types";


interface TransfersPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

export default function TransfersPage({ onNav, onOpenModal }: TransfersPageProps) {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Redistribution Centre</h1><p>Admin-mediated pharmacy-to-pharmacy transfers · 50-mile radius</p></div>
    <div className="ph-actions"><button className="btn btn-primary" onClick={() => onOpenModal('modal-transfer')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Transfer Request</button></div>
  </div>

  <div className="alert err">
    <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    <p><strong>Chain of custody breach:</strong> Transit unit T-07 recorded 11.2°C — transfer quarantined automatically. Admin review required.</p>
  </div>

  <div className="g-main">
    <div className="g-stack">
      <div className="card">
        <div className="ch"><div><div className="ct">Pending Approval</div><div className="cs">Transfers awaiting admin sign-off</div></div><span className="badge r no-dot">4 open</span></div>
        <div className="xfer">
          <div className="xfer-icon b"><svg viewBox="0 0 24 24"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg></div>
          <div style={{flex: '1', minWidth: '0'}}>
            <div style={{display: 'flex', gap: '6px', marginBottom: '4px'}}><span className="badge a no-dot" style={{fontSize: '9px'}}>Urgent</span><span className="badge gray no-dot" style={{fontSize: '9px'}}>ID: #T-098</span></div>
            <div className="xfer-drug">Trastuzumab × 8 vials</div>
            <div className="xfer-meta">LUTH → Lagos Island GH · 14.2 km · Lot TZ-2204-B</div>
          </div>
          <div className="xfer-actions">
            <button className="ico-btn ok-btn" title="Approve"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></button>
            <button className="ico-btn err-btn" title="Reject"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div className="xfer">
          <div className="xfer-icon b"><svg viewBox="0 0 24 24"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg></div>
          <div style={{flex: '1', minWidth: '0'}}>
            <div style={{display: 'flex', gap: '6px', marginBottom: '4px'}}><span className="badge b no-dot" style={{fontSize: '9px'}}>Routine</span><span className="badge gray no-dot" style={{fontSize: '9px'}}>ID: #T-097</span></div>
            <div className="xfer-drug">Rituximab × 5 vials</div>
            <div className="xfer-meta">EKO Hospital → LUTH · 7.8 km · Lot RX-0912-A</div>
          </div>
          <div className="xfer-actions">
            <button className="ico-btn ok-btn" title="Approve"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></button>
            <button className="ico-btn err-btn" title="Reject"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div className="xfer">
          <div className="xfer-icon b"><svg viewBox="0 0 24 24"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg></div>
          <div style={{flex: '1', minWidth: '0'}}>
            <div style={{display: 'flex', gap: '6px', marginBottom: '4px'}}><span className="badge a no-dot" style={{fontSize: '9px'}}>Near-Expiry</span><span className="badge gray no-dot" style={{fontSize: '9px'}}>ID: #T-096</span></div>
            <div className="xfer-drug">Bevacizumab × 12 vials</div>
            <div className="xfer-meta">UCH Ibadan → LASUTH · 22 km · Lot BV-1103-C</div>
          </div>
          <div className="xfer-actions">
            <button className="ico-btn ok-btn" title="Approve"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></button>
            <button className="ico-btn err-btn" title="Reject"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div className="xfer" style={{borderColor: '#FECACA', background: '#FFF5F5'}}>
          <div className="xfer-icon r"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <div style={{flex: '1', minWidth: '0'}}>
            <div className="xfer-drug" style={{color: 'var(--err)'}}>Rituximab × 7 vials — BREACHED</div>
            <div className="xfer-meta">Transit unit T-07 · 11.2°C breach detected en route</div>
          </div>
          <span className="badge r no-dot" style={{flexShrink: '0'}}>Quarantined</span>
        </div>
      </div>

      <div className="card">
        <div className="ch"><div><div className="ct">Completed Transfers</div><div className="cs">Last 30 days</div></div></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Drug</th><th>From</th><th>To</th><th>Qty</th><th>Date</th><th>Result</th></tr></thead>
            <tbody>
              <tr><td>Bevacizumab</td><td>UCH Ibadan</td><td>LUTH</td><td>6</td><td>Jun 10</td><td><span className="badge g">Delivered</span></td></tr>
              <tr><td>Trastuzumab</td><td>Lagos Island GH</td><td>LASUTH</td><td>4</td><td>Jun 7</td><td><span className="badge g">Delivered</span></td></tr>
              <tr><td>Pertuzumab</td><td>LUTH</td><td>EKO Hospital</td><td>2</td><td>Jun 3</td><td><span className="badge g">Delivered</span></td></tr>
              <tr><td>Rituximab</td><td>EKO Hospital</td><td>UCH Ibadan</td><td>8</td><td>May 28</td><td><span className="badge g">Delivered</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div className="g-stack">
      <div className="card">
        <div className="ch"><div><div className="ct">Active Order — Patient #0492</div><div className="cs">AXA Mansard · Breast Cancer C50.4</div></div><span className="badge b no-dot">Step 5/6</span></div>
        <div className="steps">
          <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Stock Ingestion — POS Sync</div><div className="step-desc">15 vials Trastuzumab logged. Webhook synced.</div></div></div>
          <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Prescription Packaged</div><div className="step-desc">ICD-10: C50.4, Stage IIIA. Clinical JSON sent.</div></div></div>
          <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Order Matched & Reserved</div><div className="step-desc">2 vials deducted. Reservation confirmed.</div></div></div>
          <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Prior-Authorization Cleared</div><div className="step-desc">AXA Mansard · Claims code #AXA-4892-2026.</div></div></div>
          <div className="step"><div className="step-num active">5</div><div className="step-body"><div className="step-title" style={{color: 'var(--pd)'}}>GS1 Validation Scan — In Progress</div><div className="step-desc">Courier dispatched. Pharmacist scanning Lot TZ-2204-A.</div></div></div>
          <div className="step"><div className="step-num pend">6</div><div className="step-body" style={{paddingBottom: '0'}}><div className="step-title" style={{color: 'var(--g400)'}}>Last-Mile Delivery & Disbursal</div><div className="step-desc">Cold-chain courier to oncology nurse. QR scan on arrival.</div></div></div>
        </div>
      </div>
    </div>
  </div>
    </div>
  );
}
