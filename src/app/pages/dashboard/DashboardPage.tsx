import { DrugSplitChart, InventoryChart, RedistributionEfficiencyChart } from "../../components/Charts";
import { ModalId, PageId } from "../../lib/types";
import { getAccountInfo } from "../../lib/accounts";
import { useProvider } from "../../providers/provider";

const WATCHLIST = [
  { drug: 'Rituximab', lot: 'RX-0912-A', site: 'EKO Hospital', days: 29, qty: 5 },
  { drug: 'Trastuzumab', lot: 'TZ-2204-B', site: 'LUTH', days: 38, qty: 8 },
  { drug: 'Bevacizumab', lot: 'BV-1103-C', site: 'UCH Ibadan', days: 52, qty: 12 },
];



import type React from 'react';
interface DashboardPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNav, onOpenModal }) => {
  const { userData } = useProvider();
  const accountType = userData.user?.account_type;
  const roleLabel = getAccountInfo(accountType)?.label ?? 'Network Admin';
  const isStore = accountType === 'PHARMACY_STORE';
  const canScan = !accountType || isStore;
  return (
    <div className="block animate-fade-up">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap max-md:flex-col max-md:items-stretch max-md:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]" style={{display: 'flex', alignItems: 'center', gap: '16px', flex: '1'}}>
      <div style={{width: '48px', height: '48px', background: 'var(--pl)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p)', flexShrink: '0'}}>
        <svg viewBox="0 0 24 24" style={{width: '28px', height: '28px', fill: 'none', stroke: 'currentColor', strokeWidth: '2'}}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <div>
        <h1 style={{fontSize: '24px', letterSpacing: '-0.03em', lineHeight: '1.2'}}>Network Overview</h1>
        <p style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          <span style={{color: 'var(--g800)', fontWeight: '600'}}>Lagos–Ibadan Corridor</span> 
          <span style={{color: 'var(--g300)'}}>•</span> June 2026 
          <span style={{color: 'var(--g300)'}}>•</span> <span className="inline-flex items-center gap-[3px] px-[9px] py-0.5 rounded-[20px] text-[11px] font-semibold bg-pl text-pdd dk:bg-[rgba(96,165,250,0.16)] dk:text-[#dbeafe]" style={{borderRadius: '4px', padding: '1px 6px'}}>{roleLabel}</span>
        </p>
      </div>
    </div>
    <div className="flex gap-2 flex-wrap max-md:w-full max-md:justify-start">
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" style={{boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}} onClick={() => onOpenModal('modal-export')}><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Report</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" style={{boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', display: canScan ? undefined : 'none'}} onClick={() => onNav('pg-scan')}><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></svg>Scan Vial</button>
    </div>
  </div>

  <div className="flex flex-wrap items-start gap-2.5 px-3.5 py-[11px] rounded-xl mb-6 text-[12.5px] border [&_p]:flex-1 [&_p]:min-w-0 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:mt-px [&_p_strong]:font-bold max-lg:flex-col max-lg:items-start max-lg:[&_svg]:mt-0 max-md:p-3 dk:[&_p]:text-white dk:[&_svg]:stroke-white bg-warnl border-[#fde68a] border-l-[5px] border-l-warn text-[#78350f] [&_p_strong]:text-[#92400e] dk:bg-[#331f04] dk:border-[#a16207] dk:text-[#fef3c7] dk:[&_p_strong]:text-white">
    <svg viewBox="0 0 24 24" style={{flexShrink: '0', marginTop: '2px'}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    <p style={{margin: '0', lineHeight: '1.5'}}><strong style={{fontSize: '14px'}}>7 near-expiry alerts:</strong> Trastuzumab (Lot TZ-2204-B) at LUTH expires in <span style={{color: 'var(--err)', fontWeight: '700'}}>38 days</span> — redistribution recommended.</p>
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" style={{background: 'var(--warn)', fontSize: '11px', padding: '5px 12px', border: 'none'}} onClick={() => onNav('pg-expiry')}>View All</button>
      <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p" style={{fontSize: '11px', padding: '5px 12px', borderColor: 'var(--warn)'}}>Dismiss</button>
    </div>
  </div>

  {isStore && (
    <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] mb-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <div className="text-[15px] font-bold text-g900">Near-expiry watchlist</div>
          <div className="text-xs text-g500 mt-0.5">Stock to sell, transfer or return before it expires</div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap bg-w text-g700 border border-g200 hover:border-p hover:text-p" onClick={() => onNav('pg-expiry')}>View all</button>
      </div>
      <div className="flex flex-col">
        {WATCHLIST.map((row) => (
          <div key={row.lot} className="flex items-center gap-2.5 py-[9px] border-b border-g100 last:border-b-0">
            <span className={`inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap ${row.days <= 30 ? 'bg-errl text-[#7f1d1d] dk:bg-[#4b0f0f] dk:text-[#fee2e2]' : 'bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]'}`}>{row.days} days</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-g800">{row.drug} <span className="font-normal text-g400">× {row.qty} vials</span></div>
              <div className="text-[11px] text-g400">Lot {row.lot} · {row.site}</div>
            </div>
            <button className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border border-g200 text-g600 hover:border-p hover:text-p" onClick={() => onNav('pg-transfers')}>Transfer</button>
          </div>
        ))}
      </div>
    </div>
  )}

  <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[0.9rem] mb-6 max-md:grid-cols-1">
    <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
      <div className="flex justify-between items-center mb-2.5"><span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">Network Nodes</span><div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-pl text-pd"><svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div></div>
      <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">24 <small style={{fontSize: '12px', color: 'var(--g400)', fontWeight: '400'}}>Hubs</small></div>
      <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-good"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>100% Uptime</div>
      <div className="h-[3px] bg-g100 rounded-[2px] mt-2.5 overflow-hidden"><div className="h-full rounded-[2px] transition-[width] duration-1000 ease-[ease] bg-p" style={{width: '100%', boxShadow: '0 0 8px var(--p)'}}></div></div>
    </div>
    <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
      <div className="flex justify-between items-center mb-2.5"><span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">GS1 Authenticated</span><div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-okl text-good"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 12 14 15 11"/></svg></div></div>
      <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">1,847 <small style={{fontSize: '12px', color: 'var(--g400)', fontWeight: '400'}}>Vials</small></div>
      <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-good"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>+12% Velocity</div>
      <div className="h-[3px] bg-g100 rounded-[2px] mt-2.5 overflow-hidden"><div className="h-full rounded-[2px] transition-[width] duration-1000 ease-[ease] bg-good" style={{width: '88%'}}></div></div>
    </div>
    <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
      <div className="flex justify-between items-center mb-2.5"><span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">Stock-Out Risk</span><div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-warnl text-warn"><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div></div>
      <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">28%</div>
      <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-err"><svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>-22% Improvement</div>
      <div className="h-[3px] bg-g100 rounded-[2px] mt-2.5 overflow-hidden"><div className="h-full rounded-[2px] transition-[width] duration-1000 ease-[ease] bg-warn" style={{width: '28%'}}></div></div>
    </div>
    <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
      <div className="flex justify-between items-center mb-2.5"><span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">Value Recovered</span><div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-okl text-good"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div></div>
      <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">₦42.8M</div>
      <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-good"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>Redistribution Gain</div>
      <div className="h-[3px] bg-g100 rounded-[2px] mt-2.5 overflow-hidden"><div className="h-full rounded-[2px] transition-[width] duration-1000 ease-[ease] bg-good" style={{width: '75%'}}></div></div>
    </div>
    <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
      <div className="flex justify-between items-center mb-2.5"><span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">Chain Integrity</span><div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-okl text-good"><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M17 7l-5 5-5-5M7 17l5-5 5 5"/></svg></div></div>
      <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">98.4%</div>
      <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-good"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>Real-time Monitoring</div>
      <div className="h-[3px] bg-g100 rounded-[2px] mt-2.5 overflow-hidden"><div className="h-full rounded-[2px] transition-[width] duration-1000 ease-[ease] bg-good" style={{width: '98%'}}></div></div>
    </div>
  </div>

  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-lg:grid-cols-1" style={{marginBottom: '1rem'}}>
    <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div><div className="text-[15px] font-bold text-g900">Biologic Inventory — Network Wide</div><div className="text-xs text-g500 mt-0.5">Verified vials across 24 facilities</div></div>
      </div>
      <div className="flex gap-3.5 mb-2.5 flex-wrap">
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: '#0EA5E9'}}></span>Trastuzumab</span>
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: '#06B6D4'}}></span>Rituximab</span>
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: '#10B981'}}></span>Bevacizumab</span>
      </div>
      <div style={{position: 'relative', height: '200px'}}><InventoryChart /></div>
    </div>
    <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
      <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Drug Availability Split</div><div className="text-xs text-g500 mt-0.5">Current stock composition</div></div></div>
      <div className="flex gap-3.5 mb-2.5 flex-wrap">
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: '#0EA5E9'}}></span>Trastuzumab 38%</span>
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: '#06B6D4'}}></span>Rituximab 27%</span>
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: '#10B981'}}></span>Bevacizumab 19%</span>
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: '#F59E0B'}}></span>Other 16%</span>
      </div>
      <div style={{position: 'relative', height: '170px'}}><DrugSplitChart /></div>
    </div>
  </div>

  <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4" style={{marginBottom: '1rem'}}>
    <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Therapeutic Stock Levels</div><div className="text-xs text-g500 mt-0.5">Network-wide availability vs. target safety stock</div></div></div>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <div className="p-4 border border-g200 rounded-lg bg-g50 transition duration-200 hover:border-p hover:bg-w">
        <div className="flex justify-between items-start mb-3">
          <div><span className="text-[13px] font-bold text-g800 leading-[1.3]">Trastuzumab</span><span className="block text-[11px] text-g500 mt-0.5">312 vials (HER2+)</span></div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase" style={{color: 'var(--ok)', background: 'var(--okl)'}}>Optimal</span>
        </div>
        <div className="h-1.5 bg-g200 rounded-[10px] overflow-hidden relative mt-2"><div className="h-full rounded-[10px] transition-[width] duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.15),transparent)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] after:animate-shimmer" style={{width: '87%', background: 'var(--ok)'}}></div></div>
      </div>
      <div className="p-4 border border-g200 rounded-lg bg-g50 transition duration-200 hover:border-p hover:bg-w">
        <div className="flex justify-between items-start mb-3">
          <div><span className="text-[13px] font-bold text-g800 leading-[1.3]">Rituximab</span><span className="block text-[11px] text-g500 mt-0.5">226 vials (CD20)</span></div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase" style={{color: 'var(--p)', background: 'var(--pl)'}}>Stable</span>
        </div>
        <div className="h-1.5 bg-g200 rounded-[10px] overflow-hidden relative mt-2"><div className="h-full rounded-[10px] transition-[width] duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.15),transparent)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] after:animate-shimmer" style={{width: '71%', background: 'var(--p)'}}></div></div>
      </div>
      <div className="p-4 border border-g200 rounded-lg bg-g50 transition duration-200 hover:border-p hover:bg-w">
        <div className="flex justify-between items-start mb-3">
          <div><span className="text-[13px] font-bold text-g800 leading-[1.3]">Bevacizumab</span><span className="block text-[11px] text-g500 mt-0.5">158 vials (VEGF)</span></div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase" style={{color: 'var(--ac)', background: 'var(--pll)'}}>Fair</span>
        </div>
        <div className="h-1.5 bg-g200 rounded-[10px] overflow-hidden relative mt-2"><div className="h-full rounded-[10px] transition-[width] duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.15),transparent)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] after:animate-shimmer" style={{width: '62%', background: 'var(--ac)'}}></div></div>
      </div>
      <div className="p-4 border border-g200 rounded-lg bg-g50 transition duration-200 hover:border-p hover:bg-w">
        <div className="flex justify-between items-start mb-3">
          <div><span className="text-[13px] font-bold text-g800 leading-[1.3]">Pertuzumab</span><span className="block text-[11px] text-g500 mt-0.5">89 vials</span></div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase" style={{color: 'var(--warn)', background: 'var(--warnl)'}}>Low</span>
        </div>
        <div className="h-1.5 bg-g200 rounded-[10px] overflow-hidden relative mt-2"><div className="h-full rounded-[10px] transition-[width] duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.15),transparent)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] after:animate-shimmer" style={{width: '41%', background: 'var(--warn)'}}></div></div>
      </div>
      <div className="p-4 border border-g200 rounded-lg bg-g50 transition duration-200 hover:border-p hover:bg-w">
        <div className="flex justify-between items-start mb-3">
          <div><span className="text-[13px] font-bold text-g800 leading-[1.3]">Cetuximab</span><span className="block text-[11px] text-g500 mt-0.5">44 vials (EGFR)</span></div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase" style={{color: 'var(--err)', background: 'var(--errl)'}}>Critical</span>
        </div>
        <div className="h-1.5 bg-g200 rounded-[10px] overflow-hidden relative mt-2"><div className="h-full rounded-[10px] transition-[width] duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.15),transparent)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0)_100%)] after:animate-shimmer" style={{width: '22%', background: 'var(--err)'}}></div></div>
      </div>
    </div>
  </div>

  <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
    <div className="flex items-center justify-between mb-4 gap-2">
      <div><div className="text-[15px] font-bold text-g900">Network Redistribution Efficiency</div><div className="text-xs text-g500 mt-0.5">Days from near-expiry flag to successful transfer</div></div>
      <div style={{display: 'flex', gap: '12px'}}>
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: 'var(--p)'}}></span>Avg. Days to Transfer</span>
        <span className="flex items-center gap-[5px] text-[11px] text-g500"><span className="size-2 rounded-[2px] shrink-0" style={{background: 'var(--ac)'}}></span>Target (48h)</span>
      </div>
    </div>
    <div style={{position: 'relative', height: '240px'}}><RedistributionEfficiencyChart /></div>
  </div>
    </div>
  );
}

export default DashboardPage;
