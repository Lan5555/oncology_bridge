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
  <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="text-[15px] font-bold text-slate-950">Export Network Data</div>
      <button className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800" onClick={() => onCloseModal('modal-export')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Report Type</label>
        <select><option>📄 Inventory Summary (PDF)</option><option>📊 Audit Trail (CSV)</option><option>❄️ Cold Chain Compliance (Excel)</option></select>
      </div>
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Date Range</label>
        <select><option>Last 30 Days</option><option>Current Quarter</option><option>Custom Range...</option></select>
      </div>
    </div>
    <div className="flex justify-end gap-2 bg-slate-100 px-6 py-4">
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => onCloseModal('modal-export')}>Cancel</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onCloseModal('modal-export')}>Generate Report</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-transfer' ? 'open' : ''}`} onClick={() => onCloseModal('modal-transfer')}>
  <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="text-[15px] font-bold text-slate-950">New Redistribution Request</div>
      <button className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800" onClick={() => onCloseModal('modal-transfer')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Select Drug from Surplus</label>
        <select><option>Trastuzumab (Lot TZ-2204-B) - LUTH</option><option>Rituximab (Lot RX-0912-A) - EKO</option></select>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1">
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>Quantity</label>
          <input type="number" defaultValue="1" min="1"/>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>Recipient Facility</label>
          <select><option>LASUTH</option><option>Lagos Island GH</option><option>UCH Ibadan</option></select>
        </div>
      </div>
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Urgency Level</label>
        <select><option>Standard (48h)</option><option>Urgent (24h)</option><option>Emergency (Same Day)</option></select>
      </div>
    </div>
    <div className="flex justify-end gap-2 bg-slate-100 px-6 py-4">
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => onCloseModal('modal-transfer')}>Cancel</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onCloseModal('modal-transfer')}>Initiate Transfer</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-breach' ? 'open' : ''}`} onClick={() => onCloseModal('modal-breach')}>
  <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="p-6" style={{textAlign: 'center'}}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{background: 'var(--errl)', color: 'var(--err)', margin: '0 auto 1.5rem'}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h3 style={{marginBottom: '8px'}}>Confirm Quarantine Action</h3>
      <p style={{fontSize: '14px', color: 'var(--g500)', lineHeight: '1.5'}}>You are flagging 7 vials of Rituximab (Lot RX-1044-E) for disposal due to a sustained temperature breach of 11.2°C. This action is irreversible.</p>
    </div>
    <div className="flex justify-end gap-2 bg-slate-100 px-6 py-4" style={{justifyContent: 'center', background: 'var(--g50)', paddingBottom: '1.5rem'}}>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => onCloseModal('modal-breach')}>Cancel</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-red-200 bg-red-50 text-red-800" onClick={() => onCloseModal('modal-breach')}>Confirm Disposal</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-prescription' ? 'open' : ''}`} onClick={() => onCloseModal('modal-prescription')}>
  <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="text-[15px] font-bold text-slate-950">Create New Prescription</div>
      <button className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800" onClick={() => onCloseModal('modal-prescription')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Patient ID / Name</label>
        <input type="text" placeholder="e.g. #0493 or John Doe"/>
      </div>
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>ICD-10 Diagnosis Code</label>
        <select><option>🎗️ C50.4 — Breast cancer, upper-outer quadrant</option><option>🩸 C85.1 — B-cell lymphoma</option><option>💊 C18.7 — Colon cancer</option></select>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1">
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>TNM Stage</label><select><option>❶ Stage I</option><option>❷ Stage II</option><option>❸ Stage IIIA</option><option>❹ Stage IV</option></select></div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Insurer</label><select><option>🛡️ AXA Mansard</option><option>🏛️ NHIA</option><option>🏥 Hygeia HMO</option><option>💵 Cash Pay</option></select></div>
      </div>
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Drug (HMO-filtered)</label>
        <select><option>Trastuzumab</option><option>Pertuzumab</option><option>Rituximab</option></select>
      </div>
    </div>
    <div className="flex justify-end gap-2 bg-slate-100 px-6 py-4">
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => onCloseModal('modal-prescription')}>Cancel</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onCloseModal('modal-prescription')}>Send to Network</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-notifications' ? 'open' : ''}`} onClick={() => onCloseModal('modal-notifications')}>
  <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="text-[15px] font-bold text-slate-950">Notifications</div>
      <button className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800" onClick={() => onCloseModal('modal-notifications')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6" style={{padding: '0'}}>
      <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--err)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">Cold Chain Breach</div><div className="mt-0.5 text-[11px] text-slate-400">Transit T-07 reached 11.2°C</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">10m ago</div></div>
      <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--warn)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">Near-Expiry Alert</div><div className="mt-0.5 text-[11px] text-slate-400">Trastuzumab (Lot TZ-2204-B) expires in 38 days</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">1h ago</div></div>
      <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">Transfer Approved</div><div className="mt-0.5 text-[11px] text-slate-400">Redistribution #T-094 confirmed by Admin</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">3h ago</div></div>
    </div>
    <div className="flex justify-end gap-2 bg-slate-100 px-6 py-4">
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800" style={{fontSize: '11px'}}>Mark all as read</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onCloseModal('modal-notifications')}>Close</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-onboard' ? 'open' : ''}`} onClick={() => onCloseModal('modal-onboard')}>
  <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="text-[15px] font-bold text-slate-950">Onboard New Facility</div>
      <button className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800" onClick={() => onCloseModal('modal-onboard')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Facility Name</label>
        <input type="text" placeholder="e.g. Reddington Hospital"/>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1">
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>Facility Type</label>
          <select><option>📤 Donor Hub</option><option>📥 Recipient Hub</option><option>🛰️ Satellite Clinic</option></select>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>IP Whitelist</label>
          <input type="text" placeholder="🌐 192.168.x.x"/>
        </div>
      </div>
    </div>
    <div className="flex justify-end gap-2 bg-slate-100 px-6 py-4">
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => onCloseModal('modal-onboard')}>Cancel</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onCloseModal('modal-onboard')}>Verify & Onboard</button>
    </div>
  </div>
</div>

<div className={`modal-backdrop ${openModalId === 'modal-user' ? 'open' : ''}`} onClick={() => onCloseModal('modal-user')}>
  <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="text-[15px] font-bold text-slate-950">Add New User</div>
      <button className="cursor-pointer rounded-md border-0 bg-transparent p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800" onClick={() => onCloseModal('modal-user')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Full Name</label>
        <input type="text" placeholder="e.g. Dr. Jane Doe"/>
      </div>
      <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
        <label>Email Address</label>
        <input type="email" placeholder="jane.doe@facility.org"/>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1">
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>Assigned Role</label>
          <select><option>Role A — Submitting Pharmacist</option><option>Role B — Requesting Pharmacist</option><option>Role C — Network Admin</option></select>
        </div>
        <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]">
          <label>Primary Facility</label>
          <select><option>LUTH</option><option>EKO Hospital</option><option>UCH Ibadan</option><option>LASUTH</option></select>
        </div>
      </div>
    </div>
    <div className="flex justify-end gap-2 bg-slate-100 px-6 py-4">
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" onClick={() => onCloseModal('modal-user')}>Cancel</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onCloseModal('modal-user')}>Create User Account</button>
    </div>
  </div>
</div>

    </>
  );
}
