
export default function NetworkPage() {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Network Map</h1><p>24 active facilities · Lagos–Ibadan Corridor</p></div>
  </div>
  <div className="g-main">
    <div className="g-stack">
      <div className="card" style={{minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--pll),var(--pl))', borderStyle: 'dashed', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
          <div className="badge g" style={{background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>● 18 Donor Hubs</div>
          <div className="badge b" style={{background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>● 6 Recipient Hubs</div>
        </div>
        <div style={{textAlign: 'center', color: 'var(--g400)', zIndex: '1'}}>
          <svg style={{width: '64px', height: '64px', fill: 'none', stroke: 'var(--p)', strokeWidth: '1', marginBottom: '16px', opacity: '0.6'}} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <p style={{fontSize: '15px', fontWeight: '600', color: 'var(--g800)', marginBottom: '6px'}}>Geospatial Network View</p>
          <p style={{fontSize: '12.5px', maxWidth: '300px', lineHeight: '1.6'}}>Live visualization of the 120km Lagos–Ibadan oncology corridor. Showing real-time stock movement and transit routes.</p>
          <button className="btn btn-primary" style={{marginTop: '20px'}}>Initialize Map Engine</button>
        </div>
        
        <div style={{position: 'absolute', inset: '0', opacity: '0.05', backgroundImage: 'radial-gradient(var(--p) 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
      </div>
      <div className="card">
        <div className="ch"><div><div className="ct">Route Analytics</div><div className="cs">Logistics performance</div></div></div>
        <div className="g3">
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
    <div className="g-stack">
      <div className="card">
        <div className="ch"><div><div className="ct">Facility List</div><div className="cs">24 nodes active</div></div></div>
        <div className="fac-card" style={{marginBottom: '8px'}}><div className="fac-avatar" style={{background: 'var(--pl)', color: 'var(--pd)'}}>LU</div><div><div className="fac-name">LUTH</div><div className="fac-type">Anchor Hub · Lagos</div></div><div className="fac-status"><span className="badge g">Online</span></div></div>
        <div className="fac-card" style={{marginBottom: '8px'}}><div className="fac-avatar" style={{background: 'var(--pl)', color: 'var(--pd)'}}>EK</div><div><div className="fac-name">EKO Hospital</div><div className="fac-type">Anchor Hub · Lagos</div></div><div className="fac-status"><span className="badge g">Online</span></div></div>
        <div className="fac-card" style={{marginBottom: '8px'}}><div className="fac-avatar" style={{background: 'var(--okl)', color: 'var(--ok)'}}>UC</div><div><div className="fac-name">UCH Ibadan</div><div className="fac-type">Anchor Hub · Ibadan</div></div><div className="fac-status"><span className="badge g">Online</span></div></div>
        <div className="fac-card" style={{marginBottom: '8px'}}><div className="fac-avatar" style={{background: 'var(--warnl)', color: 'var(--warn)'}}>LA</div><div><div className="fac-name">LASUTH</div><div className="fac-type">Recipient Hub · Lagos</div></div><div className="fac-status"><span className="badge a">Alert</span></div></div>
        <div className="fac-card"><div className="fac-avatar" style={{background: 'var(--pl)', color: 'var(--pd)'}}>LI</div><div><div className="fac-name">Lagos Island GH</div><div className="fac-type">Recipient Hub · Lagos</div></div><div className="fac-status"><span className="badge g">Online</span></div></div>
      </div>
    </div>
  </div>
    </div>
  );
}
