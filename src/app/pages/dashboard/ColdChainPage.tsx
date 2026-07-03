import { TemperatureHistoryChart } from "../../components/Charts";


const ColdChainPage = () => {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Cold Chain Monitor</h1><p>Real-time temperature tracking · Target 2°C – 8°C</p></div>
    <div className="ph-actions"><button className="btn btn-outline"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download Log</button></div>
  </div>

  <div className="alert err">
    <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    <p><strong>Breach detected:</strong> Transit unit T-07 reached 11.2°C. Transfer automatically quarantined. All vials in unit RX-1044-E flagged for physical inspection.</p>
  </div>

  <div className="g2" style={{marginBottom: '1rem'}}>
    <div className="card">
      <div className="ch"><div><div className="ct">Facility Storage Units</div><div className="cs">Live readings — refreshed every 30s</div></div></div>
      <div className="cc-grid">
        <div className="cc-unit"><div className="cc-name">LUTH Fridge A</div><div className="cc-temp ok">4.2°C</div><div className="cc-bar"><div className="cc-fill ok" style={{width: '52%'}}></div></div><div className="cc-range">Within 2°C–8°C ✓</div></div>
        <div className="cc-unit"><div className="cc-name">LUTH Fridge B</div><div className="cc-temp ok">3.6°C</div><div className="cc-bar"><div className="cc-fill ok" style={{width: '45%'}}></div></div><div className="cc-range">Within 2°C–8°C ✓</div></div>
        <div className="cc-unit"><div className="cc-name">EKO Hospital</div><div className="cc-temp ok">3.8°C</div><div className="cc-bar"><div className="cc-fill ok" style={{width: '47%'}}></div></div><div className="cc-range">Within 2°C–8°C ✓</div></div>
        <div className="cc-unit"><div className="cc-name">UCH Ibadan</div><div className="cc-temp ok">5.1°C</div><div className="cc-bar"><div className="cc-fill ok" style={{width: '63%'}}></div></div><div className="cc-range">Within 2°C–8°C ✓</div></div>
        <div className="cc-unit"><div className="cc-name">Lagos Island GH</div><div className="cc-temp ok">4.7°C</div><div className="cc-bar"><div className="cc-fill ok" style={{width: '58%'}}></div></div><div className="cc-range">Within 2°C–8°C ✓</div></div>
        <div className="cc-unit" style={{borderColor: 'var(--err)', background: '#FFF5F5', boxShadow: '0 0 0 2px var(--errl)'}}><div className="cc-name" style={{color: 'var(--err)'}}>Transit T-07 ⚠</div><div className="cc-temp err">11.2°C</div><div className="cc-bar"><div className="cc-fill err pulse" style={{width: '100%'}}></div></div><div className="cc-range" style={{color: 'var(--err)', fontWeight: '600'}}>CRITICAL BREACH</div></div>
      </div>
    </div>

    <div className="card">
      <div className="ch"><div><div className="ct">Temperature History — 24 Hours</div><div className="cs">All units overlay</div></div></div>
      <div style={{position: 'relative', height: '200px'}}><TemperatureHistoryChart /></div>
    </div>
  </div>

  <div className="card">
    <div className="ch"><div><div className="ct">Breach Event Log</div><div className="cs">Automated alerts triggered</div></div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--err)'}}></div><div className="log-content"><div className="log-action">Transit T-07 — Temperature breach (11.2°C)</div><div className="log-meta">Transfer quarantined automatically · Webhook sent to admin panel · RX-1044-E flagged</div></div><div className="log-time">Jun 13 · 10:47</div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--warn)'}}></div><div className="log-content"><div className="log-action">UCH Ibadan Fridge A — Temperature warning (7.9°C)</div><div className="log-meta">Resolved within 12 minutes · Thermostat adjusted</div></div><div className="log-time">Jun 11 · 14:22</div></div>
    <div className="log-item" style={{border: 'none'}}><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">All systems nominal — Routine check passed</div><div className="log-meta">24-facility sweep · 0 anomalies</div></div><div className="log-time">Jun 10 · 08:00</div></div>
  </div>
    </div>
  );
}
export default ColdChainPage;
