import type React from 'react';
import { toast } from 'sonner';

const NetworkPage: React.FC = () => {
  return (
    <div className="block animate-fade-up">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap max-md:flex-col max-md:items-stretch max-md:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]"><h1>Network Map</h1><p>24 active facilities · Lagos–Ibadan Corridor</p></div>
  </div>
  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-lg:grid-cols-1">
    <div className="flex flex-col gap-4">
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4" style={{minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--pll),var(--pl))', borderStyle: 'dashed', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
          <div className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>● 18 Donor Hubs</div>
          <div className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-pl text-pdd dk:bg-[rgba(96,165,250,0.16)] dk:text-[#dbeafe]" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>● 6 Recipient Hubs</div>
        </div>
        <div style={{textAlign: 'center', color: 'var(--g400)', zIndex: '1'}}>
          <svg style={{width: '64px', height: '64px', fill: 'none', stroke: 'var(--p)', strokeWidth: '1', marginBottom: '16px', opacity: '0.6'}} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <p style={{fontSize: '15px', fontWeight: '600', color: 'var(--g800)', marginBottom: '6px'}}>Geospatial Network View</p>
          <p style={{fontSize: '12.5px', maxWidth: '300px', lineHeight: '1.6'}}>Live visualization of the 120km Lagos–Ibadan oncology corridor. Showing real-time stock movement and transit routes.</p>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" style={{marginTop: '20px'}} onClick={() => toast.info("Map Engine will be initialized here.")}>Initialize Map Engine</button>
        </div>
        
        <div style={{position: 'absolute', inset: '0', opacity: '0.05', backgroundImage: 'radial-gradient(var(--p) 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
      </div>
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Route Analytics</div><div className="text-xs text-g500 mt-0.5">Logistics performance</div></div></div>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <div style={{textAlign: 'center', padding: '10px', borderRight: '1px solid var(--g100)'}}>
            <div style={{fontSize: '11px', color: 'var(--g400)', textTransform: 'uppercase'}}>Avg. Distance</div><div style={{fontSize: '18px', fontWeight: '700', color: 'var(--g800)'}}>14.2 km</div>
          </div>
          <div style={{textAlign: 'center', padding: '10px', borderRight: '1px solid var(--g100)'}}>
            <div style={{fontSize: '11px', color: 'var(--g400)', textTransform: 'uppercase'}}>Transit Time</div><div style={{fontSize: '18px', fontWeight: '700', color: 'var(--g800)'}}>1.4 hrs</div>
          </div>
          <div style={{textAlign: 'center', padding: '10px'}}>
            <div style={{fontSize: '11px', color: 'var(--g400)', textTransform: 'uppercase'}}>Fuel Saved</div><div style={{fontSize: '18px', fontWeight: '700', color: 'var(--ok)'}}>₦1.2M</div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-4">
      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Facility List</div><div className="text-xs text-g500 mt-0.5">24 nodes active</div></div></div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 border border-g200 rounded-lg transition duration-150 cursor-pointer hover:border-p hover:shadow-[0_2px_8px_rgba(14,165,233,0.07)]" style={{marginBottom: '8px'}}><div className="size-9 rounded-[9px] flex items-center justify-center text-xs font-bold shrink-0" style={{background: 'var(--pl)', color: 'var(--pd)'}}>LU</div><div><div className="text-[13px] font-semibold text-g800">LUTH</div><div className="text-[11px] text-g400 mt-px">Anchor Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]">Online</span></div></div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 border border-g200 rounded-lg transition duration-150 cursor-pointer hover:border-p hover:shadow-[0_2px_8px_rgba(14,165,233,0.07)]" style={{marginBottom: '8px'}}><div className="size-9 rounded-[9px] flex items-center justify-center text-xs font-bold shrink-0" style={{background: 'var(--pl)', color: 'var(--pd)'}}>EK</div><div><div className="text-[13px] font-semibold text-g800">EKO Hospital</div><div className="text-[11px] text-g400 mt-px">Anchor Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]">Online</span></div></div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 border border-g200 rounded-lg transition duration-150 cursor-pointer hover:border-p hover:shadow-[0_2px_8px_rgba(14,165,233,0.07)]" style={{marginBottom: '8px'}}><div className="size-9 rounded-[9px] flex items-center justify-center text-xs font-bold shrink-0" style={{background: 'var(--okl)', color: 'var(--ok)'}}>UC</div><div><div className="text-[13px] font-semibold text-g800">UCH Ibadan</div><div className="text-[11px] text-g400 mt-px">Anchor Hub · Ibadan</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]">Online</span></div></div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 border border-g200 rounded-lg transition duration-150 cursor-pointer hover:border-p hover:shadow-[0_2px_8px_rgba(14,165,233,0.07)]" style={{marginBottom: '8px'}}><div className="size-9 rounded-[9px] flex items-center justify-center text-xs font-bold shrink-0" style={{background: 'var(--warnl)', color: 'var(--warn)'}}>LA</div><div><div className="text-[13px] font-semibold text-g800">LASUTH</div><div className="text-[11px] text-g400 mt-px">Recipient Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-warnl text-[#78350f] dk:bg-[#331f04] dk:text-[#fef3c7]">Alert</span></div></div>
        <div className="flex items-center gap-2.5 px-3 py-2.5 border border-g200 rounded-lg transition duration-150 cursor-pointer hover:border-p hover:shadow-[0_2px_8px_rgba(14,165,233,0.07)]"><div className="size-9 rounded-[9px] flex items-center justify-center text-xs font-bold shrink-0" style={{background: 'var(--pl)', color: 'var(--pd)'}}>LI</div><div><div className="text-[13px] font-semibold text-g800">Lagos Island GH</div><div className="text-[11px] text-g400 mt-px">Recipient Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-okl text-[#065f46] dk:bg-[#064e3b] dk:text-[#d1fae5]">Online</span></div></div>
      </div>
    </div>
  </div>
    </div>
  );
}

export default NetworkPage;
