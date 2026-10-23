"use client";

import {
  ChevronDown,
  type LucideIcon,
  Network,
  Pill,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import management from "@/app/components/Management.module.css";

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const GROUPS = [
  {
    id: "people",
    label: "People & access",
    icon: Users,
    items: ["users", "facilities", "verification", "roles"],
  },
  {
    id: "medicines",
    label: "Medicines & stock",
    icon: Pill,
    items: ["medicines", "inventory", "marketplace", "scans", "expiry"],
  },
  {
    id: "orders",
    label: "Orders & payments",
    icon: ShoppingBag,
    items: ["orders", "prescriptions", "invoices", "transfers"],
  },
  {
    id: "network",
    label: "Network & monitoring",
    icon: Network,
    items: ["network", "storage", "coldchain", "shipments"],
  },
  {
    id: "administration",
    label: "Administration",
    icon: Settings,
    items: ["audit", "integrations", "research"],
  },
];

export default function AdminSidebarNavigation({
  items,
  activeSection,
  onSelect,
}: {
  items: NavigationItem[];
  activeSection: string;
  onSelect: (id: string) => void;
}) {
  const prefix = useId();
  const activeGroup =
    GROUPS.find((group) => group.items.includes(activeSection))?.id ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup);
  useEffect(() => {
    setOpenGroup(
      GROUPS.find((group) => group.items.includes(activeSection))?.id ?? null,
    );
  }, [activeSection]);

  const itemButton = (item: NavigationItem, nested = false) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        className={[management.navItem, nested ? management.navChild : ""].join(
          " ",
        )}
        aria-current={activeSection === item.id ? "page" : undefined}
        onClick={() => onSelect(item.id)}
      >
        <Icon className="size-4 shrink-0" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <nav aria-label="Admin sections">
      {items
        .filter((item) => item.id === "overview")
        .map((item) => itemButton(item))}
      <div className={management.navDivider} />
      {GROUPS.map((group) => {
        const children = group.items.flatMap((id) =>
          items.filter((item) => item.id === id),
        );
        if (!children.length) return null;
        const Icon = group.icon;
        const open = openGroup === group.id;
        const active = activeGroup === group.id;
        const panelId = `${prefix}-${group.id}`;
        return (
          <div key={group.id} className={management.navGroup}>
            <button
              type="button"
              className={management.navGroupToggle}
              aria-expanded={open}
              aria-controls={panelId}
              data-active={active}
              onClick={() => setOpenGroup(open ? null : group.id)}
            >
              <Icon className="size-[17px] shrink-0" />
              <span>{group.label}</span>
              {active && !open && (
                <span className={management.navActiveDot} aria-hidden="true" />
              )}
              <ChevronDown
                className={management.navChevron}
                data-open={open}
                aria-hidden="true"
              />
            </button>
            <div id={panelId} hidden={!open} className={management.navChildren}>
              {children.map((item) => itemButton(item, true))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
