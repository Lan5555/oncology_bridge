"use client";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import management from "@/app/components/Management.module.css";
import { useManagementDialog } from "@/app/hooks/useManagementDialog";
import {
  type AccountType,
  getAccountInfo,
  getRegistryLabel,
} from "@/app/lib/accounts";
import { notifyResult } from "@/app/lib/notifications";
import type { ModalId, PageId } from "@/app/lib/types";
import { FACILITY_SERVICE } from "@/app/services/facility-service/facility-service";
import { unwrapArray } from "@/app/services/response-utils";
import { USER_SERVICE } from "@/app/services/user-service/user-service";

interface Props {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
  adminMode?: boolean;
  canManageFacilityUsers?: boolean;
}

function humanizeStatus(value: unknown): string {
  const status = String(value ?? "")
    .trim()
    .replaceAll("_", " ")
    .toLowerCase();
  return status
    ? status.replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Not provided";
}

function getUserRoleLabel(user: any): string {
  const role =
    user.role?.name ?? user.role?.code ?? user.role_name ?? user.role;
  if (typeof role !== "string") return "Member";
  const key = role.trim().toUpperCase();
  const labels: Record<string, string> = {
    FACILITY_ADMIN: "Facility administrator",
    ADMIN: "Network administrator",
    SUPERADMIN: "Super administrator",
    ONCOLOGIST: "Oncologist",
    PHARMACIST: "Pharmacist",
  };
  return labels[key] ?? humanizeStatus(role);
}

function memberName(user: any): string {
  return (
    user.name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "Unnamed member"
  );
}
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function memberStatus(
  user: any,
): "active" | "inactive" | "pending" | "unknown" {
  if (user.active === true) return "active";
  if (user.active === false)
    return ["PENDING", "MANUAL_REVIEW"].includes(
      user.verification_status ?? user.license?.verification_status,
    )
      ? "pending"
      : "inactive";
  return "unknown";
}
function requestDate(value: unknown): string {
  if (!value) return "Date unavailable";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default function UsersPage({
  onOpenModal,
  adminMode = false,
  canManageFacilityUsers = false,
}: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [membershipReviewTarget, setMembershipReviewTarget] =
    useState<any>(null);
  const [registryChecks, setRegistryChecks] = useState<
    Record<
      string,
      { result: string; status: string; checkedAt: string; evidence: string }
    >
  >({});
  const [registryCheckLoading, setRegistryCheckLoading] = useState<
    string | null
  >(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [detailTarget, setDetailTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [membershipDecision, setMembershipDecision] = useState<{
    request: any;
    decision: "approve" | "reject";
  } | null>(null);
  const [membershipReason, setMembershipReason] = useState("");
  const [inviteSaving, setInviteSaving] = useState(false);
  const [facilityOptions, setFacilityOptions] = useState<any[]>([]);
  const [facilityOptionsLoading, setFacilityOptionsLoading] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [inviteDraft, setInviteDraft] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    account_type: "DOCTOR",
  });
  const [draft, setDraft] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const canManageUsers = adminMode || canManageFacilityUsers;
  const checkApplicantLicense = async (request: any) => {
    if (registryCheckLoading !== null) return;
    const requestId = String(request.id);
    setRegistryCheckLoading(requestId);
    const response = await USER_SERVICE.lookupFacilityMembershipLicense(
      requestId,
      adminMode,
    );
    notifyResult(
      response,
      "Licence check completed.",
      "Licence check could not be completed.",
    );
    setRegistryCheckLoading(null);
    if (!response.success) {
      setNotice(
        response.message || "Facility licence review could not be saved.",
      );
      return;
    }
    const payload = response.data as any;
    const result =
      payload?.facility_license_review ??
      payload?.license_review ??
      payload?.review ??
      payload;
    setMembershipRequests((current) =>
      current.map((item) =>
        String(item.id) === requestId
          ? { ...item, facility_license_review: result }
          : item,
      ),
    );
    setMembershipReviewTarget((current: any) =>
      current && String(current.id) === requestId
        ? { ...current, facility_license_review: result }
        : current,
    );
    setRegistryChecks((current) => ({
      ...current,
      [requestId]: {
        result:
          result.result ??
          result.registry_result ??
          result.registryResult ??
          "UNAVAILABLE",
        evidence: result.evidence ?? "",
        status: result.status ?? result.verification_status ?? "MANUAL_REVIEW",
        checkedAt:
          result.checked_at ?? result.checkedAt ?? new Date().toISOString(),
      },
    }));
    setNotice(
      "Registry check saved to this facility’s review record. The authoritative licence status remains unchanged until central licence review is complete.",
    );
  };
  const load = useCallback(async () => {
    if (!canManageUsers) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    setRequestsError("");
    const [userResponse, roleResponse, requestResponse] = await Promise.all([
      USER_SERVICE.list("take=50&skip=0", adminMode),
      USER_SERVICE.roles(adminMode),
      canManageUsers
        ? USER_SERVICE.facilityMembershipRequests("PENDING", adminMode)
        : Promise.resolve(null),
    ]);
    if (userResponse.success) setUsers(unwrapArray(userResponse.data));
    else setLoadError(userResponse.message || "Users could not be loaded.");
    if (roleResponse.success) setRoles(unwrapArray(roleResponse.data));
    if (requestResponse?.success)
      setMembershipRequests(unwrapArray(requestResponse.data));
    else if (requestResponse)
      setRequestsError(
        requestResponse.message || "Join requests could not be loaded.",
      );
    setLoading(false);
  }, [adminMode, canManageUsers]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!adminMode) return;
    setFacilityOptionsLoading(true);
    void FACILITY_SERVICE.findAllFacilities(
      { page: 1, limit: 100, status: "ACTIVE" },
      true,
    )
      .then((response) => {
        if (!response.success) {
          setNotice(
            response.message || "Active facilities could not be loaded.",
          );
          return;
        }
        const value = response.data as any;
        const rows = Array.isArray(value)
          ? value
          : (value?.facilities ?? value?.items ?? []);
        setFacilityOptions(Array.isArray(rows) ? rows : []);
      })
      .finally(() => setFacilityOptionsLoading(false));
  }, [adminMode]);
  const openEdit = (user: any) => {
    setEditTarget(user);
    setDraft({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
    setNotice("");
  };
  const saveUser = async (event: FormEvent) => {
    event.preventDefault();
    if (!editTarget?.id) return;
    setSaving(true);
    const response = await USER_SERVICE.updateUser(
      editTarget.id,
      draft,
      adminMode,
    );
    notifyResult(
      response,
      "Member details updated.",
      "Member details could not be updated.",
    );
    setSaving(false);
    if (!response.success) {
      setNotice(response.message || "User details could not be updated.");
      return;
    }
    setEditTarget(null);
    setNotice(response.message || "User details updated.");
    await load();
  };
  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setSaving(true);
    const response = await USER_SERVICE.deleteUser(deleteTarget.id, adminMode);
    notifyResult(
      response,
      "Member access removed.",
      "Member access could not be removed.",
    );
    setSaving(false);
    if (!response.success) {
      setNotice(response.message || "User could not be deleted.");
      setDeleteTarget(null);
      return;
    }
    setDeleteTarget(null);
    setNotice(
      response.message || "User access removed. The account was soft deleted.",
    );
    await load();
  };
  const inviteMember = async (event: FormEvent) => {
    event.preventDefault();
    const requiredRoleName =
      inviteDraft.account_type === "DOCTOR" ? "ONCOLOGIST" : "PHARMACIST";
    const assignedRole = roles.find(
      (role) => String(role.name).toUpperCase() === requiredRoleName,
    );
    if (!assignedRole?.id) {
      setNotice(
        `The ${requiredRoleName} role is not available. Ask a network administrator to configure the role first.`,
      );
      return;
    }
    if (adminMode && !selectedFacilityId) {
      setNotice("Select a facility for this invitation.");
      return;
    }
    setInviteSaving(true);
    const payload = {
      first_name: inviteDraft.first_name.trim(),
      last_name: inviteDraft.last_name.trim(),
      email: inviteDraft.email.trim(),
      phone: inviteDraft.phone.trim(),
      account_type: inviteDraft.account_type,
      role_id: assignedRole.id,
      ...(adminMode ? { facility_id: selectedFacilityId } : {}),
    };
    const response = await USER_SERVICE.createUser(payload, adminMode);
    notifyResult(response, "Invitation sent.", "Invitation could not be sent.");
    setInviteSaving(false);
    if (!response.success) {
      setNotice(response.message || "Invitation could not be sent.");
      return;
    }
    setInviteOpen(false);
    setInviteDraft({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      account_type: "DOCTOR",
    });
    setSelectedFacilityId("");
    setNotice(
      response.message ||
        "Invitation sent. The user must complete licence verification before receiving professional tools.",
    );
    await load();
  };
  const canInviteUsers = adminMode || canManageFacilityUsers;
  const decideMembership = async () => {
    if (!membershipDecision) return;
    if (membershipDecision.decision === "reject" && !membershipReason.trim()) {
      setNotice("Add a reason before rejecting the join request.");
      return;
    }
    setSaving(true);
    const response = await USER_SERVICE.decideFacilityMembership(
      String(membershipDecision.request.id),
      membershipDecision.decision,
      membershipDecision.decision === "reject"
        ? { reason: membershipReason.trim() }
        : {},
      adminMode,
    );
    notifyResult(
      response,
      "Membership decision saved.",
      "Membership decision could not be saved.",
    );
    setSaving(false);
    if (!response.success) {
      setNotice(
        response.message || "Facility access request could not be updated.",
      );
      return;
    }
    setMembershipDecision(null);
    setMembershipReason("");
    const decisionData = response.data as any;
    const decidedUser =
      decisionData?.user ??
      decisionData?.membership?.user ??
      decisionData?.request?.user ??
      {};
    const decidedFacility =
      decisionData?.facility ?? decisionData?.membership?.facility ?? {};
    const userActive = decidedUser.active ?? decidedUser.is_active;
    const licenceStatus = String(
      decidedUser.verification_status ??
        decidedUser.license?.verification_status ??
        "",
    ).toUpperCase();
    const facilityStatus = String(decidedFacility.status ?? "").toUpperCase();
    const activationGate =
      decisionData?.activation_gate ??
      decisionData?.activationGate ??
      decidedUser.activation_gate;
    if (membershipDecision.decision === "approve" && userActive === true) {
      setNotice(
        response.message ||
          "Membership approved and the account is active. The user can now sign in.",
      );
    } else if (
      membershipDecision.decision === "approve" &&
      licenceStatus &&
      licenceStatus !== "VERIFIED"
    ) {
      setNotice(
        response.message ||
          `Membership approved. The user remains inactive until licence review is VERIFIED (current status: ${licenceStatus}).`,
      );
    } else if (
      membershipDecision.decision === "approve" &&
      ((facilityStatus && facilityStatus !== "ACTIVE") || activationGate)
    ) {
      setNotice(
        response.message ||
          `Membership approved, but the account remains inactive because ${activationGate || `facility status is ${facilityStatus}`}.`,
      );
    } else if (
      membershipDecision.decision === "approve" &&
      userActive === false
    ) {
      setNotice(
        response.message ||
          "Membership approved, but the backend still reports the user as inactive. Check licence verification, facility status, and account setup on the updated request.",
      );
    } else {
      setNotice(
        response.message ||
          "Facility access request updated. Licence approval remains a separate check.",
      );
    }
    await load();
  };
  const visibleUsers = users.filter((user) => {
    const matchesRole =
      !filter ||
      String(user.role?.id ?? user.roleId ?? user.role_id ?? user.role) ===
        filter;
    const name =
      user.name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        name,
        user.email,
        user.phone,
        user.facility?.name,
        user.hospital?.name,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    return (
      matchesRole &&
      matchesSearch &&
      (statusFilter === "all" || memberStatus(user) === statusFilter)
    );
  });
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(visibleUsers.length / pageSize));
  const currentPage = Math.min(userPage, pageCount);
  const pageUsers = visibleUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const teamMetrics = [
    {
      label: "Team members",
      value: users.length,
      detail: "Members in the loaded directory",
      icon: UsersRound,
    },
    {
      label: "Active accounts",
      value: users.filter((user) => memberStatus(user) === "active").length,
      detail: "Accounts marked active",
      icon: ShieldCheck,
    },
    {
      label: "Awaiting activation",
      value: users.filter((user) => memberStatus(user) === "pending").length,
      detail: "Inactive with licence review pending",
      icon: Clock,
    },
    {
      label: "Join requests",
      value: membershipRequests.length,
      detail: "Requests waiting for your review",
      icon: UserPlus,
    },
  ];
  const dialogRoot = useManagementDialog(
    detailTarget
      ? "details"
      : inviteOpen
        ? "invite"
        : membershipReviewTarget
          ? "review"
          : membershipDecision
            ? "decision"
            : editTarget
              ? "edit"
              : deleteTarget
                ? "delete"
                : null,
    saving || inviteSaving || registryCheckLoading !== null,
    () => {
      setDetailTarget(null);
      setInviteOpen(false);
      setMembershipReviewTarget(null);
      setMembershipDecision(null);
      setEditTarget(null);
      setDeleteTarget(null);
    },
  );
  if (!canManageUsers) return null;
  return (
    <div ref={dialogRoot} className={management.team + " animate-fade-up"}>
      <header className={management.teamHeader}>
        <div>
          <div className={management.teamKicker}>
            <UsersRound className="size-3.5" />
            {adminMode ? "Network administration" : "Your facility workspace"}
          </div>
          <h1>{adminMode ? "People & access" : "Manage your team"}</h1>
          <p>
            {adminMode
              ? "The people behind your care network. Manage members, invitations, and facility access."
              : "Bring your care team together. Manage members and review who can access your facility."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={management.secondaryButton}
          >
            <RefreshCw
              className={"size-3.5 " + (loading ? "animate-spin" : "")}
            />
            Refresh
          </button>
          {canInviteUsers && (
            <button
              type="button"
              className={management.primaryButton}
              onClick={() => {
                setInviteOpen(true);
                setNotice("");
              }}
            >
              <UserPlus className="size-4" />
              Invite a member
            </button>
          )}
        </div>
      </header>
      {notice && (
        <output className={management.notice}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {notice}
        </output>
      )}
      <section aria-label="Team overview" className={management.metrics}>
        {teamMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className={management.metric} key={metric.label}>
              <div className={management.metricTop}>
                <span>{metric.label}</span>
                <Icon />
              </div>
              <strong>
                {loading ||
                (loadError && metric.label !== "Join requests") ||
                (requestsError && metric.label === "Join requests")
                  ? 0
                  : metric.value}
              </strong>
              <small>{metric.detail}</small>
            </article>
          );
        })}
      </section>
      <section
        className={management.teamPanel}
        aria-labelledby="team-requests-title"
      >
        <div className={management.teamPanelHeader}>
          <div>
            <h2 id="team-requests-title">
              Join requests{" "}
              <span className="ml-2 text-xs font-normal text-g400">
                {loading || requestsError ? 0 : membershipRequests.length}
              </span>
            </h2>
            <p>
              Review new applicants before they join your facility. Professional
              licence approval is a separate step.
            </p>
          </div>
          <span className={management.badge} data-tone="pending">
            <Clock className="size-3" />
            Needs your review
          </span>
        </div>
        {requestsError ? (
          <div role="alert" className={management.notice}>
            {requestsError}
            <button
              type="button"
              className="ml-auto font-semibold text-p"
              onClick={() => void load()}
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className={management.emptyRequests}>
            <Loader2 className="size-5 animate-spin" />
            Loading join requests...
          </div>
        ) : membershipRequests.length ? (
          membershipRequests.map((request) => {
            const applicant = request.user ?? request.applicant ?? {};
            const name = memberName(applicant);
            return (
              <article key={request.id} className={management.request}>
                <div className={management.avatar}>{initials(name)}</div>
                <div className={management.requestBody}>
                  <h3>{name}</h3>
                  <p>
                    {applicant.email ?? "Email not provided"} ·{" "}
                    {getAccountInfo(
                      applicant.account_type ?? request.account_type,
                    )?.label ?? "Account type not provided"}
                  </p>
                  <p>
                    {request.facility?.name
                      ? request.facility.name + " - "
                      : ""}
                    Requested{" "}
                    {requestDate(request.created_at ?? request.submitted_at)}
                  </p>
                </div>
                <span className={management.badge} data-tone="muted">
                  Licence:{" "}
                  {humanizeStatus(
                    applicant.verification_status ??
                      request.verification_status ??
                      "MANUAL_REVIEW",
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setMembershipReviewTarget(request)}
                  className={management.secondaryButton}
                >
                  Review request <ChevronRight className="size-3.5" />
                </button>
              </article>
            );
          })
        ) : (
          <div className={management.emptyRequests}>
            <div className={management.avatar}>
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <strong>You are all caught up</strong>New requests to join{" "}
              {adminMode ? "the network's facilities" : "your facility"} will
              appear here.
            </div>
          </div>
        )}
      </section>
      <section
        className={management.teamPanel}
        aria-labelledby="team-directory-title"
        aria-busy={loading}
      >
        <div className={management.teamPanelHeader}>
          <div>
            <h2 id="team-directory-title">
              {adminMode ? "Member directory" : "Your team"}
            </h2>
            <p>
              View professional profiles, check account status, and manage
              member access.
            </p>
          </div>
          <div className={management.teamSearch}>
            <Search className="size-3.5" />
            <input
              aria-label="Search members"
              placeholder="Search name, email or facility..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setUserPage(1);
              }}
            />
          </div>
        </div>
        <div className={management.directoryToolbar}>
          <div className={management.teamTabs}>
            {[
              ["all", "All members"],
              ["active", "Active"],
              ["pending", "Pending activation"],
              ["inactive", "Inactive"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={statusFilter === value}
                onClick={() => {
                  setStatusFilter(value);
                  setUserPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            aria-label="Filter members by role"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setUserPage(1);
            }}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-xs text-g600"
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {humanizeStatus(role.name)}
              </option>
            ))}
          </select>
        </div>
        {loadError ? (
          <div role="alert" className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 size-7 text-err" />
            <h3 className="text-sm font-semibold text-g800">
              The directory could not be loaded
            </h3>
            <p className="my-3 text-xs text-g500">{loadError}</p>
            <button
              type="button"
              className={management.secondaryButton}
              onClick={() => void load()}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-5 p-6">
            <span className="sr-only">Loading members</span>
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="flex animate-pulse items-center gap-4">
                <div className="size-10 rounded-xl bg-g100" />
                <div className="flex-1">
                  <div className="mb-2 h-3 w-1/3 rounded bg-g100" />
                  <div className="h-2 w-1/2 rounded bg-g100" />
                </div>
                <div className="h-5 w-20 rounded bg-g100" />
              </div>
            ))}
          </div>
        ) : visibleUsers.length ? (
          <div className={management.tableScroll}>
            <table className={management.directory}>
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Role & facility</th>
                  <th scope="col">Licence</th>
                  <th scope="col">Account status</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((user) => {
                  const name = memberName(user);
                  const status = memberStatus(user);
                  const licence =
                    user.verification_status ??
                    user.license?.verification_status;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className={management.memberCell}>
                          <div className={management.avatar}>
                            {initials(name)}
                          </div>
                          <div>
                            <strong>{name}</strong>
                            <small>{user.email ?? "Email not provided"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={management.badge} data-tone="muted">
                          {getUserRoleLabel(user)}
                        </span>
                        <p className="mt-2 text-[10px] text-g500">
                          {user.facility?.name ??
                            user.hospital?.name ??
                            "Facility not linked"}
                        </p>
                      </td>
                      <td>
                        <span
                          className={management.badge}
                          data-tone={licence === "VERIFIED" ? "good" : "muted"}
                        >
                          {licence === "VERIFIED" && (
                            <ShieldCheck className="size-3" />
                          )}
                          {humanizeStatus(licence)}
                        </span>
                        <p className="mt-2 text-[10px] text-g400">
                          {getAccountInfo(user.account_type as AccountType)
                            ?.label ?? "Professional account"}
                        </p>
                      </td>
                      <td>
                        <span
                          className={management.badge}
                          data-tone={
                            status === "active"
                              ? "good"
                              : status === "pending"
                                ? "pending"
                                : "muted"
                          }
                        >
                          <span
                            className={
                              "size-1.5 rounded-full " +
                              (status === "active"
                                ? "bg-emerald-600"
                                : status === "pending"
                                  ? "bg-amber-500"
                                  : "bg-g300")
                            }
                          />
                          {status === "pending"
                            ? "Pending activation"
                            : status === "unknown"
                              ? "Not provided"
                              : humanizeStatus(status)}
                        </span>
                      </td>
                      <td>
                        <div className={management.rowActions}>
                          <button
                            type="button"
                            aria-label={"View " + name}
                            title="View profile"
                            onClick={() => setDetailTarget(user)}
                          >
                            <Eye className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={"Edit " + name}
                            title="Edit member"
                            onClick={() => openEdit(user)}
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            data-danger
                            aria-label={"Remove " + name}
                            title="Remove access"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={UsersRound}
            title={
              search || filter || statusFilter !== "all"
                ? "No matching members"
                : "Your team starts here"
            }
            description={
              search || filter || statusFilter !== "all"
                ? "Try another search or clear your filters."
                : "Invite your first member to start building your facility team."
            }
            action={
              search || filter || statusFilter !== "all" ? (
                <button
                  type="button"
                  className={management.secondaryButton}
                  onClick={() => {
                    setSearch("");
                    setFilter("");
                    setStatusFilter("all");
                    setUserPage(1);
                  }}
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  className={management.primaryButton}
                  onClick={() => setInviteOpen(true)}
                >
                  <UserPlus className="size-4" />
                  Invite a member
                </button>
              )
            }
          />
        )}
        {!loading && !loadError && (
          <div className={management.directoryFooter}>
            <span>
              {visibleUsers.length
                ? "Showing " +
                  ((currentPage - 1) * pageSize + 1) +
                  " to " +
                  Math.min(currentPage * pageSize, visibleUsers.length) +
                  " of " +
                  visibleUsers.length +
                  " matching members"
                : "No members to display"}{" "}
              | {users.length} loaded
            </span>
            <div className="flex items-center gap-3">
              <span>
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                aria-label="Previous members page"
                disabled={currentPage === 1}
                onClick={() => setUserPage(currentPage - 1)}
                className="rounded-md border border-g200 p-1.5 disabled:opacity-30"
              >
                <ChevronLeft className="size-3" />
              </button>
              <button
                type="button"
                aria-label="Next members page"
                disabled={currentPage === pageCount}
                onClick={() => setUserPage(currentPage + 1)}
                className="rounded-md border border-g200 p-1.5 disabled:opacity-30"
              >
                <ChevronRight className="size-3" />
              </button>
            </div>
          </div>
        )}
      </section>

      {detailTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <section
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-g200 bg-w p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-g500">
                  User record
                </p>
                <h2
                  id="user-details-title"
                  className="mt-1 text-xl font-bold text-g900"
                >
                  {detailTarget.name ||
                    `${detailTarget.first_name ?? ""} ${detailTarget.last_name ?? ""}`.trim() ||
                    "User details"}
                </h2>
                <p className="mt-1 text-sm text-g500">
                  {detailTarget.email ?? "Email not provided"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                aria-label="Close user details"
                className="rounded-md p-1 text-g500 hover:bg-g100"
              >
                <X className="size-5" />
              </button>
            </div>
            {(() => {
              const facility =
                detailTarget.facility ?? detailTarget.hospital ?? {};
              const roleValue =
                detailTarget.role?.name ??
                detailTarget.role_name ??
                detailTarget.role ??
                "Not assigned";
              const role =
                typeof roleValue === "object"
                  ? (roleValue.name ?? roleValue.id ?? "Not assigned")
                  : roleValue;
              const licenseNumber =
                detailTarget.license_number ??
                detailTarget.licenseNumber ??
                detailTarget.license?.number ??
                detailTarget.license;
              const licenseRegistry = getRegistryLabel(
                detailTarget,
                detailTarget.license,
              );
              const registryResult =
                detailTarget.registry_result ??
                detailTarget.registryResult ??
                detailTarget.license?.registry_result;
              const verificationStatus =
                detailTarget.verification_status ??
                detailTarget.verificationStatus ??
                detailTarget.license?.verification_status;
              const active =
                detailTarget.active ??
                detailTarget.is_active ??
                detailTarget.isActive;
              const showValue = (value: unknown) =>
                value === null || value === undefined || value === ""
                  ? "Not provided"
                  : String(value);
              const dateValue = (value: unknown) => {
                if (!value) return "Not provided";
                const date = new Date(String(value));
                return Number.isNaN(date.getTime())
                  ? String(value)
                  : date.toLocaleString("en-NG");
              };
              const field = (label: string, value: unknown) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs font-medium text-g500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-g800">
                    {showValue(value)}
                  </dd>
                </div>
              );
              return (
                <div className="space-y-5">
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">
                      Account and contact
                    </h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {field("User ID", detailTarget.id)}
                      {field("First name", detailTarget.first_name)}
                      {field("Last name", detailTarget.last_name)}
                      {field("Email", detailTarget.email)}
                      {field("Phone", detailTarget.phone)}
                      {field("Role", role)}
                      {field(
                        "Account type",
                        detailTarget.account_type ?? detailTarget.accountType,
                      )}
                      {field(
                        "Account status",
                        active === false
                          ? "Inactive"
                          : active === true
                            ? "Active"
                            : "Not provided",
                      )}
                      {field(
                        "Last sign in",
                        dateValue(
                          detailTarget.last_login ?? detailTarget.lastLogin,
                        ),
                      )}
                      {field(
                        "Created",
                        dateValue(
                          detailTarget.created_at ?? detailTarget.createdAt,
                        ),
                      )}
                      {field(
                        "Updated",
                        dateValue(
                          detailTarget.updated_at ?? detailTarget.updatedAt,
                        ),
                      )}
                    </dl>
                  </section>
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">
                      Professional licence
                    </h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {field("Licence number", licenseNumber)}
                      {field("Issuing registry", licenseRegistry)}
                      {field("Verification status", verificationStatus)}
                      {field("Registry result", registryResult)}
                    </dl>
                  </section>
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">
                      Facility
                    </h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {field("Facility name", facility.name)}
                      {field(
                        "Facility ID",
                        facility.id ??
                          detailTarget.facility_id ??
                          detailTarget.facilityId,
                      )}
                      {field(
                        "Facility code",
                        facility.hospital_code ?? facility.code,
                      )}
                      {field(
                        "Facility type",
                        facility.facility_type ?? facility.facilityType,
                      )}
                      {field("Facility status", facility.status)}
                      {field("Facility email", facility.email)}
                      {field("Facility phone", facility.phone)}
                      {field(
                        "Address",
                        [facility.address, facility.city, facility.state]
                          .filter(Boolean)
                          .join(", "),
                      )}
                    </dl>
                  </section>
                  <p className="text-xs text-g500">
                    Sensitive credentials and password data are intentionally
                    excluded.
                  </p>
                </div>
              );
            })()}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailTarget(null)}
                className="rounded-lg border border-g200 px-4 py-2 text-sm font-medium text-g700"
              >
                Close details
              </button>
            </div>
          </section>
        </div>
      )}

      {inviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <form
            onSubmit={(event) => void inviteMember(event)}
            className="w-full max-w-xl rounded-2xl border border-g200 bg-w p-6 shadow-2xl"
            aria-labelledby="invite-facility-user-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-p">
                  Facility team
                </p>
                <h2
                  id="invite-facility-user-title"
                  className="mt-1 text-xl font-bold text-g900"
                >
                  Invite a team member
                </h2>
                <p className="mt-1 text-sm text-g500">
                  Send a secure invitation. The person completes their account
                  and licence review before role tools are unlocked.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                aria-label="Close invitation"
                className="rounded-md p-1 text-g500 hover:bg-g100"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-g700">
                First name
                <input
                  required
                  value={inviteDraft.first_name}
                  onChange={(event) =>
                    setInviteDraft((current) => ({
                      ...current,
                      first_name: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-g700">
                Last name
                <input
                  required
                  value={inviteDraft.last_name}
                  onChange={(event) =>
                    setInviteDraft((current) => ({
                      ...current,
                      last_name: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-g700">
                Work email
                <input
                  required
                  type="email"
                  value={inviteDraft.email}
                  onChange={(event) =>
                    setInviteDraft((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-g700">
                Phone
                <input
                  type="tel"
                  value={inviteDraft.phone}
                  onChange={(event) =>
                    setInviteDraft((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-g700">
                Professional account type
                <select
                  value={inviteDraft.account_type}
                  onChange={(event) =>
                    setInviteDraft((current) => ({
                      ...current,
                      account_type: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-g200 bg-w px-3 py-2"
                >
                  <option value="DOCTOR">Doctor · Oncologist role</option>
                  <option value="PHARMACIST">
                    Pharmacist · Pharmacist role
                  </option>
                </select>
              </label>
              {adminMode ? (
                <label className="text-sm font-medium text-g700">
                  Facility
                  <select
                    required
                    value={selectedFacilityId}
                    onChange={(event) =>
                      setSelectedFacilityId(event.target.value)
                    }
                    className="mt-1.5 w-full rounded-lg border border-g200 bg-w px-3 py-2"
                  >
                    <option value="">
                      {facilityOptionsLoading
                        ? "Loading facilities…"
                        : "Choose active facility"}
                    </option>
                    {facilityOptions.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name} ·{" "}
                        {facility.city ??
                          facility.state ??
                          facility.hospital_code}
                      </option>
                    ))}
                  </select>
                  {!facilityOptionsLoading && facilityOptions.length === 0 && (
                    <span className="mt-1 block text-xs text-err">
                      No active facilities available for invitations.
                    </span>
                  )}
                </label>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-g200 bg-g50 p-3 text-sm text-g600 sm:col-span-2">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-p" />
                  This invitation will be linked to your facility. Facility
                  scope is verified by the server from your signed-in account.
                </div>
              )}
            </div>
            {notice && (
              <output className="mt-4 text-sm text-err">{notice}</output>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-lg border border-g200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  inviteSaving ||
                  roles.length === 0 ||
                  (adminMode &&
                    (facilityOptionsLoading || facilityOptions.length === 0))
                }
                className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {inviteSaving ? "Sending invitation…" : "Send invitation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {membershipReviewTarget &&
        (() => {
          const applicant =
            membershipReviewTarget.user ??
            membershipReviewTarget.applicant ??
            {};
          const accountType = (applicant.account_type ??
            membershipReviewTarget.account_type) as AccountType;
          const accountInfo = getAccountInfo(accountType);
          const requestId = String(membershipReviewTarget.id);
          const savedCheck =
            membershipReviewTarget.facility_license_review ??
            membershipReviewTarget.facilityLicenseReview;
          const localCheck =
            registryChecks[requestId] ??
            (savedCheck
              ? {
                  result:
                    savedCheck.result ??
                    savedCheck.registry_result ??
                    savedCheck.registryResult ??
                    "UNAVAILABLE",
                  evidence: savedCheck.evidence ?? "",
                  status:
                    savedCheck.status ??
                    savedCheck.verification_status ??
                    "MANUAL_REVIEW",
                  checkedAt:
                    savedCheck.checked_at ?? savedCheck.checkedAt ?? "",
                }
              : null);
          const licenseNumber =
            applicant.license_number ??
            applicant.license?.number ??
            membershipReviewTarget.license_number ??
            membershipReviewTarget.license?.number;
          const licenseStatus =
            applicant.verification_status ??
            applicant.license?.verification_status ??
            membershipReviewTarget.verification_status ??
            "MANUAL_REVIEW";
          const registryResult =
            applicant.registry_result ??
            applicant.license?.registry_result ??
            membershipReviewTarget.registry_result ??
            "Not checked";
          const displayName =
            applicant.name ||
            [applicant.first_name, applicant.last_name]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            "Applicant";
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
              role="presentation"
            >
              <section
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-g200 bg-w p-6 shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="membership-review-title"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-p">
                      Facility membership review
                    </p>
                    <h2
                      id="membership-review-title"
                      className="mt-1 text-xl font-bold text-g900"
                    >
                      {displayName}
                    </h2>
                    <p className="mt-1 text-sm text-g500">
                      {applicant.email ?? "Email not provided"}
                      {applicant.phone ? ` · ${applicant.phone}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMembershipReviewTarget(null)}
                    aria-label="Close request review"
                    className="rounded-md p-1 text-g500 hover:bg-g100"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">
                      Applicant and role
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-g500">Account type</dt>
                        <dd className="mt-0.5 font-medium text-g800">
                          {accountInfo?.label ?? accountType ?? "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-g500">
                          Requested facility
                        </dt>
                        <dd className="mt-0.5 font-medium text-g800">
                          {membershipReviewTarget.facility?.name ??
                            membershipReviewTarget.facility_name ??
                            "Your facility"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-g500">Request submitted</dt>
                        <dd className="mt-0.5 font-medium text-g800">
                          {membershipReviewTarget.created_at ??
                            membershipReviewTarget.submitted_at ??
                            "Date unavailable"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-g500">Request status</dt>
                        <dd className="mt-0.5 font-medium text-g800">
                          {membershipReviewTarget.status ?? "PENDING"}
                        </dd>
                      </div>
                    </dl>
                  </section>
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">
                      Professional licence
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-xs text-g500">Issuing registry</dt>
                        <dd className="mt-0.5 font-medium text-g800">
                          {getRegistryLabel(
                            membershipReviewTarget.facility_license_review,
                            membershipReviewTarget.facilityLicenseReview,
                            applicant.license,
                            applicant,
                            membershipReviewTarget,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-g500">Licence number</dt>
                        <dd className="mt-0.5 break-all font-mono font-medium text-g800">
                          {licenseNumber ?? "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-g500">
                          Authoritative licence status
                        </dt>
                        <dd className="mt-0.5 font-semibold text-g800">
                          {String(licenseStatus).replaceAll("_", " ")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-g500">
                          Saved registry result
                        </dt>
                        <dd className="mt-0.5 font-medium text-g800">
                          {String(registryResult).replaceAll("_", " ")}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
                <div className="mt-4 rounded-xl border border-g200 bg-g50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-g900">
                        Registry lookup
                      </h3>
                      <p className="mt-1 max-w-lg text-xs leading-5 text-g600">
                        A fresh lookup provides evidence for your facility
                        decision. It does not change the authoritative licence
                        status or replace network licence approval.
                      </p>
                      {localCheck ? (
                        <p className="mt-2 text-xs font-semibold text-g900">
                          Latest lookup:{" "}
                          {localCheck.result.replaceAll("_", " ")} ·{" "}
                          {localCheck.checkedAt &&
                          !Number.isNaN(Date.parse(localCheck.checkedAt))
                            ? new Date(localCheck.checkedAt).toLocaleString(
                                "en-NG",
                              )
                            : "Time unavailable"}
                        </p>
                      ) : null}
                      {localCheck?.evidence ? (
                        <p className="mt-2 max-w-lg whitespace-pre-wrap break-words text-xs leading-5 text-g700">
                          {localCheck.evidence}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void checkApplicantLicense(membershipReviewTarget)
                      }
                      disabled={registryCheckLoading !== null}
                      className="rounded-lg border border-g200 bg-w px-3 py-2 text-xs font-semibold text-p disabled:opacity-50"
                    >
                      {registryCheckLoading === requestId
                        ? "Checking registry…"
                        : "Check licence"}
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-g500">
                  Approving this request grants facility membership only. Login
                  activation remains subject to facility status, authoritative
                  licence verification, and account setup.
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMembershipReviewTarget(null);
                      setMembershipReason("");
                      setMembershipDecision({
                        request: membershipReviewTarget,
                        decision: "reject",
                      });
                    }}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
                  >
                    Decline request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMembershipReviewTarget(null);
                      setMembershipReason("");
                      setMembershipDecision({
                        request: membershipReviewTarget,
                        decision: "approve",
                      });
                    }}
                    className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white"
                  >
                    Approve membership
                  </button>
                </div>
              </section>
            </div>
          );
        })()}

      {membershipDecision && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <section
            className="w-full max-w-lg rounded-2xl border border-g200 bg-w p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="membership-decision-title"
          >
            <h2
              id="membership-decision-title"
              className="text-lg font-bold text-g900"
            >
              {membershipDecision.decision === "approve"
                ? "Approve facility membership?"
                : "Reject facility request?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-g600">
              {membershipDecision.decision === "approve"
                ? "This links the account to your facility. Licence review remains separate, and professional tools stay locked until licence approval."
                : "The applicant will not be linked to this facility. Provide a clear reason for the decision."}
            </p>
            {membershipDecision.decision === "reject" && (
              <label className="mt-4 block text-sm font-medium text-g700">
                Reason
                <textarea
                  required
                  rows={3}
                  maxLength={1000}
                  value={membershipReason}
                  onChange={(event) => setMembershipReason(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2"
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMembershipDecision(null)}
                disabled={saving}
                className="rounded-lg border border-g200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void decideMembership()}
                disabled={
                  saving ||
                  (membershipDecision.decision === "reject" &&
                    !membershipReason.trim())
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${membershipDecision.decision === "approve" ? "bg-p" : "bg-red-700"}`}
              >
                {saving
                  ? "Saving…"
                  : membershipDecision.decision === "approve"
                    ? "Approve membership"
                    : "Reject request"}
              </button>
            </div>
          </section>
        </div>
      )}

      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <form
            onSubmit={(event) => void saveUser(event)}
            className="w-full max-w-lg rounded-2xl border border-g200 bg-w p-6 shadow-2xl"
            aria-labelledby="edit-user-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="edit-user-title"
                  className="text-lg font-bold text-g900"
                >
                  Update user details
                </h2>
                <p className="mt-1 text-sm text-g500">
                  Change the user’s contact information. Role and licence
                  changes require their own authorized workflow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                aria-label="Close edit dialog"
                className="rounded-md p-1 text-g500 hover:bg-g100"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["first_name", "First name", "text"],
                  ["last_name", "Last name", "text"],
                  ["email", "Email address", "email"],
                  ["phone", "Phone number", "tel"],
                ] as const
              ).map(([key, label, type]) => (
                <label
                  key={key}
                  className="block text-sm font-medium text-g700"
                >
                  {label}
                  <input
                    required={key !== "phone"}
                    type={type}
                    value={draft[key]}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2 text-sm"
                  />
                </label>
              ))}
            </div>
            {notice && (
              <output className="mt-3 text-sm text-err">{notice}</output>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="rounded-lg border border-g200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-g200 bg-w p-6 shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <h2 id="delete-user-title" className="text-lg font-bold text-g900">
              Delete this user?
            </h2>
            <p className="mt-2 text-sm leading-6 text-g600">
              This will remove{" "}
              <strong>
                {deleteTarget.name ??
                  `${deleteTarget.first_name ?? ""} ${deleteTarget.last_name ?? ""}`}
              </strong>{" "}
              from active user lists and disable access. The backend should
              retain an audited soft-deleted record.
            </p>
            {notice && (
              <output className="mt-3 text-sm text-err">{notice}</output>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-g200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={saving}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Deleting…" : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
