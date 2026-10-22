"use client";
import BrandLogo from "./BrandLogo";

import {
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Info,
  Mail,
  MapPin,
  Moon,
  Phone,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  Store,
  Sun,
  User,
  UserCogIcon,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ACCOUNT_TYPES,
  type AccountType,
  getAccountInfo,
} from "../lib/accounts";
import type { AuthView } from "../lib/types";
import { FacilityResponse } from "../models/facility-model";
import { UserResponse } from "../models/user-model";
import { useProvider } from "../providers/provider";
import { AUTH_SERVICE } from "../services/auth-service/auth-service";
import { FACILITY_SERVICE } from "../services/facility-service/facility-service";
import { unwrapArray } from "../services/response-utils";
import { VERIFICATION_SERVICE } from "../services/verification-service/verification-service";
import auth from "./AuthPages.module.css";

interface AuthPagesProps {
  view: AuthView;
  theme: "light" | "dark";
  onDoLogin: () => void;
  onShowAuth: (view: "login" | "register") => void;
  onToggleTheme: () => void;
}

const STEPS = [
  { id: 1, label: "Account Type" },
  { id: 2, label: "Practice Details" },
  { id: 3, label: "Your Details" },
  { id: 4, label: "Verification" },
] as const;

const ACCOUNT_ICONS: Record<AccountType, typeof Stethoscope> = {
  DOCTOR: Stethoscope,
  PHARMACIST: Pill,
  PHARMACY_STORE: Store,
};

export default function AuthPages({
  view,
  theme,
  onDoLogin,
  onShowAuth,
  onToggleTheme,
}: AuthPagesProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isLogin = view === "login";
  const isDark = theme === "dark";
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState("");
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<
    "CREATE_FACILITY" | "JOIN_FACILITY"
  >("CREATE_FACILITY");
  const [publicFacilities, setPublicFacilities] = useState<any[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitiesError, setFacilitiesError] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");

  // Login
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Registration, Step 1: Facility Information
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3 | 4>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [licenseNumber, setLicenseNumber] = useState<string>("");
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [facilityName, setFacilityName] = useState<string>("");
  const [facilityType, setFacilityType] = useState<string>("");
  const [facilityEmail, setFacilityEmail] = useState<string>("");
  const [facilityPhone, setFacilityPhone] = useState<string>("");
  const [facilityAddress, setFacilityAddress] = useState<string>("");
  const [facilityCity, setFacilityCity] = useState<string>("");
  const [facilityState, setFacilityState] = useState<string>("");

  // Registration, Step 2: Primary Administrator
  const [adminFirstName, setAdminFirstName] = useState<string>("");
  const [adminLastName, setAdminLastName] = useState<string>("");
  const [workEmail, setWorkEmail] = useState<string>("");
  const [adminPhone, setAdminPhone] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { setUser, setFacilityResponse } = useProvider();

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (view !== "register" || registrationMode !== "JOIN_FACILITY") return;
    let current = true;
    const timer = window.setTimeout(() => {
      setFacilitiesLoading(true);
      setFacilitiesError("");
      void FACILITY_SERVICE.publicFacilities(facilitySearch.trim())
        .then((response) => {
          if (!current) return;
          if (!response.success) {
            setFacilitiesError(
              response.message || "Facilities could not be loaded.",
            );
            setPublicFacilities([]);
            return;
          }
          setPublicFacilities(unwrapArray(response.data));
        })
        .finally(() => {
          if (current) setFacilitiesLoading(false);
        });
    }, 250);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [view, registrationMode, facilitySearch]);

  // --- Theme tokens: white surfaces + dark navy/blue accent ---

  const mutedText = isDark ? "text-[#8CA0BE]" : "text-[#5B6B85]";
  const headingText = isDark ? "text-[#EAF0FA]" : "text-[#0B1E3D]";
  const labelText = isDark ? "text-[#B7C4DA]" : "text-[#334862]";
  const borderColor = isDark ? "border-[#1E3358]" : "border-[#E2E8F0]";
  const accent = "var(--p)";

  const inputClasses = isDark
    ? "w-full rounded-lg border border-[#23385C] bg-[#0B1E33] px-4 py-3 text-sm text-[#EAF0FA] placeholder:text-[#5D7396] outline-none transition-colors duration-150 focus:border-[#4C8DFF]"
    : "w-full rounded-lg border border-[#DCE3ED] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0B1E3D] placeholder:text-[#94A3B8] outline-none transition-colors duration-150 focus:border-[#1B3A6B]";

  const secondaryButtonClasses = isDark
    ? "border-[#1E3358] bg-[#0B1E33] text-[#EAF0FA] hover:border-[#4C8DFF]"
    : "border-[#E2E8F0] bg-white text-[#0B1E3D] hover:border-[#1B3A6B]";

  function getOrCreateDeviceID() {
    // Check if an ID already exists in localStorage
    let deviceID = localStorage.getItem("web_device_id");

    if (!deviceID) {
      // Generate a cryptographically secure random UUID
      deviceID = crypto.randomUUID();
      // Store it for future visits
      localStorage.setItem("web_device_id", deviceID);
    }

    return deviceID;
  }

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { email, password };
    const res = await AUTH_SERVICE.signIn(payload);
    const responseCode = (res.code ?? "").toUpperCase();
    const responseMessage = res.message ?? "";
    const pendingReview =
      [
        "FACILITY_REVIEW_PENDING",
        "FACILITY_MEMBERSHIP_PENDING",
        "LICENSE_REVIEW_PENDING",
        "LICENCE_REVIEW_PENDING",
        "ACCOUNT_PENDING_REVIEW",
        "PENDING_REVIEW",
      ].includes(responseCode) ||
      (/await(?:ing|s)|pending/i.test(responseMessage) &&
        /(facility|licen[cs]e|account).*(review|approval)|review.*(facility|licen[cs]e|account)/i.test(
          responseMessage,
        ));
    if (pendingReview) {
      const message =
        responseMessage ||
        "Your account is awaiting facility and licence review. You cannot sign in until the review is complete.";
      setRegistrationNotice(message);
      toast.info(message);
      setSubmitting(false);
      return;
    }
    if (res.success && res.data) {
      toast.success(res.message);
      const user = UserResponse.fromJson(res.data);
      window.localStorage.setItem("userSession", JSON.stringify(res.data));
      setUser(user);
      onDoLogin();
      setSubmitting(false);
    } else {
      toast.error(res.message);
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: any) => {
    e.preventDefault();
    if (!accountType) return;
    setSubmitting(true);
    const info = getAccountInfo(accountType)!;
    const verification = await VERIFICATION_SERVICE.verifyLicense({
      licenseNumber: licenseNumber.trim(),
      registry: info.registry,
      lastName:
        accountType === "PHARMACY_STORE" ? undefined : adminLastName.trim(),
    });
    const licensePayload = {
      number: licenseNumber.trim(),
      registry: info.registry,
      // Compatibility only; the backend performs authoritative verification.
      verification_status: verification.status,
      registry_result: verification.registryResult,
    };
    const selectedFacility = publicFacilities.find(
      (facility) => String(facility.id) === selectedFacilityId,
    );
    const payload =
      registrationMode === "JOIN_FACILITY"
        ? {
            account_type: accountType,
            facility_id: selectedFacilityId,
            license: licensePayload,
            user: {
              first_name: adminFirstName,
              last_name: adminLastName,
              phone: adminPhone,
              email: workEmail,
              password: confirmPassword,
              device_id: getOrCreateDeviceID(),
            },
          }
        : {
            account_type: accountType,
            license: licensePayload,
            facility: {
              name: facilityName,
              facility_type: facilityType,
              email: isStore ? facilityEmail : workEmail,
              phone: facilityPhone,
              address: isStore
                ? facilityAddress
                : `${facilityCity}, ${facilityState}`,
              city: facilityCity,
              state: facilityState,
            },
            admin: {
              first_name: adminFirstName,
              last_name: adminLastName,
              phone: adminPhone,
              email: workEmail,
              password: confirmPassword,
              device_id: getOrCreateDeviceID(),
            },
          };
    const res =
      registrationMode === "JOIN_FACILITY"
        ? await FACILITY_SERVICE.registerUserToFacility(payload)
        : await FACILITY_SERVICE.registerFacility(payload);
    if (res.success && res.data) {
      setSubmitting(false);
      const facility =
        registrationMode === "JOIN_FACILITY"
          ? FacilityResponse.fromJson({
              facility: selectedFacility,
              admin: (res.data as any).user ?? (res.data as any).admin,
            })
          : FacilityResponse.fromJson(res.data);
      setFacilityResponse(facility);
      setRegistrationNotice(
        res.message ||
          (registrationMode === "JOIN_FACILITY"
            ? "Your request to join this facility was submitted. The facility administrator must review it, and your licence must be verified before access is enabled."
            : "Your registration was received and is awaiting facility and licence review."),
      );
      setRegistrationSubmitted(true);
      toast.success("Registration submitted for review.");
    } else {
      const message =
        res.status === 409
          ? res.message || "This email or licence is already registered."
          : res.status === 429
            ? res.message ||
              "Too many registration attempts. Please wait before trying again."
            : res.message;
      toast.error(message);
      setSubmitting(false);
    }
  };

  const isStore = accountType === "PHARMACY_STORE";
  const accountInfo = getAccountInfo(accountType ?? undefined);
  const selectedFacility = publicFacilities.find(
    (facility) => String(facility.id) === selectedFacilityId,
  );
  const step1Valid = accountType !== null;
  const step2Valid =
    registrationMode === "JOIN_FACILITY"
      ? Boolean(selectedFacilityId && selectedFacility)
      : Boolean(
          facilityName.trim() &&
            facilityType &&
            facilityPhone.trim() &&
            facilityCity.trim() &&
            facilityState.trim() &&
            (!isStore || (facilityEmail.trim() && facilityAddress.trim())),
        );
  const passwordsMatch =
    registerPassword.length > 0 && registerPassword === confirmPassword;
  const step3Valid = Boolean(
    adminFirstName.trim() &&
      adminLastName.trim() &&
      workEmail.trim() &&
      adminPhone.trim() &&
      registerPassword &&
      confirmPassword &&
      passwordsMatch,
  );
  const stepValid = [false, step1Valid, step2Valid, step3Valid][registerStep];
  const licenseValid = /^[A-Za-z0-9/-]{4,24}$/.test(licenseNumber.trim());

  const selectAccountType = (type: AccountType) => {
    setAccountType(type);
    setFacilityType(type === "PHARMACY_STORE" ? "PHARMACY" : "");
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Each registration step and completion screen must reset keyboard focus and scroll position.
  useEffect(() => {
    if (isLogin || !isMounted) return;
    const heading = cardRef.current?.querySelector<HTMLElement>("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    cardRef.current?.scrollIntoView({ block: "start" });
  }, [registerStep, registrationSubmitted, isLogin, isMounted]);

  const goNext = () =>
    setRegisterStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  const goBack = () =>
    setRegisterStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));

  if (!isMounted)
    return (
      <div className="flex min-h-svh items-center justify-center bg-g50">
        <span className="sr-only">Loading account access</span>
        <Clock className="size-6 animate-pulse text-p" />
      </div>
    );

  return (
    <div className={auth.page} data-theme={theme}>
      <aside className={auth.story} aria-label="About Oncosourz">
        <Link href="/" className={auth.brand}>
          <span className={auth.brandMark}>
            <BrandLogo markOnly className="size-9 rounded-lg bg-white" />
          </span>
          <span>
            <strong>Oncosourz</strong>
            <small>Connected oncology care</small>
          </span>
        </Link>
        <div className={auth.storyContent}>
          <div className={auth.eyebrow}>The Lagos-Ibadan oncology network</div>
          <h1>
            Better connected.
            <br />
            <span>Better care.</span>
          </h1>
          <p>
            A shared workspace for the people and facilities making oncology
            medicines more accessible.
          </p>
          <div className={auth.benefits}>
            <div className={auth.benefit}>
              <Building2 />
              <div>
                <strong>A network built around your team</strong>
                <p>
                  Connect your facility with doctors, pharmacists, and pharmacy
                  partners.
                </p>
              </div>
            </div>
            <div className={auth.benefit}>
              <Boxes />
              <div>
                <strong>More visibility. Fewer gaps.</strong>
                <p>
                  Find medicines, manage stock, and coordinate redistribution.
                </p>
              </div>
            </div>
            <div className={auth.benefit}>
              <ShieldCheck />
              <div>
                <strong>Professional access, verified</strong>
                <p>
                  Licence review and facility permissions support trusted
                  collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={auth.networkStats}>
          {[
            { label: "Professional review", value: "Licences" },
            { label: "Batch traceability", value: "GS1" },
            { label: "Secure checkout", value: "Paystack" },
          ].map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </aside>
      <main className={auth.main}>
        <header className={auth.topbar}>
          <Link href="/" className={auth.backLink}>
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
          <Link href="/" className={auth.brand + " " + auth.mobileBrand}>
            <span className={auth.brandMark}>
              <BrandLogo markOnly className="size-9 rounded-lg bg-white" />
            </span>
            <span>
              <strong>Oncosourz</strong>
              <small>Connected oncology care</small>
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggleTheme}
            className={auth.themeButton}
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>
        <div
          ref={cardRef}
          className={auth.card}
          data-view={isLogin ? "login" : "register"}
        >
          {isLogin ? (
            <>
              {/* Header */}
              <div className={auth.intro}>
                <span className={auth.kicker}>Your care network awaits</span>
                <h2
                  className={`text-2xl font-bold tracking-tight ${headingText}`}
                >
                  Welcome back
                </h2>
                <p className={`text-sm ${mutedText}`}>
                  Sign in to your facility workspace and pick up where you left
                  off.
                </p>
              </div>

              {registrationNotice && (
                <output
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-900"}`}
                >
                  {registrationNotice}
                </output>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="auth-input-1"
                    className={`mb-1.5 block text-sm font-medium ${labelText}`}
                  >
                    Email Address
                  </label>
                  <input
                    id="auth-input-1"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-input-2"
                    className={`mb-1.5 block text-sm font-medium ${labelText}`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-input-2"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClasses} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${mutedText}`}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium"
                    style={{ color: accent }}
                  >
                    Forgot password?
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onShowAuth("register");
                      setRegisterStep(1);
                      setRegistrationSubmitted(false);
                      setRegistrationNotice("");
                    }}
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
                  style={{
                    backgroundColor: "var(--p)",
                    color: isDark ? "#020617" : "#FFFFFF",
                  }}
                >
                  {submitting && (
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {submitting ? "Signing in..." : "Sign In"}
                </button>

                <p className={auth.secureNote}>
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                  Access is limited to approved professional accounts.
                </p>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onShowAuth("register");
                    setRegisterStep(1);
                    setRegistrationSubmitted(false);
                    setRegistrationNotice("");
                  }}
                  className={`text-sm transition-colors ${mutedText}`}
                >
                  Don&apos;t have an account?{" "}
                  <span
                    className="font-medium hover:underline"
                    style={{ color: accent }}
                  >
                    Sign up
                  </span>
                </button>
              </div>
            </>
          ) : registrationSubmitted ? (
            <section
              aria-labelledby="registration-status-title"
              className="py-3"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B3A6B]/10 text-[#1B3A6B] dark:bg-[#4C8DFF]/15 dark:text-[#8BB5FF]">
                <Clock className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="mt-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1B3A6B] dark:text-[#8BB5FF]">
                  {registrationMode === "JOIN_FACILITY"
                    ? "Join request received"
                    : "Application received"}
                </p>
                <h2
                  id="registration-status-title"
                  className={`mt-2 text-2xl font-bold tracking-tight ${headingText}`}
                >
                  Verification is in progress
                </h2>
                <p
                  className={`mx-auto mt-3 max-w-md text-sm leading-6 ${mutedText}`}
                >
                  {registrationMode === "JOIN_FACILITY"
                    ? "Your request is with the selected facility and our licence review team. We’ll let you know when both decisions are complete."
                    : "Your facility and licence details are with our review team. We’ll let you know when a decision is made."}{" "}
                  Your account will be ready to sign in after approval.
                </p>
              </div>

              <ol className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${headingText}`}>
                      {registrationMode === "JOIN_FACILITY"
                        ? "Join request submitted"
                        : "Registration submitted"}
                    </p>
                    <p className={`mt-0.5 text-xs ${mutedText}`}>
                      Your details have been received securely.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${headingText}`}>
                      {registrationMode === "JOIN_FACILITY"
                        ? "Facility membership and licence review"
                        : "Facility and licence review"}
                    </p>
                    <p className={`mt-0.5 text-xs ${mutedText}`}>
                      {registrationMode === "JOIN_FACILITY"
                        ? "The facility administrator reviews your access request; our team verifies your licence."
                        : "We’re checking the submitted information before enabling access."}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${isDark ? "border-[#29456F] text-[#8CA0BE]" : "border-[#D5DFEC] text-slate"}`}
                  >
                    3
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${headingText}`}>
                      Sign in after approval
                    </p>
                    <p className={`mt-0.5 text-xs ${mutedText}`}>
                      Your account remains inactive while review is pending.
                    </p>
                  </div>
                </li>
              </ol>

              <div
                className={`mt-7 rounded-xl border p-4 text-sm leading-6 ${isDark ? "border-[#29456F] bg-[#0A1628]/70 text-[#C7D4E8]" : "border-[#DCE6F2] bg-[#F6F9FD] text-[#40516B]"}`}
              >
                <div className="flex items-start gap-2.5">
                  <Info
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#4C8DFF]"
                    aria-hidden="true"
                  />
                  <p>{registrationNotice}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onShowAuth("login")}
                className="mt-6 w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{
                  backgroundColor: accent,
                  color: isDark ? "#020617" : "#FFFFFF",
                }}
              >
                Return to sign in
              </button>
              <p className={`mt-3 text-center text-xs ${mutedText}`}>
                You can sign in once your facility and licence are approved.
              </p>
            </section>
          ) : (
            <>
              {/* Header */}
              <div className={auth.intro}>
                <p
                  className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
                >
                  Network Application
                </p>
                <h2
                  className={`text-2xl font-bold tracking-tight ${headingText}`}
                >
                  Create your account
                </h2>
                <p className={`text-sm ${mutedText}`}>
                  Sign up as a doctor, pharmacist or pharmacy store. Your
                  professional licence is verified before you get full access.
                </p>
              </div>

              <ol className={auth.steps} aria-label="Registration progress">
                {STEPS.map((step) => (
                  <li
                    key={step.id}
                    className={auth.step}
                    aria-current={registerStep === step.id ? "step" : undefined}
                    data-complete={registerStep > step.id}
                  >
                    <span className={auth.stepNumber}>
                      {registerStep > step.id ? (
                        <Check className="size-3.5" />
                      ) : (
                        step.id
                      )}
                    </span>
                    <span>{step.label}</span>
                  </li>
                ))}
              </ol>
              <p className="sr-only" aria-live="polite">
                Step {registerStep} of 4: {STEPS[registerStep - 1].label}
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleRegisterSubmit}>
                {registerStep === 1 && (
                  <div className="space-y-4">
                    <section
                      className={`rounded-xl border p-4 ${borderColor}`}
                      aria-labelledby="registration-path-title"
                    >
                      <h3
                        id="registration-path-title"
                        className={`text-sm font-semibold ${headingText}`}
                      >
                        How would you like to register?
                      </h3>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {(
                          [
                            [
                              "CREATE_FACILITY",
                              "Create a facility",
                              "Register a new hospital, clinic, cancer center or pharmacy.",
                            ],
                            [
                              "JOIN_FACILITY",
                              "Join an existing facility",
                              "Find your workplace and request access.",
                            ],
                          ] as const
                        ).map(([mode, title, description]) => {
                          const selected = registrationMode === mode;
                          return (
                            <button
                              key={mode}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setRegistrationMode(mode)}
                              className={`rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${selected ? "shadow-md" : borderColor}`}
                              style={
                                selected
                                  ? {
                                      borderColor: accent,
                                      backgroundColor: isDark
                                        ? "rgba(76,141,255,0.1)"
                                        : "rgba(27,58,107,0.05)",
                                    }
                                  : undefined
                              }
                            >
                              <span
                                className="flex items-center gap-2 text-sm font-semibold"
                                style={{ color: selected ? accent : undefined }}
                              >
                                {mode === "CREATE_FACILITY" ? (
                                  <Building2 className="h-4 w-4" />
                                ) : (
                                  <UserPlus className="h-4 w-4" />
                                )}
                                {title}
                              </span>
                              <span
                                className={`mt-1 block text-xs leading-5 ${mutedText}`}
                              >
                                {description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                    <div className="flex items-center gap-2">
                      <BadgeCheck
                        className="h-4 w-4"
                        style={{ color: accent }}
                      />
                      <h3
                        className={`text-sm font-semibold uppercase tracking-wide ${headingText}`}
                      >
                        I am signing up as
                      </h3>
                    </div>
                    <div className="grid gap-3">
                      {ACCOUNT_TYPES.map((t) => {
                        const Icon = ACCOUNT_ICONS[t.id];
                        const selected = accountType === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => selectAccountType(t.id)}
                            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors duration-150 ${selected ? "" : borderColor}`}
                            style={
                              selected
                                ? {
                                    borderColor: accent,
                                    backgroundColor: isDark
                                      ? "rgba(76,141,255,0.1)"
                                      : "rgba(27,58,107,0.06)",
                                  }
                                : undefined
                            }
                          >
                            <Icon
                              className="mt-0.5 h-5 w-5 shrink-0"
                              style={{ color: accent }}
                            />
                            <span>
                              <span
                                className={`block text-sm font-semibold ${headingText}`}
                              >
                                {t.label}
                              </span>
                              <span className={`block text-xs ${mutedText}`}>
                                {t.blurb}
                              </span>
                              <span
                                className={`mt-1 block font-mono text-[10px] uppercase tracking-wider ${mutedText}`}
                              >
                                Workspace: {t.workspace}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {registerStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2
                        className="h-4 w-4"
                        style={{ color: accent }}
                      />
                      <h3
                        className={`text-sm font-semibold uppercase tracking-wide ${headingText}`}
                      >
                        {registrationMode === "CREATE_FACILITY"
                          ? isStore
                            ? "Create pharmacy facility"
                            : "Create facility"
                          : "Choose your facility"}
                      </h3>
                    </div>

                    {registrationMode === "CREATE_FACILITY" ? (
                      <>
                        <div>
                          <label
                            htmlFor="auth-input-3"
                            className={`mb-1.5 block text-sm font-medium ${labelText}`}
                          >
                            {isStore
                              ? "Pharmacy Name"
                              : "Hospital / Clinic / Pharmacy Name"}
                          </label>
                          <input
                            id="auth-input-3"
                            type="text"
                            value={facilityName}
                            onChange={(e) => setFacilityName(e.target.value)}
                            placeholder="Enter facility name"
                            className={inputClasses}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="auth-input-4"
                              className={`mb-1.5 block text-sm font-medium ${labelText}`}
                            >
                              Facility Type
                            </label>
                            <select
                              id="auth-input-4"
                              value={facilityType}
                              onChange={(e) => setFacilityType(e.target.value)}
                              className={inputClasses}
                            >
                              <option value="">Select type</option>
                              <option value="HOSPITAL">Hospital</option>
                              <option value="CANCER_CENTER">
                                Cancer Center
                              </option>
                              <option value="CLINIC">Oncology Clinic</option>
                              <option value="PHARMACY">Pharmacy</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="auth-input-5"
                              className={`mb-1.5 block text-sm font-medium ${labelText}`}
                            >
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone
                                className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
                              />
                              <input
                                autoComplete="tel"
                                id="auth-input-5"
                                type="tel"
                                value={facilityPhone}
                                onChange={(e) =>
                                  setFacilityPhone(e.target.value)
                                }
                                placeholder="Enter facility phone number"
                                className={`${inputClasses} pl-10`}
                              />
                            </div>
                          </div>
                        </div>

                        {isStore && (
                          <>
                            <div>
                              <label
                                htmlFor="auth-input-6"
                                className={`mb-1.5 block text-sm font-medium ${labelText}`}
                              >
                                Official Facility Email
                              </label>
                              <div className="relative">
                                <Mail
                                  className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
                                />
                                <input
                                  autoComplete="email"
                                  id="auth-input-6"
                                  type="email"
                                  value={facilityEmail}
                                  onChange={(e) =>
                                    setFacilityEmail(e.target.value)
                                  }
                                  placeholder="Enter facility email address"
                                  className={`${inputClasses} pl-10`}
                                />
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="auth-input-7"
                                className={`mb-1.5 block text-sm font-medium ${labelText}`}
                              >
                                Address
                              </label>
                              <div className="relative">
                                <MapPin
                                  className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
                                />
                                <input
                                  autoComplete="street-address"
                                  id="auth-input-7"
                                  type="text"
                                  value={facilityAddress}
                                  onChange={(e) =>
                                    setFacilityAddress(e.target.value)
                                  }
                                  placeholder="Street address"
                                  className={`${inputClasses} pl-10`}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="auth-input-8"
                              className={`mb-1.5 block text-sm font-medium ${labelText}`}
                            >
                              City
                            </label>
                            <input
                              autoComplete="address-level2"
                              id="auth-input-8"
                              type="text"
                              value={facilityCity}
                              onChange={(e) => setFacilityCity(e.target.value)}
                              placeholder="Enter city"
                              className={inputClasses}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="auth-input-9"
                              className={`mb-1.5 block text-sm font-medium ${labelText}`}
                            >
                              State
                            </label>
                            <input
                              autoComplete="address-level1"
                              id="auth-input-9"
                              type="text"
                              value={facilityState}
                              onChange={(e) => setFacilityState(e.target.value)}
                              placeholder="Enter state"
                              className={inputClasses}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 animate-fade-up">
                        <label
                          className={`block text-sm font-medium ${labelText}`}
                        >
                          Find your facility
                          <span className="relative mt-1.5 block">
                            <Search
                              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
                            />
                            <input
                              value={facilitySearch}
                              onChange={(event) => {
                                setFacilitySearch(event.target.value);
                                setSelectedFacilityId("");
                              }}
                              placeholder="Search by facility name, city or code"
                              className={`${inputClasses} pl-10`}
                            />
                          </span>
                        </label>
                        {facilitiesLoading && (
                          <p
                            className={`rounded-lg border p-4 text-sm ${borderColor} ${mutedText}`}
                          >
                            Loading active facilities…
                          </p>
                        )}
                        {facilitiesError && (
                          <div
                            role="alert"
                            className={`rounded-lg border p-4 text-sm ${isDark ? "border-red-400/30 text-red-200" : "border-red-200 bg-red-50 text-red-800"}`}
                          >
                            {facilitiesError}
                          </div>
                        )}
                        {!facilitiesLoading &&
                          !facilitiesError &&
                          publicFacilities.length === 0 && (
                            <p
                              className={`rounded-lg border border-dashed p-5 text-center text-sm ${borderColor} ${mutedText}`}
                            >
                              No active facilities found. Try another search, or
                              choose Create a facility.
                            </p>
                          )}
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                          {publicFacilities.map((facility) => {
                            const selected =
                              selectedFacilityId === String(facility.id);
                            return (
                              <button
                                key={facility.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  setSelectedFacilityId(String(facility.id))
                                }
                                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 hover:-translate-y-px ${selected ? "shadow-sm" : borderColor}`}
                                style={
                                  selected
                                    ? {
                                        borderColor: accent,
                                        backgroundColor: isDark
                                          ? "rgba(76,141,255,0.08)"
                                          : "rgba(27,58,107,0.04)",
                                      }
                                    : undefined
                                }
                              >
                                <Building2
                                  className="mt-0.5 h-4 w-4 shrink-0"
                                  style={{ color: accent }}
                                />
                                <span className="min-w-0 flex-1">
                                  <span
                                    className={`block text-sm font-semibold ${headingText}`}
                                  >
                                    {facility.name}
                                  </span>
                                  <span
                                    className={`mt-0.5 block text-xs ${mutedText}`}
                                  >
                                    {String(
                                      facility.facility_type ??
                                        facility.facilityType ??
                                        "Facility",
                                    ).replaceAll("_", " ")}{" "}
                                    ·{" "}
                                    {[facility.city, facility.state]
                                      .filter(Boolean)
                                      .join(", ") || "Location not listed"}
                                  </span>
                                  {facility.hospital_code && (
                                    <span
                                      className={`mt-1 block font-mono text-[10px] ${mutedText}`}
                                    >
                                      Code {facility.hospital_code}
                                    </span>
                                  )}
                                </span>
                                <span
                                  className={`mt-0.5 h-4 w-4 rounded-full border ${selected ? "border-4" : ""}`}
                                  style={{
                                    borderColor: selected
                                      ? accent
                                      : isDark
                                        ? "#496184"
                                        : "#CBD5E1",
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <p
                          className={`rounded-lg border p-3 text-xs leading-5 ${borderColor} ${mutedText}`}
                        >
                          Your request will go to the selected facility for
                          approval. The facility administrator and network
                          verification workflow must approve access before tools
                          are enabled.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {registerStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" style={{ color: accent }} />
                      <h3
                        className={`text-sm font-semibold uppercase tracking-wide ${headingText}`}
                      >
                        {registrationMode === "CREATE_FACILITY" && isStore
                          ? "Primary Administrator"
                          : "Your Details"}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="auth-input-10"
                          className={`mb-1.5 block text-sm font-medium ${labelText}`}
                        >
                          First Name
                        </label>
                        <input
                          autoComplete="given-name"
                          id="auth-input-10"
                          type="text"
                          value={adminFirstName}
                          onChange={(e) => setAdminFirstName(e.target.value)}
                          placeholder="First name"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="auth-input-11"
                          className={`mb-1.5 block text-sm font-medium ${labelText}`}
                        >
                          Last Name
                        </label>
                        <input
                          autoComplete="family-name"
                          id="auth-input-11"
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
                        <label
                          htmlFor="auth-input-12"
                          className={`mb-1.5 block text-sm font-medium ${labelText}`}
                        >
                          Work Email
                        </label>
                        <input
                          autoComplete="email"
                          id="auth-input-12"
                          type="email"
                          value={workEmail}
                          onChange={(e) => setWorkEmail(e.target.value)}
                          placeholder="Enter your work email address"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="auth-input-13"
                          className={`mb-1.5 block text-sm font-medium ${labelText}`}
                        >
                          Phone Number
                        </label>
                        <input
                          autoComplete="tel"
                          id="auth-input-13"
                          type="tel"
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="auth-input-14"
                          className={`mb-1.5 block text-sm font-medium ${labelText}`}
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="auth-input-14"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={registerPassword}
                            onChange={(e) =>
                              setRegisterPassword(e.target.value)
                            }
                            placeholder="••••••••"
                            className={`${inputClasses} pr-11`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="auth-input-15"
                          className={`mb-1.5 block text-sm font-medium ${labelText}`}
                        >
                          Confirm
                        </label>
                        <div className="relative">
                          <input
                            id="auth-input-15"
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`${inputClasses} pr-11`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                            aria-label={
                              showConfirm
                                ? "Hide confirmation"
                                : "Show confirmation"
                            }
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs" style={{ color: "#C4622D" }}>
                        Passwords do not match.
                      </p>
                    )}

                    <div
                      className={`flex items-start gap-2.5 rounded-lg border p-3.5 ${borderColor} ${isDark ? "bg-[#0B1E33]" : "bg-[#F8FAFC]"}`}
                    >
                      <Info
                        className={`mt-0.5 h-4 w-4 shrink-0 ${mutedText}`}
                      />
                      <p className={`text-xs leading-relaxed ${mutedText}`}>
                        {registrationMode === "JOIN_FACILITY"
                          ? "Your request will be linked to the selected facility. Use the name exactly as it appears on your professional licence."
                          : isStore
                            ? "The first administrator will manage your pharmacy account and can later invite staff."
                            : "Use the name exactly as it appears on your professional licence; it is matched against the registry."}
                      </p>
                    </div>
                  </div>
                )}

                {registerStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className="h-4 w-4"
                        style={{ color: accent }}
                      />
                      <h3
                        className={`text-sm font-semibold uppercase tracking-wide ${headingText}`}
                      >
                        Verification
                      </h3>
                    </div>

                    <div>
                      <label
                        htmlFor="auth-input-16"
                        className={`mb-1.5 block text-sm font-medium ${labelText}`}
                      >
                        {accountInfo?.licenseLabel}
                      </label>
                      <input
                        id="auth-input-16"
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder={accountInfo?.licensePlaceholder}
                        className={inputClasses}
                        autoComplete="off"
                      />
                      <p className={`mt-1.5 text-xs ${mutedText}`}>
                        Your licence will be reviewed using the registry
                        configured for your professional account.
                      </p>
                    </div>

                    <div>
                      <label
                        className={`mb-1.5 block text-sm font-medium ${labelText}`}
                        htmlFor="license-document"
                      >
                        {isStore
                          ? "Pharmacy store licence document"
                          : "Professional licence certificate"}
                      </label>
                      <input
                        accept="application/pdf,image/jpeg,image/png"
                        className={inputClasses}
                        id="license-document"
                        onChange={(event) =>
                          setLicenseDocument(event.target.files?.[0] ?? null)
                        }
                        type="file"
                      />
                      <p className={`mt-1.5 text-xs ${mutedText}`}>
                        {licenseDocument
                          ? `${licenseDocument.name} selected. `
                          : ""}
                        This registration service checks licence numbers only;
                        selected files are not uploaded or stored.
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border p-5 ${borderColor} ${isDark ? "bg-[#0B1E33]" : "bg-[#F8FAFC]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isDark
                              ? "rgba(76,141,255,0.15)"
                              : "rgba(27,58,107,0.08)",
                          }}
                        >
                          <ShieldCheck
                            className="h-5 w-5"
                            style={{ color: accent }}
                          />
                        </div>
                        <h4 className={`font-semibold ${headingText}`}>
                          Verification Process
                        </h4>
                      </div>
                      <ul className={`mt-4 space-y-2.5 text-sm ${mutedText}`}>
                        <li className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                          Your licence is checked against the public registry,
                          then reviewed by{" "}
                          {registrationMode === "JOIN_FACILITY"
                            ? "the facility administrator and "
                            : ""}
                          Oncosourz.
                        </li>
                        <li className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                          Your account stays limited to overview and settings
                          until both facility access and licence review are
                          approved.
                        </li>
                        <li className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                          You&apos;ll receive an email once your account has
                          been activated.
                        </li>
                      </ul>
                    </div>

                    <div className={`rounded-lg border p-4 ${borderColor}`}>
                      <p
                        className={`mb-2 text-xs font-semibold uppercase tracking-wide ${mutedText}`}
                      >
                        Application summary
                      </p>
                      <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                        <span className={mutedText}>Account type</span>
                        <span
                          className={`text-right font-medium ${headingText}`}
                        >
                          {accountInfo?.label ?? "N/A"}
                        </span>
                        <span className={mutedText}>
                          {registrationMode === "JOIN_FACILITY"
                            ? "Selected facility"
                            : isStore
                              ? "Pharmacy"
                              : "Workplace"}
                        </span>
                        <span
                          className={`text-right font-medium ${headingText}`}
                        >
                          {registrationMode === "JOIN_FACILITY"
                            ? (selectedFacility?.name ?? "N/A")
                            : facilityName || "N/A"}
                        </span>
                        <span className={mutedText}>Type</span>
                        <span
                          className={`text-right font-medium ${headingText}`}
                        >
                          {registrationMode === "JOIN_FACILITY"
                            ? String(
                                selectedFacility?.facility_type ?? "N/A",
                              ).replaceAll("_", " ")
                            : facilityType || "N/A"}
                        </span>
                        <span className={mutedText}>Administrator</span>
                        <span
                          className={`text-right font-medium ${headingText}`}
                        >
                          {adminFirstName || adminLastName
                            ? `${adminFirstName} ${adminLastName}`.trim()
                            : "N/A"}
                        </span>
                        <span className={mutedText}>Work Email</span>
                        <span
                          className={`text-right font-medium ${headingText}`}
                        >
                          {workEmail || "N/A"}
                        </span>
                      </div>
                    </div>

                    <p className={`text-center text-xs ${mutedText}`}>
                      By submitting you agree to our{" "}
                      <button
                        type="button"
                        className="hover:underline"
                        style={{ color: accent }}
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="hover:underline"
                        style={{ color: accent }}
                      >
                        Privacy Policy
                      </button>
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

                  {registerStep < 4 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!stepValid}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--p)",
                        color: isDark ? "#020617" : "#FFFFFF",
                      }}
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting || !licenseValid}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:opacity-70"
                      style={{
                        backgroundColor: "var(--p)",
                        color: isDark ? "#020617" : "#FFFFFF",
                      }}
                    >
                      {submitting && (
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      )}
                      {submitting ? "Verifying…" : "Submit Application"}
                    </button>
                  )}
                </div>

                {registerStep === 4 && (
                  <div
                    className={`flex items-center justify-center gap-1.5 text-xs ${mutedText}`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Average approval time:{" "}
                    <span className={`font-medium ${headingText}`}>
                      24–48 hours
                    </span>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => onShowAuth("login")}
                  className={`text-sm transition-colors ${mutedText}`}
                >
                  Already approved?{" "}
                  <span
                    className="font-medium hover:underline"
                    style={{ color: accent }}
                  >
                    Sign In
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
        <footer className={auth.footer}>
          <span>Oncosourz. Connected care, every step.</span>
          <Link href="/legal">Privacy & terms</Link>
          <Link href="/admin">
            <UserCogIcon className="size-3" />
            Administrator access
          </Link>
        </footer>
      </main>
    </div>
  );
}
