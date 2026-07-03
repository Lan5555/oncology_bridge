import { ModalId, PageId } from "../../lib/types";


interface PrescriptionsPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

export default function PrescriptionsPage({ onNav, onOpenModal }: PrescriptionsPageProps) {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Prescriptions</h1><p>Structured clinical orders · ICD-10 coded · HMO-matched</p></div>
    <div className="ph-actions"><button className="btn btn-primary" onClick={() => onOpenModal('modal-prescription')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Prescription</button></div>
  </div>

  <div className="g-main">
    <div className="card">
      <div className="tabs">
        <button className="tab-btn on"><svg viewBox="0 0 24 24" style={{width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Active Orders</button>
        <button className="tab-btn"><svg viewBox="0 0 24 24" style={{width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Awaiting Auth</button>
        <button className="tab-btn"><svg viewBox="0 0 24 24" style={{width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Completed</button>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Patient ID</th><th>ICD-10</th><th>Drug</th><th>Insurer</th><th>Pharmacy</th><th>Auth Status</th><th>Order</th></tr></thead>
          <tbody>
            <tr><td><strong>#0492</strong></td><td><span className="badge b no-dot">C50.4</span></td><td>Trastuzumab ×2</td><td>AXA Mansard</td><td>Lagos Island GH</td><td><span className="badge g">Cleared</span></td><td><span className="badge b no-dot">In Transit</span></td></tr>
            <tr><td><strong>#0481</strong></td><td><span className="badge b no-dot">C85.1</span></td><td>Rituximab ×4</td><td>NHIA</td><td>LUTH Pharmacy</td><td><span className="badge a">Pending</span></td><td><span className="badge a">Held</span></td></tr>
            <tr><td><strong>#0475</strong></td><td><span className="badge b no-dot">C18.7</span></td><td>Bevacizumab ×3</td><td>Hygeia HMO</td><td>UCH Ibadan</td><td><span className="badge g">Cleared</span></td><td><span className="badge g">Dispensed</span></td></tr>
            <tr><td><strong>#0468</strong></td><td><span className="badge b no-dot">C50.9</span></td><td>Pertuzumab ×2</td><td>Reliance HMO</td><td>EKO Hospital</td><td><span className="badge a">API Routing</span></td><td><span className="badge gray">Waiting</span></td></tr>
            <tr><td><strong>#0460</strong></td><td><span className="badge b no-dot">C34.1</span></td><td>Cetuximab ×1</td><td>Cash Pay</td><td>LASUTH</td><td><span className="badge g">Paystack ✓</span></td><td><span className="badge b no-dot">Ready</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="g-stack">
      <div className="card">
        <div className="ch"><div><div className="ct">New Prescription</div><div className="cs">Doctor micro-interface</div></div></div>
        <div className="form-group"><label>ICD-10 Diagnosis Code</label><select><option>C50.4 — Breast cancer, upper-outer quadrant</option><option>C85.1 — B-cell lymphoma</option><option>C18.7 — Colon cancer</option></select></div>
        <div className="form-row">
          <div className="form-group"><label>TNM Stage</label><select><option>Stage I</option><option>Stage II</option><option>Stage IIIA</option><option>Stage IV</option></select></div>
          <div className="form-group"><label>Insurer</label><select><option>AXA Mansard</option><option>NHIA</option><option>Hygeia HMO</option><option>Cash Pay</option></select></div>
        </div>
        <div className="form-group"><label>Drug (HMO-filtered)</label><select><option>Trastuzumab</option><option>Pertuzumab</option></select></div>
        <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}}><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Send to Network</button>
      </div>
    </div>
  </div>
    </div>
  );
}
