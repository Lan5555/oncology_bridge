import { ModalId, PageId } from "../../lib/types";
import { JSX, useState } from "react";

import type React from 'react';
interface PrescriptionsPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

type PrescriptionTab = 'active' | 'awaiting' | 'completed';

const TAB_CONFIG: { id: PrescriptionTab; label: string; icon: JSX.Element }[] = [
  {
    id: 'active',
    label: 'Active Orders',
    icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  },
  {
    id: 'awaiting',
    label: 'Awaiting Auth',
    icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  },
];

const PRESCRIPTION_DATA: Record<PrescriptionTab, Array<{ id: string; code: string; drug: string; insurer: string; pharmacy: string; status: string; order: string; statusClass: string; orderClass: string }>> = {
  active: [
    { id: '#0492', code: 'C50.4', drug: 'Trastuzumab ×2', insurer: 'AXA Mansard', pharmacy: 'Lagos Island GH', status: 'Cleared', order: 'In Transit', statusClass: 'g', orderClass: 'b' },
    { id: '#0475', code: 'C18.7', drug: 'Bevacizumab ×3', insurer: 'Hygeia HMO', pharmacy: 'UCH Ibadan', status: 'Cleared', order: 'Dispensed', statusClass: 'g', orderClass: 'g' },
  ],
  awaiting: [
    { id: '#0481', code: 'C85.1', drug: 'Rituximab ×4', insurer: 'NHIA', pharmacy: 'LUTH Pharmacy', status: 'Pending', order: 'Held', statusClass: 'a', orderClass: 'a' },
    { id: '#0468', code: 'C50.9', drug: 'Pertuzumab ×2', insurer: 'Reliance HMO', pharmacy: 'EKO Hospital', status: 'API Routing', order: 'Waiting', statusClass: 'a', orderClass: 'gray' },
  ],
  completed: [
    { id: '#0460', code: 'C34.1', drug: 'Cetuximab ×1', insurer: 'Cash Pay', pharmacy: 'LASUTH', status: 'Paystack ✓', order: 'Ready', statusClass: 'g', orderClass: 'b' },
    { id: '#0455', code: 'C50.3', drug: 'Pertuzumab ×1', insurer: 'NHIA', pharmacy: 'LUTH Pharmacy', status: 'Cleared', order: 'Delivered', statusClass: 'g', orderClass: 'g' },
  ],
};

const PrescriptionsPage: React.FC<PrescriptionsPageProps> = ({ onNav, onOpenModal }) => {
  const [activeTab, setActiveTab] = useState<PrescriptionTab>('active');
  const rows = PRESCRIPTION_DATA[activeTab];
  const counts = {
    active: PRESCRIPTION_DATA.active.length,
    awaiting: PRESCRIPTION_DATA.awaiting.length,
    completed: PRESCRIPTION_DATA.completed.length,
  };

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-left"><h1>Prescriptions</h1><p>Structured clinical orders · ICD-10 coded · HMO-matched</p></div>
        <div className="ph-actions"><button className="btn btn-primary" onClick={() => onOpenModal('modal-prescription')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Prescription</button></div>
      </div>

      <div className="g-main">
        <div className="card">
          <div className="card-head">
            <div className="title">Prescription pipeline</div>
            <div className="note">Track order statuses and approvals across the oncology network.</div>
          </div>
          <div className="summary-row">
            <div className="summary-card"><strong>{counts.active}</strong><span>Active orders</span></div>
            <div className="summary-card"><strong>{counts.awaiting}</strong><span>Awaiting authorization</span></div>
            <div className="summary-card"><strong>{counts.completed}</strong><span>Completed prescriptions</span></div>
          </div>
          <div className="tabs">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? ' on' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5' }}>
                  {tab.icon}
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tbl-wrap">
            <table className="table-scroll">
              <thead><tr><th>Patient ID</th><th>ICD-10</th><th>Drug</th><th>Insurer</th><th>Pharmacy</th><th>Auth Status</th><th>Order</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td data-label="Patient ID"><strong>{row.id}</strong></td>
                    <td data-label="ICD-10"><span className="badge b no-dot">{row.code}</span></td>
                    <td data-label="Drug">{row.drug}</td>
                    <td data-label="Insurer">{row.insurer}</td>
                    <td data-label="Pharmacy">{row.pharmacy}</td>
                    <td data-label="Auth Status"><span className={`badge ${row.statusClass}`}>{row.status}</span></td>
                    <td data-label="Order"><span className={`badge ${row.orderClass} no-dot`}>{row.order}</span></td>
                  </tr>
                ))}
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
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Send to Network</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionsPage;
