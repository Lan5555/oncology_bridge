'use client';

import AuthPages from "@/app/components/AuthPages";
import Modals from "@/app/components/Modals";
import Sidebar from "@/app/components/Sidebar";
import TopNav from "@/app/components/TopNav";
import { AuthView, ModalId, PageId, Theme } from "@/app/lib/types";
import { useEffect, useState } from "react";
import AuditPage from "./AuditPage";
import ColdChainPage from "./ColdChainPage";
import ExpiryPage from "./ExpiryPage";
import FacilitiesPage from "./FacilitiesPage";
import InventoryPage from "./InventoryPage";
import NetworkPage from "./NetworkPage";
import PrescriptionsPage from "./PrescriptionsPage";
import ScanPage from "./ScanPage";
import SettingsPage from "./SettingsPage";
import TransfersPage from "./TransfersPage";
import UsersPage from "./UsersPage";
import DashboardPage from "./DashboardPage";

const DashboardView: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [activePage, setActivePage] = useState<PageId>('pg-dashboard');
  const [theme, setTheme] = useState<Theme>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModalId, setOpenModalId] = useState<ModalId | null>(null);
  const [scanVisible, setScanVisible] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme') as Theme | null;
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
      return;
    }

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleDoLogin = () => {
    setAuthView('app');
  };

  const handleNav = (id: PageId) => {
    setActivePage(id);
    if (typeof window !== 'undefined' && window.innerWidth <= 960) {
      setSidebarOpen(false);
    }
  };

  const handleSimulateScan = () => {
    setScanVisible(false);
    window.setTimeout(() => setScanVisible(true), 600);
  };

  if (authView !== 'app') {
    return (
      <AuthPages
        view={authView}
        onDoLogin={handleDoLogin}
        onShowAuth={setAuthView}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const pageComponents: Record<PageId, React.ReactNode> = {
    'pg-dashboard': <DashboardPage onNav={handleNav} onOpenModal={setOpenModalId} />,
    'pg-inventory': <InventoryPage onNav={handleNav} onOpenModal={setOpenModalId} />,
    'pg-scan': (
      <ScanPage scanVisible={scanVisible} onSimulateScan={handleSimulateScan} />
    ),
    'pg-transfers': <TransfersPage onNav={handleNav} onOpenModal={setOpenModalId} />,
    'pg-prescriptions': <PrescriptionsPage onNav={handleNav} onOpenModal={setOpenModalId} />,
    'pg-coldchain': <ColdChainPage />,
    'pg-expiry': <ExpiryPage />,
    'pg-network': <NetworkPage />,
    'pg-facilities': <FacilitiesPage onNav={handleNav} onOpenModal={setOpenModalId} />,
    'pg-users': <UsersPage onNav={handleNav} onOpenModal={setOpenModalId} />,
    'pg-audit': <AuditPage />,
    'pg-settings': <SettingsPage />,
  };

  return (
    <>
    <div className='blue-overlay' />
      <TopNav
        activePage={activePage}
        onNav={handleNav}
        onOpenModal={setOpenModalId}
        onToggleSidebar={toggleSidebar}
        onToggleTheme={toggleTheme}
      />

      <div className="shell active">
        <Sidebar sidebarOpen={sidebarOpen} activePage={activePage} onNav={handleNav} />

        <main className="main">{pageComponents[activePage]}</main>
      </div>

      <Modals openModalId={openModalId} onCloseModal={() => setOpenModalId(null)} />
    </>
  );
}
export default DashboardView;