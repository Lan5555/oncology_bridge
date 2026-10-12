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
    badge: 'bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]',
    badgeText: 'Urgent',
  },
  {
    id: '#T-097',
    level: 'Routine',
    drug: 'Rituximab × 5 vials',
    route: 'EKO Hospital → LUTH',
    distance: '7.8 km',
    lot: 'RX-0912-A',
    badge: 'bg-pl text-pdd dk:bg-[rgba(96,165,250,0.16)] dk:text-[#dbeafe]',
    badgeText: 'Routine',
  },
  {
    id: '#T-096',
    level: 'Near-Expiry',
    drug: 'Bevacizumab × 12 vials',
    route: 'UCH Ibadan → LASUTH',
    distance: '22 km',
    lot: 'BV-1103-C',
    badge: 'bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]',
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
    <div className="block animate-fade-up">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap max-md:flex-col max-md:items-stretch max-md:gap-4">
        <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]"><h1>Redistribution Centre</h1><p>Admin-mediated pharmacy-to-pharmacy transfers · 50-mile radius</p></div>
        <div className="flex gap-2 flex-wrap max-md:w-full max-md:justify-start"><button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onOpenModal('modal-transfer')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Transfer Request</button></div>
      </div>

      <div className="flex flex-wrap items-start gap-2.5 px-3.5 py-[11px] rounded-xl mb-6 text-[12.5px] border [&_p]:flex-1 [&_p]:min-w-0 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:mt-px [&_p_strong]:font-bold max-lg:flex-col max-lg:items-start max-lg:[&_svg]:mt-0 max-md:p-3 dk:[&_p]:text-white dk:[&_svg]:stroke-white bg-errl border-[#fecaca] border-l-4 border-l-err text-[#7f1d1d] dk:bg-[#4b0f0f] dk:border-[#fca5a5] dk:text-[#fee2e2]">
        <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <p><strong>Chain of custody breach:</strong> Transit unit T-07 recorded 11.2°C — transfer quarantined automatically. Admin review required.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-4">
        <div className="bg-g50 border border-g100 rounded-lg p-[0.95rem] [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-g900 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-g500 [&_span]:mt-[3px]"><strong>{PENDING_TRANSFERS.length}</strong><span>Transfer requests open</span></div>
        <div className="bg-g50 border border-g100 rounded-lg p-[0.95rem] [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-g900 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-g500 [&_span]:mt-[3px]"><strong>{COMPLETED_TRANSFERS.length}</strong><span>Recent deliveries</span></div>
        <div className="bg-g50 border border-g100 rounded-lg p-[0.95rem] [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-g900 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-g500 [&_span]:mt-[3px]"><strong>1</strong><span>Quarantined breach</span></div>
      </div>

      <div className="flex flex-wrap border-b border-g200 rounded-full bg-g50 p-1 gap-2 overflow-x-auto mb-5 max-[520px]:p-1.5 max-[520px]:gap-[0.4rem]">
        {TRANSFER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-[12.5px] font-semibold cursor-pointer rounded-full transition duration-[180ms] whitespace-nowrap max-md:flex-1 max-md:text-center max-[520px]:min-w-[120px] max-[520px]:text-xs max-[520px]:px-3${activeTab === tab.id ? ' text-w bg-p shadow-[0_10px_25px_rgba(37,99,235,0.18)]' : ' text-g500 bg-transparent hover:text-g700 hover:bg-[rgba(15,23,42,0.04)]'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-lg:grid-cols-1">
        <div className="flex flex-col gap-4">
          {activeTab === 'pending' ? (
            <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
              <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Pending Approval</div><div className="text-xs text-g500 mt-0.5">Transfers awaiting admin sign-off</div></div><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-errl text-[#7f1d1d] dk:bg-[#4b0f0f] dk:text-[#fee2e2] before:hidden">{PENDING_TRANSFERS.length} open</span></div>
              {PENDING_TRANSFERS.map((item) => (
                <div className="flex items-center gap-2.5 px-3 py-2.5 border border-g200 rounded-lg transition duration-150 mb-2 last:mb-0 hover:border-pl hover:shadow-[0_2px_8px_rgba(14,165,233,0.06)] max-md:flex-col max-md:items-start max-md:gap-3" key={item.id}>
                  <div className={`size-[34px] rounded-lg flex items-center justify-center shrink-0 [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 ${item.badge === 'a' ? '' : item.badge === 'b' ? ' bg-pl text-pd' : ' '}`}><svg viewBox="0 0 24 24"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg></div>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}><span className={`inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 ${item.badge} before:hidden`} style={{ fontSize: '9px' }}>{item.badgeText}</span><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-g100 text-g600 before:hidden" style={{ fontSize: '9px' }}>ID: {item.id}</span></div>
                    <div className="text-[13px] font-semibold text-g800">{item.drug}</div>
                    <div className="text-[11px] text-g400 mt-px">{item.route} · {item.distance} · Lot {item.lot}</div>
                  </div>
                  <div className="flex gap-[5px] ml-auto shrink-0 max-md:w-full max-md:justify-end max-md:border-t max-md:border-g100 max-md:pt-2">
                    <button className="size-7 rounded-md border flex items-center justify-center cursor-pointer transition duration-150 [&_svg]:size-[13px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.2] bg-okl border-[#a7f3d0] text-good" title="Approve" type="button"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></button>
                    <button className="size-7 rounded-md border flex items-center justify-center cursor-pointer transition duration-150 [&_svg]:size-[13px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.2] bg-errl border-[#fecaca] text-err" title="Reject" type="button"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
              <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Completed Transfers</div><div className="text-xs text-g500 mt-0.5">Last 30 days</div></div></div>
              <div className="overflow-x-auto rounded-xl bg-w border border-g100 shadow-[0_14px_30px_rgba(15,23,42,0.08)] max-lg:block max-lg:w-full max-lg:[&_table]:w-auto max-lg:[&_table]:min-w-[720px] max-lg:[&_th]:whitespace-nowrap max-lg:[&_td]:whitespace-nowrap max-md:[&_table]:w-full max-md:[&_table]:min-w-0 max-md:[&_thead]:hidden max-md:[&_tr]:block max-md:[&_tr]:mb-4 max-md:[&_tr]:border max-md:[&_tr]:border-g200 max-md:[&_tr]:rounded-xl max-md:[&_tr]:overflow-hidden max-md:[&_tr]:bg-w max-md:[&_td]:flex max-md:[&_td]:justify-between max-md:[&_td]:items-start max-md:[&_td]:px-3 max-md:[&_td]:py-2.5 max-md:[&_td]:border-0 max-md:[&_td]:border-b max-md:[&_td]:border-g100 max-md:[&_td]:whitespace-normal max-md:[&_td:last-child]:border-b-0 max-md:[&_td]:before:content-[attr(data-label)] max-md:[&_td]:before:basis-[45%] max-md:[&_td]:before:grow-0 max-md:[&_td]:before:shrink-0 max-md:[&_td]:before:text-[11px] max-md:[&_td]:before:font-bold max-md:[&_td]:before:text-g500 max-md:[&_td]:before:mr-2.5 max-md:[&_td]:before:whitespace-nowrap max-md:[&_td_span.badge]:ml-auto max-[520px]:[&_td]:flex-col max-[520px]:[&_td]:items-start max-[520px]:[&_td]:before:mb-1.5 max-[520px]:[&_td]:before:basis-auto">
                <table className="min-w-[720px] w-full">
                  <thead><tr><th>Drug</th><th>From</th><th>To</th><th>Qty</th><th>Date</th><th>Result</th></tr></thead>
                  <tbody>
                    {COMPLETED_TRANSFERS.map((item) => (
                      <tr key={`${item.drug}-${item.date}`}>
                        <td data-label="Drug">{item.drug}</td>
                        <td data-label="From">{item.from}</td>
                        <td data-label="To">{item.to}</td>
                        <td data-label="Qty">{item.qty}</td>
                        <td data-label="Date">{item.date}</td>
                        <td data-label="Result"><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]">{item.result}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
            <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Active Order — Patient #0492</div><div className="text-xs text-g500 mt-0.5">AXA Mansard · Breast Cancer C50.4</div></div><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-pl text-pdd dk:bg-[rgba(96,165,250,0.16)] dk:text-[#dbeafe] before:hidden">Step 5/6</span></div>
            <div className="flex flex-col">
              <div className="flex gap-3 relative not-last:after:content-[''] not-last:after:absolute not-last:after:left-[13px] not-last:after:top-[30px] not-last:after:bottom-0 not-last:after:w-[1.5px] not-last:after:bg-g200 not-last:after:z-0"><div className="size-[26px] rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 relative z-[1] mt-0.5 [&_svg]:size-[11px] [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-3 bg-good text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="pb-3.5 flex-1"><div className="text-[13px] font-semibold text-g800 mb-0.5">Stock Ingestion — POS Sync</div><div className="text-[11.5px] text-g500 leading-[1.55]">15 vials Trastuzumab logged. Webhook synced.</div></div></div>
              <div className="flex gap-3 relative not-last:after:content-[''] not-last:after:absolute not-last:after:left-[13px] not-last:after:top-[30px] not-last:after:bottom-0 not-last:after:w-[1.5px] not-last:after:bg-g200 not-last:after:z-0"><div className="size-[26px] rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 relative z-[1] mt-0.5 [&_svg]:size-[11px] [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-3 bg-good text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="pb-3.5 flex-1"><div className="text-[13px] font-semibold text-g800 mb-0.5">Prescription Packaged</div><div className="text-[11.5px] text-g500 leading-[1.55]">ICD-10: C50.4, Stage IIIA. Clinical JSON sent.</div></div></div>
              <div className="flex gap-3 relative not-last:after:content-[''] not-last:after:absolute not-last:after:left-[13px] not-last:after:top-[30px] not-last:after:bottom-0 not-last:after:w-[1.5px] not-last:after:bg-g200 not-last:after:z-0"><div className="size-[26px] rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 relative z-[1] mt-0.5 [&_svg]:size-[11px] [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-3 bg-good text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="pb-3.5 flex-1"><div className="text-[13px] font-semibold text-g800 mb-0.5">Order Matched & Reserved</div><div className="text-[11.5px] text-g500 leading-[1.55]">2 vials deducted. Reservation confirmed.</div></div></div>
              <div className="flex gap-3 relative not-last:after:content-[''] not-last:after:absolute not-last:after:left-[13px] not-last:after:top-[30px] not-last:after:bottom-0 not-last:after:w-[1.5px] not-last:after:bg-g200 not-last:after:z-0"><div className="size-[26px] rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 relative z-[1] mt-0.5 [&_svg]:size-[11px] [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-3 bg-good text-white"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div><div className="pb-3.5 flex-1"><div className="text-[13px] font-semibold text-g800 mb-0.5">Prior-Authorization Cleared</div><div className="text-[11.5px] text-g500 leading-[1.55]">AXA Mansard · Claims code #AXA-4892-2026.</div></div></div>
              <div className="flex gap-3 relative not-last:after:content-[''] not-last:after:absolute not-last:after:left-[13px] not-last:after:top-[30px] not-last:after:bottom-0 not-last:after:w-[1.5px] not-last:after:bg-g200 not-last:after:z-0"><div className="size-[26px] rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 relative z-[1] mt-0.5 [&_svg]:size-[11px] [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-3 bg-p text-white shadow-[0_0_0_3px_#bae6fd]">5</div><div className="pb-3.5 flex-1"><div className="text-[13px] font-semibold text-g800 mb-0.5" style={{ color: 'var(--pd)' }}>GS1 Validation Scan — In Progress</div><div className="text-[11.5px] text-g500 leading-[1.55]">Courier dispatched. Pharmacist scanning Lot TZ-2204-A.</div></div></div>
              <div className="flex gap-3 relative not-last:after:content-[''] not-last:after:absolute not-last:after:left-[13px] not-last:after:top-[30px] not-last:after:bottom-0 not-last:after:w-[1.5px] not-last:after:bg-g200 not-last:after:z-0"><div className="size-[26px] rounded-full flex items-center justify-center text-[10.5px] font-bold shrink-0 relative z-[1] mt-0.5 [&_svg]:size-[11px] [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-3 bg-g200 text-g500">6</div><div className="pb-3.5 flex-1" style={{ paddingBottom: '0' }}><div className="text-[13px] font-semibold text-g800 mb-0.5" style={{ color: 'var(--g400)' }}>Last-Mile Delivery & Disbursal</div><div className="text-[11.5px] text-g500 leading-[1.55]">Cold-chain courier to oncology nurse. QR scan on arrival.</div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;
