import type React from 'react';

const NetworkPage: React.FC = () => {
  return (
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500"><h1>Network Map</h1><p>24 active facilities · Lagos–Ibadan Corridor</p></div>
  </div>
  <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-[960px]:grid-cols-1">
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5" style={{minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--pll),var(--pl))', borderStyle: 'dashed', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
          <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-emerald-50 text-emerald-700" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>● 18 Donor Hubs</div>
          <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-blue-100 text-blue-900" style={{boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>● 6 Recipient Hubs</div>
        </div>
        <div style={{textAlign: 'center', color: 'var(--g400)', zIndex: '1'}}>
          <svg style={{width: '64px', height: '64px', fill: 'none', stroke: 'var(--p)', strokeWidth: '1', marginBottom: '16px', opacity: '0.6'}} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <p style={{fontSize: '15px', fontWeight: '600', color: 'var(--g800)', marginBottom: '6px'}}>Geospatial Network View</p>
          <p style={{fontSize: '12.5px', maxWidth: '300px', lineHeight: '1.6'}}>Live visualization of the 120km Lagos–Ibadan oncology corridor. Showing real-time stock movement and transit routes.</p>
          <button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900" style={{marginTop: '20px'}}>Initialize Map Engine</button>
        </div>
        
        <div style={{position: 'absolute', inset: '0', opacity: '0.05', backgroundImage: 'radial-gradient(var(--p) 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Route Analytics</div><div className="mt-0.5 text-xs text-slate-500">Logistics performance</div></div></div>
        <div className="grid grid-cols-3 gap-4 max-[768px]:grid-cols-1">
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Facility List</div><div className="mt-0.5 text-xs text-slate-500">24 nodes active</div></div></div>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-blue-800 hover:shadow-md hover:shadow-sky-500/10" style={{marginBottom: '8px'}}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{background: 'var(--pl)', color: 'var(--pd)'}}>LU</div><div><div className="text-[13px] font-semibold text-slate-800">LUTH</div><div className="mt-0.5 text-[11px] text-slate-400">Anchor Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-emerald-50 text-emerald-700">Online</span></div></div>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-blue-800 hover:shadow-md hover:shadow-sky-500/10" style={{marginBottom: '8px'}}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{background: 'var(--pl)', color: 'var(--pd)'}}>EK</div><div><div className="text-[13px] font-semibold text-slate-800">EKO Hospital</div><div className="mt-0.5 text-[11px] text-slate-400">Anchor Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-emerald-50 text-emerald-700">Online</span></div></div>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-blue-800 hover:shadow-md hover:shadow-sky-500/10" style={{marginBottom: '8px'}}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{background: 'var(--okl)', color: 'var(--ok)'}}>UC</div><div><div className="text-[13px] font-semibold text-slate-800">UCH Ibadan</div><div className="mt-0.5 text-[11px] text-slate-400">Anchor Hub · Ibadan</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-emerald-50 text-emerald-700">Online</span></div></div>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-blue-800 hover:shadow-md hover:shadow-sky-500/10" style={{marginBottom: '8px'}}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{background: 'var(--warnl)', color: 'var(--warn)'}}>LA</div><div><div className="text-[13px] font-semibold text-slate-800">LASUTH</div><div className="mt-0.5 text-[11px] text-slate-400">Recipient Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-amber-50 text-amber-700">Alert</span></div></div>
        <div className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-blue-800 hover:shadow-md hover:shadow-sky-500/10"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{background: 'var(--pl)', color: 'var(--pd)'}}>LI</div><div><div className="text-[13px] font-semibold text-slate-800">Lagos Island GH</div><div className="mt-0.5 text-[11px] text-slate-400">Recipient Hub · Lagos</div></div><div className="ml-auto shrink-0"><span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-[''] bg-emerald-50 text-emerald-700">Online</span></div></div>
      </div>
    </div>
  </div>
    </div>
  );
}

export default NetworkPage;
