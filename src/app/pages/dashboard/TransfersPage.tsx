import { ModalId, PageId } from "../../lib/types";
import { useState } from "react";

import type React from 'react';
interface TransfersPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

type TransferTab = 'pending' | 'completed';

const TRANSFER_TABS: Array<{ id: TransferTab; label: string }> = [
  { id: 'pending', label: 'Pending Approval' },
  { id: 'completed', label: 'Completed Transfers' },
];

const PENDING_TRANSFERS = [
  {
    id: '#T-098',
    level: 'Urgent',
    drug: 'Trastuzumab × 8 vials',
    route: 'LUTH → Lagos Island GH',
    distance: '14.2 km',
    lot: 'TZ-2204-B',
    badge: 'a',
    badgeText: 'Urgent',
  },
  {
    id: '#T-097',
    level: 'Routine',
    drug: 'Rituximab × 5 vials',
    route: 'EKO Hospital → LUTH',
    distance: '7.8 km',
    lot: 'RX-0912-A',
    badge: 'b',
    badgeText: 'Routine',
  },
  {
    id: '#T-096',
    level: 'Near-Expiry',
    drug: 'Bevacizumab × 12 vials',
    route: 'UCH Ibadan → LASUTH',
    distance: '22 km',
    lot: 'BV-1103-C',
    badge: 'a',
    badgeText: 'Near-Expiry',
  },
];

const COMPLETED_TRANSFERS = [
  { drug: 'Bevacizumab', from: 'UCH Ibadan', to: 'LUTH', qty: '6', date: 'Jun 10', result: 'Delivered' },
  { drug: 'Trastuzumab', from: 'Lagos Island GH', to: 'LASUTH', qty: '4', date: 'Jun 7', result: 'Delivered' },
  { drug: 'Pertuzumab', from: 'LUTH', to: 'EKO Hospital', qty: '2', date: 'Jun 3', result: 'Delivered' },
  { drug: 'Rituximab', from: 'EKO Hospital', to: 'UCH Ibadan', qty: '8', date: 'May 28', result: 'Delivered' },
];

const TransfersPage: React.FC<TransfersPageProps> = ({ onNav, onOpenModal }) => {
  const [activeTab, setActiveTab] = useState<TransferTab>('pending');

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

      <div className="summary-row">
        <div className="summary-card"><strong>{PENDING_TRANSFERS.length}</strong><span>Transfer requests open</span></div>
        <div className="summary-card"><strong>{COMPLETED_TRANSFERS.length}</strong><span>Recent deliveries</span></div>
        <div className="summary-card"><strong>1</strong><span>Quarantined breach</span></div>
      </div>

      <div className="tabs">
        {TRANSFER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn${activeTab === tab.id ? ' on' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="g-main">
        <div className="g-stack">
          {activeTab === 'pending' ? (
            <div className="card">
              <div className="ch"><div><div className="ct">Pending Approval</div><div className="cs">Transfers awaiting admin sign-off</div></div><span className="badge r no-dot">{PENDING_TRANSFERS.length} open</span></div>
              {PENDING_TRANSFERS.map((item) => (
                <div className="xfer" key={item.id}>
                  <div className={`xfer-icon ${item.badge === 'a' ? 'a' : item.badge === 'b' ? 'b' : ''}`}><svg viewBox="0 0 24 24"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg></div>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}><span className={`badge ${item.badge} no-dot`} style={{ fontSize: '9px' }}>{item.badgeText}</span><span className="badge gray no-dot" style={{ fontSize: '9px' }}>ID: {item.id}</span></div>
                    <div className="xfer-drug">{item.drug}</div>
                    <div className="xfer-meta">{item.route} · {item.distance} · Lot {item.lot}</div>
                  </div>
                  <div className="xfer-actions">
                    <button className="ico-btn ok-btn" title="Approve" type="button"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></button>
                    <button className="ico-btn err-btn" title="Reject" type="button"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card">
              <div className="ch"><div><div className="ct">Completed Transfers</div><div className="cs">Last 30 days</div></div></div>
              <div className="tbl-wrap">
                <table className="table-scroll">
                  <thead><tr><th>Drug</th><th>From</th><th>To</th><th>Qty</th><th>Date</th><th>Result</th></tr></thead>
                  <tbody>
                    {COMPLETED_TRANSFERS.map((item) => (
                      <tr key={`${item.drug}-${item.date}`}>
                        <td data-label="Drug">{item.drug}</td>
                        <td data-label="From">{item.from}</td>
                        <td data-label="To">{item.to}</td>
                        <td data-label="Qty">{item.qty}</td>
                        <td data-label="Date">{item.date}</td>
                        <td data-label="Result"><span className="badge g">{item.result}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="g-stack">
          <div className="card">
            <div className="ch"><div><div className="ct">Active Order — Patient #0492</div><div className="cs">AXA Mansard · Breast Cancer C50.4</div></div><span className="badge b no-dot">Step 5/6</span></div>
            <div className="steps">
              <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Stock Ingestion — POS Sync</div><div className="step-desc">15 vials Trastuzumab logged. Webhook synced.</div></div></div>
              <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Prescription Packaged</div><div className="step-desc">ICD-10: C50.4, Stage IIIA. Clinical JSON sent.</div></div></div>
              <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Order Matched & Reserved</div><div className="step-desc">2 vials deducted. Reservation confirmed.</div></div></div>
              <div className="step"><div className="step-num done"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="step-body"><div className="step-title">Prior-Authorization Cleared</div><div className="step-desc">AXA Mansard · Claims code #AXA-4892-2026.</div></div></div>
              <div className="step"><div className="step-num active">5</div><div className="step-body"><div className="step-title" style={{ color: 'var(--pd)' }}>GS1 Validation Scan — In Progress</div><div className="step-desc">Courier dispatched. Pharmacist scanning Lot TZ-2204-A.</div></div></div>
              <div className="step"><div className="step-num pend">6</div><div className="step-body" style={{ paddingBottom: '0' }}><div className="step-title" style={{ color: 'var(--g400)' }}>Last-Mile Delivery & Disbursal</div><div className="step-desc">Cold-chain courier to oncology nurse. QR scan on arrival.</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;
