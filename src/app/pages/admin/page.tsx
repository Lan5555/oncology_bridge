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
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  Trash2,
  Home,
  Database,
  ShieldCheck,
  UserCog,
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
  ChevronDown,
  Filter,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Zap,
  Server,
  Globe,
  Key,
  Fingerprint,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Truck,
  Pill,
  Heart,
  Stethoscope,
  Microscope,
  FlaskRound,
  Syringe,
  ClipboardCheck,
  FileCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  Crown,
  Sparkles,
  Gift,
  Target,
  Compass,
  Navigation,
  Layers,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [timeFrame, setTimeFrame] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [mounted, setMounted] = useState(false); // Track client-side mount

  // Detect theme and auth on client-side only
  useEffect(() => {
    setMounted(true);
    
    // Get theme from localStorage
    const storedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    
    // Get auth status
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

  // Theme-aware classes
  const shellClasses = isDark
    ? 'min-h-screen w-full bg-slate-950 text-slate-100'
    : 'min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900';
  
  const cardClasses = isDark
    ? 'border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-sm hover:shadow-3xl transition-all duration-300'
    : 'border-slate-200/80 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-sm hover:shadow-3xl transition-all duration-300';
  
  const baseInputClasses = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-800/50 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-800'
    : 'w-full rounded-xl border border-slate-200 bg-white/50 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white';
  
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const headingText = isDark ? 'text-slate-100' : 'text-slate-900';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'blue' },
    { id: 'users', label: 'Users', icon: Users, color: 'green' },
    { id: 'facilities', label: 'Facilities', icon: Building2, color: 'purple' },
    { id: 'audit', label: 'Audit', icon: ClipboardList, color: 'orange' },
    { id: 'roles', label: 'Roles', icon: Shield, color: 'red' },
    { id: 'integrations', label: 'Integrations', icon: Plug, color: 'teal' },
  ];

  const getTabColor = (tabId: string) => {
    const colors: Record<string, string> = {
      overview: isDark ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-600/30' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      users: isDark ? 'bg-green-600/20 text-green-400 ring-1 ring-green-600/30' : 'bg-green-50 text-green-700 ring-1 ring-green-200',
      facilities: isDark ? 'bg-purple-600/20 text-purple-400 ring-1 ring-purple-600/30' : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
      audit: isDark ? 'bg-orange-600/20 text-orange-400 ring-1 ring-orange-600/30' : 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
      roles: isDark ? 'bg-red-600/20 text-red-400 ring-1 ring-red-600/30' : 'bg-red-50 text-red-700 ring-1 ring-red-200',
      integrations: isDark ? 'bg-teal-600/20 text-teal-400 ring-1 ring-teal-600/30' : 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
    };
    return colors[tabId] || '';
  };

  // Quick stats data
  const stats = [
    { label: 'Total Facilities', value: '24', change: '+12%', icon: Building2, trend: 'up', color: 'blue' },
    { label: 'Active Users', value: '156', change: '+8%', icon: Users, trend: 'up', color: 'green' },
    { label: 'Inventory Items', value: '2,847', change: '+5%', icon: Package, trend: 'up', color: 'purple' },
    { label: 'Near Expiry', value: '7', change: '-3%', icon: AlertCircle, trend: 'down', color: 'red' },
    { label: 'Total Value', value: '₦4.2M', change: '+15%', icon: DollarSign, trend: 'up', color: 'emerald' },
    { label: 'Transactions', value: '1,234', change: '+22%', icon: Activity, trend: 'up', color: 'teal' },
  ];

  const getStatColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
      green: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600',
      purple: isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600',
      red: isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600',
      emerald: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      teal: isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600',
    };
    return colors[color] || '';
  };

  // Show loading state until client-side mount
  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-linear-to-br from-slate-50 via-white to-slate-50 text-slate-900">
        <div className="flex items-center justify-center px-4 py-12">
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-sm">
            <div className="mb-8 text-center">
              <div className="relative mx-auto mb-6 inline-block">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 shadow-2xl shadow-blue-900/50">
                  <ShieldCheck className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Admin Sign In
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Loading...
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className={`${shellClasses} flex items-center justify-center px-4 py-12`} suppressHydrationWarning>
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" suppressHydrationWarning>
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: isDark
                ? 'radial-gradient(circle at 1px 1px, rgba(96,165,250,0.3) 1px, transparent 0)'
                : 'radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
            suppressHydrationWarning
          />
        </div>
        
        <div className={`relative z-10 w-full max-w-md rounded-3xl border p-8 transition-all duration-500 hover:shadow-2xl ${cardClasses}`} suppressHydrationWarning>
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-6 inline-block">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-500/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-blue-900 via-blue-800 to-blue-700 shadow-2xl shadow-blue-900/50">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className={`text-3xl font-bold tracking-tight ${headingText}`}>
              Admin Sign In
            </h1>
            <p className={`mt-2 text-sm ${mutedText}`}>
              Secure access to system administration
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
            <div className="space-y-5">
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Username
                </label>
                <div className="relative group">
                  <User className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${mutedText} group-focus-within:text-blue-500`} />
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Enter your username"
                    className={`${baseInputClasses} py-3.5 pl-11 pr-4 transition-all duration-200 group-hover:border-blue-500/50`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative group">
                  <Lock className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${mutedText} group-focus-within:text-blue-500`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Enter your password"
                    className={`${baseInputClasses} py-3.5 pl-11 pr-12 transition-all duration-200 group-hover:border-blue-500/50`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${mutedText} hover:text-blue-500`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-blue-900 via-blue-800 to-blue-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              >
                <span className="relative flex items-center justify-center gap-2.5">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-linear-to-r from-transparent via-white/10 to-transparent" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className={`flex w-full items-center justify-center gap-2.5 rounded-xl border py-3.5 text-sm font-medium transition-all duration-300 hover:shadow-lg ${
                  isDark
                    ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                    : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <Home className="h-4 w-4" />
                Return to Home
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shellClasses} relative`} suppressHydrationWarning>
      {/* Animated background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" suppressHydrationWarning>
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle at 1px 1px, rgba(96,165,250,0.2) 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.1) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
          suppressHydrationWarning
        />
      </div>

      {/* Theme-aware overlay */}
      <div className={isDark ? 'dark-overlay' : 'blue-overlay'} suppressHydrationWarning />

      {/* Main content */}
      <div className="relative z-10 px-4 py-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-lg p-2 lg:hidden ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`text-2xl font-bold tracking-tight md:text-3xl ${headingText}`}>
                  Administration
                </h1>
                <span className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                } md:inline-block`}>
                  v2.0
                </span>
              </div>
              <p className={`text-sm ${mutedText}`}>System-wide management and configuration</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:text-sm ${
              isDark ? 'border-slate-700 bg-slate-800/50 text-slate-300' : 'border-slate-200 bg-white/50 text-slate-600'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              System Online
            </div>
            <button
              onClick={handleAdminLogout}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:shadow-lg md:px-4 md:py-2 md:text-sm ${
                isDark
                  ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                  : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        {isMobileMenuOpen && (
          <div className={`mb-4 rounded-xl border p-4 lg:hidden ${cardClasses}`}>
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setSection(tab.id as any); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      section === tab.id ? getTabColor(tab.id) : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
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
          <div className={`lg:col-span-2 rounded-2xl border p-4 transition-all duration-300 md:p-6 ${cardClasses}`}>
            {/* Navigation tabs - Desktop */}
            <div className="mb-6 hidden flex-col gap-4 lg:flex xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSection(tab.id as any)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 md:px-4 ${
                        section === tab.id ? getTabColor(tab.id) : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
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
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${baseInputClasses} py-2 pl-9 pr-4 text-sm`}
                  />
                </div>
                <button
                  onClick={() => onNav && onNav('pg-settings')}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-300 hover:shadow-lg ${
                    isDark
                      ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                      : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Settings</span>
                </button>
              </div>
            </div>

            {/* Content sections */}
            {section === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                    return (
                      <div
                        key={stat.label}
                        className={`group rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                          isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className={`text-lg font-bold md:text-2xl ${headingText}`}>{stat.value}</div>
                            <div className={`text-xs ${mutedText} md:text-sm`}>{stat.label}</div>
                          </div>
                          <div className={`rounded-lg p-2 transition-all duration-300 group-hover:scale-110 ${getStatColor(stat.color)}`}>
                            <Icon className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                        </div>
                        <div className={`mt-2 flex items-center gap-1 text-xs ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          <TrendIcon className="h-3 w-3" />
                          <span>{stat.change}</span>
                          <span className={`${mutedText}`}>vs last period</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className={`mb-3 text-sm font-semibold ${headingText}`}>Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {[
                      { label: 'Run Health Check', icon: Activity, color: 'blue' },
                      { label: 'Sync All Facilities', icon: RefreshCw, color: 'green' },
                      { label: 'Export Audit', icon: Download, color: 'purple' },
                      { label: 'Generate Report', icon: FileText, color: 'orange' },
                      { label: 'Manage Users', icon: Users, color: 'teal' },
                      { label: 'View Analytics', icon: BarChart3, color: 'pink' },
                    ].map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] md:text-sm ${
                            isDark
                              ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                              : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
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
                  <h3 className={`mb-3 text-sm font-semibold ${headingText}`}>Jump to Dashboard</h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { id: 'pg-facilities', label: 'Facilities', icon: Building2, color: 'blue' },
                      { id: 'pg-users', label: 'Users', icon: Users, color: 'green' },
                      { id: 'pg-audit', label: 'Audit Log', icon: ClipboardList, color: 'orange' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => goToDashboard(item.id as PageId)}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                            isDark
                              ? 'border-slate-700 bg-slate-800/30 text-slate-200 hover:border-slate-600 hover:bg-slate-700/30'
                              : 'border-slate-200 bg-white/30 text-slate-700 hover:border-slate-300 hover:bg-white'
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
                  <h2 className={`text-lg font-semibold ${headingText}`}>User Management</h2>
                  <button className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                    isDark ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}>
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </button>
                </div>
                <UsersPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
              </div>
            )}

            {section === 'facilities' && (
              <div className="mt-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className={`text-lg font-semibold ${headingText}`}>Facility Management</h2>
                  <button className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                    isDark ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}>
                    <Plus className="h-4 w-4" />
                    Add Facility
                  </button>
                </div>
                <FacilitiesPage onNav={(id: PageId) => { window.localStorage.setItem('adminTarget', id); router.push('/pages/dashboard'); }} onOpenModal={() => {}} />
              </div>
            )}

            {section === 'audit' && (
              <div className="mt-2">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className={`text-lg font-semibold ${headingText}`}>Audit Log</h2>
                  <div className="flex items-center gap-2">
                    <button className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                      isDark ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50' : 'border-slate-200 bg-white/50 text-slate-700 hover:bg-white'
                    }`}>
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </button>
                    <button className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                      isDark ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50' : 'border-slate-200 bg-white/50 text-slate-700 hover:bg-white'
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
                  <h3 className={`text-lg font-semibold ${headingText}`}>Roles & Permissions</h3>
                  <button className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                    isDark ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}>
                    <Plus className="h-4 w-4" />
                    Create Role
                  </button>
                </div>
                {[
                  { name: 'Network Admin', desc: 'Full access across all modules', count: '3 users', icon: ShieldCheck, color: 'red' },
                  { name: 'Facility Manager', desc: 'Manage facility inventory and users', count: '12 users', icon: Building2, color: 'blue' },
                  { name: 'Auditor', desc: 'Read-only access to audit logs', count: '5 users', icon: ClipboardList, color: 'green' },
                  { name: 'Inventory Manager', desc: 'Manage inventory and transfers', count: '8 users', icon: Package, color: 'purple' },
                ].map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.name}
                      className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                        isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white/50'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-lg p-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Icon className={`h-5 w-5 ${mutedText}`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${headingText}`}>{role.name}</div>
                            <div className={`text-sm ${mutedText}`}>{role.desc}</div>
                            <div className={`mt-1 flex items-center gap-2 text-xs ${mutedText}`}>
                              <Users className="h-3 w-3" />
                              {role.count}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:shadow-md ${
                            isDark
                              ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                              : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}>
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 transition-all duration-300 hover:bg-red-500/20 hover:shadow-md">
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
                  <h3 className={`text-lg font-semibold ${headingText}`}>External Integrations</h3>
                  <button className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                    isDark ? 'bg-teal-600/20 text-teal-400 hover:bg-teal-600/30' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  }`}>
                    <Plug className="h-4 w-4" />
                    Add Integration
                  </button>
                </div>
                {[
                  { name: 'HMO Sync', status: 'Active', lastSync: '12m ago', desc: 'Synchronize patient data with HMO providers', icon: Database, color: 'green' },
                  { name: 'NAFDAC API', status: 'Active', lastSync: '2h ago', desc: 'Drug verification and compliance checking', icon: ShieldCheck, color: 'blue' },
                  { name: 'GS1 Registry', status: 'Inactive', lastSync: 'Never', desc: 'GS1 barcode validation service', icon: LinkIcon, color: 'gray' },
                  { name: 'EHR Integration', status: 'Active', lastSync: '45m ago', desc: 'Electronic Health Records synchronization', icon: FileText, color: 'purple' },
                ].map((integration) => {
                  const Icon = integration.icon;
                  const isActive = integration.status === 'Active';
                  const statusColor = isActive ? 'text-green-500' : 'text-red-500';
                  return (
                    <div
                      key={integration.name}
                      className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                        isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white/50'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-lg p-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <Icon className={`h-5 w-5 ${mutedText}`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${headingText}`}>{integration.name}</div>
                            <div className={`text-sm ${mutedText}`}>{integration.desc}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-3">
                              <span className={`inline-flex items-center gap-1 text-xs ${statusColor}`}>
                                <span className={`relative flex h-1.5 w-1.5 ${isActive ? 'animate-pulse' : ''}`}>
                                  <span className={`absolute inline-flex h-full w-full rounded-full ${
                                    isActive ? 'bg-green-400' : 'bg-red-400'
                                  } opacity-75`} />
                                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                                    isActive ? 'bg-green-500' : 'bg-red-500'
                                  }`} />
                                </span>
                                {integration.status}
                              </span>
                              <span className={`text-xs ${mutedText}`}>
                                <Clock className="mr-1 inline h-3 w-3" />
                                Last sync: {integration.lastSync}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:shadow-md ${
                            isDark
                              ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                              : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}>
                            {isActive ? <RefreshCw className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {isActive ? 'Sync' : 'Connect'}
                          </button>
                          <button className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:shadow-md ${
                            isDark
                              ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                              : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
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

          {/* Sidebar - Activity Feed */}
          <div className={`rounded-2xl border p-4 transition-all duration-300 md:p-6 ${cardClasses}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${headingText}`}>Activity Feed</h3>
              <div className="flex items-center gap-2">
                <button className={`rounded-lg p-1.5 transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                  <Filter className={`h-4 w-4 ${mutedText}`} />
                </button>
                <Bell className={`h-4 w-4 ${mutedText}`} />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { action: 'Dr. Musa updated facility settings', time: '5m ago', user: 'Network Admin', icon: Settings, color: 'blue' },
                { action: 'Nurse Adebayo registered', time: '23m ago', user: 'System', icon: UserPlus, color: 'green' },
                { action: 'Inventory sync completed for LUTH', time: '1h ago', user: 'Auto-sync', icon: RefreshCw, color: 'purple' },
                { action: 'Security alert: Failed login attempt', time: '2h ago', user: 'System', icon: ShieldAlert, color: 'red' },
                { action: 'LUTH added 45 new vials', time: '3h ago', user: 'Inventory Manager', icon: Package, color: 'orange' },
                { action: 'Audit report generated', time: '5h ago', user: 'Auditor', icon: FileCheck, color: 'teal' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={`flex gap-3 rounded-lg border p-3 transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
                      isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white/50'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${mutedText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${headingText}`}>{item.action}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className={mutedText}>{item.time}</span>
                        <span className={`h-1 w-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                        <span className={mutedText}>{item.user}</span>
                      </div>
                    </div>
                    <button className={`shrink-0 rounded p-1 transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                      <MoreVertical className={`h-4 w-4 ${mutedText}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button className={`mt-4 w-full rounded-lg border py-2 text-center text-sm font-medium transition-all duration-300 hover:shadow-lg ${
              isDark
                ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50'
                : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white'
            }`}>
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;