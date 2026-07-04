'use client';

import { useState } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shellClasses = isDark
    ? 'min-h-screen w-full bg-slate-950 text-slate-100'
    : 'min-h-screen w-full bg-slate-50 text-slate-900';
  const cardClasses = isDark
    ? 'border-slate-800 bg-slate-900 shadow-xl shadow-black/20'
    : 'border-slate-200 bg-white shadow-xl shadow-slate-900/5';
  const sidePanelClasses = isDark
    ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800'
    : 'bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600';
  const sidePattern = isDark
    ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)'
    : 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const headingText = isDark ? 'text-slate-100' : 'text-slate-900';
  const labelText = isDark ? 'text-slate-300' : 'text-slate-700';
  const inputClasses = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
    : 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
  const secondaryButtonClasses = isDark
    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700'
    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50';
  const toggleButtonClasses = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-400 hover:text-blue-300'
    : 'border-blue-100 bg-white text-blue-700 hover:border-blue-300';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onDoLogin();
    }, 400);
  };

  return (
    <div className={`${shellClasses} lg:flex`}>
      {/* Left panel — fixed to viewport height, sticky on scroll */}
      <aside className={`relative hidden shrink-0 flex-col overflow-hidden px-10 py-10 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[440px] xl:w-[500px] ${sidePanelClasses}`}>
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: sidePattern,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top: brand + heading */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth={1.5} fill="none" />
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide text-blue-100">Oncology Bridge</span>
          </div>

          <h1 className="mt-8 text-[28px] font-semibold leading-tight tracking-tight text-white">
            Lagos–Ibadan
            <br />
            Oncology Network
          </h1>
          <p className="mt-3 max-w-[340px] text-[14px] leading-relaxed text-blue-100/85">
            Secure portal for redistribution and facility coordination — track inventory,
            audits, and near-expiry biologics across the corridor in real time.
          </p>
        </div>

        {/* Spacer absorbs leftover height instead of stretching content apart */}
        <div className="flex-1" />

        {/* Bottom: corridor visualization + badges, always in view */}
        <div className="relative">
          <svg viewBox="0 0 440 170" className="w-full max-w-[380px]">
            <path
              id="corridor-route"
              d="M70,135 C150,45 300,45 370,80"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={2}
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
            <circle cx="70" cy="135" r="6" fill="white" />
            <circle cx="370" cy="80" r="6" fill="white" />
            <circle r="5" fill="#93c5fd">
              <animateMotion dur="4.5s" repeatCount="indefinite">
                <mpath href="#corridor-route" />
              </animateMotion>
            </circle>
            <text x="52" y="156" fill="white" fontSize="12" fontWeight={600}>Lagos</text>
            <text x="336" y="66" fill="white" fontSize="12" fontWeight={600}>Ibadan</text>
          </svg>

          <div className="mt-5 flex flex-wrap gap-2">
            {['GS1 Verified', 'NAFDAC ML4', 'AES-256 Encrypted'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-blue-50 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right panel — scrolls independently, form is a true card */}
      <main className="relative flex flex-1 items-center justify-center px-6 py-12 lg:h-screen lg:overflow-y-auto">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle at 1px 1px, rgba(96,165,250,0.16) 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.15) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <button
          onClick={onToggleTheme}
          title="Toggle Dark Mode"
          className={`absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${toggleButtonClasses}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>

        <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-8 transition-colors duration-300 ${cardClasses}`}>
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
            </div>
            <span className={`text-sm font-semibold ${headingText}`}>Oncology Bridge</span>
          </div>

          <h2 className={`text-2xl font-semibold tracking-tight ${headingText}`}>
            {isLogin ? 'Sign in to your account' : 'Create a facility account'}
          </h2>
          <p className={`mt-1.5 text-sm ${mutedText}`}>
            {isLogin
              ? 'Enter your credentials to continue'
              : 'Provide facility details to join the network'}
          </p>

          {isLogin ? (
            <form className="mt-7 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@facility.org"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className={`${inputClasses} pr-10`}
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

              <div className="flex items-center flex items-center justify-between pt-1">
                <label className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <input type="checkbox" className={`h-4 w-4 rounded ${isDark ? 'border-slate-600 bg-slate-800 text-blue-500' : 'border-slate-300 text-blue-600'} focus:ring-blue-500`} />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => onShowAuth('register')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Register facility
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-70"
              >
                {submitting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                Sign In
              </button>

              <div className="relative py-1 text-center">
                <span className={`relative px-3 text-xs uppercase tracking-wide ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-400'}`}>
                  or continue with
                </span>
                <div className={`absolute inset-x-0 top-1/2 -z-10 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${secondaryButtonClasses}`}
                >
                  Google
                </button>
                <button
                  type="button"
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${secondaryButtonClasses}`}
                >
                  Microsoft
                </button>
              </div>
            </form>
          ) : (
            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onShowAuth('login');
              }}
            >
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LUTH Pharmacy"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Facility Type</label>
                  <select
                    required
                    className={inputClasses}
                  >
                    <option>Donor Hub</option>
                    <option>Recipient Hub</option>
                  </select>
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Admin Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@facility.org"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className={`${inputClasses} pr-10`}
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
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Confirm</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className={`${inputClasses} pr-10`}
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
                className="mt-1 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Create Account
              </button>

              <p className={`pt-1 text-center text-xs ${mutedText}`}>
                By registering you agree to our terms and privacy policy.
              </p>
            </form>
          )}
        </div>
      </main>

      <Link
        href="/admin"
        aria-label="Open Admin Console"
        className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:scale-105 hover:bg-blue-700"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2v20M2 12h20" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}