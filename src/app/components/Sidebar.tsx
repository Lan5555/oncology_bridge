"use client";

import type { LucideIcon } from "lucide-react";
import {
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
  Users,
} from "lucide-react";
import type { PageId } from "../lib/types";
import { getAccountInfo, type AccountType, type VerificationStatus } from "../lib/accounts";

interface SidebarProps {
  activePage: PageId;
  sidebarOpen: boolean;
  onNav: (id: PageId) => void;
  allowedPages: PageId[] | null;
  accountType?: AccountType;
  verificationStatus?: VerificationStatus;
  canManageFacilityUsers?: boolean;
  showFacilityTeam?: boolean;
}

type Section = "Overview" | "Facility team" | "Pharmacy tools" | "Clinical";
interface Item {
  id: PageId;
  label: string;
  icon: LucideIcon;
  section: Section;
  description: string;
}

const ITEMS: Item[] = [
  {
    id: "pg-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Overview",
    description: "Facility activity and key updates.",
  },
  { id: "pg-network", label: "Network map", icon: Map, section: "Overview", description: "Explore connected facilities." },
  { id: "pg-users", label: "Facility team", icon: Users, section: "Facility team", description: "Invite members and manage facility access." },
  {
    id: "pg-scan",
    label: "GS1 scanner",
    icon: ScanLine,
    section: "Pharmacy tools",
    description: "Scan product GS1 codes.",
  },
  {
    id: "pg-inventory",
    label: "Inventory",
    icon: Boxes,
    section: "Pharmacy tools",
    description: "View and manage stock.",
  },
  {
    id: "pg-transfers",
    label: "Redistribution",
    icon: ArrowLeftRight,
    section: "Pharmacy tools",
    description: "Coordinate stock transfers.",
  },
  {
    id: "pg-medicines",
    label: "Medicine catalog",
    icon: Pill,
    section: "Pharmacy tools",
    description: "Browse medicines and details.",
  },
  {
    id: "pg-prescriptions",
    label: "Prescriptions",
    icon: ClipboardList,
    section: "Clinical",
    description: "Manage prescriptions and orders.",
  },
  {
    id: "pg-coldchain",
    label: "Cold chain",
    icon: Thermometer,
    section: "Clinical",
    description: "Monitor temperature records.",
  },
  {
    id: "pg-expiry",
    label: "Near expiry",
    icon: CalendarClock,
    section: "Clinical",
    description: "Track stock nearing expiry.",
  },
];

const SECTION_ORDER: Section[] = ["Overview", "Facility team", "Pharmacy tools", "Clinical"];

export default function Sidebar({
  activePage,
  sidebarOpen,
  onNav,
  allowedPages,
  accountType,
  verificationStatus,
  canManageFacilityUsers = false,
  showFacilityTeam = canManageFacilityUsers,
}: SidebarProps) {
  const items = ITEMS.map((item) =>
    item.id === "pg-expiry" && accountType === "PHARMACY_STORE"
      ? { ...item, section: "Pharmacy tools" as Section }
      : item,
  ).filter((item) =>
    item.id === "pg-users"
      ? showFacilityTeam && (!allowedPages || allowedPages.includes(item.id))
      : !allowedPages || allowedPages.includes(item.id),
  );
  const locked = Boolean(accountType && verificationStatus && verificationStatus !== "VERIFIED");
  const accountInfo = getAccountInfo(accountType);

  const navButton = (id: PageId, label: string, description: string, Icon: LucideIcon) => {
    const active = activePage === id;
    return (
      <button
        key={id}
        aria-current={active ? "page" : undefined}
        className={`group relative mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${
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
        <span className="min-w-0 flex-1">
          <span className="block">{label}</span>
          <span className={`mt-0.5 block text-[10px] leading-4 ${active ? "text-white/75" : "text-g400 group-hover:text-g500"}`}>{description}</span>
        </span>
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
      {accountInfo ? (
        <div className="mb-5 rounded-xl border border-g200 bg-g50/70 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-g400">{accountInfo.workspace} workspace</p>
          <p className="mt-1 text-sm font-semibold text-g800">{accountInfo.label}</p>
          <p className="mt-1 text-[11px] leading-4 text-g500">{accountInfo.blurb}</p>
        </div>
      ) : null}
      {SECTION_ORDER.map((section) => {
        const sectionItems = items.filter((item) => item.section === section);
        if (!sectionItems.length) return null;
        return (
          <div className="mb-5" key={section}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-g400">
              {section}
            </p>
            {sectionItems.map(({ id, label, description, icon: Icon }) =>
              navButton(id, label, description, Icon),
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
        {navButton("pg-settings", "Settings", "Account preferences and security.", Settings)}
      </div>
    </aside>
  );
}
