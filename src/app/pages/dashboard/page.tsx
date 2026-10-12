'use client';
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
import Camera from "@/app/components/Camera/camera";
import VerificationGate from "@/app/components/VerificationGate";
import { allowedPages as getAllowedPages } from "@/app/lib/accounts";
import { useProvider } from "@/app/providers/provider";

const DashboardView: React.FC = () => {
  const { userData } = useProvider();
  const accountType = userData.user?.account_type;
  const verification = userData.user?.verification_status;
  const allowedPages = getAllowedPages(accountType, verification);
  const isVerified = !accountType || verification === 'VERIFIED';
  const defaultPage: PageId = accountType === 'DOCTOR' || accountType === 'PHARMACIST' ? 'pg-prescriptions' : 'pg-dashboard';
  const [activePage, setActivePage] = useState<PageId>(isVerified ? defaultPage : 'pg-dashboard');
  const [theme, setTheme] = useState<Theme>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModalId, setOpenModalId] = useState<ModalId | null>(null);
  const [scanVisible, setScanVisible] = useState(false);
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const target = window.localStorage.getItem('adminTarget');
    if (target) {
      const valid = ['pg-dashboard','pg-inventory','pg-scan','pg-transfers','pg-prescriptions','pg-coldchain','pg-expiry','pg-network','pg-facilities','pg-users','pg-audit','pg-settings'];
      if (valid.includes(target)) {
        setActivePage(target as PageId);
      }
      window.localStorage.removeItem('adminTarget');
    }
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  const toggleSidebar = () => setSidebarOpen((v) => !v);



  const handleNav = (id: PageId) => {
    if (allowedPages && !allowedPages.includes(id)) return;
    setActivePage(id);
    if (typeof window !== 'undefined' && window.innerWidth <= 960) {
      setSidebarOpen(false);
    }
  };

  const handleSimulateScan = () => {
    setCameraOpen(prev => !prev);
    scanVail();
    window.setTimeout(() => setScanVisible(true), 600);
  };

  const scanVail = () => {
    setScanVisible(false);
  }

  // Dashboard no longer shows auth UI; authentication is handled on /auth route.

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
      <TopNav
        activePage={activePage}
        onNav={handleNav}
        onOpenModal={setOpenModalId}
        onToggleSidebar={toggleSidebar}
        allowedPages={allowedPages}
        onToggleTheme={toggleTheme}
      />
    <div className="fixed inset-0 bg-[rgba(18,83,223,0.05)] pointer-events-none z-[9999] mix-blend-multiply"/>

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar sidebarOpen={sidebarOpen} activePage={activePage} onNav={handleNav} allowedPages={allowedPages} accountType={accountType} />

        <main className="flex-1 px-8 py-7 overflow-x-hidden max-w-[calc(100vw-var(--sidebar-w))] max-lg:max-w-[100vw] max-lg:w-full max-lg:px-4 max-lg:py-5 max-md:p-4">{!isVerified && activePage !== 'pg-settings' ? <VerificationGate /> : pageComponents[activePage]}</main>
      </div>

      <Modals openModalId={openModalId} onCloseModal={() => setOpenModalId(null)} />
        {cameraOpen ? <Camera/> : null}
    </>
  );
}
export default DashboardView;