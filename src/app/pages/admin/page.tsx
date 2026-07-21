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
} from 'lucide-react';

interface AdminPageProps {
  onNav?: (id: PageId) => void;
  onOpenModal?: (id: ModalId) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNav }) => {
  const [section, setSection] = useState<'overview' | 'roles' | 'integrations' | 'users' | 'facilities' | 'audit'>('overview');
  const [search, setSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // --- FIX: Initialize with safe defaults to prevent hydration mismatch ---
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false); // Track client-side mount

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

  const handleAdminLogin = () => {
    if (!adminUser || !adminPass) return;
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
    : 'min-h-screen w-full bg-[#EEF3FA] text-[#0B1E3D]';

  const cardClasses = isDark
    ? 'border border-[#1E3358] bg-[#0F2038]'
    : 'border border-[#E2E8F0] bg-white';

  const baseInputClasses = isDark
    ? 'w-full rounded-md border border-[#23385C] bg-[#0B1E33] text-sm text-[#EAF0FA] placeholder:text-[#5D7396] outline-none transition-colors duration-150 focus:border-[#4C8DFF]'
    : 'w-full rounded-md border border-[#DCE3ED] bg-[#F8FAFC] text-sm text-[#0B1E3D] placeholder:text-[#94A3B8] outline-none transition-colors duration-150 focus:border-[#1B3A6B]';

  const mutedText = isDark ? 'text-[#8CA0BE]' : 'text-[#5B6B85]';
  const headingText = isDark ? 'text-[#EAF0FA]' : 'text-[#0B1E3D]';
  const borderColor = isDark ? 'border-[#1E3358]' : 'border-[#E2E8F0]';
  const accentBlue = isDark ? '#4C8DFF' : '#1B3A6B';
  const accentAmber = isDark ? '#E08A4F' : '#C4622D';
  const accentPositive = isDark ? '#4C8DFF' : '#1B3A6B';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'audit', label: 'Audit', icon: ClipboardList },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ];

  // Quick stats — mono figures, muted trend copy instead of colored pill badges
  const stats = [
    { label: 'Total facilities', value: '24', change: '+12%', icon: Building2, trend: 'up' },
    { label: 'Active users', value: '156', change: '+8%', icon: Users, trend: 'up' },
    { label: 'Inventory items', value: '2,847', change: '+5%', icon: Package, trend: 'up' },
    { label: 'Near expiry', value: '7', change: '-3%', icon: AlertCircle, trend: 'down' },
    { label: 'Total value', value: '\u20a64.2M', change: '+15%', icon: DollarSign, trend: 'up' },
    { label: 'Transactions', value: '1,234', change: '+22%', icon: Activity, trend: 'up' },
  ];

  const activityFeed = [
    { action: 'Dr. Musa updated facility settings', time: '5m ago', user: 'Network Admin', icon: Settings },
    { action: 'Nurse Adebayo registered', time: '23m ago', user: 'System', icon: UserPlus },
    { action: 'Inventory sync completed for LUTH', time: '1h ago', user: 'Auto-sync', icon: RefreshCw },
    { action: 'Security alert: failed login attempt', time: '2h ago', user: 'System', icon: ShieldAlert, alert: true },
    { action: 'LUTH added 45 new vials', time: '3h ago', user: 'Inventory Manager', icon: Package },
    { action: 'Audit report generated', time: '5h ago', user: 'Auditor', icon: FileCheck },
  ];

  const roles = [
    { name: 'Network Admin', desc: 'Full access across all modules', count: '3 users', icon: ShieldCheck },
    { name: 'Facility Manager', desc: 'Manage facility inventory and users', count: '12 users', icon: Building2 },
    { name: 'Auditor', desc: 'Read-only access to audit logs', count: '5 users', icon: ClipboardList },
    { name: 'Inventory Manager', desc: 'Manage inventory and transfers', count: '8 users', icon: Package },
  ];

  const integrations = [
    { name: 'HMO Sync', status: 'Active', lastSync: '12m ago', desc: 'Synchronize patient data with HMO providers', icon: Database },
    { name: 'NAFDAC API', status: 'Active', lastSync: '2h ago', desc: 'Drug verification and compliance checking', icon: ShieldCheck },
    { name: 'GS1 Registry', status: 'Inactive', lastSync: 'Never', desc: 'GS1 barcode validation service', icon: LinkIcon },
    { name: 'EHR Integration', status: 'Active', lastSync: '45m ago', desc: 'Electronic Health Records synchronization', icon: FileText },
  ];

  const quickActions = [
    { label: 'Run health check', icon: Activity },
    { label: 'Sync all facilities', icon: RefreshCw },
    { label: 'Export audit', icon: Download },
    { label: 'Generate report', icon: FileText },
    { label: 'Manage users', icon: Users },
    { label: 'View analytics', icon: ClipboardList },
  ];

  const globalStyle = (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      .font-display { font-family: 'Source Serif 4', Georgia, serif; }
      .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      .font-ui { font-family: 'Inter', system-ui, sans-serif; }
      .spec-card { position: relative; }
      .spec-card::before, .spec-card::after,
      .spec-card .tick-br::before, .spec-card .tick-br::after { content: ''; position: absolute; width: 8px; height: 8px; }
      .spec-card::before { top: -1px; left: -1px; border-top: 1.5px solid var(--tick-color); border-left: 1.5px solid var(--tick-color); }
      .spec-card::after { top: -1px; right: -1px; border-top: 1.5px solid var(--tick-color); border-right: 1.5px solid var(--tick-color); }
      .spec-card .tick-br { position: absolute; inset: 0; }
      .spec-card .tick-br::before { bottom: -1px; left: -1px; top: auto; border-bottom: 1.5px solid var(--tick-color); border-left: 1.5px solid var(--tick-color); border-top: none; }
      .spec-card .tick-br::after { bottom: -1px; right: -1px; top: auto; border-bottom: 1.5px solid var(--tick-color); border-right: 1.5px solid var(--tick-color); border-top: none; }
    `}</style>
  );

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
      <div className={`${shellClasses} font-ui flex items-center justify-center px-4 py-12`} suppressHydrationWarning>
        {globalStyle}
        {/* restrained background: a faint label-grid, no blurred orbs */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? '#8CA0BE' : '#5B6B85'} 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
          suppressHydrationWarning
        />

        <div
          className={`spec-card relative z-10 w-full max-w-md rounded-lg p-8 ${cardClasses}`}
          style={{ '--tick-color': accentBlue } as React.CSSProperties}
        >
          <div className="tick-br" />
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-[#0B1E3D]">
              <ShieldCheck className="h-6 w-6 text-[#EEF3FA]" />
            </div>
            <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Oncology Bridge / Restricted</p>
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
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Enter your username"
                    className={`${baseInputClasses} py-3 pl-11 pr-4`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-xs font-medium uppercase tracking-wide ${isDark ? 'text-[#8CA0BE]' : 'text-[#5B6B85]'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
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

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2.5 rounded-md bg-[#0B1E3D] py-3 text-sm font-medium text-[#EEF3FA] transition-colors duration-150 hover:bg-[#1B3A6B] disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                {submitting ? 'Authenticating\u2026' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className={`flex w-full items-center justify-center gap-2.5 rounded-md border py-3 text-sm font-medium transition-colors duration-150 ${
                  isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                }`}
              >
                <Home className="h-4 w-4" />
                Return to home
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shellClasses} font-ui relative`} suppressHydrationWarning>
      {globalStyle}

      {/* Main content */}
      <div className="relative z-10 px-4 py-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-6 flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between ${borderColor}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-md p-2 lg:hidden ${isDark ? 'hover:bg-[#0F2038]' : 'hover:bg-[#E9EFF7]'}`}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Oncology Bridge</p>
              <div className="flex items-center gap-3">
                <h1 className={`font-display text-2xl font-semibold tracking-tight md:text-3xl ${headingText}`}>
                  Administration
                </h1>
                <span className={`hidden rounded border px-2 py-0.5 font-mono text-[11px] md:inline-block ${borderColor} ${mutedText}`}>
                  v2.0
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs ${borderColor} ${mutedText}`}>
              <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentPositive }} />
              System online
            </div>
            <button
              onClick={handleAdminLogout}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 md:px-4 md:py-2 md:text-sm ${
                isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

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
                      className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 md:px-4 ${
                        active
                          ? 'border-current'
                          : 'border-transparent'
                      } ${active ? headingText : `${mutedText} hover:${headingText}`}`}
                      style={active ? { borderColor: accentBlue, color: accentBlue } : undefined}
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
                  onClick={() => onNav && onNav('pg-settings')}
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
                          className="spec-card rounded-md border p-4"
                          style={{ '--tick-color': accentBlue, borderColor: isDark ? '#1E3358' : '#E2E8F0' } as React.CSSProperties}
                        >
                          <div className="tick-br" />
                          <div className="flex items-start justify-between">
                            <div>
                              <div className={`font-mono text-lg font-medium md:text-2xl ${headingText}`}>{stat.value}</div>
                              <div className={`text-xs ${mutedText} md:text-sm`}>{stat.label}</div>
                            </div>
                            <Icon className={`h-4 w-4 ${mutedText}`} />
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
                          className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs font-medium transition-colors duration-150 md:text-sm ${
                            isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
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
                      { id: 'pg-facilities', label: 'Facilities', icon: Building2 },
                      { id: 'pg-users', label: 'Users', icon: Users },
                      { id: 'pg-audit', label: 'Audit log', icon: ClipboardList },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => goToDashboard(item.id as PageId)}
                          className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                            isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
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
                <div className="mb-4 flex items-center justify-between">
                  <h2 className={`font-display text-lg font-semibold ${headingText}`}>User management</h2>
                  <button
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150"
                    style={{ backgroundColor: accentBlue }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add user
                  </button>
                </div>
                <UsersPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
              </div>
            )}

            {section === 'facilities' && (
              <div className="mt-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className={`font-display text-lg font-semibold ${headingText}`}>Facility management</h2>
                  <button
                    className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150"
                    style={{ backgroundColor: accentBlue }}
                  >
                    <Plus className="h-4 w-4" />
                    Add facility
                  </button>
                </div>
                <FacilitiesPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
              </div>
            )}

            {section === 'audit' && (
              <div className="mt-2">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className={`font-display text-lg font-semibold ${headingText}`}>Audit log</h2>
                  <div className="flex items-center gap-2">
                    <button className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                      isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                    }`}>
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </button>
                    <button className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                      isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                    }`}>
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>
                </div>
                <AuditPage />
              </div>
            )}

            {section === 'roles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`font-display text-lg font-semibold ${headingText}`}>Roles & permissions</h3>
                  <button
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
                    <div key={role.name} className={`rounded-md border p-4 ${borderColor}`}>
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
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                            isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                          }`}>
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
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
                    <div key={integration.name} className={`rounded-md border p-4 ${borderColor}`}>
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
                          <button className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                            isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                          }`}>
                            {isActive ? <RefreshCw className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {isActive ? 'Sync' : 'Connect'}
                          </button>
                          <button className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                            isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
                          }`}>
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
                <button className={`rounded-md p-1.5 ${isDark ? 'hover:bg-[#0B1E33]' : 'hover:bg-[#EEF3FA]'}`}>
                  <Filter className={`h-4 w-4 ${mutedText}`} />
                </button>
                <Bell className={`h-4 w-4 ${mutedText}`} />
              </div>
            </div>
            <div className={`relative space-y-0 border-l pl-5 ${borderColor}`}>
              {activityFeed.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative pb-5 last:pb-0">
                    <span
                      className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center rounded-sm border bg-inherit"
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
                      <button className={`shrink-0 rounded p-1 ${isDark ? 'hover:bg-[#0B1E33]' : 'hover:bg-[#EEF3FA]'}`}>
                        <MoreVertical className={`h-3.5 w-3.5 ${mutedText}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className={`mt-4 w-full rounded-md border py-2 text-center text-sm font-medium transition-colors duration-150 ${
              isDark ? 'border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]'
            }`}>
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;