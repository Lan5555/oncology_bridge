'use client';

import { ModalId } from "../lib/types";


interface ModalsProps {
  openModalId: ModalId | null;
  onCloseModal: (id: ModalId) => void;
}

export default function Modals({ openModalId, onCloseModal }: ModalsProps) {
  return (
    <>
<div className={`modal-backdrop ${openModalId === 'modal-export' ? 'open' : ''}`} onClick={() => onCloseModal('modal-export')}>
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-h">
      <div className="ct">Export Network Data</div>
      <button className="close-modal" onClick={() => onCloseModal('modal-export')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="modal-b">
      <div className="form-group">
        <label>Report Type</label>
        <select><option>📄 Inventory Summary (PDF)</option><option>📊 Audit Trail (CSV)</option><option>❄️ Cold Chain Compliance (Excel)</option></select>
      </div>
      <div className="form-group">
        <label>Date Range</label>
        <select><option>Last 30 Days</option><option>Current Quarter</option><option>Custom Range...</option></select>
      </div>
    </div>
    <div className="modal-f">
      <button className="btn btn-outline" onClick={() => onCloseModal('modal-export')}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onCloseModal('modal-export')}>Generate Report</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-transfer' ? 'open' : ''}`} onClick={() => onCloseModal('modal-transfer')}>
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-h">
      <div className="ct">New Redistribution Request</div>
      <button className="close-modal" onClick={() => onCloseModal('modal-transfer')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="modal-b">
      <div className="form-group">
        <label>Select Drug from Surplus</label>
        <select><option>Trastuzumab (Lot TZ-2204-B) - LUTH</option><option>Rituximab (Lot RX-0912-A) - EKO</option></select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Quantity</label>
          <input type="number" defaultValue="1" min="1"/>
        </div>
        <div className="form-group">
          <label>Recipient Facility</label>
          <select><option>LASUTH</option><option>Lagos Island GH</option><option>UCH Ibadan</option></select>
        </div>
      </div>
      <div className="form-group">
        <label>Urgency Level</label>
        <select><option>Standard (48h)</option><option>Urgent (24h)</option><option>Emergency (Same Day)</option></select>
      </div>
    </div>
    <div className="modal-f">
      <button className="btn btn-outline" onClick={() => onCloseModal('modal-transfer')}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onCloseModal('modal-transfer')}>Initiate Transfer</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-breach' ? 'open' : ''}`} onClick={() => onCloseModal('modal-breach')}>
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-b" style={{textAlign: 'center'}}>
      <div className="modal-icon-circle" style={{background: 'var(--errl)', color: 'var(--err)', margin: '0 auto 1.5rem'}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h3 style={{marginBottom: '8px'}}>Confirm Quarantine Action</h3>
      <p style={{fontSize: '14px', color: 'var(--g500)', lineHeight: '1.5'}}>You are flagging 7 vials of Rituximab (Lot RX-1044-E) for disposal due to a sustained temperature breach of 11.2°C. This action is irreversible.</p>
    </div>
    <div className="modal-f" style={{justifyContent: 'center', background: 'var(--g50)', paddingBottom: '1.5rem'}}>
      <button className="btn btn-outline" onClick={() => onCloseModal('modal-breach')}>Cancel</button>
      <button className="btn btn-danger" onClick={() => onCloseModal('modal-breach')}>Confirm Disposal</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-prescription' ? 'open' : ''}`} onClick={() => onCloseModal('modal-prescription')}>
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-h">
      <div className="ct">Create New Prescription</div>
      <button className="close-modal" onClick={() => onCloseModal('modal-prescription')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="modal-b">
      <div className="form-group">
        <label>Patient ID / Name</label>
        <input type="text" placeholder="e.g. #0493 or John Doe"/>
      </div>
      <div className="form-group">
        <label>ICD-10 Diagnosis Code</label>
        <select><option>🎗️ C50.4 — Breast cancer, upper-outer quadrant</option><option>🩸 C85.1 — B-cell lymphoma</option><option>💊 C18.7 — Colon cancer</option></select>
      </div>
      <div className="form-row">
        <div className="form-group"><label>TNM Stage</label><select><option>❶ Stage I</option><option>❷ Stage II</option><option>❸ Stage IIIA</option><option>❹ Stage IV</option></select></div>
        <div className="form-group"><label>Insurer</label><select><option>🛡️ AXA Mansard</option><option>🏛️ NHIA</option><option>🏥 Hygeia HMO</option><option>💵 Cash Pay</option></select></div>
      </div>
      <div className="form-group">
        <label>Drug (HMO-filtered)</label>
        <select><option>Trastuzumab</option><option>Pertuzumab</option><option>Rituximab</option></select>
      </div>
    </div>
    <div className="modal-f">
      <button className="btn btn-outline" onClick={() => onCloseModal('modal-prescription')}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onCloseModal('modal-prescription')}>Send to Network</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-notifications' ? 'open' : ''}`} onClick={() => onCloseModal('modal-notifications')}>
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-h">
      <div className="ct">Notifications</div>
      <button className="close-modal" onClick={() => onCloseModal('modal-notifications')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="modal-b" style={{padding: '0'}}>
      <div className="log-item"><div className="log-dot" style={{background: 'var(--err)'}}></div><div className="log-content"><div className="log-action">Cold Chain Breach</div><div className="log-meta">Transit T-07 reached 11.2°C</div></div><div className="log-time">10m ago</div></div>
      <div className="log-item"><div className="log-dot" style={{background: 'var(--warn)'}}></div><div className="log-content"><div className="log-action">Near-Expiry Alert</div><div className="log-meta">Trastuzumab (Lot TZ-2204-B) expires in 38 days</div></div><div className="log-time">1h ago</div></div>
      <div className="log-item"><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">Transfer Approved</div><div className="log-meta">Redistribution #T-094 confirmed by Admin</div></div><div className="log-time">3h ago</div></div>
    </div>
    <div className="modal-f">
      <button className="btn btn-ghost" style={{fontSize: '11px'}}>Mark all as read</button>
      <button className="btn btn-primary" onClick={() => onCloseModal('modal-notifications')}>Close</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-onboard' ? 'open' : ''}`} onClick={() => onCloseModal('modal-onboard')}>
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-h">
      <div className="ct">Onboard New Facility</div>
      <button className="close-modal" onClick={() => onCloseModal('modal-onboard')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="modal-b">
      <div className="form-group">
        <label>Facility Name</label>
        <input type="text" placeholder="e.g. Reddington Hospital"/>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Facility Type</label>
          <select><option>📤 Donor Hub</option><option>📥 Recipient Hub</option><option>🛰️ Satellite Clinic</option></select>
        </div>
        <div className="form-group">
          <label>IP Whitelist</label>
          <input type="text" placeholder="🌐 192.168.x.x"/>
        </div>
      </div>
    </div>
    <div className="modal-f">
      <button className="btn btn-outline" onClick={() => onCloseModal('modal-onboard')}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onCloseModal('modal-onboard')}>Verify & Onboard</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-user' ? 'open' : ''}`} onClick={() => onCloseModal('modal-user')}>
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-h">
      <div className="ct">Add New User</div>
      <button className="close-modal" onClick={() => onCloseModal('modal-user')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="modal-b">
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" placeholder="e.g. Dr. Jane Doe"/>
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" placeholder="jane.doe@facility.org"/>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Assigned Role</label>
          <select><option>Role A — Submitting Pharmacist</option><option>Role B — Requesting Pharmacist</option><option>Role C — Network Admin</option></select>
        </div>
        <div className="form-group">
          <label>Primary Facility</label>
          <select><option>LUTH</option><option>EKO Hospital</option><option>UCH Ibadan</option><option>LASUTH</option></select>
        </div>
      </div>
    </div>
    <div className="modal-f">
      <button className="btn btn-outline" onClick={() => onCloseModal('modal-user')}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onCloseModal('modal-user')}>Create User Account</button>
    </div>
  </div>
</div>

    </>
  );
}
