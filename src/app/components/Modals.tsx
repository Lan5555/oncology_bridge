'use client';

import { ModalId } from "../lib/types";


interface ModalsProps {
  openModalId: ModalId | null;
  onCloseModal: (id: ModalId) => void;
}



export default function Modals({ openModalId, onCloseModal }: ModalsProps) {
  return (
    <>
<div className={`fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[4px] items-center justify-center z-[1000] ${openModalId === 'modal-export' ? ' flex' : ' hidden'}`} onClick={() => onCloseModal('modal-export')}>
  <div className="bg-w rounded-2xl w-full max-w-[500px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
    <div className="px-6 py-5 border-b border-g100 flex justify-between items-center">
      <div className="text-[15px] font-bold text-g900">Export Network Data</div>
      <button className="bg-transparent text-g400 cursor-pointer p-1 rounded-md hover:bg-g100 hover:text-g800" onClick={() => onCloseModal('modal-export')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4">
        <label>Report Type</label>
        <select><option>📄 Inventory Summary (PDF)</option><option>📊 Audit Trail (CSV)</option><option>❄️ Cold Chain Compliance (Excel)</option></select>
      </div>
      <div className="mb-4">
        <label>Date Range</label>
        <select><option>Last 30 Days</option><option>Current Quarter</option><option>Custom Range...</option></select>
      </div>
    </div>
    <div className="px-6 py-4 bg-g50 flex justify-end gap-2">
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={() => onCloseModal('modal-export')}>Cancel</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onCloseModal('modal-export')}>Generate Report</button>
    </div>
  </div>
</div>

<div className={`fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[4px] items-center justify-center z-[1000] ${openModalId === 'modal-transfer' ? ' flex' : ' hidden'}`} onClick={() => onCloseModal('modal-transfer')}>
  <div className="bg-w rounded-2xl w-full max-w-[500px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
    <div className="px-6 py-5 border-b border-g100 flex justify-between items-center">
      <div className="text-[15px] font-bold text-g900">New Redistribution Request</div>
      <button className="bg-transparent text-g400 cursor-pointer p-1 rounded-md hover:bg-g100 hover:text-g800" onClick={() => onCloseModal('modal-transfer')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4">
        <label>Select Drug from Surplus</label>
        <select className="p-2"><option>Trastuzumab (Lot TZ-2204-B) - LUTH</option><option>Rituximab (Lot RX-0912-A) - EKO</option></select>
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="mb-4">
          <label>Quantity</label>
          <input type="number" defaultValue="1" min="1" className="p-2"/>
        </div>
        <div className="mb-4">
          <label>Recipient Facility</label>
          <select className="p-2"><option>LASUTH</option><option>Lagos Island GH</option><option>UCH Ibadan</option></select>
        </div>
      </div>
      <div className="mb-4">
        <label>Urgency Level</label>
        <select className="p-2"><option>Standard (48h)</option><option>Urgent (24h)</option><option>Emergency (Same Day)</option></select>
      </div>
    </div>
    <div className="px-6 py-4 bg-g50 flex justify-end gap-2">
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={() => onCloseModal('modal-transfer')}>Cancel</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onCloseModal('modal-transfer')}>Initiate Transfer</button>
    </div>
  </div>
</div>

<div className={`fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[4px] items-center justify-center z-[1000] ${openModalId === 'modal-breach' ? ' flex' : ' hidden'}`} onClick={() => onCloseModal('modal-breach')}>
  <div className="bg-w rounded-2xl w-full max-w-[500px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
    <div className="p-6" style={{textAlign: 'center'}}>
      <div className="size-10 rounded-full flex items-center justify-center mb-4" style={{background: 'var(--errl)', color: 'var(--err)', margin: '0 auto 1.5rem'}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h3 style={{marginBottom: '8px'}}>Confirm Quarantine Action</h3>
      <p style={{fontSize: '14px', color: 'var(--g500)', lineHeight: '1.5'}}>You are flagging 7 vials of Rituximab (Lot RX-1044-E) for disposal due to a sustained temperature breach of 11.2°C. This action is irreversible.</p>
    </div>
    <div className="px-6 py-4 bg-g50 flex justify-end gap-2" style={{justifyContent: 'center', background: 'var(--g50)', paddingBottom: '1.5rem'}}>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={() => onCloseModal('modal-breach')}>Cancel</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-errl text-[#991b1b] border border-[#fecaca] dk:text-w dk:border-err" onClick={() => onCloseModal('modal-breach')}>Confirm Disposal</button>
    </div>
  </div>
</div>

<div className={`fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[4px] items-center justify-center z-[1000] ${openModalId === 'modal-prescription' ? ' flex' : ' hidden'}`} onClick={() => onCloseModal('modal-prescription')}>
  <div className="bg-w rounded-2xl w-full max-w-[500px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
    <div className="px-6 py-5 border-b border-g100 flex justify-between items-center">
      <div className="text-[15px] font-bold text-g900">Create New Prescription</div>
      <button className="bg-transparent text-g400 cursor-pointer p-1 rounded-md hover:bg-g100 hover:text-g800" onClick={() => onCloseModal('modal-prescription')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4">
        <label>Patient ID / Name</label>
        <input type="text" placeholder="e.g. #0493 or John Doe" className="p-2"/>
      </div>
      <div className="mb-4">
        <label>ICD-10 Diagnosis Code</label>
        <select className="p-2"><option>🎗️ C50.4 — Breast cancer, upper-outer quadrant</option><option>🩸 C85.1 — B-cell lymphoma</option><option>💊 C18.7 — Colon cancer</option></select>
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="mb-4"><label>TNM Stage</label><select className="p-2"><option>❶ Stage I</option><option>❷ Stage II</option><option>❸ Stage IIIA</option><option>❹ Stage IV</option></select></div>
        <div className="mb-4"><label>Insurer</label><select className="p-2"><option>🛡️ AXA Mansard</option><option>🏛️ NHIA</option><option>🏥 Hygeia HMO</option><option>💵 Cash Pay</option></select></div>
      </div>
      <div className="mb-4">
        <label>Drug (HMO-filtered)</label>
        <select className="p-2"><option>Trastuzumab</option><option>Pertuzumab</option><option>Rituximab</option></select>
      </div>
    </div>
    <div className="px-6 py-4 bg-g50 flex justify-end gap-2">
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={() => onCloseModal('modal-prescription')}>Cancel</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onCloseModal('modal-prescription')}>Send to Network</button>
    </div>
  </div>
</div>

<div className={`fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[4px] items-center justify-center z-[1000] ${openModalId === 'modal-notifications' ? ' flex' : ' hidden'}`} onClick={() => onCloseModal('modal-notifications')}>
  <div className="bg-w rounded-2xl w-full max-w-[500px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
    <div className="px-6 py-5 border-b border-g100 flex justify-between items-center">
      <div className="text-[15px] font-bold text-g900">Notifications</div>
      <button className="bg-transparent text-g400 cursor-pointer p-1 rounded-md hover:bg-g100 hover:text-g800" onClick={() => onCloseModal('modal-notifications')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6" style={{padding: '0'}}>
      <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--err)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">Cold Chain Breach</div><div className="text-[11px] text-g400 mt-0.5">Transit T-07 reached 11.2°C</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">10m ago</div></div>
      <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--warn)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">Near-Expiry Alert</div><div className="text-[11px] text-g400 mt-0.5">Trastuzumab (Lot TZ-2204-B) expires in 38 days</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">1h ago</div></div>
      <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">Transfer Approved</div><div className="text-[11px] text-g400 mt-0.5">Redistribution #T-094 confirmed by Admin</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">3h ago</div></div>
    </div>
    <div className="px-6 py-4 bg-g50 flex justify-end gap-2">
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-transparent text-g600 border border-g200 hover:bg-g50 hover:text-g800" style={{fontSize: '11px'}}>Mark all as read</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onCloseModal('modal-notifications')}>Close</button>
    </div>
  </div>
</div>

<div className={`fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[4px] items-center justify-center z-[1000] ${openModalId === 'modal-onboard' ? ' flex' : ' hidden'}`} onClick={() => onCloseModal('modal-onboard')}>
  <div className="bg-w rounded-2xl w-full max-w-[500px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
    <div className="px-6 py-5 border-b border-g100 flex justify-between items-center">
      <div className="text-[15px] font-bold text-g900">Onboard New Facility</div>
      <button className="bg-transparent text-g400 cursor-pointer p-1 rounded-md hover:bg-g100 hover:text-g800" onClick={() => onCloseModal('modal-onboard')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4">
        <label>Facility Name</label>
        <input type="text" placeholder="e.g. Reddington Hospital"/>
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="mb-4">
          <label>Facility Type</label>
          <select><option>📤 Donor Hub</option><option>📥 Recipient Hub</option><option>🛰️ Satellite Clinic</option></select>
        </div>
        <div className="mb-4">
          <label>IP Whitelist</label>
          <input type="text" placeholder="🌐 192.168.x.x"/>
        </div>
      </div>
    </div>
    <div className="px-6 py-4 bg-g50 flex justify-end gap-2">
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={() => onCloseModal('modal-onboard')}>Cancel</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onCloseModal('modal-onboard')}>Verify & Onboard</button>
    </div>
  </div>
</div>

<div className={`fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[4px] items-center justify-center z-[1000] ${openModalId === 'modal-user' ? ' flex' : ' hidden'}`} onClick={() => onCloseModal('modal-user')}>
  <div className="bg-w rounded-2xl w-full max-w-[500px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-modal-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
    <div className="px-6 py-5 border-b border-g100 flex justify-between items-center">
      <div className="text-[15px] font-bold text-g900">Add New User</div>
      <button className="bg-transparent text-g400 cursor-pointer p-1 rounded-md hover:bg-g100 hover:text-g800" onClick={() => onCloseModal('modal-user')}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div className="p-6">
      <div className="mb-4">
        <label>Full Name</label>
        <input type="text" placeholder="e.g. Dr. Jane Doe"/>
      </div>
      <div className="mb-4">
        <label>Email Address</label>
        <input type="email" placeholder="jane.doe@facility.org"/>
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="mb-4">
          <label>Assigned Role</label>
          <select><option>Role A — Submitting Pharmacist</option><option>Role B — Requesting Pharmacist</option><option>Role C — Network Admin</option></select>
        </div>
        <div className="mb-4">
          <label>Primary Facility</label>
          <select><option>LUTH</option><option>EKO Hospital</option><option>UCH Ibadan</option><option>LASUTH</option></select>
        </div>
      </div>
    </div>
    <div className="px-6 py-4 bg-g50 flex justify-end gap-2">
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={() => onCloseModal('modal-user')}>Cancel</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onCloseModal('modal-user')}>Create User Account</button>
    </div>
  </div>
</div>

    </>
  );
}
