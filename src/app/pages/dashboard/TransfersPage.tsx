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
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
        <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500"><h1>Redistribution Centre</h1><p>Admin-mediated pharmacy-to-pharmacy transfers · 50-mile radius</p></div>
        <div className="flex flex-wrap gap-2 max-[768px]:w-full [&_.btn]:max-[768px]:w-full [&_.btn]:max-[768px]:justify-center"><button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onOpenModal('modal-transfer')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Transfer Request</button></div>
      </div>

      <div className="mb-6 flex flex-wrap items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12.5px] text-slate-800 [&_p]:min-w-0 [&_p]:flex-1 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-red-500 text-white">
        <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <p><strong>Chain of custody breach:</strong> Transit unit T-07 recorded 11.2°C — transfer quarantined automatically. Admin review required.</p>
      </div>

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500"><strong>{PENDING_TRANSFERS.length}</strong><span>Transfer requests open</span></div>
        <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500"><strong>{COMPLETED_TRANSFERS.length}</strong><span>Recent deliveries</span></div>
        <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500"><strong>1</strong><span>Quarantined breach</span></div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto rounded-full bg-slate-100 p-1">
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

      <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-[960px]:grid-cols-1">
        <div className="flex flex-col gap-4">
          {activeTab === 'pending' ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Pending Approval</div><div className="mt-0.5 text-xs text-slate-500">Transfers awaiting admin sign-off</div></div><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-red-50 text-red-700 before:hidden">{PENDING_TRANSFERS.length} open</span></div>
              {PENDING_TRANSFERS.map((item) => (
                <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-blue-200 hover:shadow-md hover:shadow-sky-500/10 last:mb-0 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-3" key={item.id}>
                  <div className={`xfer-icon ${item.badge === 'a' ? 'a' : item.badge === 'b' ? 'b' : ''}`}><svg viewBox="0 0 24 24"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg></div>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}><span className={`badge ${item.badge} no-dot`} style={{ fontSize: '9px' }}>{item.badgeText}</span><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-slate-100 text-slate-600 before:hidden" style={{ fontSize: '9px' }}>ID: {item.id}</span></div>
                    <div className="text-[13px] font-semibold text-slate-800">{item.drug}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{item.route} · {item.distance} · Lot {item.lot}</div>
                  </div>
                  <div className="ml-auto flex shrink-0 gap-1.5 max-[768px]:w-full max-[768px]:justify-end max-[768px]:border-t max-[768px]:border-slate-100 max-[768px]:pt-2">
                    <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-800 hover:text-blue-800 [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.2] border-emerald-200 bg-emerald-50 text-emerald-600" title="Approve" type="button"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></button>
                    <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-800 hover:text-blue-800 [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.2] border-red-200 bg-red-50 text-red-600" title="Reject" type="button"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Completed Transfers</div><div className="mt-0.5 text-xs text-slate-500">Last 30 days</div></div></div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-900/10 [&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-[13px] [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.5px] [&_th]:text-slate-400 [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-3.5 [&_td]:align-middle [&_td]:text-slate-700 [&_tr:hover_td]:bg-slate-100 [&_tr:last-child_td]:border-b-0">
                <table className="w-full min-w-[720px]">
                  <thead><tr><th>Drug</th><th>From</th><th>To</th><th>Qty</th><th>Date</th><th>Result</th></tr></thead>
                  <tbody>
                    {COMPLETED_TRANSFERS.map((item) => (
                      <tr key={`${item.drug}-${item.date}`}>
                        <td data-label="Drug">{item.drug}</td>
                        <td data-label="From">{item.from}</td>
                        <td data-label="To">{item.to}</td>
                        <td data-label="Qty">{item.qty}</td>
                        <td data-label="Date">{item.date}</td>
                        <td data-label="Result"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-emerald-50 text-emerald-700">{item.result}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
            <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Active Order — Patient #0492</div><div className="mt-0.5 text-xs text-slate-500">AXA Mansard · Breast Cancer C50.4</div></div><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-blue-100 text-blue-900 before:hidden">Step 5/6</span></div>
            <div className="flex flex-col">
              <div className="relative flex gap-3"><div className="relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold bg-emerald-600 text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="flex-1 pb-3.5"><div className="mb-0.5 text-[13px] font-semibold text-slate-800">Stock Ingestion — POS Sync</div><div className="text-[11.5px] leading-6 text-slate-500">15 vials Trastuzumab logged. Webhook synced.</div></div></div>
              <div className="relative flex gap-3"><div className="relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold bg-emerald-600 text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="flex-1 pb-3.5"><div className="mb-0.5 text-[13px] font-semibold text-slate-800">Prescription Packaged</div><div className="text-[11.5px] leading-6 text-slate-500">ICD-10: C50.4, Stage IIIA. Clinical JSON sent.</div></div></div>
              <div className="relative flex gap-3"><div className="relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold bg-emerald-600 text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="flex-1 pb-3.5"><div className="mb-0.5 text-[13px] font-semibold text-slate-800">Order Matched & Reserved</div><div className="text-[11.5px] leading-6 text-slate-500">2 vials deducted. Reservation confirmed.</div></div></div>
              <div className="relative flex gap-3"><div className="relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold bg-emerald-600 text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="flex-1 pb-3.5"><div className="mb-0.5 text-[13px] font-semibold text-slate-800">Prior-Authorization Cleared</div><div className="text-[11.5px] leading-6 text-slate-500">AXA Mansard · Claims code #AXA-4892-2026.</div></div></div>
              <div className="relative flex gap-3"><div className="relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold active">5</div><div className="flex-1 pb-3.5"><div className="mb-0.5 text-[13px] font-semibold text-slate-800" style={{ color: 'var(--pd)' }}>GS1 Validation Scan — In Progress</div><div className="text-[11.5px] leading-6 text-slate-500">Courier dispatched. Pharmacist scanning Lot TZ-2204-A.</div></div></div>
              <div className="relative flex gap-3"><div className="relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold bg-slate-200 text-slate-500">6</div><div className="flex-1 pb-3.5" style={{ paddingBottom: '0' }}><div className="mb-0.5 text-[13px] font-semibold text-slate-800" style={{ color: 'var(--g400)' }}>Last-Mile Delivery & Disbursal</div><div className="text-[11.5px] leading-6 text-slate-500">Cold-chain courier to oncology nurse. QR scan on arrival.</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;
