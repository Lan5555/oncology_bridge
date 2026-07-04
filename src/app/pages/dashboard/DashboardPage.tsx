import { DrugSplitChart, InventoryChart, RedistributionEfficiencyChart } from "../../components/Charts";
import { ModalId, PageId } from "../../lib/types";



import type React from 'react';
interface DashboardPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNav, onOpenModal }) => {
  return (
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500" style={{display: 'flex', alignItems: 'center', gap: '16px', flex: '1'}}>
      <div style={{width: '48px', height: '48px', background: 'var(--pl)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)', flexShrink: '0'}}>
        <svg viewBox="0 0 24 24" style={{width: '28px', height: '28px', fill: 'none', stroke: 'currentColor', strokeWidth: '2'}}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <div>
        <h1 style={{fontSize: '24px', letterSpacing: '-0.03em', lineHeight: '1.2'}}>Network Overview</h1>
        <p style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <span style={{color: 'var(--g800)', fontWeight: '600'}}>Lagos–Ibadan Corridor</span> 
          <span style={{color: 'var(--g300)'}}>•</span> June 2026 
          <span style={{color: 'var(--g300)'}}>•</span> <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-blue-100 text-blue-900" style={{borderRadius: '4px', padding: '1px 6px'}}>Network Admin</span>
        </p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 max-[768px]:w-full [&_.btn]:max-[768px]:w-full [&_.btn]:max-[768px]:justify-center">
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" style={{boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}} onClick={() => onOpenModal('modal-export')}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Report</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" style={{boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'}} onClick={() => onNav('pg-scan')}><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></svg>Scan Vial</button>
    </div>
  </div>

  <div className="mb-6 flex flex-wrap items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12.5px] text-slate-800 [&_p]:min-w-0 [&_p]:flex-1 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-amber-500 text-white expiry-banner">
    <svg viewBox="0 0 24 24" style={{flexShrink: '0', marginTop: '2px'}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    <p style={{margin: '0', lineHeight: '1.5'}}><strong style={{fontSize: '14px'}}>7 near-expiry alerts:</strong> Trastuzumab (Lot TZ-2204-B) at LUTH expires in <span style={{color: 'var(--err)', fontWeight: '700'}}>38 days</span> — redistribution recommended.</p>
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" style={{background: 'var(--warn)', fontSize: '11px', padding: '5px 12px', border: 'none'}} onClick={() => onNav('pg-expiry')}>View All</button>
      <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800" style={{fontSize: '11px', padding: '5px 12px', borderColor: 'var(--warn)'}}>Dismiss</button>
    </div>
  </div>

  <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 max-[768px]:grid-cols-1">
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
      <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Network Nodes</span><div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-100 text-blue-900"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div></div>
      <div className="text-2xl font-bold text-slate-950">24 <small style={{fontSize: '12px', color: 'var(--g400)', fontWeight: '400'}}>Hubs</small></div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>100% Uptime</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-100 text-blue-900" style={{width: '100%', boxShadow: '0 0 8px var(--p)'}}></div></div>
    </div>
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
      <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">GS1 Authenticated</span><div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-emerald-50 text-emerald-700"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 15 11"/></svg></div></div>
      <div className="text-2xl font-bold text-slate-950">1,847 <small style={{fontSize: '12px', color: 'var(--g400)', fontWeight: '400'}}>Vials</small></div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>+12% Velocity</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-50 text-emerald-700" style={{width: '88%'}}></div></div>
    </div>
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
      <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Stock-Out Risk</span><div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-amber-50 text-amber-700"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div></div>
      <div className="text-2xl font-bold text-slate-950">28%</div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"><svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>-22% Improvement</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-amber-50 text-amber-700" style={{width: '28%'}}></div></div>
    </div>
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
      <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Value Recovered</span><div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-emerald-50 text-emerald-700"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div></div>
      <div className="text-2xl font-bold text-slate-950">₦42.8M</div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>Redistribution Gain</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-50 text-emerald-700" style={{width: '75%'}}></div></div>
    </div>
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
      <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Chain Integrity</span><div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-emerald-50 text-emerald-700"><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M17 7l-5 5-5-5M7 17l5-5 5 5"/></svg></div></div>
      <div className="text-2xl font-bold text-slate-950">98.4%</div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>Real-time Monitoring</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-50 text-emerald-700" style={{width: '98%'}}></div></div>
    </div>
  </div>

  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-[960px]:grid-cols-1" style={{marginBottom: '1rem'}}>
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div><div className="text-[15px] font-bold text-slate-950">Biologic Inventory — Network Wide</div><div className="mt-0.5 text-xs text-slate-500">Verified vials across 24 facilities</div></div>
      </div>
      <div className="mb-2.5 flex flex-wrap gap-3.5">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: '#0EA5E9'}}></span>Trastuzumab</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: '#06B6D4'}}></span>Rituximab</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: '#10B981'}}></span>Bevacizumab</span>
      </div>
      <div style={{position: 'relative', height: '200px'}}><InventoryChart /></div>
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Drug Availability Split</div><div className="mt-0.5 text-xs text-slate-500">Current stock composition</div></div></div>
      <div className="mb-2.5 flex flex-wrap gap-3.5">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: '#0EA5E9'}}></span>Trastuzumab 38%</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: '#06B6D4'}}></span>Rituximab 27%</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: '#10B981'}}></span>Bevacizumab 19%</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: '#F59E0B'}}></span>Other 16%</span>
      </div>
      <div style={{position: 'relative', height: '170px'}}><DrugSplitChart /></div>
    </div>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{marginBottom: '1rem'}}>
    <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Therapeutic Stock Levels</div><div className="mt-0.5 text-xs text-slate-500">Network-wide availability vs. target safety stock</div></div></div>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 transition hover:border-blue-800 hover:bg-white">
        <div className="mb-3 flex items-start justify-between">
          <div><span className="text-[13px] font-bold leading-tight text-slate-800">Trastuzumab</span><span className="mt-0.5 block text-[11px] text-slate-500">312 vials (HER2+)</span></div>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{color: 'var(--ok)', background: 'var(--okl)'}}>Optimal</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full transition-all duration-700" style={{width: '87%', background: 'var(--ok)'}}></div></div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 transition hover:border-blue-800 hover:bg-white">
        <div className="mb-3 flex items-start justify-between">
          <div><span className="text-[13px] font-bold leading-tight text-slate-800">Rituximab</span><span className="mt-0.5 block text-[11px] text-slate-500">226 vials (CD20)</span></div>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{color: 'var(--p)', background: 'var(--pl)'}}>Stable</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full transition-all duration-700" style={{width: '71%', background: 'var(--p)'}}></div></div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 transition hover:border-blue-800 hover:bg-white">
        <div className="mb-3 flex items-start justify-between">
          <div><span className="text-[13px] font-bold leading-tight text-slate-800">Bevacizumab</span><span className="mt-0.5 block text-[11px] text-slate-500">158 vials (VEGF)</span></div>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{color: 'var(--ac)', background: 'var(--pll)'}}>Fair</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full transition-all duration-700" style={{width: '62%', background: 'var(--ac)'}}></div></div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 transition hover:border-blue-800 hover:bg-white">
        <div className="mb-3 flex items-start justify-between">
          <div><span className="text-[13px] font-bold leading-tight text-slate-800">Pertuzumab</span><span className="mt-0.5 block text-[11px] text-slate-500">89 vials</span></div>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{color: 'var(--warn)', background: 'var(--warnl)'}}>Low</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full transition-all duration-700" style={{width: '41%', background: 'var(--warn)'}}></div></div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-100 p-4 transition hover:border-blue-800 hover:bg-white">
        <div className="mb-3 flex items-start justify-between">
          <div><span className="text-[13px] font-bold leading-tight text-slate-800">Cetuximab</span><span className="mt-0.5 block text-[11px] text-slate-500">44 vials (EGFR)</span></div>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{color: 'var(--err)', background: 'var(--errl)'}}>Critical</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full transition-all duration-700" style={{width: '22%', background: 'var(--err)'}}></div></div>
      </div>
    </div>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
    <div className="mb-4 flex items-center justify-between gap-2">
      <div><div className="text-[15px] font-bold text-slate-950">Network Redistribution Efficiency</div><div className="mt-0.5 text-xs text-slate-500">Days from near-expiry flag to successful transfer</div></div>
      <div style={{display: 'flex', gap: '12px'}}>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: 'var(--p)'}}></span>Avg. Days to Transfer</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-2 w-2 shrink-0 rounded-sm" style={{background: 'var(--ac)'}}></span>Target (48h)</span>
      </div>
    </div>
    <div style={{position: 'relative', height: '240px'}}><RedistributionEfficiencyChart /></div>
  </div>
    </div>
  );
}

export default DashboardPage;
