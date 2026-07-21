'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthView } from "../lib/types";
import {
  UserCogIcon,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Info,
  Clock,
} from 'lucide-react';
import { FACILITY_SERVICE } from '../services/facility-service/facility-service';
import { toast } from 'sonner';
import { AUTH_SERVICE } from '../services/auth-service/auth-service';

interface AuthPagesProps {
  view: AuthView;
  theme: 'light' | 'dark';
  onDoLogin: () => void;
  onShowAuth: (view: 'login' | 'register') => void;
  onToggleTheme: () => void;
}

const STEPS = [
  { id: 1, label: 'Facility Information' },
  { id: 2, label: 'Administrator' },
  { id: 3, label: 'Verification' },
] as const;

export default function AuthPages({ view, theme, onDoLogin, onShowAuth, onToggleTheme }: AuthPagesProps) {
  const isLogin = view === 'login';
  const isDark = theme === 'dark';
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Login
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Registration — Step 1: Facility Information
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [facilityName, setFacilityName] = useState<string>('');
  const [facilityType, setFacilityType] = useState<string>('');
  const [facilityEmail, setFacilityEmail] = useState<string>('');
  const [facilityPhone, setFacilityPhone] = useState<string>('');
  const [facilityAddress, setFacilityAddress] = useState<string>('');
  const [facilityCity, setFacilityCity] = useState<string>('');
  const [facilityState, setFacilityState] = useState<string>('');

  // Registration — Step 2: Primary Administrator
  const [adminFirstName, setAdminFirstName] = useState<string>('');
  const [adminLastName, setAdminLastName] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>('');
  const [adminPhone, setAdminPhone] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Theme tokens: white surfaces + dark navy/blue accent ---
  const shellClasses = isDark
    ? 'min-h-screen w-full bg-[#0A1628] text-[#EAF0FA]'
    : 'min-h-screen w-full bg-[#EEF3FA] text-[#0B1E3D]';

  const cardClasses = isDark
    ? 'border-[#1E3358] bg-[#0F2038]'
    : 'border-[#E2E8F0] bg-white';

  const sidePanelClasses = 'bg-gradient-to-br from-[#0B1E3D] via-[#122A4F] to-[#0A1628] text-[#EAF0FA]';

  const mutedText = isDark ? 'text-[#8CA0BE]' : 'text-[#5B6B85]';
  const headingText = isDark ? 'text-[#EAF0FA]' : 'text-[#0B1E3D]';
  const labelText = isDark ? 'text-[#B7C4DA]' : 'text-[#334862]';
  const borderColor = isDark ? 'border-[#1E3358]' : 'border-[#E2E8F0]';
  const accent = isDark ? '#4C8DFF' : '#1B3A6B';

  const inputClasses = isDark
    ? 'w-full rounded-lg border border-[#23385C] bg-[#0B1E33] px-4 py-3 text-sm text-[#EAF0FA] placeholder:text-[#5D7396] outline-none transition-colors duration-150 focus:border-[#4C8DFF]'
    : 'w-full rounded-lg border border-[#DCE3ED] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0B1E3D] placeholder:text-[#94A3B8] outline-none transition-colors duration-150 focus:border-[#1B3A6B]';

  const secondaryButtonClasses = isDark
    ? 'border-[#1E3358] bg-[#0B1E33] text-[#EAF0FA] hover:border-[#4C8DFF]'
    : 'border-[#E2E8F0] bg-white text-[#0B1E3D] hover:border-[#1B3A6B]';

  const toggleButtonClasses = isDark
    ? 'border-[#1E3358] bg-[#0F2038] text-[#EAF0FA] hover:border-[#4C8DFF]'
    : 'border-[#E2E8F0] bg-white text-[#0B1E3D] hover:border-[#1B3A6B]';

    function getOrCreateDeviceID() {
    // Check if an ID already exists in localStorage
    let deviceID = localStorage.getItem('web_device_id');
    
    if (!deviceID) {
        // Generate a cryptographically secure random UUID
        deviceID = crypto.randomUUID(); 
        // Store it for future visits
        localStorage.setItem('web_device_id', deviceID);
    }
    
    return deviceID;
}

  const handleLogin = async(e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      email,
      password
    };
    const res = await AUTH_SERVICE.signIn(payload);
    if(res.success){
      toast.success(res.message);
      onDoLogin();
      setSubmitting(false);
    }else{
      toast.error(res.message);
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async(e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      facility: {
      name: facilityName,
      facility_type: facilityType,
      email: facilityEmail,
      phone: facilityPhone,
      address: facilityAddress,
      city: facilityCity,
      state: facilityState
      },
      admin: {
        first_name: adminFirstName,
        last_name: adminLastName,
        phone: adminPhone,
        email: workEmail,
        password: confirmPassword,
        device_id: getOrCreateDeviceID()
      }
      
    }
    const res = await FACILITY_SERVICE.registerFacility(payload);
    if(res.success){
      setSubmitting(false);
      onShowAuth('login');
      toast.success(res.message);
    }else{
      toast.error(res.message);
      setSubmitting(false);
      console.log(res.message)
    }
  };

  const step1Valid = Boolean(
    facilityName.trim() && facilityType && facilityEmail.trim() && facilityPhone.trim() &&
    facilityAddress.trim() && facilityCity.trim() && facilityState.trim()
  );
  const passwordsMatch = registerPassword.length > 0 && registerPassword === confirmPassword;
  const step2Valid = Boolean(
    adminFirstName.trim() && adminLastName.trim() && workEmail.trim() && adminPhone.trim() &&
    registerPassword && confirmPassword && passwordsMatch
  );

  const goNext = () => setRegisterStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  const goBack = () => setRegisterStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

  // Fixed particle positions - deterministic on server and client
  const particles = [
    { size: 3, left: '15%', top: '20%', delay: '0s', duration: '15s' },
    { size: 4, left: '75%', top: '15%', delay: '1s', duration: '12s' },
    { size: 2, left: '25%', top: '60%', delay: '2s', duration: '18s' },
    { size: 5, left: '85%', top: '70%', delay: '0.5s', duration: '14s' },
    { size: 3, left: '45%', top: '80%', delay: '1.5s', duration: '16s' },
    { size: 4, left: '10%', top: '45%', delay: '3s', duration: '13s' },
  ];

  const networkBadges = [
    'GS1 DataMatrix Verification',
    'Cold Chain Monitoring',
    'AES-256 Encryption',
    'Role-Based Access Control',
    'Audit Logging',
    'Offline Sync',
  ];

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!isMounted) {
    return (
      <div className={`${shellClasses} lg:flex`}>
        <aside className={`relative hidden shrink-0 flex-col overflow-hidden px-10 py-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-120 xl:w-135 ${sidePanelClasses}`}>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth={1.5} fill="none" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium tracking-wide text-[#AFC6EE]">Oncology Bridge</span>
                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#AFC6EE] border border-white/10">v2.0</span>
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B3A6B] border-t-transparent" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${shellClasses} lg:flex`}>
      {/* Left Panel */}
      <aside className={`relative hidden shrink-0 flex-col overflow-hidden px-10 py-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-120 xl:w-135 ${sidePanelClasses}`}>
        {/* Ambient background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(76,141,255,0.35) 0%, transparent 40%)' }} />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
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
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-all hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth={1.5} fill="none" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-medium tracking-wide text-[#AFC6EE]">Oncology Bridge</span>
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#AFC6EE] border border-white/10">
                v2.0
              </span>
            </div>
          </div>

          <div className="mt-10">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Lagos–Ibadan
              <br />
              <span className="text-[#8FB4F0]">Oncology Network</span>
            </h1>
            <div className="mt-4 h-1 w-20 rounded-full bg-[#4C8DFF]/60" />
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#C3D3EC]">
              Secure collaboration platform connecting verified oncology facilities for
              inventory visibility, medicine verification, and safe redistribution across Nigeria.
            </p>
          </div>

          <div className="mt-8 flex gap-6">
            {[
              { label: 'Facilities', value: '24+' },
              { label: 'Transactions', value: '1.2K' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-[#8FA6CB]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1" />

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
            <circle cx="70" cy="135" r="8" fill="white" />
            <circle cx="370" cy="80" r="8" fill="white" />
            <circle r="6" fill="#4C8DFF">
              <animateMotion dur="4s" repeatCount="indefinite">
                <mpath href="#corridor-route" />
              </animateMotion>
            </circle>
            <text x="45" y="160" fill="white" fontSize="13" fontWeight="600">Lagos</text>
            <text x="350" y="62" fill="white" fontSize="13" fontWeight="600">Ibadan</text>
          </svg>

          <div className="mt-4 flex flex-wrap gap-2">
            {networkBadges.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#DCE7F8] transition-colors hover:bg-white/10"
              >
                <Check className="h-3 w-3 text-[#7FB0FF]" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Panel */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-12 lg:h-screen lg:overflow-y-auto">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle at 1px 1px, rgba(76,141,255,0.25) 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, rgba(27,58,107,0.15) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <button
          onClick={onToggleTheme}
          className={`absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-colors duration-200 ${toggleButtonClasses}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>

        <div className={`relative z-10 w-full ${isLogin ? 'max-w-md' : 'max-w-xl'} rounded-2xl border p-8 transition-all duration-300 ${cardClasses}`}>
          {/* Mobile brand */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1E3D]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
            </div>
            <span className={`text-sm font-semibold ${headingText}`}>Oncology Bridge</span>
          </div>

          {isLogin ? (
            <>
              {/* Header */}
              <div className="space-y-1">
                <h2 className={`text-2xl font-bold tracking-tight ${headingText}`}>Welcome back</h2>
                <p className={`text-sm ${mutedText}`}>Sign in to access your facility dashboard</p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Email Address</label>
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
                  <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Password</label>
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
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${mutedText}`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => { onShowAuth('register'); setRegisterStep(1); }}
                    className="text-sm font-medium transition-colors"
                    style={{ color: accent }}
                  >
                    Create account
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-70"
                  style={{ backgroundColor: '#0B1E3D' }}
                >
                  {submitting && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative py-1">
                  <div className={`absolute inset-x-0 top-1/2 h-px ${isDark ? 'bg-[#1E3358]' : 'bg-[#E2E8F0]'}`} />
                  <span className={`relative px-3 text-xs uppercase tracking-wider ${isDark ? 'bg-[#0F2038] text-[#8CA0BE]' : 'bg-white text-slate'}`}>
                    Or continue with
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors duration-150 ${secondaryButtonClasses}`}
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
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors duration-150 ${secondaryButtonClasses}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.4 24h1.2c.9 0 1.8-.1 2.7-.3l-.4-1.9c-.8.2-1.6.3-2.4.3h-1.4c-4.2 0-7.6-3.4-7.6-7.6V8.4c0-4.2 3.4-7.6 7.6-7.6h1.4c4.2 0 7.6 3.4 7.6 7.6v4.6c0 1.4-.4 2.7-1.1 3.8l1.5 1.4c1-1.5 1.6-3.3 1.6-5.2V8.4C24 3.8 20.2 0 15.6 0h-1.4C9.8 0 6 3.8 6 8.4v6.2c0 4.6 3.8 8.4 8.4 8.4h1.4z" />
                    </svg>
                    Microsoft
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { onShowAuth('register'); setRegisterStep(1); }}
                  className={`text-sm transition-colors ${mutedText}`}
                >
                  Don&apos;t have an account?{' '}
                  <span className="font-medium hover:underline" style={{ color: accent }}>Sign up</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-1 mt-30">
                <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}>Network Application</p>
                <h2 className={`text-2xl font-bold tracking-tight ${headingText}`}>Join the network</h2>
                <p className={`text-sm ${mutedText}`}>
                  Apply for your facility to join the Oncology Bridge network. Every application is reviewed and verified.
                </p>
              </div>

              {/* Step indicator */}
              <div className="mt-6 flex items-center">
                {STEPS.map((step, i) => {
                  const isComplete = registerStep > step.id;
                  const isActive = registerStep === step.id;
                  return (
                    <div key={step.id} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-200"
                          style={{
                            borderColor: isComplete || isActive ? accent : (isDark ? '#1E3358' : '#E2E8F0'),
                            backgroundColor: isComplete ? accent : 'transparent',
                            color: isComplete ? '#FFFFFF' : isActive ? accent : (isDark ? '#8CA0BE' : '#94A3B8'),
                          }}
                        >
                          {isComplete ? <Check className="h-4 w-4" /> : step.id}
                        </div>
                        <span
                          className={`hidden text-center text-[11px] font-medium sm:block ${isActive || isComplete ? headingText : mutedText}`}
                          style={{ maxWidth: '90px' }}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className="mx-2 h-0.5 flex-1 transition-colors duration-200"
                          style={{ backgroundColor: isComplete ? accent : (isDark ? '#1E3358' : '#E2E8F0') }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleRegisterSubmit}>
                {registerStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" style={{ color: accent }} />
                      <h3 className={`text-sm font-semibold uppercase tracking-wide ${headingText}`}>Facility Information</h3>
                    </div>

                    <div>
                      <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Facility Name</label>
                      <input
                        type="text"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        placeholder="e.g. LUTH Pharmacy"
                        className={inputClasses}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Facility Type</label>
                        <select value={facilityType} onChange={(e) => setFacilityType(e.target.value)} className={inputClasses}>
                          <option value="">Select type</option>
                          <option value="HOSPITAL">Hospital</option>
                          <option value="CANCER_CENTER">Cancer Center</option>
                          <option value="CLINIC">Oncology Clinic</option>
                          <option value="PHARMACY">Pharmacy</option>
                        </select>
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Phone Number</label>
                        <div className="relative">
                          <Phone className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                          <input
                            type="tel"
                            value={facilityPhone}
                            onChange={(e) => setFacilityPhone(e.target.value)}
                            placeholder="+234"
                            className={`${inputClasses} pl-10`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Official Facility Email</label>
                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                        <input
                          type="email"
                          value={facilityEmail}
                          onChange={(e) => setFacilityEmail(e.target.value)}
                          placeholder="records@facility.org"
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Address</label>
                      <div className="relative">
                        <MapPin className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`} />
                        <input
                          type="text"
                          value={facilityAddress}
                          onChange={(e) => setFacilityAddress(e.target.value)}
                          placeholder="Street address"
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>City</label>
                        <input
                          type="text"
                          value={facilityCity}
                          onChange={(e) => setFacilityCity(e.target.value)}
                          placeholder="e.g. Lagos"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>State</label>
                        <input
                          type="text"
                          value={facilityState}
                          onChange={(e) => setFacilityState(e.target.value)}
                          placeholder="e.g. Lagos State"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {registerStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" style={{ color: accent }} />
                      <h3 className={`text-sm font-semibold uppercase tracking-wide ${headingText}`}>Primary Administrator</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>First Name</label>
                        <input
                          type="text"
                          value={adminFirstName}
                          onChange={(e) => setAdminFirstName(e.target.value)}
                          placeholder="First name"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Last Name</label>
                        <input
                          type="text"
                          value={adminLastName}
                          onChange={(e) => setAdminLastName(e.target.value)}
                          placeholder="Last name"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Work Email</label>
                        <input
                          type="email"
                          value={workEmail}
                          onChange={(e) => setWorkEmail(e.target.value)}
                          placeholder="admin@facility.org"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Phone Number</label>
                        <input
                          type="tel"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          placeholder="+234"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`${inputClasses} pr-11`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={`mb-1.5 block text-sm font-medium ${labelText}`}>Confirm</label>
                        <div className="relative">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`${inputClasses} pr-11`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                            aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs" style={{ color: '#C4622D' }}>Passwords do not match.</p>
                    )}

                    <div className={`flex items-start gap-2.5 rounded-lg border p-3.5 ${borderColor} ${isDark ? 'bg-[#0B1E33]' : 'bg-[#F8FAFC]'}`}>
                      <Info className={`mt-0.5 h-4 w-4 shrink-0 ${mutedText}`} />
                      <p className={`text-xs leading-relaxed ${mutedText}`}>
                        The first administrator will manage your facility account and can later invite pharmacists, oncologists, and other staff.
                      </p>
                    </div>
                  </div>
                )}

                {registerStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" style={{ color: accent }} />
                      <h3 className={`text-sm font-semibold uppercase tracking-wide ${headingText}`}>Verification</h3>
                    </div>

                    <div className={`rounded-lg border p-5 ${borderColor} ${isDark ? 'bg-[#0B1E33]' : 'bg-[#F8FAFC]'}`}>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: isDark ? 'rgba(76,141,255,0.15)' : 'rgba(27,58,107,0.08)' }}
                        >
                          <ShieldCheck className="h-5 w-5" style={{ color: accent }} />
                        </div>
                        <h4 className={`font-semibold ${headingText}`}>Verification Process</h4>
                      </div>
                      <ul className={`mt-4 space-y-2.5 text-sm ${mutedText}`}>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                          Your application will be reviewed by the Oncology Bridge Network.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                          Facility credentials may be verified before approval.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                          You&apos;ll receive an email once your account has been activated.
                        </li>
                      </ul>
                    </div>

                    <div className={`rounded-lg border p-4 ${borderColor}`}>
                      <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${mutedText}`}>Application summary</p>
                      <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                        <span className={mutedText}>Facility</span>
                        <span className={`text-right font-medium ${headingText}`}>{facilityName || '—'}</span>
                        <span className={mutedText}>Type</span>
                        <span className={`text-right font-medium ${headingText}`}>{facilityType || '—'}</span>
                        <span className={mutedText}>Administrator</span>
                        <span className={`text-right font-medium ${headingText}`}>
                          {adminFirstName || adminLastName ? `${adminFirstName} ${adminLastName}`.trim() : '—'}
                        </span>
                        <span className={mutedText}>Work Email</span>
                        <span className={`text-right font-medium ${headingText}`}>{workEmail || '—'}</span>
                      </div>
                    </div>

                    <p className={`text-center text-xs ${mutedText}`}>
                      By submitting you agree to our{' '}
                      <button type="button" className="hover:underline" style={{ color: accent }}>Terms of Service</button>{' '}
                      and{' '}
                      <button type="button" className="hover:underline" style={{ color: accent }}>Privacy Policy</button>
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-3 pt-2">
                  {registerStep > 1 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className={`flex items-center gap-1.5 rounded-lg border px-4 py-3 text-sm font-medium transition-colors duration-150 ${secondaryButtonClasses}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}

                  {registerStep < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={registerStep === 1 ? !step1Valid : !step2Valid}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-50"
                      style={{ backgroundColor: '#0B1E3D' }}
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-70"
                      style={{ backgroundColor: '#0B1E3D' }}
                    >
                      {submitting && (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      )}
                      {submitting ? 'Submitting...' : 'Submit Facility Application'}
                    </button>
                  )}
                </div>

                {registerStep === 3 && (
                  <div className={`flex items-center justify-center gap-1.5 text-xs ${mutedText}`}>
                    <Clock className="h-3.5 w-3.5" />
                    Average approval time: <span className={`font-medium ${headingText}`}>24–48 hours</span>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => onShowAuth('login')}
                  className={`text-sm transition-colors ${mutedText}`}
                >
                  Already approved?{' '}
                  <span className="font-medium hover:underline" style={{ color: accent }}>Sign In</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Admin Console Button */}
      <Link
        href="/pages/admin"
        aria-label="Open Admin Console"
        className={`group fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-colors duration-200 ${
          isDark ? 'border-[#1E3358] bg-[#0F2038] text-[#8CA0BE] hover:border-[#4C8DFF]' : 'border-[#E2E8F0] bg-white text-[#5B6B85] hover:border-[#1B3A6B]'
        }`}
      >
        <UserCogIcon className="h-5 w-5" />
      </Link>
    </div>
  );
}