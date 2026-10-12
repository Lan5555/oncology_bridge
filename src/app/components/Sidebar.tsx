'use client';

import type { ReactNode } from "react";
import { PageId } from "../lib/types";
import { AccountType } from "../lib/accounts";

interface SidebarProps {
  activePage: PageId;
  sidebarOpen: boolean;
  onNav: (id: PageId) => void;
  /** Pages this account may open; null means no restriction. */
  allowedPages: PageId[] | null;
  accountType?: AccountType;
}

type Section = 'Overview' | 'Pharmacy Tools' | 'Clinical';

interface Item {
  id: PageId;
  label: string;
  icon: ReactNode;
  section: Section;
  pip?: { text: string; tone: 'err' | 'warn'; pulse?: boolean };
}

const ITEMS: Item[] = [
  { id: 'pg-dashboard', label: 'Dashboard', section: 'Overview', icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> },
  { id: 'pg-network', label: 'Network Map', section: 'Overview', icon: <><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v3M12 11l-6 5M12 11l6 5"/></> },
  { id: 'pg-scan', label: 'Scan GS1 Barcode', section: 'Pharmacy Tools', icon: <><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M2 12h5M7 7h14M7 17h14"/></> },
  { id: 'pg-inventory', label: 'Inventory Ledger', section: 'Pharmacy Tools', icon: <><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="2"/></> },
  { id: 'pg-transfers', label: 'Redistribution', section: 'Pharmacy Tools', pip: { text: '3', tone: 'err' }, icon: <><polyline points="17,1 21,5 17,9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7,23 3,19 7,15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></> },
  { id: 'pg-prescriptions', label: 'Prescriptions', section: 'Clinical', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></> },
  { id: 'pg-coldchain', label: 'Cold Chain Monitor', section: 'Clinical', pip: { text: '1', tone: 'err', pulse: true }, icon: <path d="M12 2v20M2 12h20M17 7l-5 5-5-5M7 17l5-5 5 5"/> },
  { id: 'pg-expiry', label: 'Near-Expiry', section: 'Clinical', pip: { text: '7', tone: 'warn' }, icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></> },
];

const SECTION_ORDER: Section[] = ['Overview', 'Pharmacy Tools', 'Clinical'];

const ITEM_BASE = "flex items-center gap-[9px] px-[1.1rem] py-2 text-[13.5px] cursor-pointer w-full text-left transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] relative rounded-lg mb-0.5 [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 [&_svg]:shrink-0";
const ITEM_IDLE = "font-medium text-g600 bg-transparent hover:bg-g50 hover:text-p";
const ITEM_ACTIVE = "bg-p text-w font-semibold shadow-[0_4px_12px_rgba(30,64,175,0.2)]";
const PIP_BASE = "ml-auto text-[9.5px] font-bold px-1.5 py-0.5 rounded-[10px] text-white";

export default function Sidebar({ activePage, sidebarOpen, onNav, allowedPages, accountType }: SidebarProps) {
  // Pharmacy stores track near-expiry stock alongside their other tools.
  const items = ITEMS
    .map((item) => (item.id === 'pg-expiry' && accountType === 'PHARMACY_STORE' ? { ...item, section: 'Pharmacy Tools' as Section } : item))
    .filter((item) => !allowedPages || allowedPages.includes(item.id));
  const locked = allowedPages !== null && !allowedPages.includes('pg-prescriptions') && !allowedPages.includes('pg-inventory');

  return (
    <aside className={`w-(--sidebar-w) bg-linear-180 from-w to-pll border-r border-g200 pt-5 px-3 pb-8 shrink-0 flex flex-col sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto transition-[translate,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] max-lg:fixed max-lg:left-0 max-lg:top-16 max-lg:z-[300] max-lg:h-[calc(100vh-64px)] max-lg:w-[min(280px,100vw)] ${sidebarOpen ? 'max-lg:translate-x-0 max-lg:shadow-[4px_0_24px_rgba(0,0,0,0.15)]' : 'max-lg:-translate-x-full'}`}>
      {SECTION_ORDER.map((section) => {
        const sectionItems = items.filter((item) => item.section === section);
        if (!sectionItems.length) return null;
        return (
          <div className="mb-5" key={section}>
            <div className="text-[10px] font-bold text-g400 tracking-[0.05em] uppercase px-3 mb-2">{section}</div>
            {sectionItems.map((item) => (
              <button
                key={item.id}
                className={`${ITEM_BASE} ${activePage === item.id ? ITEM_ACTIVE : ITEM_IDLE}`}
                onClick={() => onNav(item.id)}
              >
                <svg viewBox="0 0 24 24">{item.icon}</svg>
                {item.label}
                {item.pip && (
                  <span className={`${PIP_BASE} ${item.pip.tone === 'err' ? 'bg-err' : 'bg-warn'} ${item.pip.pulse ? 'animate-[blink_1.5s_infinite]' : ''}`}>{item.pip.text}</span>
                )}
              </button>
            ))}
          </div>
        );
      })}

      {locked && (
        <p className="mx-3 text-[11.5px] leading-[1.5] text-g500">Your workspace unlocks once your licence is verified.</p>
      )}

      <div className="mb-5 mt-auto pt-4">
        <div className="h-px bg-g100 my-2 mx-[1.1rem]"></div>
        <button
          className={`${ITEM_BASE} ${activePage === 'pg-settings' ? ITEM_ACTIVE : ITEM_IDLE}`}
          onClick={() => onNav('pg-settings')}
        >
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
      </div>
    </aside>
  );
}
