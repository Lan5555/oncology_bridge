'use client';

import { PageId } from "../lib/types";



interface SidebarProps {
  activePage: PageId;
  sidebarOpen: boolean;
  onNav: (id: PageId) => void;
}

export default function Sidebar({ activePage, sidebarOpen, onNav }: SidebarProps) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sb-section">
        <div className="sb-label">Overview</div>
        <button className={`sb-item ${activePage === 'pg-dashboard' ? 'active' : ''}`} onClick={() => onNav('pg-dashboard')}>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </button>
        <button className={`sb-item ${activePage === 'pg-network' ? 'active' : ''}`} onClick={() => onNav('pg-network')}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v3M12 11l-6 5M12 11l6 5"/></svg>
          Network Map
        </button>
      </div>
    
      <div className="sb-section">
        <div className="sb-label">Pharmacy Tools</div>
        <button className={`sb-item ${activePage === 'pg-scan' ? 'active' : ''}`} onClick={() => onNav('pg-scan')}>
          <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></svg>
          Scan GS1 Barcode
        </button>
        <button className={`sb-item ${activePage === 'pg-inventory' ? 'active' : ''}`} onClick={() => onNav('pg-inventory')}>
          <svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="2"/></svg>
          Inventory Ledger
        </button>
        <button className={`sb-item ${activePage === 'pg-transfers' ? 'active' : ''}`} onClick={() => onNav('pg-transfers')}>
          <svg viewBox="0 0 24 24"><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          Redistribution
          <span className="sb-pip err">3</span>
        </button>
      </div>
    
      <div className="sb-section">
        <div className="sb-label">Clinical</div>
        <button className={`sb-item ${activePage === 'pg-prescriptions' ? 'active' : ''}`} onClick={() => onNav('pg-prescriptions')}>
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
          Prescriptions
        </button>
        <button className={`sb-item ${activePage === 'pg-coldchain' ? 'active' : ''}`} onClick={() => onNav('pg-coldchain')}>
          <svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M17 7l-5 5-5-5M7 17l5-5 5 5"/></svg>
          Cold Chain Monitor
          <span className="sb-pip err pulse">1</span>
        </button>
        <button className={`sb-item ${activePage === 'pg-expiry' ? 'active' : ''}`} onClick={() => onNav('pg-expiry')}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          Near-Expiry
          <span className="sb-pip warn">7</span>
        </button>
      </div>
    
      <div className="sb-section">
        <div className="sb-label">Admin</div>
        <button className={`sb-item ${activePage === 'pg-facilities' ? 'active' : ''}`} onClick={() => onNav('pg-facilities')}>
          <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Facility Access
        </button>
        <button className={`sb-item ${activePage === 'pg-users' ? 'active' : ''}`} onClick={() => onNav('pg-users')}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>
          User Management
        </button>
        <button className={`sb-item ${activePage === 'pg-audit' ? 'active' : ''}`} onClick={() => onNav('pg-audit')}>
          <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Audit Log
        </button>
      </div>
    
      <div className="sb-section sb-bottom">
        <div className="sb-divider"></div>
        <button className={`sb-item ${activePage === 'pg-settings' ? 'active' : ''}`} onClick={() => onNav('pg-settings')}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
      </div>
    </aside>
  );
}
