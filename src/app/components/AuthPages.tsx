'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthView } from "../lib/types";

interface AuthPagesProps {
  view: AuthView;
  theme: 'light' | 'dark';
  onDoLogin: () => void;
  onShowAuth: (view: 'login' | 'register') => void;
  onToggleTheme: () => void;
}

export default function AuthPages({ view, theme, onDoLogin, onShowAuth, onToggleTheme }: AuthPagesProps) {
  const isLogin = view === 'login';
  const isDark = theme === 'dark';
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [facilityName, setFacilityName] = useState<string>('');
  const [facilityType, setFacilityType] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shellClasses = isDark
    ? 'min-h-screen w-full bg-slate-950 text-slate-100'
    : 'min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900';
  
  const cardClasses = isDark
    ? 'border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-sm'
    : 'border-slate-200/80 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-sm';
  
  const sidePanelClasses = isDark
    ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900'
    : 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700';
  
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const headingText = isDark ? 'text-slate-100' : 'text-slate-900';
  const labelText = isDark ? 'text-slate-300' : 'text-slate-700';
  
  const inputClasses = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-800'
    : 'w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white';
  
  const secondaryButtonClasses = isDark
    ? 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-700/50 backdrop-blur-sm'
    : 'border-slate-200 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white backdrop-blur-sm';
  
  const toggleButtonClasses = isDark
    ? 'border-slate-700 bg-slate-900/50 text-slate-200 hover:border-blue-400 hover:text-blue-300 backdrop-blur-sm'
    : 'border-slate-200 bg-white/50 text-slate-700 hover:border-blue-300 hover:text-blue-600 backdrop-blur-sm';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onDoLogin();
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onShowAuth('login');
    }, 400);
  };

  // Fixed particle positions - deterministic on server and client
  const particles = [
    { size: 3, left: '15%', top: '20%', delay: '0s', duration: '15s' },
    { size: 4, left: '75%', top: '15%', delay: '1s', duration: '12s' },
    { size: 2, left: '25%', top: '60%', delay: '2s', duration: '18s' },
    { size: 5, left: '85%', top: '70%', delay: '0.5s', duration: '14s' },
    { size: 3, left: '45%', top: '80%', delay: '1.5s', duration: '16s' },
    { size: 4, left: '10%', top: '45%', delay: '3s', duration: '13s' },
  ];

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!isMounted) {
    return (
      <div className={`${shellClasses} lg:flex`}>
        {/* Static shell to prevent layout shift */}
        <aside className={`relative hidden shrink-0 flex-col overflow-hidden px-10 py-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-120 xl:w-135 ${sidePanelClasses}`}>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth={1.5} fill="none" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium tracking-wide text-blue-100">Oncology Bridge</span>
                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-blue-100 border border-white/10">v2.0</span>
              </div>
            </div>
            <div className="mt-10">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">Loading...</h1>
            </div>
          </div>
        </aside>
        <main className="relative flex flex-1 items-center justify-center px-4 py-12">
          <div className={`relative z-10 w-full max-w-md rounded-2xl border p-8 ${cardClasses}`}>
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${shellClasses} lg:flex`}>
      {/* Left Panel - Enhanced with animations */}
      <aside className={`relative hidden shrink-0 flex-col overflow-hidden px-10 py-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-120 xl:w-135 ${sidePanelClasses}`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 40%)',
          }} />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating particles - fixed positions */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-float"
              style={{
                width: particle.size + 'px',
                height: particle.size + 'px',
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm transition-all hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth={1.5} fill="none" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium tracking-wide text-blue-100">Oncology Bridge</span>
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-blue-100 border border-white/10">
                v2.0
              </span>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-10">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Lagos–Ibadan
              <br />
              <span className="text-blue-200">Oncology Network</span>
            </h1>
            <div className="mt-4 h-1 w-20 rounded-full bg-blue-400/50" />
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-blue-100/90">
              Secure portal for redistribution and facility coordination — track inventory,
              audits, and near-expiry biologics across the corridor in real time.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 flex gap-6">
            {[
              { label: 'Facilities', value: '24+' },
              { label: 'Transactions', value: '1.2K' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-blue-200/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        {/* Bottom */}
        <div className="relative z-10">
          <svg viewBox="0 0 440 170" className="w-full max-w-95">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>
            <path
              id="corridor-route"
              d="M70,135 C150,45 300,45 370,80"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth={2}
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
            <circle cx="70" cy="135" r="8" fill="white" className="shadow-lg" />
            <circle cx="370" cy="80" r="8" fill="white" className="shadow-lg" />
            <circle r="6" fill="#60a5fa" className="shadow-lg">
              <animateMotion dur="4s" repeatCount="indefinite">
                <mpath href="#corridor-route" />
              </animateMotion>
            </circle>
            <text x="45" y="160" fill="white" fontSize="13" fontWeight="600" className="drop-shadow-lg">Lagos</text>
            <text x="350" y="62" fill="white" fontSize="13" fontWeight="600" className="drop-shadow-lg">Ibadan</text>
          </svg>

          <div className="mt-4 flex flex-wrap gap-2">
            {['GS1 Verified', 'NAFDAC ML4', 'AES-256 Encrypted', 'HIPAA Compliant'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-blue-50 backdrop-blur-sm transition-all hover:bg-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Panel */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-12 lg:h-screen lg:overflow-y-auto">
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle at 1px 1px, rgba(96,165,250,0.2) 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.1) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all duration-300 hover:scale-110 ${toggleButtonClasses}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>

        {/* Card */}
        <div className={`relative z-10 w-full max-w-md rounded-2xl border p-8 transition-all duration-300 hover:shadow-2xl ${cardClasses}`}>
          {/* Mobile brand */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-900 to-blue-700 shadow-lg shadow-blue-500/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
            </div>
            <span className={`text-sm font-semibold ${headingText}`}>Oncology Bridge</span>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className={`text-2xl font-bold tracking-tight ${headingText}`}>
              {isLogin ? 'Welcome back' : 'Join the network'}
            </h2>
            <p className={`text-sm ${mutedText}`}>
              {isLogin
                ? 'Sign in to access your facility dashboard'
                : 'Create your facility account to get started'}
            </p>
          </div>

          {isLogin ? (
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@facility.org"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClasses} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      {showPassword ? (
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.3A9.8 9.8 0 0112 5c5 0 9 4 10 7-.4 1.1-1.1 2.3-2 3.4M6.2 6.6C4.3 8 3 9.9 2 12c1 3 5 7 10 7 1.3 0 2.6-.3 3.8-.7" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <>
                          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Removed "Remember me" checkbox - just the create account link */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onShowAuth('register')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create account
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-blue-900 via-blue-800 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all duration-300 hover:shadow-blue-900/40 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {submitting && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {submitting ? 'Signing in...' : 'Sign In'}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-linear-to-r from-transparent via-white/10 to-transparent" />
              </button>

              <div className="relative py-1">
                <div className={`absolute inset-x-0 top-1/2 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <span className={`relative px-3 text-xs uppercase tracking-wider ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-400'}`}>
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md ${secondaryButtonClasses}`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md ${secondaryButtonClasses}`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24h1.2c.9 0 1.8-.1 2.7-.3l-.4-1.9c-.8.2-1.6.3-2.4.3h-1.4c-4.2 0-7.6-3.4-7.6-7.6V8.4c0-4.2 3.4-7.6 7.6-7.6h1.4c4.2 0 7.6 3.4 7.6 7.6v4.6c0 1.4-.4 2.7-1.1 3.8l1.5 1.4c1-1.5 1.6-3.3 1.6-5.2V8.4C24 3.8 20.2 0 15.6 0h-1.4C9.8 0 6 3.8 6 8.4v6.2c0 4.6 3.8 8.4 8.4 8.4h1.4z" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleRegister}>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                  Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g. LUTH Pharmacy"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                    Facility Type
                  </label>
                  <select
                    required
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="">Select type</option>
                    <option value="donor">Donor Hub</option>
                    <option value="recipient">Recipient Hub</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                    Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Full Name"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="admin@facility.org"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClasses} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        {showPassword ? (
                          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.3A9.8 9.8 0 0112 5c5 0 9 4 10 7-.4 1.1-1.1 2.3-2 3.4M6.2 6.6C4.3 8 3 9.9 2 12c1 3 5 7 10 7 1.3 0 2.6-.3 3.8-.7" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <>
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>
                    Confirm
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClasses} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                      aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        {showConfirm ? (
                          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.3A9.8 9.8 0 0112 5c5 0 9 4 10 7-.4 1.1-1.1 2.3-2 3.4M6.2 6.6C4.3 8 3 9.9 2 12c1 3 5 7 10 7 1.3 0 2.6-.3 3.8-.7" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <>
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-blue-900 via-blue-800 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all duration-300 hover:shadow-blue-900/40 hover:scale-[1.02] disabled:opacity-70"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {submitting && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {submitting ? 'Creating...' : 'Create Account'}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 bg-linear-to-r from-transparent via-white/10 to-transparent" />
              </button>

              <p className={`pt-1 text-center text-xs ${mutedText}`}>
                By registering you agree to our{' '}
                <button type="button" className="text-blue-600 hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-600 hover:underline">
                  Privacy Policy
                </button>
              </p>
            </form>
          )}

          {/* Footer link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => onShowAuth(isLogin ? 'register' : 'login')}
              className={`text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-medium text-blue-600 hover:underline">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Admin Console Button */}
      <Link
        href="/pages/admin"
        aria-label="Open Admin Console"
        className="group fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-blue-900 to-blue-700 text-white shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-110 hover:shadow-blue-900/50"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 2v20M2 12h20" />
        </svg>
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
      </Link>
    </div>
  );
}