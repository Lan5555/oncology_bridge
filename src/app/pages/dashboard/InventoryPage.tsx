import { ModalId, PageId } from "../../lib/types";


interface InventoryPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

export default function InventoryPage({ onNav, onOpenModal }: InventoryPageProps) {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Inventory Ledger</h1><p>GS1-verified stock across all network facilities</p></div>
    <div className="ph-actions">
      <button className="btn btn-outline"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export CSV</button>
      <button className="btn btn-primary" onClick={() => onNav('pg-scan')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Log New Stock</button>
    </div>
  </div>

  <div className="stat-grid" style={{gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))'}}>
    <div className="stat-card"><div className="stat-top"><span className="stat-lbl">Total Vials</span><div className="stat-ico b"><svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg></div></div><div className="stat-val">829</div><div className="stat-delta up"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>+42 today</div></div>
    <div className="stat-card"><div className="stat-top"><span className="stat-lbl">Verified GS1</span><div className="stat-ico g"><svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg></div></div><div className="stat-val">821</div><div className="stat-delta up"><svg viewBox="0 0 24 24"><polyline points="18,15 12,9 6,15"/></svg>99.0% of stock</div></div>
    <div className="stat-card"><div className="stat-top"><span className="stat-lbl">Near Expiry</span><div className="stat-ico a"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div></div><div className="stat-val">7</div><div className="stat-delta neutral">&lt;60 days remaining</div></div>
    <div className="stat-card"><div className="stat-top"><span className="stat-lbl">Quarantined</span><div className="stat-ico r"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div></div><div className="stat-val">1</div><div className="stat-delta down"><svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>Temp breach T-07</div></div>
  </div>

  <div className="card">
    <div className="tabs">
      <button className="tab-btn on"><svg viewBox="0 0 24 24" style={{width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5'}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>All Stock</button>
      <button className="tab-btn"><svg viewBox="0 0 24 24" style={{width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5'}}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Near Expiry</button>
      <button className="tab-btn"><svg viewBox="0 0 24 24" style={{width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>Quarantined</button>
      <button className="tab-btn"><svg viewBox="0 0 24 24" style={{width: '12px', height: '12px', display: 'inline', marginRight: '4px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5'}}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>Redistributed</button>
    </div>
    <div className="tbl-wrap">
      <table style={{minWidth: '900px'}}>
        <thead><tr><th>Drug / GTIN</th><th>Lot Number</th><th>Facility</th><th>Qty</th><th>Expiry Date</th><th>Temp Status</th><th>Status</th><th style={{textAlign: 'right'}}>Actions</th></tr></thead>
        <tbody>
          <tr><td><div className="drug-name">Trastuzumab</div><div className="drug-meta">GTIN 0304817892</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>TZ-2204-B</td><td>LUTH</td><td><strong>8</strong></td><td>Aug 3, 2026</td><td><span className="badge g">2°C–8°C ✓</span></td><td><span className="badge a">Near Expiry</span></td><td style={{textAlign: 'right'}}><button className="btn btn-ghost" style={{padding: '4px'}}>Transfer</button></td></tr>
          <tr><td><div className="drug-name">Rituximab</div><div className="drug-meta">GTIN 0812944031</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>RX-0912-A</td><td>EKO Hospital</td><td><strong>5</strong></td><td>Jul 28, 2026</td><td><span className="badge g">2°C–8°C ✓</span></td><td><span className="badge r">Critical Expiry</span></td><td style={{textAlign: 'right'}}><button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '10px'}}>Redistribute</button></td></tr>
          <tr><td><div className="drug-name">Bevacizumab</div><div className="drug-meta">GTIN 0519273447</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>BV-1103-C</td><td>UCH Ibadan</td><td><strong>12</strong></td><td>Sep 12, 2026</td><td><span className="badge g">2°C–8°C ✓</span></td><td><span className="badge a">Near Expiry</span></td><td style={{textAlign: 'right'}}><button className="btn btn-ghost" style={{padding: '4px'}}>Transfer</button></td></tr>
          <tr><td><div className="drug-name">Trastuzumab</div><div className="drug-meta">GTIN 0304817893</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>TZ-2211-A</td><td>Lagos Island GH</td><td><strong>20</strong></td><td>Jan 15, 2027</td><td><span className="badge g">2°C–8°C ✓</span></td><td><span className="badge g">In Stock</span></td><td style={{textAlign: 'right'}}><button className="btn btn-ghost" style={{padding: '4px'}}>View</button></td></tr>
          <tr><td><div className="drug-name">Pertuzumab</div><div className="drug-meta">GTIN 0321847920</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>PT-0707-D</td><td>Lagos Island GH</td><td><strong>3</strong></td><td>Sep 5, 2026</td><td><span className="badge g">2°C–8°C ✓</span></td><td><span className="badge a">Near Expiry</span></td><td style={{textAlign: 'right'}}><button className="btn btn-ghost" style={{padding: '4px'}}>Transfer</button></td></tr>
          <tr><td><div className="drug-name">Rituximab</div><div className="drug-meta">GTIN 0812945002</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>RX-1044-E</td><td>LASUTH</td><td><strong>7</strong></td><td>Jul 22, 2026</td><td><span className="badge r">Breach — 11.2°C</span></td><td><span className="badge r">Quarantined</span></td><td style={{textAlign: 'right'}}><button className="btn btn-danger" style={{padding: '4px 8px', fontSize: '10px'}}>Inspect</button></td></tr>
          <tr><td><div className="drug-name">Cetuximab</div><div className="drug-meta">GTIN 0621847001</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>CE-0310-B</td><td>LUTH</td><td><strong>9</strong></td><td>Mar 20, 2027</td><td><span className="badge g">2°C–8°C ✓</span></td><td><span className="badge g">In Stock</span></td><td style={{textAlign: 'right'}}><button className="btn btn-ghost" style={{padding: '4px'}}>View</button></td></tr>
          <tr><td><div className="drug-name">Bevacizumab</div><div className="drug-meta">GTIN 0519273448</div></td><td style={{fontFamily: 'monospace', fontSize: '12px'}}>BV-1210-F</td><td>UCH Ibadan</td><td><strong>15</strong></td><td>Feb 8, 2027</td><td><span className="badge g">2°C–8°C ✓</span></td><td><span className="badge g">In Stock</span></td><td style={{textAlign: 'right'}}><button className="btn btn-ghost" style={{padding: '4px'}}>View</button></td></tr>
        </tbody>
      </table>
    </div>
  </div>
    </div>
  );
}
