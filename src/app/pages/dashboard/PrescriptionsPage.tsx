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
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
        <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500"><h1>Prescriptions</h1><p>Structured clinical orders · ICD-10 coded · HMO-matched</p></div>
        <div className="flex flex-wrap gap-2 max-[768px]:w-full [&_.btn]:max-[768px]:w-full [&_.btn]:max-[768px]:justify-center"><button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" onClick={() => onOpenModal('modal-prescription')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Prescription</button></div>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-[960px]:grid-cols-1">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="mb-4 flex items-center gap-3 [&_.title]:mb-1 [&_.title]:text-sm [&_.title]:font-bold [&_.title]:text-slate-950 [&_.note]:text-xs [&_.note]:text-slate-500">
            <div className="text-sm font-bold text-slate-950">Prescription pipeline</div>
            <div className="text-xs text-slate-500">Track order statuses and approvals across the oncology network.</div>
          </div>
          <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500"><strong>{counts.active}</strong><span>Active orders</span></div>
            <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500"><strong>{counts.awaiting}</strong><span>Awaiting authorization</span></div>
            <div className="rounded-lg border border-slate-100 bg-slate-100 p-4 [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-slate-950 [&_span]:mt-1 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-slate-500"><strong>{counts.completed}</strong><span>Completed prescriptions</span></div>
          </div>
          <div className="mb-5 flex gap-2 overflow-x-auto rounded-full bg-slate-100 p-1">
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

          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-900/10 [&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-[13px] [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.5px] [&_th]:text-slate-400 [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-3.5 [&_td]:align-middle [&_td]:text-slate-700 [&_tr:hover_td]:bg-slate-100 [&_tr:last-child_td]:border-b-0">
            <table className="w-full min-w-[720px]">
              <thead><tr><th>Patient ID</th><th>ICD-10</th><th>Drug</th><th>Insurer</th><th>Pharmacy</th><th>Auth Status</th><th>Order</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td data-label="Patient ID"><strong>{row.id}</strong></td>
                    <td data-label="ICD-10"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-blue-100 text-blue-900 before:hidden">{row.code}</span></td>
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

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
            <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">New Prescription</div><div className="mt-0.5 text-xs text-slate-500">Doctor micro-interface</div></div></div>
            <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>ICD-10 Diagnosis Code</label><select><option>C50.4 — Breast cancer, upper-outer quadrant</option><option>C85.1 — B-cell lymphoma</option><option>C18.7 — Colon cancer</option></select></div>
            <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-1">
              <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>TNM Stage</label><select><option>Stage I</option><option>Stage II</option><option>Stage IIIA</option><option>Stage IV</option></select></div>
              <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Insurer</label><select><option>AXA Mansard</option><option>NHIA</option><option>Hygeia HMO</option><option>Cash Pay</option></select></div>
            </div>
            <div className="mb-4 [&_label]:mb-1.5 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-slate-600 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:text-slate-800 [&_input]:outline-none [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px] [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-[13px]"><label>Drug (HMO-filtered)</label><select><option>Trastuzumab</option><option>Pertuzumab</option></select></div>
            <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" style={{ width: '100%', justifyContent: 'center' }}><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Send to Network</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionsPage;
