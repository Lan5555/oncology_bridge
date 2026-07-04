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
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-sky-500/10">
      <div className="flex items-center gap-2.5">
        <button className="mr-2.5 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-700 hover:text-blue-700 max-[960px]:flex [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2" onClick={onToggleSidebar}><svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-md shadow-sky-600/20 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.2]">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div>
          <div className="text-[15px] font-bold text-slate-950 max-[768px]:text-sm">Oncology Bridge</div>
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.9px] text-blue-800 max-[768px]:hidden">Lagos–Ibadan Network</div>
        </div>
      </div>
    
    <div className="flex gap-2 overflow-x-auto rounded-full bg-slate-100 p-1 max-[960px]:hidden">
        <button className={`nc-btn ${activePage === 'pg-dashboard' ? 'on' : ''}`} onClick={() => onNav('pg-dashboard')}>Dashboard</button>
        <button className={`nc-btn ${activePage === 'pg-inventory' ? 'on' : ''}`} onClick={() => onNav('pg-inventory')}>Inventory</button>
        <button className={`nc-btn ${activePage === 'pg-transfers' ? 'on' : ''}`} onClick={() => onNav('pg-transfers')}>Transfers</button>
        <button className={`nc-btn ${activePage === 'pg-audit' ? 'on' : ''}`} onClick={() => onNav('pg-audit')}>Audit Log</button>
      </div>
    
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-medium text-emerald-600 max-[768px]:hidden"><div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></div>Network Live</div>
        <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-700 hover:text-blue-700 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2" title="Toggle Dark Mode" onClick={onToggleTheme}><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button>
        <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-700 hover:text-blue-700 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2" aria-label="Notifications" onClick={() => onOpenModal('modal-notifications')}><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg><div className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-red-500"></div></button>
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-600 text-[11px] font-bold tracking-wide text-white [&_img]:h-full [&_img]:w-full [&_img]:rounded-full [&_img]:object-cover"><img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" alt="User"/></div>
      </div>
    </nav>
    
  );
}
