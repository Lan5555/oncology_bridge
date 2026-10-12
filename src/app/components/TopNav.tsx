'use client';

import { PageId } from "../lib/types";
import { useProvider } from "../providers/provider";



interface TopNavProps {
  activePage: PageId;
  onNav: (id: PageId) => void;
  onToggleSidebar: () => void;
  allowedPages: PageId[] | null;
  onToggleTheme: () => void;
  onOpenModal: (id: 'modal-notifications') => void;
}

export default function TopNav({ activePage, onNav, onToggleSidebar, onToggleTheme, onOpenModal, allowedPages }: TopNavProps) {
  const {userData} = useProvider();
  const hide = (id: PageId) => (allowedPages && !allowedPages.includes(id) ? 'hidden ' : '');
  return (
    <nav className="bg-w border-b border-g200 px-6 h-16 flex items-center justify-between sticky top-0 z-[200] shadow-[0_1px_12px_rgba(14,165,233,0.07)]">
      <div className="flex items-center gap-2.5">
        <button className="hidden size-8 rounded-lg border border-g200 bg-w items-center justify-center cursor-pointer text-g500 transition duration-150 mr-2.5 hover:border-p hover:text-p max-lg:flex [&_svg]:size-[18px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2" onClick={onToggleSidebar}><svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
        <div className="size-[34px] rounded-[9px] bg-linear-135 from-p to-ac flex items-center justify-center shadow-[0_4px_10px_rgba(8,145,178,0.2)] [&_svg]:size-[18px] [&_svg]:stroke-white [&_svg]:fill-none [&_svg]:stroke-[2.2]">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div>
          <div className="text-[15px] font-bold text-g900 tracking-[-0.3px] max-md:text-sm">Oncosourz</div>
          <div className="text-[9.5px] font-semibold text-p tracking-[0.9px] uppercase max-md:hidden">{userData.user?.hospital?.name}</div>
        </div>
      </div>
    
    <div className="flex gap-0.5 bg-g100 p-[3px] rounded-[10px] max-lg:hidden">
        <button className={`px-3.5 py-[5px] rounded-[7px] text-[12.5px] cursor-pointer transition duration-150 ${hide('pg-dashboard')}${activePage === 'pg-dashboard' ? ' bg-w text-pd shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold' : ' font-medium text-g500 bg-transparent hover:text-g700 hover:bg-white/50'}`} onClick={() => onNav('pg-dashboard')}>Dashboard</button>
        <button className={`px-3.5 py-[5px] rounded-[7px] text-[12.5px] cursor-pointer transition duration-150 ${hide('pg-inventory')}${activePage === 'pg-inventory' ? ' bg-w text-pd shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold' : ' font-medium text-g500 bg-transparent hover:text-g700 hover:bg-white/50'}`} onClick={() => onNav('pg-inventory')}>Inventory</button>
        <button className={`px-3.5 py-[5px] rounded-[7px] text-[12.5px] cursor-pointer transition duration-150 ${hide('pg-transfers')}${activePage === 'pg-transfers' ? ' bg-w text-pd shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold' : ' font-medium text-g500 bg-transparent hover:text-g700 hover:bg-white/50'}`} onClick={() => onNav('pg-transfers')}>Transfers</button>
        <button className={`px-3.5 py-[5px] rounded-[7px] text-[12.5px] cursor-pointer transition duration-150 ${hide('pg-audit')}${activePage === 'pg-audit' ? ' bg-w text-pd shadow-[0_1px_4px_rgba(0,0,0,0.08)] font-semibold' : ' font-medium text-g500 bg-transparent hover:text-g700 hover:bg-white/50'}`} onClick={() => onNav('pg-audit')}>Audit Log</button>
      </div>
    
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-[5px] text-[11.5px] font-medium text-good bg-okl px-2.5 py-1 rounded-[20px] max-md:hidden"><div className="size-1.5 bg-good rounded-full animate-blink"></div>{userData.user?.first_name}&nbsp;{userData.user?.last_name}</div>
        <button className="size-8 rounded-lg border border-g200 bg-w flex items-center justify-center cursor-pointer text-g500 relative transition duration-150 hover:border-p hover:text-p [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2" title="Toggle Dark Mode" onClick={onToggleTheme}><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg></button>
        <button className="size-8 rounded-lg border border-g200 bg-w flex items-center justify-center cursor-pointer text-g500 relative transition duration-150 hover:border-p hover:text-p [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2" aria-label="Notifications" onClick={() => onOpenModal('modal-notifications')}><svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg><div className="absolute top-[5px] right-[5px] size-[7px] bg-err rounded-full border-[1.5px] border-white"></div></button>
        <div className="size-8 rounded-full bg-linear-135 from-pd to-ac flex items-center justify-center text-[11px] font-bold text-white cursor-pointer tracking-[0.5px] [&_img]:size-full [&_img]:rounded-full [&_img]:object-cover"><img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" alt="User"/></div>
      </div>
    </nav>
    
  );
}
