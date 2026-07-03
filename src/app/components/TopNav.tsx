'use client';

import { PageId } from "../lib/types";



interface TopNavProps {
  activePage: PageId;
  onNav: (id: PageId) => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onOpenModal: (id: 'modal-notifications') => void;
}

export default function TopNav({ activePage, onNav, onToggleSidebar, onToggleTheme, onOpenModal }: TopNavProps) {
  return (
    <nav className="topnav">
      <div className="logo">
        <button className="menu-btn" onClick={onToggleSidebar}><svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
        <div className="logo-mark">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div>
          <div className="logo-name">Oncology Bridge</div>
          <div className="logo-tag">Lagos–Ibadan Network</div>
        </div>
      </div>
    
    <div className="nav-center">
        <button className={`nc-btn ${activePage === 'pg-dashboard' ? 'on' : ''}`} onClick={() => onNav('pg-dashboard')}>Dashboard</button>
        <button className={`nc-btn ${activePage === 'pg-inventory' ? 'on' : ''}`} onClick={() => onNav('pg-inventory')}>Inventory</button>
        <button className={`nc-btn ${activePage === 'pg-transfers' ? 'on' : ''}`} onClick={() => onNav('pg-transfers')}>Transfers</button>
        <button className={`nc-btn ${activePage === 'pg-audit' ? 'on' : ''}`} onClick={() => onNav('pg-audit')}>Audit Log</button>
      </div>
    
      <div className="nav-r">
        <div className="live-badge"><div className="live-dot"></div>Network Live</div>
        <button className="notif-btn" title="Toggle Dark Mode" onClick={onToggleTheme}><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button>
        <button className="notif-btn" aria-label="Notifications" onClick={() => onOpenModal('modal-notifications')}><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg><div className="notif-pip"></div></button>
        <div className="avatar"><img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" alt="User"/></div>
      </div>
    </nav>
    
  );
}
