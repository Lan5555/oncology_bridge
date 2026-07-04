
const AuditPage = () => {
  return (
    <div className="page active">
      <div className="ph">
    <div className="ph-left"><h1>Audit Log</h1><p>Immutable activity trail · AES-256 field-level encryption</p></div>
    <div className="ph-actions">
      <button className="btn btn-outline"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Log</button>
    </div>
  </div>
  <div className="card">
    <div className="ch"><div><div className="ct">Event Stream</div><div className="cs">All system actions · All roles · Real-time</div></div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--err)'}}></div><div className="log-content"><div className="log-action">BREACH ALERT — Transit T-07 temperature exceeded 8°C</div><div className="log-meta">System · Transfer ticket quarantined · Webhook sent to admin · Batch RX-1044-E flagged</div></div><div className="log-time">Jun 13 · 10:47</div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--p)'}}></div><div className="log-content"><div className="log-action">GS1 Scan — TZ-2204-A verified clean (Pharm. Usman)</div><div className="log-meta">Role A · GTIN 0304817892 · LUTH · WAOAB Security cleared</div></div><div className="log-time">Jun 13 · 10:31</div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">Transfer approved — Trastuzumab ×4 (Dr. Okonkwo)</div><div className="log-meta">Role C · Lagos Island GH → LASUTH · transfer_ticket #T-094</div></div><div className="log-time">Jun 13 · 09:55</div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--p)'}}></div><div className="log-content"><div className="log-action">Prescription sent to network — Patient #0492</div><div className="log-meta">ICD-10 C50.4 · AXA Mansard · Trastuzumab ×2 · Clinical JSON packaged</div></div><div className="log-time">Jun 13 · 09:30</div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--warn)'}}></div><div className="log-content"><div className="log-action">Near-expiry flag — RX-0912-A (32 days remaining)</div><div className="log-meta">System · item_status set to near_expiry · Broadcast to 6 recipient hubs within 50 miles</div></div><div className="log-time">Jun 13 · 08:00</div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">Stock ingested — 15 vials Trastuzumab (Pharm. Nwosu)</div><div className="log-meta">Role A · POS webhook · Pharmacy X · Batch TZ-2211-A · Jan 2027</div></div><div className="log-time">Jun 12 · 17:10</div></div>
    <div className="log-item"><div className="log-dot" style={{background: 'var(--p)'}}></div><div className="log-content"><div className="log-action">New facility onboarded — Lagos Island GH</div><div className="log-meta">Role C · Dr. Sotunde · IP whitelist set · 2 devices paired · Role B assigned</div></div><div className="log-time">Jun 11 · 11:00</div></div>
    <div className="log-item" style={{border: 'none'}}><div className="log-dot" style={{background: 'var(--ok)'}}></div><div className="log-content"><div className="log-action">JWT token renewed — Pharm. Usman</div><div className="log-meta">Session sliding-window renewal · EKO Hospital device</div></div><div className="log-time">Jun 11 · 09:05</div></div>
  </div>
    </div>
  );
}
export default AuditPage;
