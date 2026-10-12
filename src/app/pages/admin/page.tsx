"use client";

import { ModalId, PageId } from '@/app/lib/types';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UsersPage from '@/app/pages/dashboard/UsersPage';
import FacilitiesPage from '@/app/pages/dashboard/FacilitiesPage';
import AuditPage from '@/app/pages/dashboard/AuditPage';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Shield,
  Plug,
  Search,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Activity,
  Edit,
  Trash2,
  Home,
  Database,
  ShieldCheck,
  Package,
  FileText,
  Bell,
  ChevronRight,
  RefreshCw,
  Download,
  MoreVertical,
  AlertCircle,
  Link as LinkIcon,
  User,
  Lock,
  Menu,
  X,
  Filter,
  Plus,
  Clock,
  ShieldAlert,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FileCheck,
  Key,
  CheckCircle2,
  UserCheck,
  Stethoscope,
  Pill,
  Store,
  XCircle,
} from 'lucide-react';
import { ACCOUNT_TYPES, AccountType, VerificationStatus, getAccountInfo } from '@/app/lib/accounts';
import { VERIFICATION_SERVICE } from '@/app/services/verification-service/verification-service';

type RegistryResult = 'MATCH' | 'NO_MATCH' | 'UNAVAILABLE';

interface Application {
  id: string;
  name: string;
  accountType: AccountType;
  license: string;
  workplace: string;
  submitted: string;
  registryResult: RegistryResult;
  status: VerificationStatus;
}

const INITIAL_APPLICATIONS: Application[] = [
  { id: 'a1', name: 'Dr. Chidinma Okafor', accountType: 'DOCTOR', license: 'MDCN/R/48211', workplace: 'LUTH, Lagos', submitted: '12m ago', registryResult: 'MATCH', status: 'MANUAL_REVIEW' },
  { id: 'a2', name: 'Ph. Tunde Balogun', accountType: 'PHARMACIST', license: 'PCN/20987', workplace: 'UCH, Ibadan', submitted: '1h ago', registryResult: 'MATCH', status: 'MANUAL_REVIEW' },
  { id: 'a3', name: 'HealthPlus Ikeja', accountType: 'PHARMACY_STORE', license: 'PCN/PREM/5543', workplace: 'Ikeja, Lagos', submitted: '3h ago', registryResult: 'UNAVAILABLE', status: 'MANUAL_REVIEW' },
  { id: 'a4', name: 'Dr. Aisha Bello', accountType: 'DOCTOR', license: 'MDCN/R/51034', workplace: 'EKO Hospital, Lagos', submitted: '5h ago', registryResult: 'NO_MATCH', status: 'MANUAL_REVIEW' },
  { id: 'a5', name: 'Ph. Emeka Eze', accountType: 'PHARMACIST', license: 'PCN/18842', workplace: 'LASUTH, Lagos', submitted: 'Yesterday', registryResult: 'MATCH', status: 'VERIFIED' },
  { id: 'a6', name: 'Greenfield Pharmacy', accountType: 'PHARMACY_STORE', license: 'PCN/PREM/3021', workplace: 'Ibadan North', submitted: 'Yesterday', registryResult: 'MATCH', status: 'VERIFIED' },
  { id: 'a7', name: 'Dr. Samuel Ade', accountType: 'DOCTOR', license: 'MDCN/R/00012', workplace: 'Unknown clinic', submitted: '2d ago', registryResult: 'NO_MATCH', status: 'REJECTED' },
];

const TYPE_ICONS: Record<AccountType, typeof Stethoscope> = {
  DOCTOR: Stethoscope,
  PHARMACIST: Pill,
  PHARMACY_STORE: Store,
};

const REGISTRY_TEXT: Record<RegistryResult, string> = {
  MATCH: 'Found in registry',
  NO_MATCH: 'Not found in registry \u2014 check manually',
  UNAVAILABLE: 'Registry unavailable \u2014 check manually',
};

interface AdminPageProps {
  onNav?: (id: PageId) => void;
  onOpenModal?: (id: ModalId) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNav }) => {
  const [section, setSection] = useState<'overview' | 'verification' | 'roles' | 'integrations' | 'users' | 'facilities' | 'audit'>('overview');
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [statusFilter, setStatusFilter] = useState<'REVIEW' | 'VERIFIED' | 'REJECTED' | 'ALL'>('REVIEW');
  const [typeFilter, setTypeFilter] = useState<AccountType | 'ALL'>('ALL');
  const [rechecking, setRechecking] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // --- FIX: Initialize with safe defaults to prevent hydration mismatch ---
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false); // Track client-side mount

  // Lightweight feedback toast so every action button gives a visible
  // response even before it's wired to real backend logic.
  const [toast, setToast] = useState<string | null>(null);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2200);
  };

  // Detect theme and auth on client-side only
  useEffect(() => {
    setMounted(true);

    const storedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    const auth = window.localStorage.getItem('adminAuth') === '1';
    setIsAuthed(auth);
  }, []);

  const isDark = theme === 'dark';

  const pendingCount = applications.filter((a) => a.status === 'PENDING' || a.status === 'MANUAL_REVIEW').length;

  const decide = (app: Application, status: 'VERIFIED' | 'REJECTED') => {
    setApplications((list) => list.map((a) => (a.id === app.id ? { ...a, status } : a)));
    notify(`${app.name} ${status === 'VERIFIED' ? 'approved' : 'rejected'}.`);
  };

  const recheck = async (app: Application) => {
    setRechecking(app.id);
    const info = getAccountInfo(app.accountType)!;
    const lastName = app.accountType === 'PHARMACY_STORE' ? undefined : app.name.split(' ').slice(-1)[0];
    const result = await VERIFICATION_SERVICE.verifyLicense({ licenseNumber: app.license, registry: info.registry, lastName });
    setApplications((list) => list.map((a) => (a.id === app.id ? { ...a, registryResult: result.registryResult } : a)));
    setRechecking(null);
    notify(`Registry check: ${REGISTRY_TEXT[result.registryResult].toLowerCase()}.`);
  };

  const handleAdminLogin = () => {
    // FIX: previously this just silently returned when a field was empty,
    // so clicking "Sign in" with nothing typed looked like a dead button.
    if (!adminUser || !adminPass) {
      setLoginError('Enter both a username and password to continue.');
      return;
    }
    setLoginError('');
    setSubmitting(true);
    setTimeout(() => {
      window.localStorage.setItem('adminAuth', '1');
      setIsAuthed(true);
      setSubmitting(false);
    }, 600);
  };

  const handleAdminLogout = () => {
    window.localStorage.removeItem('adminAuth');
    setIsAuthed(false);
  };

  const goToDashboard = (target: PageId) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('adminTarget', target);
    router.push('/pages/dashboard');
  };

  // --- Theme tokens: parchment / ink, not the default blue-glass SaaS palette ---
  const shellClasses = isDark
    ? 'min-h-screen w-full bg-[#0A1628] text-[#EAF0FA]'
    : 'min-h-screen w-full bg-gradient-to-b from-[#F9FBFD] to-[#EDF2F9] text-[#0B1E3D]';

  const cardClasses = isDark
    ? 'border border-[#1E3358] bg-[#0F2038]'
    : 'border border-[#E7ECF4] bg-white shadow-[0_1px_2px_rgba(15,30,61,0.04),0_8px_24px_-16px_rgba(15,30,61,0.12)]';

  // Interactive cards (roles, integrations, quick actions) get a hover lift
  // to signal they respond to input — flat cards feel dead, elevation reads as clickable.
  const interactiveCardClasses = isDark
    ? 'border border-[#1E3358] bg-[#0F2038] transition-all duration-200 hover:border-[#2A4370]'
    : 'border border-[#E7ECF4] bg-white transition-all duration-200 hover:border-[#C9D6E8] hover:shadow-[0_4px_16px_-8px_rgba(15,30,61,0.18)] hover:-translate-y-[1px]';

  const baseInputClasses = isDark
    ? 'w-full rounded-lg border border-[#23385C] bg-[#0B1E33] text-sm text-[#EAF0FA] placeholder:text-[#5D7396] outline-none transition-all duration-150 focus:border-[#4C8DFF] focus:ring-4 focus:ring-[#4C8DFF]/10'
    : 'w-full rounded-lg border border-[#DCE3ED] bg-[#FBFCFE] text-sm text-[#0B1E3D] placeholder:text-[#94A3B8] outline-none transition-all duration-150 focus:border-[#1B3A6B] focus:bg-white focus:ring-4 focus:ring-[#1B3A6B]/8';

  const mutedText = isDark ? 'text-[#8CA0BE]' : 'text-[#5B6B85]';
  const headingText = isDark ? 'text-[#EAF0FA]' : 'text-[#0B1E3D]';
  const borderColor = isDark ? 'border-[#1E3358]' : 'border-[#E7ECF4]';
  const accentBlue = isDark ? '#4C8DFF' : '#1B3A6B';
  const accentAmber = isDark ? '#E08A4F' : '#C4622D';
  const accentPositive = isDark ? '#4C8DFF' : '#1B3A6B';
  // Sign-in / primary CTA color — kept constant per brief, the one fixed anchor color.
  const primaryCta = '#0B1E3D';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'verification', label: `Verification${pendingCount ? ` (${pendingCount})` : ''}`, icon: UserCheck },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'audit', label: 'Audit', icon: ClipboardList },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ];

  // Quick stats — each carries its own accent so the panel reads as a real
  // dashboard rather than one color repeated six times.
  const stats = [
    { label: 'Total facilities', value: '24', change: '+12%', icon: Building2, trend: 'up', color: '#1B3A6B' },
    { label: 'Active users', value: '156', change: '+8%', icon: Users, trend: 'up', color: '#0F766E' },
    { label: 'Inventory items', value: '2,847', change: '+5%', icon: Package, trend: 'up', color: '#6D28D9' },
    { label: 'Near expiry', value: '7', change: '-3%', icon: AlertCircle, trend: 'down', color: '#C4622D' },
    { label: 'Total value', value: '\u20a64.2M', change: '+15%', icon: DollarSign, trend: 'up', color: '#15803D' },
    { label: 'Pending verifications', value: String(pendingCount), change: 'needs review', icon: UserCheck, trend: 'down', color: '#0E7490' },
  ];

  const activityFeed = [
    { action: 'Licence PCN/20987 sent for manual review', time: '1h ago', user: 'Verification', icon: UserCheck },
    { action: 'Dr. Musa updated facility settings', time: '5m ago', user: 'Network Admin', icon: Settings },
    { action: 'Nurse Adebayo registered', time: '23m ago', user: 'System', icon: UserPlus },
    { action: 'Inventory sync completed for LUTH', time: '1h ago', user: 'Auto-sync', icon: RefreshCw },
    { action: 'Security alert: failed login attempt', time: '2h ago', user: 'System', icon: ShieldAlert, alert: true },
    { action: 'LUTH added 45 new vials', time: '3h ago', user: 'Inventory Manager', icon: Package },
    { action: 'Audit report generated', time: '5h ago', user: 'Auditor', icon: FileCheck },
  ];

  const roles = [
    { name: 'Doctor', desc: 'Signs up with an MDCN licence. Sees only the Clinical workspace.', count: '41 users', icon: Stethoscope, sees: ['Prescriptions', 'Cold Chain Monitor', 'Near-Expiry', 'Network Map'] },
    { name: 'Pharmacist', desc: 'Signs up with a PCN registration. Sees only the Clinical workspace.', count: '58 users', icon: Pill, sees: ['Prescriptions', 'Cold Chain Monitor', 'Near-Expiry', 'Network Map'] },
    { name: 'Pharmacy Store', desc: 'Signs up with a PCN premises licence. Sees only Pharmacy Tools.', count: '24 stores', icon: Store, sees: ['Scan GS1', 'Inventory Ledger', 'Redistribution', 'Near-Expiry', 'Network Map'] },
    { name: 'Network Admin', desc: 'Full access across all modules, including verification.', count: '3 users', icon: ShieldCheck, sees: ['Everything', 'Verification queue', 'Audit log'] },
  ];

  const integrations = [
    { name: 'MDCN Registry', status: 'Active', lastSync: 'Live lookup', desc: 'Doctor licence check against the Medical and Dental Council of Nigeria register', icon: UserCheck },
    { name: 'PCN Registry', status: 'Active', lastSync: 'Live lookup', desc: 'Pharmacist and premises licence check against the Pharmacists Council of Nigeria', icon: UserCheck },    { name: 'HMO Sync', status: 'Active', lastSync: '12m ago', desc: 'Synchronize patient data with HMO providers', icon: Database },
    { name: 'NAFDAC API', status: 'Active', lastSync: '2h ago', desc: 'Drug verification and compliance checking', icon: ShieldCheck },
    { name: 'GS1 Registry', status: 'Inactive', lastSync: 'Never', desc: 'GS1 barcode validation service', icon: LinkIcon },
    { name: 'EHR Integration', status: 'Active', lastSync: '45m ago', desc: 'Electronic Health Records synchronization', icon: FileText },
  ];

  const quickActions = [
    { label: 'Review verifications', icon: UserCheck, color: '#0E7490' },
    { label: 'Sync all facilities', icon: RefreshCw, color: '#0E7490' },
    { label: 'Export audit', icon: Download, color: '#6D28D9' },
    { label: 'Generate report', icon: FileText, color: '#15803D' },
    { label: 'Manage users', icon: Users, color: '#0F766E' },
    { label: 'View analytics', icon: ClipboardList, color: '#C4622D' },
  ];

  const globalStyle = (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      .font-display { font-family: 'Source Serif 4', Georgia, serif; }
      .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      .font-ui { font-family: 'Inter', system-ui, sans-serif; }
      .spec-card { position: relative; }
      .spec-card::before, .spec-card::after,
      .spec-card .tick-br::before, .spec-card .tick-br::after { content: ''; position: absolute; width: 8px; height: 8px; pointer-events: none; }
      .spec-card::before { top: -1px; left: -1px; border-top: 1.5px solid var(--tick-color); border-left: 1.5px solid var(--tick-color); pointer-events: none; }
      .spec-card::after { top: -1px; right: -1px; border-top: 1.5px solid var(--tick-color); border-right: 1.5px solid var(--tick-color); pointer-events: none; }
      /* FIX: this div is stretched (inset: 0) to cover the entire card so its
         ::before/::after can draw the bottom corner ticks. Being absolutely
         positioned, it paints ABOVE the card's static-positioned children
         (header, form, buttons) and was silently swallowing every hover and
         click on anything inside a spec-card. pointer-events: none lets
         events pass through to the real content underneath. */
      .spec-card .tick-br { position: absolute; inset: 0; pointer-events: none; }
      .spec-card .tick-br::before { bottom: -1px; left: -1px; top: auto; border-bottom: 1.5px solid var(--tick-color); border-left: 1.5px solid var(--tick-color); border-top: none; }
      .spec-card .tick-br::after { bottom: -1px; right: -1px; top: auto; border-bottom: 1.5px solid var(--tick-color); border-right: 1.5px solid var(--tick-color); border-top: none; }
      @keyframes toast-in {
        from { opacity: 0; transform: translate(-50%, 8px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      .toast-pop { animation: toast-in 0.18s ease-out; }
      .press-fx { transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease; }
      .press-fx:active { transform: scale(0.98); }
      .glow-orb {
        position: absolute;
        border-radius: 9999px;
        filter: blur(64px);
        pointer-events: none;
      }
    `}</style>
  );

  // Toast rendered on both the auth and authenticated views
  const toastNode = toast ? (
    <div
      className="toast-pop fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md border px-4 py-2.5 font-mono text-xs shadow-lg"
      style={{
        backgroundColor: isDark ? '#0F2038' : '#0B1E3D',
        borderColor: isDark ? '#1E3358' : '#0B1E3D',
        color: '#EAF0FA',
      }}
    >
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: accentPositive === '#1B3A6B' ? '#7FB0FF' : accentPositive }} />
      {toast}
    </div>
  ) : null;

  // Show loading state until client-side mount
  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#EEF3FA] text-[#0B1E3D] font-ui flex items-center justify-center px-4 py-12">
        {globalStyle}
        <div className="w-full max-w-md rounded-lg border border-[#E2E8F0] bg-white p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-[#0B1E3D]">
              <ShieldCheck className="h-6 w-6 text-[#EEF3FA]" />
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#0B1E3D]">Admin Sign In</h1>
            <p className="mt-2 text-sm text-[#5B6B85]">Loading console\u2026</p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#1B3A6B]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className={`${shellClasses} font-ui relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12`} suppressHydrationWarning>
        {globalStyle}
        {toastNode}

        {/* restrained background: faint label-grid + a soft ambient glow, no busy decoration */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? '#8CA0BE' : '#5B6B85'} 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
          suppressHydrationWarning
        />
        <div className="glow-orb h-105 w-105 -translate-x-1/2 -translate-y-1/2 opacity-[0.10]" style={{ top: '10%', left: '20%', backgroundColor: primaryCta }} />
        <div className="glow-orb h-90 w-90 translate-x-1/2 translate-y-1/2 opacity-[0.06]" style={{ bottom: '5%', right: '15%', backgroundColor: accentBlue }} />

        <div
          className={`spec-card relative z-10 w-full max-w-md overflow-hidden rounded-2xl p-8 sm:p-10 ${cardClasses}`}
          style={{ '--tick-color': accentBlue } as React.CSSProperties}
        >
          <div className="tick-br" />
          {/* thin gradient accent bar — the one deliberate flourish on an otherwise quiet card */}
          <div
            className="absolute inset-x-0 top-0 h-0.75"
            style={{ background: `linear-gradient(90deg, ${primaryCta}, ${accentBlue}, transparent)` }}
          />

          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-[0_8px_20px_-8px_rgba(11,30,61,0.5)]"
              style={{ background: `linear-gradient(135deg, ${primaryCta}, #14295094)` }}
            >
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Oncosourz / Restricted</p>
            <h1 className={`font-display mt-1 text-3xl font-semibold tracking-tight ${headingText}`}>Admin Sign In</h1>
            <p className={`mt-2 text-sm ${mutedText}`}>Secure access to system administration</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
            <div className="space-y-5">
              <div>
                <label className={`mb-2 block text-xs font-medium uppercase tracking-wide ${isDark ? 'text-[#8CA0BE]' : 'text-[#5B6B85]'}`}>
                  Username
                </label>
                <div className="relative">
                  <User className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => { setAdminUser(e.target.value); if (loginError) setLoginError(''); }}
                    placeholder="Enter your username"
                    className={`${baseInputClasses} py-3 pl-11 pr-4`}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={`block text-xs font-medium uppercase tracking-wide ${isDark ? 'text-[#8CA0BE]' : 'text-[#5B6B85]'}`}>
                    Password
                  </label>
                  <button type="button" className="text-xs font-medium hover:underline" style={{ color: accentBlue }}>
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => { setAdminPass(e.target.value); if (loginError) setLoginError(''); }}
                    placeholder="Enter your password"
                    className={`${baseInputClasses} py-3 pl-11 pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${mutedText} hover:text-[#1B3A6B]`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* FIX: previously an empty-field submit failed silently.
                  Now it surfaces a visible, specific reason. */}
              {loginError && (
                <div
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs"
                  style={{ borderColor: accentAmber, color: accentAmber, backgroundColor: isDark ? 'transparent' : '#FBF2EC' }}
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="press-fx flex w-full items-center justify-center gap-2.5 rounded-lg py-3 text-sm font-medium text-white shadow-[0_10px_24px_-10px_rgba(11,30,61,0.55)] hover:shadow-[0_14px_28px_-10px_rgba(11,30,61,0.6)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                style={{ backgroundColor: primaryCta }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#14295A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = primaryCta; }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                {submitting ? 'Authenticating\u2026' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className={`press-fx flex w-full items-center justify-center gap-2.5 rounded-lg border py-3 text-sm font-medium ${
                  isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0B1E33]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B] hover:bg-[#F8FAFC] cursor-pointer'
                }`}
              >
                <Home className="h-4 w-4" />
                Return to home
              </button>
            </div>
          </form>

          <div className={`mt-8 flex items-center justify-center gap-2 border-t pt-5 font-mono text-[11px] ${borderColor} ${mutedText}`}>
            <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentPositive }} />
            All systems operational &middot; AES-256 encrypted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shellClasses} font-ui relative`} suppressHydrationWarning>
      {globalStyle}
      {toastNode}

      {/* Main content */}
      <div className="relative z-10">
        {/* Header — sticky with a soft blur so it reads as an app shell, not a static banner */}
        <div
          className={`sticky top-0 z-30 flex flex-col gap-4 border-b px-4 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-6 lg:px-8 ${borderColor}`}
          style={{ backgroundColor: isDark ? 'rgba(10,22,40,0.85)' : 'rgba(238,243,250,0.82)' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-lg p-2 lg:hidden ${isDark ? 'hover:bg-[#0F2038]' : 'hover:bg-white'}`}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:flex"
                style={{ background: `linear-gradient(135deg, ${primaryCta}, #14295094)` }}
              >
                <ShieldCheck className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Oncosourz</p>
                <div className="flex items-center gap-3">
                  <h1 className={`font-display text-2xl font-semibold tracking-tight md:text-3xl ${headingText}`}>
                    Administration
                  </h1>
                  <span className={`hidden rounded-md border px-2 py-0.5 font-mono text-[11px] md:inline-block ${borderColor} ${mutedText}`}>
                    v2.0
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs ${borderColor} ${mutedText} ${isDark ? 'bg-[#0F2038]' : 'bg-white'}`}>
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: accentPositive }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentPositive }} />
              </span>
              System online
            </div>
            <button
              onClick={handleAdminLogout}
              className={`press-fx flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium md:px-4 md:py-2 md:text-sm ${
                isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0F2038]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B] hover:bg-white'
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-6 md:px-6 lg:px-8">

        {/* Mobile tabs */}
        {isMobileMenuOpen && (
          <div className={`mb-4 rounded-lg border p-4 lg:hidden ${cardClasses}`}>
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = section === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setSection(tab.id as any); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      active
                        ? isDark ? 'bg-[#4C8DFF]/10 text-[#4C8DFF]' : 'bg-[#1B3A6B]/10 text-[#1B3A6B]'
                        : mutedText
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className={`lg:col-span-2 rounded-lg border p-4 md:p-6 ${cardClasses}`}>
            {/* Navigation tabs - Desktop, styled as a folder index */}
            <div className={`mb-6 hidden flex-col gap-4 border-b pb-4 lg:flex xl:flex-row xl:items-center xl:justify-between ${borderColor}`}>
              <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = section === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSection(tab.id as any)}
                      className={`press-fx flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium md:px-4 ${
                        active ? '' : `${mutedText} hover:${headingText}`
                      }`}
                      style={
                        active
                          ? { backgroundColor: isDark ? 'rgba(76,141,255,0.1)' : 'rgba(11,30,61,0.06)', color: accentBlue }
                          : undefined
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                  <input
                    placeholder="Search\u2026"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${baseInputClasses} py-2 pl-9 pr-4 text-sm`}
                  />
                </div>
                <button
                  onClick={() => (onNav ? onNav('pg-settings') : notify('Settings page is not connected yet.'))}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Settings</span>
                </button>
              </div>
            </div>

            {/* Content sections */}
            {section === 'overview' && (
              <div className="space-y-8">
                {/* Welcome banner — the one saturated surface on the page, gives the
                    otherwise all-white overview a focal point of color */}
                <div
                  className="relative overflow-hidden rounded-xl p-5 text-white sm:p-6"
                  style={{ background: `linear-gradient(120deg, ${primaryCta} 0%, #16305F 55%, ${accentBlue} 130%)` }}
                >
                  <div className="glow-orb h-56 w-56 opacity-20" style={{ top: '-40%', right: '-5%', backgroundColor: '#4C8DFF' }} />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Network overview</p>
                      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">Good to see you back.</h2>
                      <p className="mt-1 text-sm text-white/70">24 facilities online across the Lagos&ndash;Ibadan corridor &middot; {pendingCount} licence{pendingCount === 1 ? '' : 's'} awaiting review.</p>
                    </div>
                    <button
                      onClick={() => setSection('verification')}
                      className="press-fx flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur-sm hover:bg-white/20"
                    >
                      <UserCheck className="h-4 w-4" style={{ color: '#F0B27A' }} />
                      Review verifications
                    </button>
                  </div>
                </div>

                {/* Stats Grid — specimen-label cards */}
                <div>
                  <p className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Network snapshot</p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                      const trendColor = stat.trend === 'up' ? accentPositive : accentAmber;
                      return (
                        <div
                          key={stat.label}
                          className={`spec-card relative overflow-hidden rounded-xl p-4 ${interactiveCardClasses}`}
                          style={{ '--tick-color': accentBlue } as React.CSSProperties}
                        >
                          <div className="tick-br" />
                          <div className="absolute inset-y-0 left-0 w-0.75" style={{ backgroundColor: stat.color }} />
                          <div className="flex items-start justify-between">
                            <div>
                              <div className={`font-mono text-lg font-medium md:text-2xl ${headingText}`}>{stat.value}</div>
                              <div className={`text-xs ${mutedText} md:text-sm`}>{stat.label}</div>
                            </div>
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${stat.color}1A` }}
                            >
                              <Icon className="h-4 w-4" style={{ color: stat.color }} />
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1 font-mono text-xs" style={{ color: trendColor }}>
                            <TrendIcon className="h-3 w-3" />
                            <span>{stat.change}</span>
                            <span className={mutedText}>vs last period</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <p className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Quick actions</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => (action.label === 'Review verifications' ? setSection('verification') : notify(`${action.label}\u2026 started.`))}
                          className={`press-fx flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-medium text-left md:text-sm ${
                            isDark
                              ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0F2038]'
                              : 'border-[#E7ECF4] text-[#0B1E3D] bg-white hover:border-[#1B3A6B] hover:shadow-[0_4px_16px_-8px_rgba(15,30,61,0.18)] hover:-translate-y-px'
                          }`}
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{ backgroundColor: `${action.color}1A` }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: action.color }} />
                          </div>
                          <span className="hidden sm:inline">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Jump to Dashboard */}
                <div>
                  <p className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Jump to dashboard</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { id: 'pg-facilities', label: 'Facilities', icon: Building2, color: '#1B3A6B' },
                      { id: 'pg-users', label: 'Users', icon: Users, color: '#0F766E' },
                      { id: 'pg-audit', label: 'Audit log', icon: ClipboardList, color: '#6D28D9' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => goToDashboard(item.id as PageId)}
                          className={`press-fx flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium ${
                            isDark
                              ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0F2038]'
                              : 'border-[#E7ECF4] bg-white text-[#0B1E3D] hover:border-[#C9D6E8] hover:shadow-[0_4px_16px_-8px_rgba(15,30,61,0.18)]'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-md"
                              style={{ backgroundColor: `${item.color}1A` }}
                            >
                              <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                            </div>
                            {item.label}
                          </span>
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {section === 'users' && (
              <div className="mt-2">
                
                <UsersPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
              </div>
            )}

            {section === 'facilities' && (
              <div className="mt-2">
                
                <FacilitiesPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
              </div>
            )}

            {section === 'audit' && (
              <div className="mt-2">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className={`font-display text-lg font-semibold ${headingText}`}>Audit log</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => notify('Filter panel opened.')}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                        isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                      }`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </button>
                    <button
                      onClick={() => notify('Audit log exported.')}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                        isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                      }`}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>
                </div>
                <AuditPage />
              </div>
            )}

            {section === 'verification' && (() => {
              const q = search.trim().toLowerCase();
              const visible = applications.filter((a) => {
                const inStatus =
                  statusFilter === 'ALL' ||
                  (statusFilter === 'REVIEW' ? a.status === 'PENDING' || a.status === 'MANUAL_REVIEW' : a.status === statusFilter);
                const inType = typeFilter === 'ALL' || a.accountType === typeFilter;
                const inSearch = !q || a.name.toLowerCase().includes(q) || a.license.toLowerCase().includes(q);
                return inStatus && inType && inSearch;
              });
              const chip = (active: boolean) =>
                `press-fx rounded-md border px-3 py-1.5 text-xs font-medium ${
                  active
                    ? isDark ? 'border-[#4C8DFF] bg-[#4C8DFF]/10 text-[#4C8DFF]' : 'border-[#1B3A6B] bg-[#1B3A6B]/10 text-[#1B3A6B]'
                    : `${borderColor} ${mutedText}`
                }`;
              const statusColor: Record<VerificationStatus, string> = {
                VERIFIED: accentPositive,
                REJECTED: '#B91C1C',
                PENDING: accentAmber,
                MANUAL_REVIEW: accentAmber,
              };
              const statusLabel: Record<VerificationStatus, string> = {
                VERIFIED: 'Verified',
                REJECTED: 'Rejected',
                PENDING: 'Pending',
                MANUAL_REVIEW: 'Needs review',
              };
              return (
                <div className="space-y-4">
                  <div>
                    <h3 className={`font-display text-lg font-semibold ${headingText}`}>Licence verification</h3>
                    <p className={`text-sm ${mutedText}`}>
                      Doctors, pharmacists and pharmacy stores only see their own workspace once approved. Registry results are a first check, not proof of identity.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {([['REVIEW', `Needs review (${pendingCount})`], ['VERIFIED', 'Verified'], ['REJECTED', 'Rejected'], ['ALL', 'All']] as const).map(([id, label]) => (
                      <button key={id} onClick={() => setStatusFilter(id)} className={chip(statusFilter === id)}>{label}</button>
                    ))}
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as AccountType | 'ALL')}
                      className={`${baseInputClasses} ml-auto w-auto px-3 py-1.5 text-xs`}
                    >
                      <option value="ALL">All account types</option>
                      {ACCOUNT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>

                  {visible.length === 0 && (
                    <div className={`rounded-xl border border-dashed p-8 text-center text-sm ${borderColor} ${mutedText}`}>
                      Nothing to show for this filter.
                    </div>
                  )}

                  {visible.map((app) => {
                    const Icon = TYPE_ICONS[app.accountType];
                    const info = getAccountInfo(app.accountType)!;
                    const open = app.status === 'PENDING' || app.status === 'MANUAL_REVIEW';
                    return (
                      <div key={app.id} className={`rounded-xl p-4 ${interactiveCardClasses}`}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`rounded-md border p-2 ${borderColor}`}>
                              <Icon className={`h-5 w-5 ${mutedText}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`font-medium ${headingText}`}>{app.name}</span>
                                <span className="font-mono text-[11px]" style={{ color: statusColor[app.status] }}>● {statusLabel[app.status]}</span>
                              </div>
                              <div className={`text-sm ${mutedText}`}>{info.label} &middot; {app.workplace}</div>
                              <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs ${mutedText}`}>
                                <span>{info.registry.replace('_', ' ')}: {app.license}</span>
                                <span style={{ color: app.registryResult === 'MATCH' ? accentPositive : accentAmber }}>{REGISTRY_TEXT[app.registryResult]}</span>
                                <span>{app.submitted}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => recheck(app)}
                              disabled={rechecking === app.id}
                              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 disabled:opacity-60 ${
                                isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                              }`}
                            >
                              {rechecking === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                              Re-check registry
                            </button>
                            {app.status !== 'VERIFIED' && (
                              <button
                                onClick={() => decide(app, 'VERIFIED')}
                                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white"
                                style={{ backgroundColor: accentBlue }}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Approve
                              </button>
                            )}
                            {open && (
                              <button
                                onClick={() => decide(app, 'REJECTED')}
                                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium"
                                style={{ borderColor: accentAmber, color: accentAmber }}
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {section === 'roles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-display text-lg font-semibold ${headingText}`}>Roles & permissions</h3>
                  <button
                    onClick={() => notify('Create role form opened.')}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150"
                    style={{ backgroundColor: accentAmber }}
                  >
                    <Plus className="h-4 w-4" />
                    Create role
                  </button>
                </div>
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div key={role.name} className={`rounded-xl p-4 ${interactiveCardClasses}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-md border p-2 ${borderColor}`}>
                            <Icon className={`h-5 w-5 ${mutedText}`} />
                          </div>
                          <div>
                            <div className={`font-medium ${headingText}`}>{role.name}</div>
                            <div className={`text-sm ${mutedText}`}>{role.desc}</div>
                            <div className={`mt-1 flex items-center gap-2 font-mono text-xs ${mutedText}`}>
                              <Users className="h-3 w-3" />
                              {role.count}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {role.sees.map((s) => (
                                <span key={s} className={`rounded-md border px-2 py-0.5 text-[11px] ${borderColor} ${mutedText}`}>{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => notify(`Editing ${role.name}.`)}
                            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                              isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                            }`}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => notify(`${role.name} removed.`)}
                            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150"
                            style={{ borderColor: accentAmber, color: accentAmber }}
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {section === 'integrations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-display text-lg font-semibold ${headingText}`}>External integrations</h3>
                  <button
                    onClick={() => notify('Add integration form opened.')}
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150"
                    style={{ backgroundColor: accentBlue }}
                  >
                    <Plug className="h-4 w-4" />
                    Add integration
                  </button>
                </div>
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  const isActive = integration.status === 'Active';
                  return (
                    <div key={integration.name} className={`rounded-xl p-4 ${interactiveCardClasses}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-md border p-2 ${borderColor}`}>
                            <Icon className={`h-5 w-5 ${mutedText}`} />
                          </div>
                          <div>
                            <div className={`font-medium ${headingText}`}>{integration.name}</div>
                            <div className={`text-sm ${mutedText}`}>{integration.desc}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-3">
                              <span
                                className="inline-flex items-center gap-1.5 font-mono text-xs"
                                style={{ color: isActive ? accentPositive : accentAmber }}
                              >
                                <span
                                  className="inline-block h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: isActive ? accentPositive : accentAmber }}
                                />
                                {integration.status}
                              </span>
                              <span className={`font-mono text-xs ${mutedText}`}>
                                <Clock className="mr-1 inline h-3 w-3" />
                                Last sync: {integration.lastSync}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => notify(isActive ? `${integration.name} synced.` : `Connecting ${integration.name}\u2026`)}
                            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                              isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                            }`}
                          >
                            {isActive ? <RefreshCw className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {isActive ? 'Sync' : 'Connect'}
                          </button>
                          <button
                            onClick={() => notify(`Configuring ${integration.name}.`)}
                            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                              isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                            }`}
                          >
                            <Settings className="h-3 w-3" />
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - Activity Feed styled as a chain-of-custody log */}
          <div className={`rounded-lg border p-4 md:p-6 ${cardClasses}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Chain of custody</p>
                <h3 className={`font-display text-lg font-semibold ${headingText}`}>Activity feed</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => notify('Activity feed filtered.')}
                  className={`rounded-md p-1.5 ${isDark ? 'hover:bg-[#0B1E33]' : 'hover:bg-[#EEF3FA]'}`}
                >
                  <Filter className={`h-4 w-4 ${mutedText}`} />
                </button>
                <Bell className={`h-4 w-4 ${mutedText}`} />
              </div>
            </div>
            <div className={`relative space-y-0 border-l pl-5 ${borderColor}`}>
              {activityFeed.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className={`relative -ml-2 rounded-lg py-1 pb-4 pl-2 pr-1 transition-colors duration-150 last:pb-0 ${isDark ? 'hover:bg-[#0B1E33]' : 'hover:bg-[#F8FAFC]'}`}>
                    <span
                      className="absolute -left-6.25 top-1 flex h-4 w-4 items-center justify-center rounded-sm border bg-inherit"
                      style={{ borderColor: item.alert ? accentAmber : borderColor.includes('26364C') ? '#1E3358' : '#E2E8F0' }}
                    >
                      <Icon className="h-2.5 w-2.5" style={{ color: item.alert ? accentAmber : (isDark ? '#8CA0BE' : '#5B6B85') }} />
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`text-sm ${headingText}`}>{item.action}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                          <span className={mutedText}>{item.time}</span>
                          <span className={mutedText}>&middot;</span>
                          <span className={mutedText}>{item.user}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => notify('Activity details opened.')}
                        className={`shrink-0 rounded p-1 ${isDark ? 'hover:bg-[#0B1E33]' : 'hover:bg-[#EEF3FA]'}`}
                      >
                        <MoreVertical className={`h-3.5 w-3.5 ${mutedText}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => notify('Loading full activity history\u2026')}
              className={`mt-4 w-full rounded-md border py-2 text-center text-sm font-medium transition-colors duration-150 ${
                isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
              }`}
            >
              View all activity
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;