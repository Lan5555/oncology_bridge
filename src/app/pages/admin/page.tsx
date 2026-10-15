"use client";

import { ModalId, PageId } from "@/app/lib/types";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UsersPage from "@/app/pages/dashboard/UsersPage";
import FacilitiesPage from "@/app/pages/dashboard/FacilitiesPage";
import AuditPage from "@/app/pages/dashboard/AuditPage";
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
  DollarSign,
  FileCheck,
  Key,
  CheckCircle2,
  UserCheck,
  Stethoscope,
  Pill,
  Store,
  XCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import {
  ACCOUNT_TYPES,
  AccountType,
  VerificationStatus,
  getAccountInfo,
} from "@/app/lib/accounts";
import { ADMIN_SERVICE } from "@/app/services/admin-service/admin-service";
import { DASHBOARD_SERVICE } from "@/app/services/dashboard-service/dashboard-service";
import { AUDIT_SERVICE } from "@/app/services/audit-service/audit-service";
import { USER_SERVICE } from "@/app/services/user-service/user-service";
import {
  type VerificationApplication as Application,
  type RegistryResult,
} from "@/app/services/bridge-data/bridge-data-service";

const TYPE_ICONS: Record<AccountType, typeof Stethoscope> = {
  DOCTOR: Stethoscope,
  PHARMACIST: Pill,
  PHARMACY_STORE: Store,
};

const REGISTRY_TEXT: Record<RegistryResult, string> = {
  MATCH: "Found in registry",
  NO_MATCH: "Not found in registry \u2014 check manually",
  UNAVAILABLE: "Registry unavailable \u2014 check manually",
};

function readPermissionKeys(session: any): string[] {
  const role = session?.user?.role ?? session?.role;
  const candidates = [
    ...(Array.isArray(session?.permissions) ? session.permissions : []),
    ...(Array.isArray(session?.user?.permissions) ? session.user.permissions : []),
    ...(Array.isArray(role?.permissions) ? role.permissions : []),
  ];
  return [...new Set(candidates
    .map((permission: any) => typeof permission === "string" ? permission : permission?.key ?? permission?.name)
    .filter((permission: unknown): permission is string => typeof permission === "string")
    .map(normalizeAdminPermission))];
}

function normalizeAdminPermission(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
  const aliases: Record<string, string> = {
    "roles.manage": "role.manage",
    "manage.role": "role.manage",
    "manage.roles": "role.manage",
    "role.permissions.manage": "role.manage",
    "roles.permissions.manage": "role.manage",
  };
  return aliases[normalized] ?? normalized;
}

function hasPermissionClaim(session: any): boolean {
  const role = session?.user?.role ?? session?.role;
  return Array.isArray(session?.permissions) ||
    Array.isArray(session?.user?.permissions) ||
    Array.isArray(role?.permissions);
}

function readAdminRoleName(session: any): string {
  const role = session?.user?.role ?? session?.role;
  const value = typeof role === "string" ? role : role?.name ?? role?.code ?? role?.key ?? role?.id;
  const normalized = String(value ?? "").trim().toUpperCase();
  if (normalized === "1") return "ADMIN";
  if (normalized === "4") return "SUPERADMIN";
  return normalized;
}

function readApplicationRows(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["applications", "verifications", "items", "results", "rows"]) {
    if (Array.isArray(value[key])) return value[key];
  }
  // Some API clients wrap the normal data envelope a second time.
  return readApplicationRows(value.data ?? value.result);
}

function normalizeApplicationStatus(value: unknown): VerificationStatus {
  const status = String(value ?? "MANUAL_REVIEW").trim().toUpperCase();
  if (["PENDING", "SUBMITTED", "IN_REVIEW", "UNDER_REVIEW", "MANUAL_REVIEW"].includes(status)) {
    return "MANUAL_REVIEW";
  }
  if (status === "VERIFIED" || status === "APPROVED") return "VERIFIED";
  if (status === "REJECTED" || status === "DECLINED") return "REJECTED";
  return "MANUAL_REVIEW";
}

interface AdminPageProps {
  onNav?: (id: PageId) => void;
  onOpenModal?: (id: ModalId) => void;
}

type RegistrationApplication = Application & {
  userId?: string;
  facilityId?: string;
  adminEmail?: string;
  facilityStatus?: string;
  facilityType?: string;
  facilityCode?: string;
  facilityEmail?: string;
  facilityPhone?: string;
  facilityAddress?: string;
  facilityCity?: string;
  facilityState?: string;
  adminPhone?: string;
  userVerificationStatus?: VerificationStatus;
  adminActive?: boolean;
  registryCheckedAt?: string;
  reviewReason?: string;
};

const AdminPage: React.FC<AdminPageProps> = ({ onNav }) => {
  const [section, setSection] = useState<
    | "overview"
    | "verification"
    | "roles"
    | "integrations"
    | "users"
    | "facilities"
    | "audit"
  >("overview");
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsLoaded, setApplicationsLoaded] = useState(false);
  const [applicationsLoadError, setApplicationsLoadError] = useState("");
  const [reviewTarget, setReviewTarget] = useState<RegistrationApplication | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<{
    app: RegistrationApplication;
    status: "VERIFIED" | "REJECTED";
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionSaving, setDecisionSaving] = useState(false);
  const [settlements, setSettlements] = useState<any>(null);
  const [summary, setSummary] = useState<any>({});
  const [activityRows, setActivityRows] = useState<any[]>([]);
  const [roleRows, setRoleRows] = useState<any[]>([]);
  const [permissionsTarget, setPermissionsTarget] = useState<{
    id: string | number;
    name: string;
    permissions: string[];
    availablePermissions: string[];
  } | null>(null);
  const [permissionsSaving, setPermissionsSaving] = useState(false);
  const [integrationRows, setIntegrationRows] = useState<any[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [integrationTarget, setIntegrationTarget] = useState<any | null>(null);
  const [integrationFields, setIntegrationFields] = useState<any[]>([]);
  const [integrationValues, setIntegrationValues] = useState<Record<string, any>>({});
  const [integrationConfigLoading, setIntegrationConfigLoading] = useState(false);
  const [integrationActionKey, setIntegrationActionKey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "REVIEW" | "VERIFIED" | "REJECTED" | "ALL"
  >("REVIEW");
  const [typeFilter, setTypeFilter] = useState<AccountType | "ALL">("ALL");
  const [rechecking, setRechecking] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const loadApplications = async () => {
    setApplicationsLoading(true);
    setApplicationsLoaded(false);
    setApplicationsLoadError("");
    let response;
    try {
      response = await ADMIN_SERVICE.verifications("ALL");
    } catch (error) {
      setApplicationsLoading(false);
      const message = error instanceof Error ? error.message : "Submitted licence applications could not be loaded.";
      setApplicationsLoadError(message);
      notify(message);
      return null;
    }
    setApplicationsLoading(false);
    if (!response.success) {
      const message = response.message || "Submitted licence applications could not be loaded.";
      setApplicationsLoadError(message);
      notify(message);
      return null;
    }
    const value = response.data as any;
    const rows = readApplicationRows(value);
    const normalizedRows = rows.map((row: any) => {
        const user = row.user ?? row.admin ?? {};
        const facility = row.facility ?? {};
      const license = row.license ?? row.licence ?? {};
      const normalizedStatus = normalizeApplicationStatus(
        row.status ?? row.application_status ?? row.verification_status ??
        row.user_verification_status ?? user.verification_status,
      );
        const name =
          row.name ??
          user.name ??
          ([user.first_name, user.last_name].filter(Boolean).join(" ") ||
            "Applicant");
        return {
          id: String(row.id ?? row.application_id ?? ""),
          userId: row.userId ?? row.user_id ?? user.id,
          facilityId: row.facilityId ?? row.facility_id ?? facility.id,
          name,
          accountType:
            row.accountType ?? row.account_type ?? user.account_type ?? "DOCTOR",
          license:
            license.number ??
            (typeof license === "string" ? license : undefined) ??
            row.licenseNumber ??
            row.license_number ??
            user.license_number ??
            "",
          workplace:
            row.workplace ?? facility.name ?? row.facility_name ?? "Unknown facility",
          facilityType:
            row.facilityType ?? row.facility_type ?? facility.facility_type ?? "",
          facilityCode:
            row.hospital_code ?? row.facility_code ?? facility.hospital_code ?? "",
          facilityEmail: facility.email ?? row.facility_email ?? "",
          facilityPhone: facility.phone ?? row.facility_phone ?? "",
          facilityAddress: facility.address ?? row.facility_address ?? "",
          facilityCity: facility.city ?? row.city ?? "",
          facilityState: facility.state ?? row.state ?? "",
          adminEmail: row.adminEmail ?? row.admin_email ?? user.email ?? row.email ?? "",
          adminPhone: user.phone ?? row.user_phone ?? row.admin_phone ?? "",
          facilityStatus:
            row.facilityStatus ?? row.facility_status ?? facility.status ?? "PENDING",
          userVerificationStatus:
            normalizeApplicationStatus(
              user.verification_status ?? row.user_verification_status ?? row.verification_status ?? row.status,
            ),
          adminActive: user.active ?? row.user_active ?? row.admin_active,
          submitted:
            row.submittedAt ?? row.submitted_at ?? row.created_at ?? "—",
          registryResult:
            row.registryResult ?? row.registry_result ?? license.registry_result ?? "UNAVAILABLE",
          registry: row.registry ?? row.license_registry ?? license.registry ?? user.license_registry ?? "",
          registryCheckedAt:
            row.registryCheckedAt ?? row.registry_checked_at ?? row.checked_at ?? "",
          reviewReason: row.reason ?? "",
          status: normalizedStatus,
        } as RegistrationApplication;
      });
    setApplications(normalizedRows);
    setApplicationsLoaded(true);
    return normalizedRows;
  };

  const loadIntegrations = async () => {
    setIntegrationsLoading(true);
    const response = await ADMIN_SERVICE.integrationsHealth();
    setIntegrationsLoading(false);
    if (!response.success) {
      notify(response.message || "Integration health could not be loaded.");
      return;
    }
    const value = response.data as any;
    setIntegrationRows(
      Array.isArray(value) ? value : (value?.integrations ?? value?.items ?? []),
    );
  };

  const openIntegrationConfiguration = async (integration: any) => {
    const key = String(integration.key ?? integration.name ?? "");
    if (!key || !adminPermissions.includes("integration.manage")) return;
    setIntegrationTarget({ ...integration, key });
    setIntegrationConfigLoading(true);
    setIntegrationFields([]);
    setIntegrationValues({});
    const response = await ADMIN_SERVICE.integrationConfiguration(key);
    setIntegrationConfigLoading(false);
    if (!response.success) {
      notify(response.message || "Integration configuration could not be loaded.");
      return;
    }
    const data = response.data as any;
    const fields = Array.isArray(data) ? data : (data?.fields ?? data?.configuration?.fields ?? []);
    setIntegrationFields(fields);
    setIntegrationValues(Object.fromEntries(fields.map((field: any) => [field.key, field.type === "boolean" ? Boolean(field.value) : field.type === "secret" ? "" : field.value ?? ""])));
  };

  const saveIntegration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!integrationTarget || !adminPermissions.includes("integration.manage")) return;
    setIntegrationActionKey(integrationTarget.key);
    const values = Object.fromEntries(Object.entries(integrationValues).filter(([, value]) => value !== "" && value !== undefined));
    const response = await ADMIN_SERVICE.saveIntegrationConfiguration(integrationTarget.key, values);
    setIntegrationActionKey(null);
    notify(response.message || (response.success ? "Integration configuration saved." : "Configuration could not be saved."));
    if (response.success) {
      setIntegrationTarget(null);
      await loadIntegrations();
    }
  };

  const runIntegrationAction = async (key: string, action: "test" | "sync") => {
    const permission = action === "test" ? "integration.manage" : "integration.sync";
    if (!adminPermissions.includes(permission)) return;
    setIntegrationActionKey(`${key}:${action}`);
    const response = action === "test" ? await ADMIN_SERVICE.testIntegration(key) : await ADMIN_SERVICE.syncIntegration(key);
    setIntegrationActionKey(null);
    notify(response.message || (response.success ? (action === "test" ? "Connection test completed." : "Sync queued.") : `Integration ${action} failed.`));
    if (response.success) await loadIntegrations();
  };

  // --- FIX: Initialize with safe defaults to prevent hydration mismatch ---
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [adminPermissionsKnown, setAdminPermissionsKnown] = useState(false);
  const [adminRoleName, setAdminRoleName] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false); // Track client-side mount

  // Lightweight feedback toast so every action button gives a visible
  // response even before it's wired to real backend logic.
  const [toast, setToast] = useState<string | null>(null);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(
      () => setToast((current) => (current === message ? null : current)),
      2200,
    );
  };

  // Detect theme and auth on client-side only
  useEffect(() => {
    setMounted(true);

    const storedTheme = window.localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    try {
      const session = JSON.parse(
        window.localStorage.getItem("adminSession") ?? "{}",
      );
      setIsAuthed(Boolean(session?.token));
      setAdminPermissions(readPermissionKeys(session));
      setAdminPermissionsKnown(hasPermissionClaim(session));
      setAdminRoleName(readAdminRoleName(session));
    } catch {
      window.localStorage.removeItem("adminSession");
    }
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    if (hasAdminPermission("verification.review")) void loadApplications();
    if (hasAdminPermission("integration.read")) void loadIntegrations();
    void Promise.all([
      hasAdminPermission("settlement.read") ? ADMIN_SERVICE.settlements() : Promise.resolve(null),
      hasAdminPermission("dashboard.read") ? DASHBOARD_SERVICE.summary(true) : Promise.resolve(null),
      hasAdminPermission("audit.read") ? AUDIT_SERVICE.list("page=1&limit=7", true) : Promise.resolve(null),
      hasAdminPermission("role.manage") ? USER_SERVICE.roles(true) : Promise.resolve(null),
    ]).then(
      ([
        settlementResponse,
        summaryResponse,
        activityResponse,
        roleResponse,
      ]) => {
        if (settlementResponse?.success) setSettlements(settlementResponse.data);
        if (summaryResponse?.success) setSummary(summaryResponse.data ?? {});
        if (activityResponse?.success) {
          const value = activityResponse.data as any;
          setActivityRows(
            Array.isArray(value)
              ? value
              : (value?.items ?? value?.rows ?? value?.events ?? []),
          );
        }
        if (roleResponse?.success) {
          const value = roleResponse.data as any;
          setRoleRows(
            Array.isArray(value) ? value : (value?.items ?? value?.roles ?? []),
          );
        }
      },
    );
  }, [isAuthed, adminPermissions, adminPermissionsKnown, adminRoleName]);

  const isDark = theme === "dark";

  const pendingCount = applications.filter(
    (a) => a.status === "PENDING" || a.status === "MANUAL_REVIEW",
  ).length;
  const facilityCount = summary.nodes ?? summary.facilityCount;
  const reviewQueueSummary = !applicationsLoaded
    ? applicationsLoadError
      ? "Licence review queue unavailable"
      : "Loading submitted licences…"
    : `${pendingCount} licence${pendingCount === 1 ? "" : "s"} awaiting review`;

  const decide = async () => {
    if (!decisionTarget) return;
    if (decisionTarget.status === "REJECTED" && !decisionReason.trim()) {
      notify("Add a reason before rejecting this registration.");
      return;
    }
    setDecisionSaving(true);
    const { app, status } = decisionTarget;
    const result = await ADMIN_SERVICE.decide(app.id, status, {
      reason: decisionReason.trim(),
    });
    setDecisionSaving(false);
    if (!result.success) {
      notify(result.message || "Verification decision failed.");
      return;
    }
    setDecisionTarget(null);
    setReviewTarget(null);
    setDecisionReason("");
    const refreshedApplications = await loadApplications();
    const refreshedApplication =
      refreshedApplications?.find((item: any) => item.id === app.id) ?? null;
    if (
      status === "VERIFIED" &&
      (!refreshedApplication ||
        refreshedApplication.status !== "VERIFIED" ||
        refreshedApplication.userVerificationStatus !== "VERIFIED" ||
        refreshedApplication.adminActive !== true ||
        refreshedApplication.facilityStatus !== "ACTIVE")
    ) {
      notify(
        "The approval request succeeded, but the saved user or facility is still not fully active. Sign-in will remain blocked until the backend persists VERIFIED licence status, an active admin user, and ACTIVE facility status.",
      );
      return;
    }
    notify(
      result.message ||
        `${app.name} ${status === "VERIFIED" ? "approved" : "rejected"}.`,
    );
  };

  const loadRoles = async () => {
    const response = await USER_SERVICE.roles(true);
    if (!response.success) {
      notify(response.message || "Roles could not be loaded.");
      return;
    }
    const value = response.data as any;
    setRoleRows(
      Array.isArray(value) ? value : (value?.items ?? value?.roles ?? []),
    );
  };
  const createRole = async () => {
    const name = window.prompt("Role name");
    if (!name?.trim()) return;
    const response = await USER_SERVICE.createRole({ name: name.trim() }, true);
    notify(
      response.message ||
        (response.success ? "Role created." : "Role could not be created."),
    );
    if (response.success) await loadRoles();
  };
  const editRole = async (role: any) => {
    const name = window.prompt("Role name", role.name ?? "");
    if (!name?.trim()) return;
    const response = await USER_SERVICE.updateRole(
      role.id,
      { name: name.trim() },
      true,
    );
    notify(
      response.message ||
        (response.success ? "Role updated." : "Role could not be updated."),
    );
    if (response.success) await loadRoles();
  };
  const deleteRole = async (role: any) => {
    if (!window.confirm(`Delete the ${role.name} role?`)) return;
    const response = await USER_SERVICE.deleteRole(role.id, true);
    notify(
      response.message ||
        (response.success ? "Role deleted." : "Role could not be deleted."),
    );
    if (response.success) await loadRoles();
  };

  const openRolePermissions = async (role: any) => {
    const response = await USER_SERVICE.rolePermissions(role.id, true);
    if (!response.success) {
      notify(response.message || "Role permissions could not be loaded.");
      return;
    }
    const value = response.data as any;
    const items = Array.isArray(value) ? value : (value?.permissions ?? []);
    const permissionKeys = items
      .map((item: any) =>
        typeof item === "string" ? item : (item.key ?? item.name),
      )
      .filter((item: unknown): item is string => typeof item === "string");
    const availableRaw = value?.availablePermissions ?? value?.available_permissions;
    const rolePermissionKeys = roleRows.flatMap((row: any) =>
      Array.isArray(row.permissions)
        ? row.permissions.map((item: any) =>
            typeof item === "string" ? item : (item.key ?? item.name),
          )
        : [],
    );
    const availableKeys = (Array.isArray(availableRaw) ? availableRaw : rolePermissionKeys)
      .map((item: any) =>
        typeof item === "string" ? item : (item.key ?? item.name),
      )
      .filter((item: unknown): item is string => typeof item === "string");
    setPermissionsTarget({
      id: role.id,
      name: role.name,
      permissions: permissionKeys,
      availablePermissions: [...new Set([...availableKeys, ...permissionKeys])].sort(),
    });
  };

  const saveRolePermissions = async () => {
    if (!permissionsTarget) return;
    setPermissionsSaving(true);
    const response = await USER_SERVICE.updateRolePermissions(
      permissionsTarget.id,
      { permissions: permissionsTarget.permissions },
      true,
    );
    setPermissionsSaving(false);
    if (!response.success) {
      notify(response.message || "Role permissions could not be saved.");
      return;
    }
    setPermissionsTarget(null);
    notify(response.message || `${permissionsTarget.name} permissions saved.`);
    await loadRoles();
  };

  const recheck = async (app: RegistrationApplication) => {
    setRechecking(app.id);
    const response = await ADMIN_SERVICE.recheck(app.id);
    const result = response.data as any;
    if (!response.success) {
      setRechecking(null);
      notify(response.message || "The licence registry could not be rechecked.");
      return;
    }
    if (response.success) {
      const updated = {
        ...app,
        registryResult:
          result?.registryResult ?? result?.registry_result ?? app.registryResult,
        registryCheckedAt:
          result?.checkedAt ?? result?.checked_at ?? new Date().toISOString(),
      };
      setApplications((list) => list.map((item) => item.id === app.id ? updated : item));
      setReviewTarget((current) => current?.id === app.id ? updated : current);
    }
    setRechecking(null);
    const registryResult =
      result?.registryResult ?? result?.registry_result ?? "UNAVAILABLE";
    notify(
      `Registry check: ${(REGISTRY_TEXT[registryResult as RegistryResult] ?? REGISTRY_TEXT.UNAVAILABLE).toLowerCase()}.`,
    );
  };

  const formatReviewDate = (value?: string) => {
    if (!value || value === "—") return "Not provided";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat("en-NG", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
  };

  const handleAdminLogin = () => {
    // FIX: previously this just silently returned when a field was empty,
    // so clicking "Sign in" with nothing typed looked like a dead button.
    if (!adminUser || !adminPass) {
      setLoginError("Enter both a username and password to continue.");
      return;
    }
    setLoginError("");
    setSubmitting(true);
    void ADMIN_SERVICE.login({ email: adminUser, password: adminPass }).then(
      (response) => {
        const session = response.data as any;
        if (!response.success || !session?.token) {
          const backendMessage = response.message || "Admin sign-in failed.";
          const error = /awaiting.*(facility|licen[cs]e).*review|pending.*review/i.test(
            backendMessage,
          )
            ? `${backendMessage} Admin access requires an active ADMIN or SUPERADMIN account; the backend must not apply facility/licence review to those roles.`
            : backendMessage;
          setLoginError(error);
          setSubmitting(false);
          return;
        }
        const role = session.user?.role ?? session.role;
        const roleName =
          typeof role === "string"
            ? role
            : String(role?.name ?? role?.code ?? role?.key ?? role?.id ?? "");
        if (
          !/^(?:1|4|ADMIN|SUPERADMIN|NETWORK\s*ADMIN|NETWORK\s*ADMINISTRATOR|SUPER\s*ADMINISTRATOR)$/i.test(
            roleName.trim(),
          )
        ) {
          setLoginError("This account does not have ADMIN or SUPERADMIN access.");
          setSubmitting(false);
          return;
        }
        window.localStorage.setItem("adminSession", JSON.stringify(session));
        setAdminPermissions(readPermissionKeys(session));
        setAdminPermissionsKnown(hasPermissionClaim(session));
        setAdminRoleName(readAdminRoleName(session));
        setIsAuthed(true);
        setSubmitting(false);
      },
    );
  };

  const handleAdminLogout = () => {
    window.localStorage.removeItem("adminSession");
    setAdminPermissions([]);
    setAdminPermissionsKnown(false);
    setAdminRoleName("");
    setIsAuthed(false);
  };

  const goToDashboard = (target: PageId) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("adminTarget", target);
    router.push("/pages/dashboard");
  };

  // --- Theme tokens: parchment / ink, not the default blue-glass SaaS palette ---
  const shellClasses = isDark
    ? "min-h-screen w-full bg-[#0A1628] text-[#EAF0FA]"
    : "min-h-screen w-full bg-gradient-to-b from-[#F9FBFD] to-[#EDF2F9] text-[#0B1E3D]";

  const cardClasses = isDark
    ? "border border-[#1E3358] bg-[#0F2038]"
    : "border border-[#E7ECF4] bg-white shadow-[0_1px_2px_rgba(15,30,61,0.04),0_8px_24px_-16px_rgba(15,30,61,0.12)]";

  // Interactive cards (roles, integrations, quick actions) get a hover lift
  // to signal they respond to input — flat cards feel dead, elevation reads as clickable.
  const interactiveCardClasses = isDark
    ? "border border-[#1E3358] bg-[#0F2038] transition-all duration-200 hover:border-[#2A4370]"
    : "border border-[#E7ECF4] bg-white transition-all duration-200 hover:border-[#C9D6E8] hover:shadow-[0_4px_16px_-8px_rgba(15,30,61,0.18)] hover:-translate-y-[1px]";

  const baseInputClasses = isDark
    ? "w-full rounded-lg border border-[#23385C] bg-[#0B1E33] text-sm text-[#EAF0FA] placeholder:text-[#5D7396] outline-none transition-all duration-150 focus:border-[#4C8DFF] focus:ring-4 focus:ring-[#4C8DFF]/10"
    : "w-full rounded-lg border border-[#DCE3ED] bg-[#FBFCFE] text-sm text-[#0B1E3D] placeholder:text-[#94A3B8] outline-none transition-all duration-150 focus:border-[#1B3A6B] focus:bg-white focus:ring-4 focus:ring-[#1B3A6B]/8";

  const mutedText = isDark ? "text-[#8CA0BE]" : "text-[#5B6B85]";
  const headingText = isDark ? "text-[#EAF0FA]" : "text-[#0B1E3D]";
  const borderColor = isDark ? "border-[#1E3358]" : "border-[#E7ECF4]";
  const accentBlue = isDark ? "#4C8DFF" : "#1B3A6B";
  const accentAmber = isDark ? "#E08A4F" : "#C4622D";
  const accentPositive = isDark ? "#4C8DFF" : "#1B3A6B";
  // Sign-in / primary CTA color — kept constant per brief, the one fixed anchor color.
  const primaryCta = "#0B1E3D";

  const hasAdminPermission = (permission: string) =>
    ["role.manage", "verification.review"].includes(permission) && ["ADMIN", "SUPERADMIN"].includes(adminRoleName)
      ? true
      : !adminPermissionsKnown || adminPermissions.includes(permission);
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, permission: "dashboard.read" },
    {
      id: "verification",
      label: `Licence review${applicationsLoaded && pendingCount ? ` (${pendingCount})` : ""}`,
      icon: UserCheck,
      permission: "verification.review",
    },
    { id: "users", label: "Users", icon: Users, permission: "user.read" },
    { id: "facilities", label: "Facilities", icon: Building2, permission: "facility.read" },
    { id: "audit", label: "Audit", icon: ClipboardList, permission: "audit.read" },
    { id: "roles", label: "Roles & permissions", icon: Shield, permission: "role.manage" },
    { id: "integrations", label: "Integrations", icon: Plug, permission: "integration.read" },
  ].filter((tab) => tab.id === "overview" || hasAdminPermission(tab.permission));

  // Dashboard metrics are sourced from the admin APIs. Missing fields stay blank.
  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  const stats = [
    {
      label: "Facilities",
      value: String(summary.nodes ?? summary.facilityCount ?? "—"),
      icon: Building2,
      color: "#1B3A6B",
    },
    {
      label: "Active users",
      value: String(summary.activeUsers ?? "—"),
      icon: Users,
      color: "#0F766E",
    },
    {
      label: "Inventory items",
      value: summary.totalInventoryItems == null && summary.inventoryItems == null
        ? "—"
        : Number(summary.totalInventoryItems ?? summary.inventoryItems).toLocaleString(),
      icon: Package,
      color: "#6D28D9",
    },
    {
      label: "Near expiry",
      value: String(summary.nearExpiryCount ?? summary.nearExpiry ?? "—"),
      icon: AlertCircle,
      color: "#C4622D",
    },
    {
      label: "Value recovered",
      value: summary.valueRecoveredNaira == null
        ? "—"
        : formatNaira(Number(summary.valueRecoveredNaira)),
      icon: DollarSign,
      color: "#15803D",
    },
    {
      label: "Pending verifications",
      value: applicationsLoaded ? String(pendingCount) : applicationsLoadError ? "—" : "…",
      icon: UserCheck,
      color: "#0E7490",
    },
  ];
  const activityFeed = activityRows.map((event: any) => ({
    action: event.action ?? event.type ?? event.description ?? "Audit event",
    time: event.createdAt ?? event.created_at ?? event.at ?? "—",
    user: event.actor?.name ?? event.actor?.email ?? event.actor ?? "System",
    icon: Activity,
    alert: /fail|reject|error/i.test(String(event.action ?? event.type ?? "")),
  }));

  const roles = roleRows.map((role: any) => ({
    id: role.id,
    name: role.name ?? role.title ?? `Role ${role.id}`,
    desc: role.description ?? "",
    count: role.userCount ?? role.user_count ?? "—",
    icon: /doctor/i.test(role.name ?? "")
      ? Stethoscope
      : /pharmac/i.test(role.name ?? "")
        ? Pill
        : ShieldCheck,
    sees: Array.isArray(role.permissions)
      ? role.permissions
          .map((item: any) =>
            typeof item === "string" ? item : (item.name ?? item.key),
          )
          .filter(Boolean)
      : [],
  }));
  const integrations = integrationRows.map((row: any) => ({
    key: row.key ?? row.integrationKey ?? row.integration_key ?? row.provider ?? "",
    name: row.name ?? row.key ?? row.provider ?? "Integration",
    desc: row.description ?? row.message ?? row.status_detail ?? "Health reported by backend",
    status: row.status ?? (row.healthy === true ? "Healthy" : "Unavailable"),
    lastSync: row.lastCheckedAt ?? row.last_checked_at ?? row.checked_at ?? "—",
  }));

  const quickActions = [
    { label: "Review submitted licences", icon: UserCheck, color: "#0E7490", permission: "verification.review" },
    { label: "Export audit", icon: Download, color: "#6D28D9", permission: "audit.read" },
    { label: "Manage users", icon: Users, color: "#0F766E", permission: "user.read" },
    { label: "View analytics", icon: ClipboardList, color: "#C4622D", permission: "dashboard.read" },
  ].filter((action) => hasAdminPermission(action.permission));
  const runQuickAction = async (label: string) => {
    if (label === "Review submitted licences") {
      setSection("verification");
      return;
    }
    if (label === "Manage users") {
      setSection("users");
      return;
    }
    if (label === "View analytics") {
      goToDashboard("pg-dashboard");
      return;
    }
    if (label === "Export audit") {
      const response = await AUDIT_SERVICE.exportCsv(true);
      const value = (response.data as any)?.csv ?? response.data;
      if (!response.success || !value) {
        notify(response.message || "Audit export failed.");
        return;
      }
      const blob = new Blob(
        [typeof value === "string" ? value : JSON.stringify(value)],
        { type: "text/csv" },
      );
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "audit.csv";
      link.click();
      URL.revokeObjectURL(link.href);
      notify("Audit CSV downloaded.");
    }
  };

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
        backgroundColor: isDark ? "#0F2038" : "#0B1E3D",
        borderColor: isDark ? "#1E3358" : "#0B1E3D",
        color: "#EAF0FA",
      }}
    >
      <CheckCircle2
        className="h-3.5 w-3.5 shrink-0"
        style={{
          color: accentPositive === "#1B3A6B" ? "#7FB0FF" : accentPositive,
        }}
      />
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
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#0B1E3D]">
              Admin Sign In
            </h1>
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
      <div
        className={`${shellClasses} font-ui relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12`}
        suppressHydrationWarning
      >
        {globalStyle}
        {toastNode}

        {/* restrained background: faint label-grid + a soft ambient glow, no busy decoration */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "#8CA0BE" : "#5B6B85"} 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
          suppressHydrationWarning
        />
        <div
          className="glow-orb h-105 w-105 -translate-x-1/2 -translate-y-1/2 opacity-[0.10]"
          style={{ top: "10%", left: "20%", backgroundColor: primaryCta }}
        />
        <div
          className="glow-orb h-90 w-90 translate-x-1/2 translate-y-1/2 opacity-[0.06]"
          style={{ bottom: "5%", right: "15%", backgroundColor: accentBlue }}
        />

        <div
          className={`spec-card relative z-10 w-full max-w-md overflow-hidden rounded-2xl p-8 sm:p-10 ${cardClasses}`}
          style={{ "--tick-color": accentBlue } as React.CSSProperties}
        >
          <div className="tick-br" />
          {/* thin gradient accent bar — the one deliberate flourish on an otherwise quiet card */}
          <div
            className="absolute inset-x-0 top-0 h-0.75"
            style={{
              background: `linear-gradient(90deg, ${primaryCta}, ${accentBlue}, transparent)`,
            }}
          />

          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-[0_8px_20px_-8px_rgba(11,30,61,0.5)]"
              style={{
                background: `linear-gradient(135deg, ${primaryCta}, #14295094)`,
              }}
            >
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <p
              className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
            >
              Oncosourz / Restricted
            </p>
            <h1
              className={`font-display mt-1 text-3xl font-semibold tracking-tight ${headingText}`}
            >
              Admin Sign In
            </h1>
            <p className={`mt-2 text-sm ${mutedText}`}>
              Secure access to system administration
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminLogin();
            }}
          >
            <div className="space-y-5">
              <div>
                <label
                  className={`mb-2 block text-xs font-medium uppercase tracking-wide ${isDark ? "text-[#8CA0BE]" : "text-[#5B6B85]"}`}
                >
                  Email
                </label>
                <div className="relative">
                  <User
                    className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
                  />
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => {
                      setAdminUser(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    placeholder="Enter your admin email"
                    className={`${baseInputClasses} py-3 pl-11 pr-4`}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    className={`block text-xs font-medium uppercase tracking-wide ${isDark ? "text-[#8CA0BE]" : "text-[#5B6B85]"}`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium hover:underline"
                    style={{ color: accentBlue }}
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminPass}
                    onChange={(e) => {
                      setAdminPass(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    placeholder="Enter your password"
                    className={`${baseInputClasses} py-3 pl-11 pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${mutedText} hover:text-[#1B3A6B]`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* FIX: previously an empty-field submit failed silently.
                  Now it surfaces a visible, specific reason. */}
              {loginError && (
                <div
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs"
                  style={{
                    borderColor: accentAmber,
                    color: accentAmber,
                    backgroundColor: isDark ? "transparent" : "#FBF2EC",
                  }}
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
                onMouseEnter={(e) => {
                  if (!submitting)
                    e.currentTarget.style.backgroundColor = "#14295A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = primaryCta;
                }}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                {submitting ? "Authenticating\u2026" : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/")}
                className={`press-fx flex w-full items-center justify-center gap-2.5 rounded-lg border py-3 text-sm font-medium ${
                  isDark
                    ? "border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0B1E33]"
                    : "border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B] hover:bg-[#F8FAFC] cursor-pointer"
                }`}
              >
                <Home className="h-4 w-4" />
                Return to home
              </button>
            </div>
          </form>

          <div
            className={`mt-8 flex items-center justify-center gap-2 border-t pt-5 font-mono text-[11px] ${borderColor} ${mutedText}`}
          >
            <span
              className="inline-flex h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accentPositive }}
            />
            All systems operational &middot; AES-256 encrypted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${shellClasses} font-ui relative`}
      suppressHydrationWarning
    >
      {globalStyle}
      {toastNode}
      {integrationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !integrationActionKey) setIntegrationTarget(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="integration-config-title" className={`max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-7 ${cardClasses}`}>
            <div className="mb-5 flex items-start justify-between gap-3"><div><p className={`font-mono text-[11px] uppercase tracking-widest ${mutedText}`}>Integration settings</p><h2 id="integration-config-title" className={`mt-1 text-xl font-semibold ${headingText}`}>{integrationTarget.name}</h2><p className={`mt-1 text-sm ${mutedText}`}>Secret fields are write-only. Existing values are never returned or shown.</p></div><button type="button" aria-label="Close configuration" disabled={Boolean(integrationActionKey)} onClick={() => setIntegrationTarget(null)} className={`rounded-lg border p-2 ${borderColor} ${headingText}`}><X className="h-4 w-4" /></button></div>
            {integrationConfigLoading ? <p className={`py-8 text-center text-sm ${mutedText}`}>Loading configurable fields…</p> : integrationFields.length ? <form onSubmit={(event) => void saveIntegration(event)} className="space-y-4">
              {integrationFields.map((field: any) => <label key={field.key} className={`block text-sm font-medium ${headingText}`}>{field.label ?? field.key}{field.required && !(field.type === "secret" && field.configured) ? <span className="ml-1 text-red-500">*</span> : null}{field.description ? <span className={`mt-1 block text-xs font-normal ${mutedText}`}>{field.description}</span> : null}<input required={Boolean(field.required && !(field.type === "secret" && field.configured))} type={field.type === "secret" ? "password" : field.type === "url" ? "url" : field.type === "boolean" ? "checkbox" : "text"} autoComplete="new-password" value={field.type === "boolean" ? undefined : integrationValues[field.key] ?? ""} checked={field.type === "boolean" ? Boolean(integrationValues[field.key]) : undefined} placeholder={field.type === "secret" && field.configured ? "Configured · enter to replace" : field.placeholder ?? ""} onChange={(event) => setIntegrationValues((current) => ({ ...current, [field.key]: field.type === "boolean" ? event.target.checked : event.target.value }))} className={field.type === "boolean" ? "mt-2 h-4 w-4" : `mt-1 block ${baseInputClasses} px-3 py-2`} /></label>)}
              <p className={`rounded-lg border p-3 text-xs ${borderColor} ${mutedText}`}>Saving updates the server-side integration configuration. Never paste credentials into support notes or browser storage.</p>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setIntegrationTarget(null)} className={`rounded-lg border px-4 py-2 text-sm font-medium ${borderColor} ${headingText}`}>Cancel</button><button type="submit" disabled={Boolean(integrationActionKey)} className="rounded-lg bg-[#0B1E3D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{integrationActionKey === integrationTarget.key ? "Saving…" : "Save configuration"}</button></div>
            </form> : <div className={`rounded-xl border border-dashed p-5 text-sm ${borderColor} ${mutedText}`}>The backend has not provided a configuration schema for this integration, so there are no editable settings yet.</div>}
          </section>
        </div>
      )}
      {reviewTarget && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !decisionSaving && !rechecking) {
              setReviewTarget(null);
            }
          }}
        >
          <section
            aria-labelledby="application-review-title"
            aria-modal="true"
            role="dialog"
            className={`max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-7 ${cardClasses}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${mutedText}`}>
                  Licence and facility review
                </p>
                <h2 id="application-review-title" className={`mt-1 text-xl font-semibold sm:text-2xl ${headingText}`}>
                  {reviewTarget.workplace}
                </h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  {reviewTarget.name} · {getAccountInfo(reviewTarget.accountType)?.label ?? reviewTarget.accountType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                disabled={decisionSaving || rechecking === reviewTarget.id}
                className={`rounded-lg border p-2 ${borderColor} ${mutedText}`}
                aria-label="Close application review"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`mt-5 rounded-xl border p-4 ${isDark ? "border-amber-400/30 bg-amber-400/5" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span className={`rounded-full px-2.5 py-1 text-xs ${isDark ? "bg-amber-400/10 text-amber-200" : "bg-amber-100 text-amber-900"}`}>
                  Facility: {reviewTarget.facilityStatus ?? "PENDING"}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs ${isDark ? "bg-amber-400/10 text-amber-200" : "bg-amber-100 text-amber-900"}`}>
                  Licence: {reviewTarget.userVerificationStatus ?? reviewTarget.status}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs ${reviewTarget.adminActive ? (isDark ? "bg-emerald-400/10 text-emerald-200" : "bg-emerald-100 text-emerald-900") : (isDark ? "bg-slate-400/10 text-slate-300" : "bg-slate-100 text-slate-700")}`}>
                  User: {reviewTarget.adminActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className={`mt-3 text-sm leading-6 ${isDark ? "text-[#E6D8BD]" : "text-amber-950"}`}>
                This facility is pending because its registration has not been approved. The licence remains in review until you make a decision. A registry recheck updates evidence only; it does not activate the user or facility.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <section className={`rounded-xl border p-4 ${borderColor}`}>
                <div className="mb-3 flex items-center gap-2">
                  <User className={`h-4 w-4 ${mutedText}`} />
                  <h3 className={`text-sm font-semibold ${headingText}`}>Applicant</h3>
                </div>
                <dl className="space-y-3 text-sm">
                  <div><dt className={mutedText}>Full name</dt><dd className={`mt-0.5 ${headingText}`}>{reviewTarget.name}</dd></div>
                  <div className="flex items-start gap-2"><Mail className={`mt-0.5 h-4 w-4 ${mutedText}`} /><div><dt className={mutedText}>Email</dt><dd className={`mt-0.5 break-all ${headingText}`}>{reviewTarget.adminEmail || "Not provided"}</dd></div></div>
                  <div className="flex items-start gap-2"><Phone className={`mt-0.5 h-4 w-4 ${mutedText}`} /><div><dt className={mutedText}>Phone</dt><dd className={`mt-0.5 ${headingText}`}>{reviewTarget.adminPhone || "Not provided"}</dd></div></div>
                  <div><dt className={mutedText}>Account type</dt><dd className={`mt-0.5 ${headingText}`}>{reviewTarget.accountType}</dd></div>
                </dl>
              </section>

              <section className={`rounded-xl border p-4 ${borderColor}`}>
                <div className="mb-3 flex items-center gap-2">
                  <FileCheck className={`h-4 w-4 ${mutedText}`} />
                  <h3 className={`text-sm font-semibold ${headingText}`}>Licence and registry evidence</h3>
                </div>
                <dl className="space-y-3 text-sm">
                  <div><dt className={mutedText}>Licence number</dt><dd className={`mt-0.5 break-all font-mono ${headingText}`}>{reviewTarget.license || "Not provided"}</dd></div>
                  <div><dt className={mutedText}>Issuing registry</dt><dd className={`mt-0.5 ${headingText}`}>{getAccountInfo(reviewTarget.accountType)?.registry ?? "Not provided"}</dd></div>
                  <div><dt className={mutedText}>Latest registry result</dt><dd className="mt-0.5 font-medium" style={{ color: reviewTarget.registryResult === "MATCH" ? accentPositive : accentAmber }}>{REGISTRY_TEXT[reviewTarget.registryResult] ?? "No registry result"}</dd></div>
                  <div><dt className={mutedText}>Last checked</dt><dd className={`mt-0.5 ${headingText}`}>{formatReviewDate(reviewTarget.registryCheckedAt)}</dd></div>
                  <div><dt className={mutedText}>Submitted</dt><dd className={`mt-0.5 ${headingText}`}>{formatReviewDate(reviewTarget.submitted)}</dd></div>
                </dl>
              </section>

              <section className={`rounded-xl border p-4 md:col-span-2 ${borderColor}`}>
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className={`h-4 w-4 ${mutedText}`} />
                  <h3 className={`text-sm font-semibold ${headingText}`}>Facility details</h3>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div><dt className={mutedText}>Facility name</dt><dd className={`mt-0.5 ${headingText}`}>{reviewTarget.workplace}</dd></div>
                  <div><dt className={mutedText}>Facility type</dt><dd className={`mt-0.5 ${headingText}`}>{reviewTarget.facilityType?.replaceAll("_", " ") || "Not provided"}</dd></div>
                  <div><dt className={mutedText}>Facility code</dt><dd className={`mt-0.5 font-mono ${headingText}`}>{reviewTarget.facilityCode || "Not assigned"}</dd></div>
                  <div><dt className={mutedText}>Facility email</dt><dd className={`mt-0.5 break-all ${headingText}`}>{reviewTarget.facilityEmail || "Not provided"}</dd></div>
                  <div><dt className={mutedText}>Facility phone</dt><dd className={`mt-0.5 ${headingText}`}>{reviewTarget.facilityPhone || "Not provided"}</dd></div>
                  <div className="flex items-start gap-2"><MapPin className={`mt-0.5 h-4 w-4 ${mutedText}`} /><div><dt className={mutedText}>Address / location</dt><dd className={`mt-0.5 ${headingText}`}>{[reviewTarget.facilityAddress, reviewTarget.facilityCity, reviewTarget.facilityState].filter(Boolean).join(", ") || "Not provided"}</dd></div></div>
                </dl>
                {reviewTarget.reviewReason && <p className={`mt-4 border-t pt-3 text-sm ${borderColor} ${mutedText}`}>Review note: {reviewTarget.reviewReason}</p>}
              </section>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => void recheck(reviewTarget)}
                disabled={rechecking === reviewTarget.id || decisionSaving}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-60 ${borderColor} ${headingText}`}
              >
                {rechecking === reviewTarget.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Re-check licence registry
              </button>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setReviewTarget(null)} disabled={decisionSaving || rechecking === reviewTarget.id} className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${borderColor} ${headingText}`}>Close</button>
                {reviewTarget.status !== "VERIFIED" && reviewTarget.status !== "REJECTED" && (
                  <>
                    <button type="button" onClick={() => { setDecisionReason(""); setDecisionTarget({ app: reviewTarget, status: "REJECTED" }); }} className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-red-600" style={{ borderColor: "#B91C1C" }}>
                      <XCircle className="h-4 w-4" /> Reject submission
                    </button>
                    <button type="button" onClick={() => { setDecisionReason(""); setDecisionTarget({ app: reviewTarget, status: "VERIFIED" }); }} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#166534" }}>
                      <CheckCircle2 className="h-4 w-4" /> Approve and activate
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
      {decisionTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !decisionSaving) {
              setDecisionTarget(null);
            }
          }}
        >
          <section
            aria-labelledby="registration-decision-title"
            aria-modal="true"
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${cardClasses}`}
            role="dialog"
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${mutedText}`}>
              Registration decision
            </p>
            <h2 id="registration-decision-title" className={`mt-2 text-xl font-semibold ${headingText}`}>
              {decisionTarget.status === "VERIFIED" ? "Approve applicant?" : "Reject registration?"}
            </h2>
            <p className={`mt-2 text-sm ${mutedText}`}>
              {decisionTarget.app.name} · {decisionTarget.app.workplace}
              {decisionTarget.status === "VERIFIED"
                ? " will be activated after approval."
                : " will remain unable to access the network."}
            </p>
            <label className={`mt-5 block text-sm font-medium ${headingText}`} htmlFor="registration-decision-reason">
              {decisionTarget.status === "REJECTED" ? "Reason for rejection" : "Review note (optional)"}
            </label>
            <textarea
              id="registration-decision-reason"
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder={decisionTarget.status === "REJECTED" ? "Explain what needs to be corrected." : "Add an internal review note."}
              className={`${baseInputClasses} mt-2 resize-y p-3`}
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={decisionSaving}
                onClick={() => setDecisionTarget(null)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${borderColor} ${headingText}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={decisionSaving || (decisionTarget.status === "REJECTED" && !decisionReason.trim())}
                onClick={() => void decide()}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: decisionTarget.status === "VERIFIED" ? "#166534" : "#B91C1C" }}
              >
                {decisionSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {decisionTarget.status === "VERIFIED" ? "Approve registration" : "Reject registration"}
              </button>
            </div>
          </section>
        </div>
      )}
      {permissionsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
          <section
            aria-labelledby="role-permissions-title"
            aria-modal="true"
            className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl ${cardClasses}`}
            role="dialog"
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${mutedText}`}>
              Access control
            </p>
            <h2 id="role-permissions-title" className={`mt-2 text-xl font-semibold ${headingText}`}>
              {permissionsTarget.name} permissions
            </h2>
            <p className={`mt-2 text-sm ${mutedText}`}>
              Select the backend-defined permissions assigned to this role.
            </p>
            <div className="mt-5 grid max-h-[50vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {permissionsTarget.availablePermissions.map((permission) => {
                const checked = permissionsTarget.permissions.includes(permission);
                return (
                  <label key={permission} className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${borderColor} ${headingText}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setPermissionsTarget((current) =>
                          !current
                            ? current
                            : {
                                ...current,
                                permissions: checked
                                  ? current.permissions.filter((item) => item !== permission)
                                  : [...current.permissions, permission],
                              },
                        )
                      }
                      className="h-4 w-4 accent-[#1B3A6B]"
                    />
                    <span className="break-all">{permission.replaceAll("_", " ")}</span>
                  </label>
                );
              })}
              {!permissionsTarget.availablePermissions.length && (
                <p className={`col-span-full rounded-lg border border-dashed p-4 text-sm ${borderColor} ${mutedText}`}>
                  The backend must return available permission keys with this role before assignments can be changed.
                </p>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={permissionsSaving}
                onClick={() => setPermissionsTarget(null)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${borderColor} ${headingText}`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={permissionsSaving || !permissionsTarget.availablePermissions.length}
                onClick={() => void saveRolePermissions()}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: primaryCta }}
              >
                {permissionsSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save permissions
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[1680px]">
        {/* Header — sticky with a soft blur so it reads as an app shell, not a static banner */}
        <div
          className={`sticky top-0 z-30 flex flex-col gap-4 border-b px-4 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-6 lg:px-8 ${borderColor}`}
          style={{
            backgroundColor: isDark
              ? "rgba(10,22,40,0.85)"
              : "rgba(238,243,250,0.82)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-lg p-2 lg:hidden ${isDark ? "hover:bg-[#0F2038]" : "hover:bg-white"}`}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:flex"
                style={{
                  background: `linear-gradient(135deg, ${primaryCta}, #14295094)`,
                }}
              >
                <ShieldCheck className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p
                  className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
                >
                  Oncosourz
                </p>
                <div className="flex items-center gap-3">
                  <h1
                    className={`font-display text-2xl font-semibold tracking-tight md:text-3xl ${headingText}`}
                  >
                    Administration
                  </h1>
                  <span
                    className={`hidden rounded-md border px-2 py-0.5 font-mono text-[11px] md:inline-block ${borderColor} ${mutedText}`}
                  >
                    v2.0
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs ${borderColor} ${mutedText} ${isDark ? "bg-[#0F2038]" : "bg-white"}`}
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ backgroundColor: accentPositive }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accentPositive }}
                />
              </span>
              System online
            </div>
            <button
              onClick={handleAdminLogout}
              className={`press-fx flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium md:px-4 md:py-2 md:text-sm ${
                isDark
                  ? "border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0F2038]"
                  : "border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B] hover:bg-white"
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
            <div
              className={`mb-4 rounded-lg border p-4 lg:hidden ${cardClasses}`}
            >
              <div className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = section === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSection(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                        active
                          ? isDark
                            ? "bg-[#4C8DFF]/10 text-[#4C8DFF]"
                            : "bg-[#1B3A6B]/10 text-[#1B3A6B]"
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
            <div
              className={`${section === "overview" ? "lg:col-span-2" : "lg:col-span-3"} rounded-xl border p-4 md:p-6 ${cardClasses}`}
            >
              {/* Navigation tabs - Desktop, styled as a folder index */}
              <div
                className={`mb-6 hidden flex-col gap-4 border-b pb-4 lg:flex xl:flex-row xl:items-center xl:justify-between ${borderColor}`}
              >
                <div className="flex flex-wrap gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = section === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSection(tab.id as any)}
                        className={`press-fx flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium md:px-4 ${
                          active ? "" : `${mutedText} hover:${headingText}`
                        }`}
                        style={
                          active
                            ? {
                                backgroundColor: isDark
                                  ? "rgba(76,141,255,0.1)"
                                  : "rgba(11,30,61,0.06)",
                                color: accentBlue,
                              }
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
                    <Search
                      className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}
                    />
                    <input
                      placeholder="Search\u2026"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={`${baseInputClasses} py-2 pl-9 pr-4 text-sm`}
                    />
                  </div>
                  <button
                    onClick={() =>
                      onNav
                        ? onNav("pg-settings")
                        : goToDashboard("pg-settings")
                    }
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      isDark
                        ? "border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]"
                        : "border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden md:inline">Settings</span>
                  </button>
                </div>
              </div>

              {/* Content sections */}
              {section === "overview" && (
                <div className="space-y-8">
                  {/* Welcome banner — the one saturated surface on the page, gives the
                    otherwise all-white overview a focal point of color */}
                  <div
                    className="relative overflow-hidden rounded-xl p-5 text-white sm:p-6"
                    style={{
                      background: `linear-gradient(120deg, ${primaryCta} 0%, #16305F 55%, ${accentBlue} 130%)`,
                    }}
                  >
                    <div
                      className="glow-orb h-56 w-56 opacity-20"
                      style={{
                        top: "-40%",
                        right: "-5%",
                        backgroundColor: "#4C8DFF",
                      }}
                    />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                          Network overview
                        </p>
                        <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
                          Admin dashboard
                        </h2>
                        <p className="mt-1 text-sm text-white/70">
                          {facilityCount == null
                            ? "Facility total unavailable"
                            : `${facilityCount} facilities in the network`}
                          {" · "}
                          {reviewQueueSummary}.
                        </p>
                      </div>
                      {hasAdminPermission("verification.review") && <button
                        onClick={() => setSection("verification")}
                        className="press-fx flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur-sm hover:bg-white/20"
                      >
                        <UserCheck
                          className="h-4 w-4"
                          style={{ color: "#F0B27A" }}
                        />
                        Review submitted licences
                      </button>}
                    </div>
                  </div>

                  {/* Stats Grid — specimen-label cards */}
                  <div>
                    <p
                      className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
                    >
                      Network snapshot
                    </p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                      {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={stat.label}
                            className={`spec-card relative overflow-hidden rounded-xl p-4 ${interactiveCardClasses}`}
                            style={
                              {
                                "--tick-color": accentBlue,
                              } as React.CSSProperties
                            }
                          >
                            <div className="tick-br" />
                            <div
                              className="absolute inset-y-0 left-0 w-0.75"
                              style={{ backgroundColor: stat.color }}
                            />
                            <div className="flex items-start justify-between">
                              <div>
                                <div
                                  className={`font-mono text-lg font-medium md:text-2xl ${headingText}`}
                                >
                                  {stat.value}
                                </div>
                                <div
                                  className={`text-xs ${mutedText} md:text-sm`}
                                >
                                  {stat.label}
                                </div>
                              </div>
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${stat.color}1A` }}
                              >
                                <Icon
                                  className="h-4 w-4"
                                  style={{ color: stat.color }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <section
                    className={`rounded-xl border p-5 ${cardClasses}`}
                    aria-labelledby="settlement-monitor-title"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p
                          className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
                        >
                          Payments
                        </p>
                        <h2
                          id="settlement-monitor-title"
                          className={`mt-1 font-display text-lg font-semibold ${headingText}`}
                        >
                          Settlement summary
                        </h2>
                      </div>
                      <span className="rounded-md border border-[#dbe4ee] bg-[#f5f8fb] px-2.5 py-1 text-xs font-semibold text-[#40536b]">
                        Live API
                      </span>
                    </div>
                    <p
                      className={`mt-3 max-w-[720px] text-sm leading-6 ${mutedText}`}
                    >
                      Settlement totals returned by the payments service.
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                      {[
                        {
                          label: "Transactions",
                          value: String(settlements?.transactionCount ?? "—"),
                        },
                        {
                          label: "Volume",
                          value: settlements?.transactionVolumeNaira == null
                            ? "—"
                            : formatNaira(settlements.transactionVolumeNaira),
                        },
                        {
                          label: "Platform fees",
                          value: settlements?.platformFeesNaira == null
                            ? "—"
                            : formatNaira(settlements.platformFeesNaira),
                        },
                        {
                          label: "Payouts queued",
                          value: String(settlements?.payoutsQueued ?? "—"),
                        },
                      ].map(({ label, value }) => (
                        <div
                          className={`rounded-lg border p-3 ${borderColor}`}
                          key={label}
                        >
                          <p className={`text-xs ${mutedText}`}>{label}</p>
                          <p
                            className={`mt-1 font-mono text-sm font-medium ${headingText}`}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Quick Actions */}
                  <div>
                    <p
                      className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
                    >
                      Quick actions
                    </p>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.label}
                            onClick={() => void runQuickAction(action.label)}
                            className={`press-fx flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-medium text-left md:text-sm ${
                              isDark
                                ? "border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0F2038]"
                                : "border-[#E7ECF4] text-[#0B1E3D] bg-white hover:border-[#1B3A6B] hover:shadow-[0_4px_16px_-8px_rgba(15,30,61,0.18)] hover:-translate-y-px"
                            }`}
                          >
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                              style={{ backgroundColor: `${action.color}1A` }}
                            >
                              <Icon
                                className="h-3.5 w-3.5"
                                style={{ color: action.color }}
                              />
                            </div>
                            <span className="hidden sm:inline">
                              {action.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Jump to Dashboard */}
                  <div>
                    <p
                      className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
                    >
                      Jump to dashboard
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[
                        {
                          id: "pg-facilities",
                          label: "Facilities",
                          icon: Building2,
                          color: "#1B3A6B",
                          permission: "facility.read",
                        },
                        {
                          id: "pg-users",
                          label: "Users",
                          icon: Users,
                          color: "#0F766E",
                          permission: "user.read",
                        },
                        {
                          id: "pg-audit",
                          label: "Audit log",
                          icon: ClipboardList,
                          color: "#6D28D9",
                          permission: "audit.read",
                        },
                      ].filter((item) => hasAdminPermission(item.permission)).map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => goToDashboard(item.id as PageId)}
                            className={`press-fx flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium ${
                              isDark
                                ? "border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF] hover:bg-[#0F2038]"
                                : "border-[#E7ECF4] bg-white text-[#0B1E3D] hover:border-[#C9D6E8] hover:shadow-[0_4px_16px_-8px_rgba(15,30,61,0.18)]"
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <div
                                className="flex h-7 w-7 items-center justify-center rounded-md"
                                style={{ backgroundColor: `${item.color}1A` }}
                              >
                                <Icon
                                  className="h-3.5 w-3.5"
                                  style={{ color: item.color }}
                                />
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

              {section === "users" && (
                <div className="mt-2">
                  <UsersPage
                    adminMode
                    onNav={(id: PageId) => {
                      window.localStorage.setItem("adminTarget", id);
                      router.push("/pages/dashboard");
                    }}
                    onOpenModal={() => {}}
                  />
                </div>
              )}

              {section === "facilities" && (
                <div className="mt-2">
                  <FacilitiesPage
                    adminMode
                    onNav={(id: PageId) => {
                      window.localStorage.setItem("adminTarget", id);
                      router.push("/pages/dashboard");
                    }}
                    onOpenModal={() => {}}
                  />
                </div>
              )}

              {section === "audit" && (
                <div className="mt-2">
                  <AuditPage adminMode />
                </div>
              )}

              {section === "verification" &&
                (() => {
                  const q = search.trim().toLowerCase();
                  const visible = applications.filter((a) => {
                    const inStatus =
                      statusFilter === "ALL" ||
                      (statusFilter === "REVIEW"
                        ? a.status === "PENDING" || a.status === "MANUAL_REVIEW"
                        : a.status === statusFilter);
                    const inType =
                      typeFilter === "ALL" || a.accountType === typeFilter;
                    const inSearch =
                      !q ||
                      a.name.toLowerCase().includes(q) ||
                      a.license.toLowerCase().includes(q);
                    return inStatus && inType && inSearch;
                  });
                  const chip = (active: boolean) =>
                    `press-fx rounded-md border px-3 py-1.5 text-xs font-medium ${
                      active
                        ? isDark
                          ? "border-[#4C8DFF] bg-[#4C8DFF]/10 text-[#4C8DFF]"
                          : "border-[#1B3A6B] bg-[#1B3A6B]/10 text-[#1B3A6B]"
                        : `${borderColor} ${mutedText}`
                    }`;
                  const statusColor: Record<VerificationStatus, string> = {
                    VERIFIED: accentPositive,
                    REJECTED: "#B91C1C",
                    PENDING: accentAmber,
                    MANUAL_REVIEW: accentAmber,
                  };
                  const statusLabel: Record<VerificationStatus, string> = {
                    VERIFIED: "Verified",
                    REJECTED: "Rejected",
                    PENDING: "Pending",
                    MANUAL_REVIEW: "Needs review",
                  };
                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                        <h3
                          className={`font-display text-lg font-semibold ${headingText}`}
                        >
                          Submitted licence review
                        </h3>
                        <p className={`text-sm ${mutedText}`}>
                          Check the registry result and applicant details, then approve or reject the facility registration.
                        </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void loadApplications()}
                          disabled={applicationsLoading}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-60 ${borderColor} ${headingText}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${applicationsLoading ? "animate-spin" : ""}`} />
                          Refresh list
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {(
                          [
                            ["REVIEW", `Needs review (${applicationsLoaded ? pendingCount : "—"})`],
                            ["VERIFIED", "Verified"],
                            ["REJECTED", "Rejected"],
                            ["ALL", "All"],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            onClick={() => setStatusFilter(id)}
                            className={chip(statusFilter === id)}
                          >
                            {label}
                          </button>
                        ))}
                        <select
                          value={typeFilter}
                          onChange={(e) =>
                            setTypeFilter(e.target.value as AccountType | "ALL")
                          }
                          className={`${baseInputClasses} ml-auto w-auto px-3 py-1.5 text-xs`}
                        >
                          <option value="ALL">All account types</option>
                          {ACCOUNT_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {applicationsLoading && visible.length === 0 && (
                        <div className={`rounded-xl border p-8 text-center text-sm ${borderColor} ${mutedText}`}>
                          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                          Loading registration applications…
                        </div>
                      )}
                      {!applicationsLoading && applicationsLoadError && (
                        <div className={`rounded-xl border p-5 text-sm ${isDark ? "border-red-400/30 bg-red-400/5 text-red-200" : "border-red-200 bg-red-50 text-red-800"}`} role="alert">
                          <p className="font-medium">Licence review queue unavailable</p>
                          <p className="mt-1">{applicationsLoadError}</p>
                          <button
                            type="button"
                            onClick={() => void loadApplications()}
                            className="mt-3 rounded-md border border-current px-3 py-1.5 text-xs font-semibold"
                          >
                            Retry loading applications
                          </button>
                        </div>
                      )}
                      {!applicationsLoading && !applicationsLoadError && applicationsLoaded && visible.length === 0 && (
                        <div
                          className={`rounded-xl border border-dashed p-8 text-center text-sm ${borderColor} ${mutedText}`}
                        >
                          No submitted licences match this filter.
                        </div>
                      )}

                      {visible.map((app) => {
                        const Icon = TYPE_ICONS[app.accountType];
                        const info = getAccountInfo(app.accountType)!;
                        return (
                          <div
                            key={app.id}
                            className={`rounded-xl p-4 ${interactiveCardClasses}`}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`rounded-md border p-2 ${borderColor}`}
                                >
                                  <Icon className={`h-5 w-5 ${mutedText}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`font-medium ${headingText}`}
                                    >
                                      {app.name}
                                    </span>
                                    <span
                                      className="font-mono text-[11px]"
                                      style={{ color: statusColor[app.status] }}
                                    >
                                      ● {statusLabel[app.status]}
                                    </span>
                                  </div>
                                  <div className={`text-sm ${mutedText}`}>
                                    {info.label} &middot; {app.workplace}
                                  </div>
                                  <div className={`mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs ${mutedText}`}>
                                    {app.adminEmail && <span>Applicant: {app.adminEmail}</span>}
                                    {app.facilityType && <span>Facility type: {app.facilityType.replaceAll("_", " ")}</span>}
                                    <span>Facility status: {app.facilityStatus || "PENDING"}</span>
                                    <span>Licence status: {app.userVerificationStatus || app.status}</span>
                                    <span>Admin account: {app.adminActive === true ? "Active" : "Inactive"}</span>
                                  </div>
                                  <div
                                    className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs ${mutedText}`}
                                  >
                                    <span>
                                      {info.registry.replace("_", " ")}:{" "}
                                      {app.license}
                                    </span>
                                    <span
                                      style={{
                                        color:
                                          app.registryResult === "MATCH"
                                            ? accentPositive
                                            : accentAmber,
                                      }}
                                    >
                                      {REGISTRY_TEXT[app.registryResult]}
                                    </span>
                                    <span>{app.submitted}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReviewTarget(app)}
                                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                                  style={{ backgroundColor: accentBlue }}
                                >
                                  <FileCheck className="h-4 w-4" />
                                  Review application
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              {section === "roles" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-display text-lg font-semibold ${headingText}`}
                    >
                      Roles & permissions
                    </h3>
                    <button
                      onClick={() => void createRole()}
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
                      <div
                        key={role.name}
                        className={`rounded-xl p-4 ${interactiveCardClasses}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-md border p-2 ${borderColor}`}
                            >
                              <Icon className={`h-5 w-5 ${mutedText}`} />
                            </div>
                            <div>
                              <div className={`font-medium ${headingText}`}>
                                {role.name}
                              </div>
                              <div className={`text-sm ${mutedText}`}>
                                {role.desc}
                              </div>
                              <div
                                className={`mt-1 flex items-center gap-2 font-mono text-xs ${mutedText}`}
                              >
                                <Users className="h-3 w-3" />
                                {role.count}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {role.sees.map((s: string) => (
                                  <span
                                    key={s}
                                    className={`rounded-md border px-2 py-0.5 text-[11px] ${borderColor} ${mutedText}`}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => void openRolePermissions(role)}
                              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${borderColor} ${headingText}`}
                            >
                              <Shield className="h-3 w-3" />
                              Permissions
                            </button>
                            <button
                              onClick={() => void editRole(role)}
                              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                                isDark
                                  ? "border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]"
                                  : "border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]"
                              }`}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => void deleteRole(role)}
                              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150"
                              style={{
                                borderColor: accentAmber,
                                color: accentAmber,
                              }}
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

              {section === "integrations" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className={`font-display text-lg font-semibold ${headingText}`}>
                        External integrations
                      </h3>
                      <p className={`mt-1 text-sm ${mutedText}`}>
                        Health checks reported by the backend. Credentials stay server-side.
                      </p>
                    </div>
                    <button type="button" disabled={integrationsLoading} onClick={() => void loadIntegrations()} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-60 ${borderColor} ${headingText}`}>
                      <RefreshCw className={`h-4 w-4 ${integrationsLoading ? "animate-spin" : ""}`} />
                      Refresh status
                    </button>
                  </div>
                  {integrationsLoading && !integrations.length && (
                    <p className={`rounded-xl border p-6 text-sm ${borderColor} ${mutedText}`}>
                      Checking connected services…
                    </p>
                  )}
                  {!integrations.length && !integrationsLoading ? (
                    <p
                      className={`rounded-xl border border-dashed p-6 text-sm ${borderColor} ${mutedText}`}
                    >
                      The backend did not return any integration health records.
                    </p>
                  ) : null}
                  {integrations.map((integration) => {
                    const isActive = /healthy|active|connected|ok/i.test(String(integration.status));
                    return (
                      <div
                        key={integration.name}
                        className={`rounded-xl p-4 ${interactiveCardClasses}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-md border p-2 ${borderColor}`}
                            >
                              <Plug className={`h-5 w-5 ${mutedText}`} />
                            </div>
                            <div>
                              <div className={`font-medium ${headingText}`}>
                                {integration.name}
                              </div>
                              <div className={`text-sm ${mutedText}`}>
                                {integration.desc}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-3">
                                <span
                                  className="inline-flex items-center gap-1.5 font-mono text-xs"
                                  style={{
                                    color: isActive
                                      ? accentPositive
                                      : accentAmber,
                                  }}
                                >
                                  <span
                                    className="inline-block h-1.5 w-1.5 rounded-full"
                                    style={{
                                      backgroundColor: isActive
                                        ? accentPositive
                                        : accentAmber,
                                    }}
                                  />
                                  {integration.status}
                                </span>
                                <span
                                  className={`font-mono text-xs ${mutedText}`}
                                >
                                  <Clock className="mr-1 inline h-3 w-3" />
                                  Last sync: {integration.lastSync}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:justify-end">
                            {adminPermissions.includes("integration.manage") && integration.key && <>
                              <button type="button" onClick={() => void openIntegrationConfiguration(integration)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${borderColor} ${headingText}`}>Configure</button>
                              <button type="button" disabled={integrationActionKey !== null} onClick={() => void runIntegrationAction(integration.key, "test")} className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${borderColor} ${headingText}`}>{integrationActionKey === `${integration.key}:test` ? "Testing…" : "Test connection"}</button>
                            </>}
                            {adminPermissions.includes("integration.sync") && integration.key && <button type="button" disabled={integrationActionKey !== null} onClick={() => void runIntegrationAction(integration.key, "sync")} className="rounded-lg bg-[#0B1E3D] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{integrationActionKey === `${integration.key}:sync` ? "Starting…" : "Sync now"}</button>}
                            {!integration.key && <span className={`self-center text-xs ${mutedText}`}>Backend health record has no integration key; controls are unavailable.</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar - Activity Feed styled as a chain-of-custody log */}
            {section === "overview" && <div className={`rounded-xl border p-4 md:p-6 ${cardClasses}`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p
                    className={`font-mono text-[11px] uppercase tracking-[0.2em] ${mutedText}`}
                  >
                    Chain of custody
                  </p>
                  <h3
                    className={`font-display text-lg font-semibold ${headingText}`}
                  >
                    Activity feed
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className={`h-4 w-4 ${mutedText}`} />
                </div>
              </div>
              <div
                className={`relative space-y-0 border-l pl-5 ${borderColor}`}
              >
                {activityFeed.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className={`relative -ml-2 rounded-lg py-1 pb-4 pl-2 pr-1 transition-colors duration-150 last:pb-0 ${isDark ? "hover:bg-[#0B1E33]" : "hover:bg-[#F8FAFC]"}`}
                    >
                      <span
                        className="absolute -left-6.25 top-1 flex h-4 w-4 items-center justify-center rounded-sm border bg-inherit"
                        style={{
                          borderColor: item.alert
                            ? accentAmber
                            : borderColor.includes("26364C")
                              ? "#1E3358"
                              : "#E2E8F0",
                        }}
                      >
                        <Icon
                          className="h-2.5 w-2.5"
                          style={{
                            color: item.alert
                              ? accentAmber
                              : isDark
                                ? "#8CA0BE"
                                : "#5B6B85",
                          }}
                        />
                      </span>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className={`text-sm ${headingText}`}>
                            {item.action}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                            <span className={mutedText}>{item.time}</span>
                            <span className={mutedText}>&middot;</span>
                            <span className={mutedText}>{item.user}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {hasAdminPermission("audit.read") && <button
                onClick={() => setSection("audit")}
                className={`mt-4 w-full rounded-md border py-2 text-center text-sm font-medium transition-colors duration-150 ${
                  isDark
                    ? "border-[#1E3358] text-[#EAF0FA] hover:border-[#4C8DFF]"
                    : "border-[#E2E8F0] text-[#0B1E3D] hover:border-[#1B3A6B]"
                }`}
              >
                View all activity
              </button>}
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
