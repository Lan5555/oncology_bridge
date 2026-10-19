"use client";

import type { PageId } from "../lib/types";
import { useProvider } from "../providers/provider";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Pill,
  ShoppingBag,
  Sun,
} from "lucide-react";
import { AUTH_SERVICE } from "../services/auth-service/auth-service";

interface TopNavProps {
  activePage: PageId;
  onNav: (id: PageId) => void;
  onToggleSidebar: () => void;
  allowedPages: PageId[] | null;
  onToggleTheme: () => void;
  onOpenModal: (id: "modal-notifications") => void;
}

const QUICK_LINKS: {
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "pg-dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "pg-marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "pg-inventory", label: "Inventory", icon: Boxes },
  { id: "pg-transfers", label: "Transfers", icon: ArrowLeftRight },
  { id: "pg-prescriptions", label: "Prescriptions", icon: ClipboardList },
  { id: "pg-medicines", label: "Medicines", icon: Pill },
];

export default function TopNav({
  activePage,
  onNav,
  onToggleSidebar,
  onToggleTheme,
  onOpenModal,
  allowedPages,
}: TopNavProps) {
  const { userData } = useProvider();
  const router = useRouter();
  const user = userData.user;
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = fullName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const signOut = async () => {
    if (user?.id) await AUTH_SERVICE.signOut(user.id);
    window.localStorage.removeItem("userSession");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-[200] flex h-16 items-center justify-between border-b border-g200 bg-w/95 px-4 shadow-sm backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Toggle navigation"
          className="hidden size-9 items-center justify-center rounded-lg border border-g200 text-g500 transition hover:border-p hover:text-p max-lg:flex"
          onClick={onToggleSidebar}
          type="button"
        >
          <Menu className="size-[18px]" aria-hidden="true" />
        </button>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-p to-ac text-white shadow-sm">
          <Activity className="size-5" strokeWidth={2.2} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold tracking-tight text-g900">
            Oncosourz
          </p>
          <p className="flex items-center gap-1 truncate text-[10px] font-medium text-g500">
            <Building2 className="size-3 shrink-0 text-p" aria-hidden="true" />
            {user?.hospital?.name || "Verified network"}
          </p>
        </div>
      </div>

      <nav
        aria-label="Quick navigation"
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-g50 p-1 max-xl:hidden"
      >
        {QUICK_LINKS.filter(
          ({ id }) => !allowedPages || allowedPages.includes(id),
        ).map(({ id, label, icon: Icon }) => (
          <button
            aria-current={activePage === id ? "page" : undefined}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${activePage === id ? "bg-w font-semibold text-p shadow-sm" : "font-medium text-g500 hover:text-g800"}`}
            key={id}
            onClick={() => onNav(id)}
            type="button"
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-2 rounded-full bg-okl px-3 py-1.5 text-[11px] font-semibold text-good sm:inline-flex">
          <span className="size-1.5 rounded-full bg-good" />
          {user?.role?.name ??
            user?.account_type?.replaceAll("_", " ") ??
            "Network member"}
        </span>
        <button
          aria-label="Toggle color theme"
          className="flex size-9 items-center justify-center rounded-lg border border-g200 text-g500 transition hover:border-p hover:text-p"
          onClick={onToggleTheme}
          type="button"
        >
          <Sun className="hidden size-4 dk:block" aria-hidden="true" />
          <Moon className="size-4 dk:hidden" aria-hidden="true" />
        </button>
        <button
          aria-label="Notifications"
          className="flex size-9 items-center justify-center rounded-lg border border-g200 text-g500 transition hover:border-p hover:text-p"
          onClick={() => onOpenModal("modal-notifications")}
          type="button"
        >
          <Bell className="size-4" aria-hidden="true" />
        </button>
        <div className="hidden items-center gap-2 border-l border-g200 pl-3 sm:flex">
          <div
            className="flex size-8 items-center justify-center rounded-full bg-pl text-[11px] font-bold text-pd"
            aria-hidden="true"
          >
            {initials || "U"}
          </div>
          <span className="max-w-32 truncate text-xs font-semibold text-g700">
            {fullName || user?.email || "Account"}
          </span>
        </div>
        <button
          aria-label="Sign out"
          className="flex size-9 items-center justify-center rounded-lg border border-g200 text-g500 transition hover:border-err hover:text-err"
          onClick={() => void signOut()}
          title="Sign out"
          type="button"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
