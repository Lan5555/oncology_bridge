import { TemperatureHistoryChart } from "../../components/Charts";


const ColdChainPage = () => {
  return (
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500"><h1>Cold Chain Monitor</h1><p>Real-time temperature tracking · Target 2°C – 8°C</p></div>
    <div className="flex flex-wrap gap-2 max-[768px]:w-full [&_.btn]:max-[768px]:w-full [&_.btn]:max-[768px]:justify-center"><button className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download Log</button></div>
  </div>

  <div className="mb-6 flex flex-wrap items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12.5px] text-slate-800 [&_p]:min-w-0 [&_p]:flex-1 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-red-500 text-white">
    <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    <p><strong>Breach detected:</strong> Transit unit T-07 reached 11.2°C. Transfer automatically quarantined. All vials in unit RX-1044-E flagged for physical inspection.</p>
  </div>

  <div className="grid grid-cols-2 gap-4 max-[960px]:grid-cols-1" style={{marginBottom: '1rem'}}>
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Facility Storage Units</div><div className="mt-0.5 text-xs text-slate-500">Live readings — refreshed every 30s</div></div></div>
      <div className="grid grid-cols-2 gap-2 max-[768px]:grid-cols-1">
        <div className="rounded-lg border border-slate-200 p-2.5"><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">LUTH Fridge A</div><div className="mb-1 text-[22px] font-bold bg-emerald-600 text-white">4.2°C</div><div className="mb-1 mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 text-white" style={{width: '52%'}}></div></div><div className="text-[10.5px] text-slate-400">Within 2°C–8°C ✓</div></div>
        <div className="rounded-lg border border-slate-200 p-2.5"><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">LUTH Fridge B</div><div className="mb-1 text-[22px] font-bold bg-emerald-600 text-white">3.6°C</div><div className="mb-1 mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 text-white" style={{width: '45%'}}></div></div><div className="text-[10.5px] text-slate-400">Within 2°C–8°C ✓</div></div>
        <div className="rounded-lg border border-slate-200 p-2.5"><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">EKO Hospital</div><div className="mb-1 text-[22px] font-bold bg-emerald-600 text-white">3.8°C</div><div className="mb-1 mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 text-white" style={{width: '47%'}}></div></div><div className="text-[10.5px] text-slate-400">Within 2°C–8°C ✓</div></div>
        <div className="rounded-lg border border-slate-200 p-2.5"><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">UCH Ibadan</div><div className="mb-1 text-[22px] font-bold bg-emerald-600 text-white">5.1°C</div><div className="mb-1 mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 text-white" style={{width: '63%'}}></div></div><div className="text-[10.5px] text-slate-400">Within 2°C–8°C ✓</div></div>
        <div className="rounded-lg border border-slate-200 p-2.5"><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Lagos Island GH</div><div className="mb-1 text-[22px] font-bold bg-emerald-600 text-white">4.7°C</div><div className="mb-1 mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 text-white" style={{width: '58%'}}></div></div><div className="text-[10.5px] text-slate-400">Within 2°C–8°C ✓</div></div>
        <div className="rounded-lg border border-slate-200 p-2.5" style={{borderColor: 'var(--err)', background: 'var(--errl)', boxShadow: '0 0 0 2px var(--errl)'}}><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400" style={{color: 'var(--err)'}}>Transit T-07 ⚠</div><div className="mb-1 text-[22px] font-bold bg-red-500 text-white">11.2°C</div><div className="mb-1 mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-red-500 text-white animate-pulse" style={{width: '100%'}}></div></div><div className="text-[10.5px] text-slate-400" style={{color: 'var(--err)', fontWeight: '600'}}>CRITICAL BREACH</div></div>
      </div>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Temperature History — 24 Hours</div><div className="mt-0.5 text-xs text-slate-500">All units overlay</div></div></div>
      <div style={{position: 'relative', height: '200px'}}><TemperatureHistoryChart /></div>
    </div>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
    <div className="mb-4 flex items-center justify-between gap-2"><div><div className="text-[15px] font-bold text-slate-950">Breach Event Log</div><div className="mt-0.5 text-xs text-slate-500">Automated alerts triggered</div></div></div>
    <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--err)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">Transit T-07 — Temperature breach (11.2°C)</div><div className="mt-0.5 text-[11px] text-slate-400">Transfer quarantined automatically · Webhook sent to admin panel · RX-1044-E flagged</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">Jun 13 · 10:47</div></div>
    <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--warn)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">UCH Ibadan Fridge A — Temperature warning (7.9°C)</div><div className="mt-0.5 text-[11px] text-slate-400">Resolved within 12 minutes · Thermostat adjusted</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">Jun 11 · 14:22</div></div>
    <div className="flex gap-3 border-b border-slate-100 p-3 transition hover:bg-slate-50 last:border-b-0" style={{border: 'none'}}><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-slate-800">All systems nominal — Routine check passed</div><div className="mt-0.5 text-[11px] text-slate-400">24-facility sweep · 0 anomalies</div></div><div className="mt-1 shrink-0 text-[11px] text-slate-400">Jun 10 · 08:00</div></div>
  </div>
    </div>
  );
}
export default ColdChainPage;
