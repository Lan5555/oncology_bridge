"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeftRight,
  Boxes,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Map,
  Pill,
  ScanLine,
  Settings,
  Thermometer,
} from "lucide-react";
import type { PageId } from "../lib/types";
import type { AccountType } from "../lib/accounts";

interface SidebarProps {
  activePage: PageId;
  sidebarOpen: boolean;
  onNav: (id: PageId) => void;
  allowedPages: PageId[] | null;
  accountType?: AccountType;
}

type Section = "Overview" | "Pharmacy tools" | "Clinical";
interface Item {
  id: PageId;
  label: string;
  icon: LucideIcon;
  section: Section;
}

const ITEMS: Item[] = [
  {
    id: "pg-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Overview",
  },
  { id: "pg-network", label: "Network map", icon: Map, section: "Overview" },
  {
    id: "pg-scan",
    label: "GS1 scanner",
    icon: ScanLine,
    section: "Pharmacy tools",
  },
  {
    id: "pg-inventory",
    label: "Inventory",
    icon: Boxes,
    section: "Pharmacy tools",
  },
  {
    id: "pg-transfers",
    label: "Redistribution",
    icon: ArrowLeftRight,
    section: "Pharmacy tools",
  },
  {
    id: "pg-medicines",
    label: "Medicine catalog",
    icon: Pill,
    section: "Pharmacy tools",
  },
  {
    id: "pg-prescriptions",
    label: "Prescriptions",
    icon: ClipboardList,
    section: "Clinical",
  },
  {
    id: "pg-coldchain",
    label: "Cold chain",
    icon: Thermometer,
    section: "Clinical",
  },
  {
    id: "pg-expiry",
    label: "Near expiry",
    icon: CalendarClock,
    section: "Clinical",
  },
];

const SECTION_ORDER: Section[] = ["Overview", "Pharmacy tools", "Clinical"];

export default function Sidebar({
  activePage,
  sidebarOpen,
  onNav,
  allowedPages,
  accountType,
}: SidebarProps) {
  const items = ITEMS.map((item) =>
    item.id === "pg-expiry" && accountType === "PHARMACY_STORE"
      ? { ...item, section: "Pharmacy tools" as Section }
      : item,
  ).filter((item) => !allowedPages || allowedPages.includes(item.id));
  const locked =
    allowedPages !== null &&
    !allowedPages.includes("pg-prescriptions") &&
    !allowedPages.includes("pg-inventory");

  const navButton = (id: PageId, label: string, Icon: LucideIcon) => {
    const active = activePage === id;
    return (
      <button
        key={id}
        aria-current={active ? "page" : undefined}
        className={`group relative mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${
          active
            ? "bg-p font-semibold text-white shadow-[0_6px_18px_rgba(30,64,175,0.2)]"
            : "font-medium text-g600 hover:bg-g50 hover:text-p"
        }`}
        onClick={() => onNav(id)}
        type="button"
      >
        <Icon
          className="size-[17px] shrink-0"
          strokeWidth={1.9}
          aria-hidden="true"
        />
        <span>{label}</span>
        {active ? (
          <span className="ml-auto size-1.5 rounded-full bg-white/90" />
        ) : null}
      </button>
    );
  };

  return (
    <aside
      className={`sticky top-16 flex h-[calc(100vh-64px)] w-(--sidebar-w) shrink-0 flex-col overflow-y-auto border-r border-g200 bg-w px-3 pb-6 pt-5 transition-[translate,box-shadow] duration-300 max-lg:fixed max-lg:left-0 max-lg:z-[300] max-lg:h-[calc(100vh-64px)] max-lg:w-[min(280px,100vw)] ${sidebarOpen ? "max-lg:translate-x-0 max-lg:shadow-2xl" : "max-lg:-translate-x-full"}`}
    >
      {SECTION_ORDER.map((section) => {
        const sectionItems = items.filter((item) => item.section === section);
        if (!sectionItems.length) return null;
        return (
          <div className="mb-5" key={section}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-g400">
              {section}
            </p>
            {sectionItems.map(({ id, label, icon: Icon }) =>
              navButton(id, label, Icon),
            )}
          </div>
        );
      })}
      {locked ? (
        <p className="mx-2 rounded-lg bg-g50 px-3 py-2 text-[11px] leading-5 text-g500">
          Verify your licence to unlock your workspace.
        </p>
      ) : null}
      <div className="mt-auto border-t border-g100 pt-4">
        {navButton("pg-settings", "Settings", Settings)}
      </div>
    </aside>
  );
}
