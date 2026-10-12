import { TemperatureHistoryChart } from "../../components/Charts";


const ColdChainPage = () => {
  return (
    <div className="block animate-fade-up">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap max-md:flex-col max-md:items-stretch max-md:gap-4">
    <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]"><h1>Cold Chain Monitor</h1><p>Real-time temperature tracking · Target 2°C – 8°C</p></div>
    <div className="flex gap-2 flex-wrap max-md:w-full max-md:justify-start"><button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download Log</button></div>
  </div>

  <div className="flex flex-wrap items-start gap-2.5 px-3.5 py-[11px] rounded-xl mb-6 text-[12.5px] border [&_p]:flex-1 [&_p]:min-w-0 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:mt-px [&_p_strong]:font-bold max-lg:flex-col max-lg:items-start max-lg:[&_svg]:mt-0 max-md:p-3 dk:[&_p]:text-white dk:[&_svg]:stroke-white bg-errl border-[#fecaca] border-l-4 border-l-err text-[#7f1d1d] dk:bg-[#4b0f0f] dk:border-[#fca5a5] dk:text-[#fee2e2]">
    <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    <p><strong>Breach detected:</strong> Transit unit T-07 reached 11.2°C. Transfer automatically quarantined. All vials in unit RX-1044-E flagged for physical inspection.</p>
  </div>

  <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1" style={{marginBottom: '1rem'}}>
    <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
      <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Facility Storage Units</div><div className="text-xs text-g500 mt-0.5">Live readings — refreshed every 30s</div></div></div>
      <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
        <div className="border border-g200 rounded-lg p-2.5"><div className="text-[10px] font-bold text-g400 uppercase tracking-[0.5px] mb-1">LUTH Fridge A</div><div className="text-[22px] font-bold tracking-[-0.5px] mb-[5px] text-good">4.2°C</div><div className="h-1 bg-g100 rounded-[2px] overflow-hidden mb-1"><div className="h-full rounded-[2px] bg-good" style={{width: '52%'}}></div></div><div className="text-[10.5px] text-g400">Within 2°C–8°C ✓</div></div>
        <div className="border border-g200 rounded-lg p-2.5"><div className="text-[10px] font-bold text-g400 uppercase tracking-[0.5px] mb-1">LUTH Fridge B</div><div className="text-[22px] font-bold tracking-[-0.5px] mb-[5px] text-good">3.6°C</div><div className="h-1 bg-g100 rounded-[2px] overflow-hidden mb-1"><div className="h-full rounded-[2px] bg-good" style={{width: '45%'}}></div></div><div className="text-[10.5px] text-g400">Within 2°C–8°C ✓</div></div>
        <div className="border border-g200 rounded-lg p-2.5"><div className="text-[10px] font-bold text-g400 uppercase tracking-[0.5px] mb-1">EKO Hospital</div><div className="text-[22px] font-bold tracking-[-0.5px] mb-[5px] text-good">3.8°C</div><div className="h-1 bg-g100 rounded-[2px] overflow-hidden mb-1"><div className="h-full rounded-[2px] bg-good" style={{width: '47%'}}></div></div><div className="text-[10.5px] text-g400">Within 2°C–8°C ✓</div></div>
        <div className="border border-g200 rounded-lg p-2.5"><div className="text-[10px] font-bold text-g400 uppercase tracking-[0.5px] mb-1">UCH Ibadan</div><div className="text-[22px] font-bold tracking-[-0.5px] mb-[5px] text-good">5.1°C</div><div className="h-1 bg-g100 rounded-[2px] overflow-hidden mb-1"><div className="h-full rounded-[2px] bg-good" style={{width: '63%'}}></div></div><div className="text-[10.5px] text-g400">Within 2°C–8°C ✓</div></div>
        <div className="border border-g200 rounded-lg p-2.5"><div className="text-[10px] font-bold text-g400 uppercase tracking-[0.5px] mb-1">Lagos Island GH</div><div className="text-[22px] font-bold tracking-[-0.5px] mb-[5px] text-good">4.7°C</div><div className="h-1 bg-g100 rounded-[2px] overflow-hidden mb-1"><div className="h-full rounded-[2px] bg-good" style={{width: '58%'}}></div></div><div className="text-[10.5px] text-g400">Within 2°C–8°C ✓</div></div>
        <div className="border border-g200 rounded-lg p-2.5" style={{borderColor: 'var(--err)', background: 'var(--errl)', boxShadow: '0 0 0 2px var(--errl)'}}><div className="text-[10px] font-bold text-g400 uppercase tracking-[0.5px] mb-1" style={{color: 'var(--err)'}}>Transit T-07 ⚠</div><div className="text-[22px] font-bold tracking-[-0.5px] mb-[5px] text-err">11.2°C</div><div className="h-1 bg-g100 rounded-[2px] overflow-hidden mb-1"><div className="h-full rounded-[2px] bg-err animate-[shimmer_1.5s_infinite] opacity-80" style={{width: '100%'}}></div></div><div className="text-[10.5px] text-g400" style={{color: 'var(--err)', fontWeight: '600'}}>CRITICAL BREACH</div></div>
      </div>
    </div>

    <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
      <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Temperature History — 24 Hours</div><div className="text-xs text-g500 mt-0.5">All units overlay</div></div></div>
      <div style={{position: 'relative', height: '200px'}}><TemperatureHistoryChart /></div>
    </div>
  </div>

  <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
    <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">Breach Event Log</div><div className="text-xs text-g500 mt-0.5">Automated alerts triggered</div></div></div>
    <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--err)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">Transit T-07 — Temperature breach (11.2°C)</div><div className="text-[11px] text-g400 mt-0.5">Transfer quarantined automatically · Webhook sent to admin panel · RX-1044-E flagged</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">Jun 13 · 10:47</div></div>
    <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0"><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--warn)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">UCH Ibadan Fridge A — Temperature warning (7.9°C)</div><div className="text-[11px] text-g400 mt-0.5">Resolved within 12 minutes · Thermostat adjusted</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">Jun 11 · 14:22</div></div>
    <div className="flex gap-3 p-3 border-b border-g100 transition-colors duration-200 hover:bg-pll last:border-b-0" style={{border: 'none'}}><div className="size-2.5 rounded-full shrink-0 mt-1 shadow-[0_0_0_3px_var(--w),0_0_0_4px_var(--g100)]" style={{background: 'var(--ok)'}}></div><div className="flex-1"><div className="text-[12.5px] font-medium text-g800">All systems nominal — Routine check passed</div><div className="text-[11px] text-g400 mt-0.5">24-facility sweep · 0 anomalies</div></div><div className="text-[11px] text-g400 shrink-0 mt-[3px]">Jun 10 · 08:00</div></div>
  </div>
    </div>
  );
}
export default ColdChainPage;
