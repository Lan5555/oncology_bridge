import type React from 'react';

const ExpiryPage: React.FC = () => {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Near-Expiry Alerts</h1><p>Items flagged within 60 days of expiry — auto-broadcast to recipient hubs</p></div>
  </div>

  <div className="alert warn">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
    <p><strong>7 items</strong> require redistribution within the next 60 days to prevent wastage. Facilities within 50-mile radius have been notified.</p>
  </div>

  <div className="card">
    <div className="ch"><div><div className="ct">Near-Expiry Stock Register</div><div className="cs">Sorted by urgency</div></div></div>
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>Drug</th><th>Lot Number</th><th>Donor Facility</th><th>Qty</th><th>Expiry</th><th>Urgency</th><th>Nearest Recipient</th><th>Action</th></tr></thead>
        <tbody>
          <tr style={{background: 'var(--errl)'}}><td><div className="drug-name">Rituximab</div><div className="drug-meta">GTIN 0812945002</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>RX-1044-E</td><td>LASUTH</td><td>7</td><td>Jul 22, 2026</td><td><span className="badge r" style={{padding: '4px 10px', border: '1px solid #fecaca'}}>Critical: 26 days</span></td><td>EKO Hospital · 8.1km</td><td><button className="btn btn-primary" style={{padding: '5px 10px', fontSize: '11px', background: 'var(--err)', border: 'none'}}>Priority Transfer</button></td></tr>
          <tr style={{background: 'var(--errl)'}}><td><div className="drug-name">Rituximab</div><div className="drug-meta">GTIN 0812944031</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>RX-0912-A</td><td>EKO Hospital</td><td>5</td><td>Jul 28, 2026</td><td><span className="badge r" style={{padding: '4px 10px', border: '1px solid #fecaca'}}>Critical: 32 days</span></td><td>LUTH · 7.8km</td><td><button className="btn btn-primary" style={{padding: '5px 10px', fontSize: '11px', background: 'var(--err)', border: 'none'}}>Priority Transfer</button></td></tr>
          <tr><td><div className="drug-name">Trastuzumab</div><div className="drug-meta">GTIN 0304817892</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>TZ-2204-B</td><td>LUTH</td><td>8</td><td>Aug 3, 2026</td><td><span className="badge a" style={{padding: '4px 10px'}}>Warning: 38 days</span></td><td>Lagos Island GH · 14.2km</td><td><button className="btn btn-primary" style={{padding: '5px 10px', fontSize: '11px'}}>Request Transfer</button></td></tr>
          <tr><td><div className="drug-name">Pertuzumab</div><div className="drug-meta">GTIN 0321847920</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>PT-0707-D</td><td>Lagos Island GH</td><td>3</td><td>Sep 5, 2026</td><td><span className="badge a" style={{padding: '4px 10px'}}>Warning: 41 days</span></td><td>LUTH · 14.2km</td><td><button className="btn btn-primary" style={{padding: '5px 10px', fontSize: '11px'}}>Request Transfer</button></td></tr>
          <tr><td><div className="drug-name">Bevacizumab</div><div className="drug-meta">GTIN 0519273447</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>BV-1103-C</td><td>UCH Ibadan</td><td>12</td><td>Sep 12, 2026</td><td><span className="badge a" style={{padding: '4px 10px'}}>Warning: 48 days</span></td><td>LASUTH · 22km</td><td><button className="btn btn-primary" style={{padding: '5px 10px', fontSize: '11px'}}>Request Transfer</button></td></tr>
        </tbody>
      </table>
    </div>
  </div>
    </div>
  );
}

export default ExpiryPage;
