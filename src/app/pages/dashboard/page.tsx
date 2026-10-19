"use client";
import Modals from "@/app/components/Modals";
import Sidebar from "@/app/components/Sidebar";
import TopNav from "@/app/components/TopNav";
import { ModalId, PageId } from "@/app/lib/types";
import { useEffect, useState } from "react";
import AuditPage from "./AuditPage";
import ColdChainPage from "./ColdChainPage";
import ExpiryPage from "./ExpiryPage";
import FacilitiesPage from "./FacilitiesPage";
import InventoryPage from "./InventoryPage";
import MedicinesPage from "./MedicinesPage";
import MarketplacePage from "./MarketplacePage";
import NetworkPage from "./NetworkPage";
import PrescriptionsPage from "./PrescriptionsPage";
import ScanPage from "./ScanPage";
import SettingsPage from "./SettingsPage";
import TransfersPage from "./TransfersPage";
import UsersPage from "./UsersPage";
import DashboardPage from "./DashboardPage";
import VerificationGate from "@/app/components/VerificationGate";
import { allowedPages as getAllowedPages } from "@/app/lib/accounts";
import { useProvider } from "@/app/providers/provider";

const DashboardView: React.FC = () => {
  const { userData, sessionReady, theme, setTheme } = useProvider();
  const accountType = userData.user?.account_type;
  const verification = userData.user?.verification_status;
  const rawPermissions = [
    ...(userData.user?.permissions ?? []),
    ...(userData.user?.role?.permissions ?? []).map((permission) =>
      typeof permission === "string"
        ? permission
        : (permission.key ?? permission.name ?? ""),
    ),
  ];
  const canManageFacilityUsers =
    userData.user?.can_manage_facility_users === true ||
    rawPermissions.includes("facility.users.manage");
  const isVerified = !accountType || verification === "VERIFIED";
  const showFacilityTeam = isVerified && canManageFacilityUsers;
  const baseAllowedPages = getAllowedPages(
    accountType,
    verification,
    userData.user?.allowed_pages,
    rawPermissions,
    canManageFacilityUsers,
  );
  const allowedPages =
    baseAllowedPages && showFacilityTeam
      ? [...new Set([...baseAllowedPages, "pg-users" as PageId])]
      : baseAllowedPages;
  const defaultPage: PageId =
    accountType === "DOCTOR" || accountType === "PHARMACIST"
      ? "pg-prescriptions"
      : "pg-dashboard";
  const [activePage, setActivePage] = useState<PageId>(
    isVerified ? defaultPage : "pg-dashboard",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModalId, setOpenModalId] = useState<ModalId | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionReady) return;
    const target = window.localStorage.getItem("adminTarget");
    if (target) {
      const valid = [
        "pg-marketplace",
        "pg-dashboard",
        "pg-inventory",
        "pg-medicines",
        "pg-scan",
        "pg-transfers",
        "pg-prescriptions",
        "pg-coldchain",
        "pg-expiry",
        "pg-network",
        "pg-facilities",
        "pg-users",
        "pg-audit",
        "pg-settings",
      ];
      if (
        valid.includes(target) &&
        (target !== "pg-users" || showFacilityTeam) &&
        (!allowedPages || allowedPages.includes(target as PageId))
      ) {
        setActivePage(target as PageId);
      }
      window.localStorage.removeItem("adminTarget");
    }
  }, [allowedPages, showFacilityTeam, sessionReady]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleNav = (id: PageId) => {
    if (id === "pg-users" && !showFacilityTeam) return;
    if (allowedPages && !allowedPages.includes(id)) return;
    setActivePage(id);
    if (typeof window !== "undefined" && window.innerWidth <= 960) {
      setSidebarOpen(false);
    }
  };

  // Dashboard no longer shows auth UI; authentication is handled on /auth route.

  const pageComponents: Record<PageId, React.ReactNode> = {
    "pg-marketplace": <MarketplacePage />,
    "pg-dashboard": (
      <DashboardPage
        onNav={handleNav}
        onOpenModal={setOpenModalId}
        canManageFacilityUsers={canManageFacilityUsers}
        showFacilityTeam={showFacilityTeam}
        allowedPages={allowedPages}
      />
    ),
    "pg-inventory": (
      <InventoryPage onNav={handleNav} onOpenModal={setOpenModalId} />
    ),
    "pg-medicines": <MedicinesPage />,
    "pg-scan": <ScanPage />,
    "pg-transfers": (
      <TransfersPage onNav={handleNav} onOpenModal={setOpenModalId} />
    ),
    "pg-prescriptions": (
      <PrescriptionsPage onNav={handleNav} onOpenModal={setOpenModalId} />
    ),
    "pg-coldchain": <ColdChainPage />,
    "pg-expiry": <ExpiryPage />,
    "pg-network": <NetworkPage />,
    "pg-facilities": (
      <FacilitiesPage onNav={handleNav} onOpenModal={setOpenModalId} />
    ),
    "pg-users": (
      <UsersPage
        onNav={handleNav}
        onOpenModal={setOpenModalId}
        canManageFacilityUsers={canManageFacilityUsers}
      />
    ),
    "pg-audit": <AuditPage />,
    "pg-settings": <SettingsPage />,
  };

  return (
    <div className="dashboard-shell">
      <TopNav
        activePage={activePage}
        onNav={handleNav}
        onOpenModal={setOpenModalId}
        onToggleSidebar={toggleSidebar}
        allowedPages={allowedPages}
        onToggleTheme={toggleTheme}
      />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar
          sidebarOpen={sidebarOpen}
          activePage={activePage}
          onNav={handleNav}
          allowedPages={allowedPages}
          accountType={accountType}
          verificationStatus={verification}
          canManageFacilityUsers={canManageFacilityUsers}
          showFacilityTeam={showFacilityTeam}
        />

        <main className="min-w-0 flex-1 overflow-x-hidden bg-g50/60 px-8 py-7 max-lg:w-full max-lg:px-4 max-lg:py-5 max-md:p-4">
          {!isVerified && activePage !== "pg-settings" ? (
            <VerificationGate />
          ) : (
            pageComponents[activePage]
          )}
        </main>
      </div>

      <Modals
        openModalId={openModalId}
        onCloseModal={() => setOpenModalId(null)}
      />
    </div>
  );
};
export default DashboardView;
