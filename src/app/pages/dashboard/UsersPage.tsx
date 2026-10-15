"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, Edit, Eye, RefreshCw, Trash2, UserPlus, UsersRound, X } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import type { ModalId, PageId } from "@/app/lib/types";
import { USER_SERVICE } from "@/app/services/user-service/user-service";
import { unwrapArray } from "@/app/services/response-utils";
import { FACILITY_SERVICE } from "@/app/services/facility-service/facility-service";
import { getAccountInfo, type AccountType } from "@/app/lib/accounts";

interface Props {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
  adminMode?: boolean;
  canManageFacilityUsers?: boolean;
}

function humanizeStatus(value: unknown): string {
  const status = String(value ?? "").trim().replaceAll("_", " ").toLowerCase();
  return status ? status.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not provided";
}

function getUserRoleLabel(user: any): string {
  const role = user.role?.name ?? user.role?.code ?? user.role_name ?? user.role;
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

export default function UsersPage({ onOpenModal, adminMode = false, canManageFacilityUsers = false }: Props) {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [membershipReviewTarget, setMembershipReviewTarget] = useState<any>(null);
  const [registryChecks, setRegistryChecks] = useState<Record<string, { result: string; status: string; checkedAt: string }>>({});
  const [registryCheckLoading, setRegistryCheckLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [detailTarget, setDetailTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [membershipDecision, setMembershipDecision] = useState<{ request: any; decision: "approve" | "reject" } | null>(null);
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
    const applicant = request.user ?? request.applicant ?? {};
    const licenseNumber = applicant.license_number ?? applicant.license?.number ?? request.license_number ?? request.license?.number;
    if (!licenseNumber) {
      setNotice("The applicant’s licence number is missing, so a registry lookup cannot be run.");
      return;
    }
    const requestId = String(request.id);
    setRegistryCheckLoading(requestId);
    const response = await USER_SERVICE.checkFacilityMembershipLicense(requestId);
    setRegistryCheckLoading(null);
    if (!response.success) {
      setNotice(response.message || "Facility licence review could not be saved.");
      return;
    }
    const payload = response.data as any;
    const result = payload?.facility_license_review ?? payload?.license_review ?? payload?.review ?? payload;
    setRegistryChecks((current) => ({
      ...current,
      [requestId]: {
        result: result.registry_result ?? result.registryResult ?? "UNAVAILABLE",
        status: result.status ?? result.verification_status ?? "MANUAL_REVIEW",
        checkedAt: result.checked_at ?? result.checkedAt ?? new Date().toISOString(),
      },
    }));
    setNotice("Registry check saved to this facility’s review record. The authoritative licence status remains unchanged until central licence review is complete.");
  };
  const load = async () => {
    if (!canManageUsers) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [userResponse, roleResponse, requestResponse] = await Promise.all([
      USER_SERVICE.list("take=50&skip=0", adminMode),
      USER_SERVICE.roles(adminMode),
      canManageUsers
        ? USER_SERVICE.facilityMembershipRequests("PENDING", adminMode)
        : Promise.resolve(null),
    ]);
    if (userResponse.success) setUsers(unwrapArray(userResponse.data));
    else setNotice(userResponse.message || "Users could not be loaded.");
    if (roleResponse.success) setRoles(unwrapArray(roleResponse.data));
    if (requestResponse?.success) setMembershipRequests(unwrapArray(requestResponse.data));
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, [adminMode, canManageUsers]);
  useEffect(() => {
    if (!adminMode) return;
    setFacilityOptionsLoading(true);
    void FACILITY_SERVICE.findAllFacilities({ page: 1, limit: 100, status: "ACTIVE" }, true)
      .then((response) => {
        if (!response.success) {
          setNotice(response.message || "Active facilities could not be loaded.");
          return;
        }
        const value = response.data as any;
        const rows = Array.isArray(value) ? value : value?.facilities ?? value?.items ?? [];
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
    const response = await USER_SERVICE.updateUser(editTarget.id, draft, adminMode);
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
    setSaving(false);
    if (!response.success) {
      setNotice(response.message || "User could not be deleted.");
      setDeleteTarget(null);
      return;
    }
    setDeleteTarget(null);
    setNotice(response.message || "User access removed. The account was soft deleted.");
    await load();
  };
  const inviteMember = async (event: FormEvent) => {
    event.preventDefault();
    const requiredRoleName = inviteDraft.account_type === "DOCTOR" ? "ONCOLOGIST" : "PHARMACIST";
    const assignedRole = roles.find((role) => String(role.name).toUpperCase() === requiredRoleName);
    if (!assignedRole?.id) {
      setNotice(`The ${requiredRoleName} role is not available. Ask a network administrator to configure the role first.`);
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
    setInviteSaving(false);
    if (!response.success) {
      setNotice(response.message || "Invitation could not be sent.");
      return;
    }
    setInviteOpen(false);
    setInviteDraft({ first_name: "", last_name: "", email: "", phone: "", account_type: "DOCTOR" });
    setSelectedFacilityId("");
    setNotice(response.message || "Invitation sent. The user must complete licence verification before receiving professional tools.");
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
      membershipDecision.decision === "reject" ? { reason: membershipReason.trim() } : {},
      adminMode,
    );
    setSaving(false);
    if (!response.success) {
      setNotice(response.message || "Facility access request could not be updated.");
      return;
    }
    setMembershipDecision(null);
    setMembershipReason("");
    const decisionData = response.data as any;
    const decidedUser = decisionData?.user ?? decisionData?.membership?.user ?? decisionData?.request?.user ?? {};
    const decidedFacility = decisionData?.facility ?? decisionData?.membership?.facility ?? {};
    const userActive = decidedUser.active ?? decidedUser.is_active;
    const licenceStatus = String(decidedUser.verification_status ?? decidedUser.license?.verification_status ?? "").toUpperCase();
    const facilityStatus = String(decidedFacility.status ?? "").toUpperCase();
    const activationGate = decisionData?.activation_gate ?? decisionData?.activationGate ?? decidedUser.activation_gate;
    if (membershipDecision.decision === "approve" && userActive === true) {
      setNotice(response.message || "Membership approved and the account is active. The user can now sign in.");
    } else if (membershipDecision.decision === "approve" && licenceStatus && licenceStatus !== "VERIFIED") {
      setNotice(response.message || `Membership approved. The user remains inactive until licence review is VERIFIED (current status: ${licenceStatus}).`);
    } else if (membershipDecision.decision === "approve" && (facilityStatus && facilityStatus !== "ACTIVE" || activationGate)) {
      setNotice(response.message || `Membership approved, but the account remains inactive because ${activationGate || `facility status is ${facilityStatus}`}.`);
    } else if (membershipDecision.decision === "approve" && userActive === false) {
      setNotice(response.message || "Membership approved, but the backend still reports the user as inactive. Check licence verification, facility status, and account setup on the updated request.");
    } else {
      setNotice(response.message || "Facility access request updated. Licence approval remains a separate check.");
    }
    await load();
  };
  const visibleUsers = users.filter((user) => {
    const matchesRole = !filter ||
      String(user.role?.id ?? user.roleId ?? user.role_id ?? user.role) === filter;
    const name = user.name ?? `${user.first_name ?? ""} ${user.last_name ?? ""}`;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [name, user.email, user.phone, user.facility?.name, user.hospital?.name]
      .some((value) => String(value ?? "").toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });
  if (!canManageUsers) return null;
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
            <UsersRound className="size-5 text-p" aria-hidden="true" />
            {adminMode ? "Users & Roles" : "Facility team"}
          </h1>
            <p className="mt-1 text-[12.5px] text-g500">
            {adminMode ? "Manage access for network members" : "Manage access for members of your facility"}
          </p>
        </div>
        {canInviteUsers && <button
          type="button"
          className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white"
          onClick={() => { setInviteOpen(true); setNotice(""); }}
        >
          <UserPlus className="mr-1.5 inline size-4" /> Add facility user
        </button>}
      </header>
      {notice ? (
        <p role="status" className="mb-4 text-sm text-g600">
          {notice}
        </p>
      ) : null}
      <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {roles.map((role) => (
          <article
            className="rounded-xl border border-g200 bg-w p-4"
            key={role.id}
          >
            <h2 className="text-sm font-semibold text-g800">{role.name}</h2>
            <p className="mt-1 text-xs text-g500">{role.description ?? ""}</p>
            <p className="mt-3 text-lg font-bold text-g900">
              {role.userCount ?? role.user_count ?? 0}
            </p>
          </article>
        ))}
      </section>
      {canManageUsers && (
        <section className="mb-6 animate-fade-up rounded-2xl border border-g200 bg-w p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-p">Facility access</p>
              <h2 className="mt-1 text-lg font-bold text-g900">Join requests</h2>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-g500">Review applicant details and licence evidence. Membership approval is separate from statutory licence approval.</p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">{membershipRequests.length} awaiting review</span>
          </div>
          {membershipRequests.length > 0 ? <div className="space-y-2">
            {membershipRequests.map((request) => {
              const applicant = request.user ?? request.applicant ?? {};
              const displayName = applicant.name || [applicant.first_name, applicant.last_name].filter(Boolean).join(" ") || "Applicant";
              return (
                <article key={request.id} className="flex flex-col justify-between gap-3 rounded-xl border border-g200 bg-white p-4 transition-colors hover:border-g300 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-g800">{displayName}</h3>
                    <p className="mt-0.5 text-xs text-g600">{applicant.email ?? "Email not provided"} Â· {applicant.account_type ?? request.account_type ?? "Account type not provided"}</p>
                    {request.facility?.name && <p className="mt-1 text-xs font-medium text-g700">Facility: {request.facility.name}</p>}
                    <p className="mt-1 font-mono text-xs text-g600">Licence: {applicant.license_number ?? request.license_number ?? "Pending submission"} Â· {applicant.verification_status ?? request.verification_status ?? "MANUAL_REVIEW"}</p>
                    <p className="mt-1 text-[11px] text-g500">Requested {request.created_at ?? request.submitted_at ?? "date unavailable"}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={() => setMembershipReviewTarget(request)} className="rounded-lg border border-g200 px-3 py-2 text-xs font-semibold text-g700 hover:border-p hover:text-p">Review details</button>
                    <button type="button" onClick={() => { setMembershipReason(""); setMembershipDecision({ request, decision: "reject" }); }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">Reject request</button>
                    <button type="button" onClick={() => { setMembershipReason(""); setMembershipDecision({ request, decision: "approve" }); }} className="rounded-lg bg-p px-3 py-2 text-xs font-semibold text-white">Approve membership</button>
                  </div>
                </article>
              );
            })}
          </div> : <p className="rounded-lg border border-dashed border-amber-300 bg-white/70 p-4 text-sm text-g600">No pending requests. New requests to join this facility will appear here.</p>}
        </section>
      )}

      <section className="rounded-xl border border-g200 bg-w p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[15px] font-bold text-g900">{adminMode ? "Network users" : "Facility users"}</h2>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
            <input
              aria-label="Search users"
              className="w-full rounded-lg border border-g200 px-3 py-2 text-xs sm:w-56"
              placeholder="Search name, email or facility"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Filter users by role"
              className="rounded-lg border border-g200 px-3 py-2 text-xs"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="">All roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              aria-label="Refresh users"
              className="rounded-lg border border-g200 px-3 py-2 text-xs disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
        {loading && !users.length ? <p className="py-8 text-center text-sm text-g500">Loading usersâ€¦</p> : null}
        {visibleUsers.map((user) => (
          <article
            className="flex flex-wrap items-center justify-between gap-3 border-t border-g100 py-3"
            key={user.id}
          >
            <div>
              <h3 className="text-sm font-semibold text-g800">
                {user.name ??
                  `${user.first_name ?? ""} ${user.last_name ?? ""}`}
              </h3>
              <p className="text-xs text-g500">{user.email ?? "Email not provided"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded-full bg-pl px-2 py-0.5 font-semibold text-p">{getUserRoleLabel(user)}</span>
                <span className="text-g400">{user.facility?.name ?? user.hospital?.name ?? "Facility not linked"}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-g500">
                <span>{getAccountInfo(user.account_type as AccountType)?.label ?? humanizeStatus(user.account_type ?? "Account type unavailable")}</span>
                <span aria-hidden="true" className="text-g300">|</span>
                <span>Licence: {humanizeStatus(user.verification_status ?? user.license?.verification_status ?? "status unavailable")}</span>
                {user.active === false && (user.verification_status ?? user.license?.verification_status) !== "VERIFIED" ? <span className="text-amber-700">Activation awaits licence approval</span> : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-g500">
                {user.active === false ? "Inactive" : "Active"}
              </span>
              {canManageUsers ? (
                <>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-md border border-g200 px-3 py-1.5 text-xs text-g700"
                    onClick={() => setDetailTarget(user)}
                  >
                    <Eye className="size-3.5" /> Full details
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-md border border-g200 px-3 py-1.5 text-xs text-g700"
                    onClick={() => openEdit(user)}
                  >
                    <Edit className="size-3.5" /> Edit details
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-700"
                    onClick={() => setDeleteTarget(user)}
                  >
                    <Trash2 className="size-3.5" /> Delete user
                  </button>
                </>
              ) : null}
            </div>
          </article>
        ))}
        {!visibleUsers.length ? (
          <EmptyState
            icon={UsersRound}
            title="No users found"
            description="Try a different search, or add a user to get started."
          />
        ) : null}
      </section>

      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-g200 bg-w p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="user-details-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-g500">User record</p>
                <h2 id="user-details-title" className="mt-1 text-xl font-bold text-g900">
                  {detailTarget.name || `${detailTarget.first_name ?? ""} ${detailTarget.last_name ?? ""}`.trim() || "User details"}
                </h2>
                <p className="mt-1 text-sm text-g500">{detailTarget.email ?? "Email not provided"}</p>
              </div>
              <button type="button" onClick={() => setDetailTarget(null)} aria-label="Close user details" className="rounded-md p-1 text-g500 hover:bg-g100"><X className="size-5" /></button>
            </div>
            {(() => {
              const facility = detailTarget.facility ?? detailTarget.hospital ?? {};
              const roleValue = detailTarget.role?.name ?? detailTarget.role_name ?? detailTarget.role ?? "Not assigned";
              const role = typeof roleValue === "object" ? roleValue.name ?? roleValue.id ?? "Not assigned" : roleValue;
              const licenseNumber = detailTarget.license_number ?? detailTarget.licenseNumber ?? detailTarget.license?.number ?? detailTarget.license;
              const licenseRegistry = detailTarget.license_registry ?? detailTarget.licenseRegistry ?? detailTarget.license?.registry;
              const registryResult = detailTarget.registry_result ?? detailTarget.registryResult ?? detailTarget.license?.registry_result;
              const verificationStatus = detailTarget.verification_status ?? detailTarget.verificationStatus ?? detailTarget.license?.verification_status;
              const active = detailTarget.active ?? detailTarget.is_active ?? detailTarget.isActive;
              const showValue = (value: unknown) => value === null || value === undefined || value === "" ? "Not provided" : String(value);
              const dateValue = (value: unknown) => {
                if (!value) return "Not provided";
                const date = new Date(String(value));
                return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-NG");
              };
              const field = (label: string, value: unknown) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs font-medium text-g500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-g800">{showValue(value)}</dd>
                </div>
              );
              return (
                <div className="space-y-5">
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">Account and contact</h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {field("User ID", detailTarget.id)}
                      {field("First name", detailTarget.first_name)}
                      {field("Last name", detailTarget.last_name)}
                      {field("Email", detailTarget.email)}
                      {field("Phone", detailTarget.phone)}
                      {field("Role", role)}
                      {field("Account type", detailTarget.account_type ?? detailTarget.accountType)}
                      {field("Account status", active === false ? "Inactive" : active === true ? "Active" : "Not provided")}
                      {field("Last sign in", dateValue(detailTarget.last_login ?? detailTarget.lastLogin))}
                      {field("Created", dateValue(detailTarget.created_at ?? detailTarget.createdAt))}
                      {field("Updated", dateValue(detailTarget.updated_at ?? detailTarget.updatedAt))}
                    </dl>
                  </section>
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">Professional licence</h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {field("Licence number", licenseNumber)}
                      {field("Issuing registry", licenseRegistry)}
                      {field("Verification status", verificationStatus)}
                      {field("Registry result", registryResult)}
                    </dl>
                  </section>
                  <section className="rounded-xl border border-g200 p-4">
                    <h3 className="mb-3 text-sm font-bold text-g800">Facility</h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {field("Facility name", facility.name)}
                      {field("Facility ID", facility.id ?? detailTarget.facility_id ?? detailTarget.facilityId)}
                      {field("Facility code", facility.hospital_code ?? facility.code)}
                      {field("Facility type", facility.facility_type ?? facility.facilityType)}
                      {field("Facility status", facility.status)}
                      {field("Facility email", facility.email)}
                      {field("Facility phone", facility.phone)}
                      {field("Address", [facility.address, facility.city, facility.state].filter(Boolean).join(", "))}
                    </dl>
                  </section>
                  <p className="text-xs text-g500">Sensitive credentials and password data are intentionally excluded.</p>
                </div>
              );
            })()}
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setDetailTarget(null)} className="rounded-lg border border-g200 px-4 py-2 text-sm font-medium text-g700">Close details</button>
            </div>
          </section>
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <form onSubmit={(event) => void inviteMember(event)} className="w-full max-w-xl rounded-2xl border border-g200 bg-w p-6 shadow-2xl" aria-labelledby="invite-facility-user-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-p">Facility team</p>
                <h2 id="invite-facility-user-title" className="mt-1 text-xl font-bold text-g900">Add a user</h2>
                <p className="mt-1 text-sm text-g500">Send a secure invitation. The person completes their account and licence review before role tools are unlocked.</p>
              </div>
              <button type="button" onClick={() => setInviteOpen(false)} aria-label="Close invitation" className="rounded-md p-1 text-g500 hover:bg-g100"><X className="size-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-g700">First name<input required value={inviteDraft.first_name} onChange={(event) => setInviteDraft((current) => ({ ...current, first_name: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2" /></label>
              <label className="text-sm font-medium text-g700">Last name<input required value={inviteDraft.last_name} onChange={(event) => setInviteDraft((current) => ({ ...current, last_name: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2" /></label>
              <label className="text-sm font-medium text-g700">Work email<input required type="email" value={inviteDraft.email} onChange={(event) => setInviteDraft((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2" /></label>
              <label className="text-sm font-medium text-g700">Phone<input type="tel" value={inviteDraft.phone} onChange={(event) => setInviteDraft((current) => ({ ...current, phone: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2" /></label>
              <label className="text-sm font-medium text-g700">Professional account type<select value={inviteDraft.account_type} onChange={(event) => setInviteDraft((current) => ({ ...current, account_type: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-g200 bg-white px-3 py-2"><option value="DOCTOR">Doctor Â· Oncologist role</option><option value="PHARMACIST">Pharmacist Â· Pharmacist role</option></select></label>
              {adminMode ? (
                <label className="text-sm font-medium text-g700">Facility<select required value={selectedFacilityId} onChange={(event) => setSelectedFacilityId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-g200 bg-white px-3 py-2"><option value="">{facilityOptionsLoading ? "Loading facilitiesâ€¦" : "Choose active facility"}</option>{facilityOptions.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} Â· {facility.city ?? facility.state ?? facility.hospital_code}</option>)}</select>{!facilityOptionsLoading && facilityOptions.length === 0 && <span className="mt-1 block text-xs text-err">No active facilities available for invitations.</span>}</label>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-g200 bg-g50 p-3 text-sm text-g600 sm:col-span-2"><Building2 className="mt-0.5 size-4 shrink-0 text-p" />This invitation will be linked to your facility. Facility scope is verified by the server from your signed-in account.</div>
              )}
            </div>
            {notice && <p role="status" className="mt-4 text-sm text-err">{notice}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setInviteOpen(false)} className="rounded-lg border border-g200 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={inviteSaving || roles.length === 0 || (adminMode && (facilityOptionsLoading || facilityOptions.length === 0))} className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{inviteSaving ? "Sending invitationâ€¦" : "Send invitation"}</button>
            </div>
          </form>
        </div>
      )}

      {membershipReviewTarget && (() => {
        const applicant = membershipReviewTarget.user ?? membershipReviewTarget.applicant ?? {};
        const accountType = (applicant.account_type ?? membershipReviewTarget.account_type) as AccountType;
        const accountInfo = getAccountInfo(accountType);
        const requestId = String(membershipReviewTarget.id);
        const savedCheck = membershipReviewTarget.facility_license_review ?? membershipReviewTarget.facilityLicenseReview;
        const localCheck = registryChecks[requestId] ?? (savedCheck ? {
          result: savedCheck.registry_result ?? savedCheck.registryResult ?? "UNAVAILABLE",
          status: savedCheck.status ?? savedCheck.verification_status ?? "MANUAL_REVIEW",
          checkedAt: savedCheck.checked_at ?? savedCheck.checkedAt ?? "",
        } : null);
        const licenseNumber = applicant.license_number ?? applicant.license?.number ?? membershipReviewTarget.license_number ?? membershipReviewTarget.license?.number;
        const licenseStatus = applicant.verification_status ?? applicant.license?.verification_status ?? membershipReviewTarget.verification_status ?? "MANUAL_REVIEW";
        const registryResult = applicant.registry_result ?? applicant.license?.registry_result ?? membershipReviewTarget.registry_result ?? "Not checked";
        const displayName = applicant.name || [applicant.first_name, applicant.last_name].filter(Boolean).join(" ").trim() || "Applicant";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
            <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-g200 bg-w p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="membership-review-title">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-p">Facility membership review</p>
                  <h2 id="membership-review-title" className="mt-1 text-xl font-bold text-g900">{displayName}</h2>
                  <p className="mt-1 text-sm text-g500">{applicant.email ?? "Email not provided"}{applicant.phone ? ` · ${applicant.phone}` : ""}</p>
                </div>
                <button type="button" onClick={() => setMembershipReviewTarget(null)} aria-label="Close request review" className="rounded-md p-1 text-g500 hover:bg-g100"><X className="size-5" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded-xl border border-g200 p-4">
                  <h3 className="mb-3 text-sm font-bold text-g800">Applicant and role</h3>
                  <dl className="space-y-3 text-sm">
                    <div><dt className="text-xs text-g500">Account type</dt><dd className="mt-0.5 font-medium text-g800">{accountInfo?.label ?? accountType ?? "Not provided"}</dd></div>
                    <div><dt className="text-xs text-g500">Requested facility</dt><dd className="mt-0.5 font-medium text-g800">{membershipReviewTarget.facility?.name ?? membershipReviewTarget.facility_name ?? "Your facility"}</dd></div>
                    <div><dt className="text-xs text-g500">Request submitted</dt><dd className="mt-0.5 font-medium text-g800">{membershipReviewTarget.created_at ?? membershipReviewTarget.submitted_at ?? "Date unavailable"}</dd></div>
                    <div><dt className="text-xs text-g500">Request status</dt><dd className="mt-0.5 font-medium text-g800">{membershipReviewTarget.status ?? "PENDING"}</dd></div>
                  </dl>
                </section>
                <section className="rounded-xl border border-g200 p-4">
                  <h3 className="mb-3 text-sm font-bold text-g800">Professional licence</h3>
                  <dl className="space-y-3 text-sm">
                    <div><dt className="text-xs text-g500">Issuing registry</dt><dd className="mt-0.5 font-medium text-g800">{accountInfo?.registryName ?? "Not provided"}</dd></div>
                    <div><dt className="text-xs text-g500">Licence number</dt><dd className="mt-0.5 break-all font-mono font-medium text-g800">{licenseNumber ?? "Not provided"}</dd></div>
                    <div><dt className="text-xs text-g500">Authoritative licence status</dt><dd className="mt-0.5 font-semibold text-g800">{String(licenseStatus).replaceAll("_", " ")}</dd></div>
                    <div><dt className="text-xs text-g500">Saved registry result</dt><dd className="mt-0.5 font-medium text-g800">{String(registryResult).replaceAll("_", " ")}</dd></div>
                  </dl>
                </section>
              </div>
              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-sky-950">Registry lookup</h3>
                    <p className="mt-1 max-w-lg text-xs leading-5 text-sky-900">A fresh lookup provides evidence for your facility decision. It does not change the authoritative licence status or replace network licence approval.</p>
                    {localCheck ? <p className="mt-2 text-xs font-semibold text-sky-950">Latest lookup: {localCheck.result.replaceAll("_", " ")} · {new Date(localCheck.checkedAt).toLocaleString("en-NG")}</p> : null}
                  </div>
                  <button type="button" onClick={() => void checkApplicantLicense(membershipReviewTarget)} disabled={registryCheckLoading === requestId || !licenseNumber} className="rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs font-semibold text-sky-900 disabled:opacity-50">{registryCheckLoading === requestId ? "Checking registry…" : "Check licence"}</button>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-g500">Approving this request grants facility membership only. Login activation remains subject to facility status, authoritative licence verification, and account setup.</p>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => { setMembershipReviewTarget(null); setMembershipReason(""); setMembershipDecision({ request: membershipReviewTarget, decision: "reject" }); }} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">Decline request</button>
                <button type="button" onClick={() => { setMembershipReviewTarget(null); setMembershipReason(""); setMembershipDecision({ request: membershipReviewTarget, decision: "approve" }); }} className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white">Approve membership</button>
              </div>
            </section>
          </div>
        );
      })()}

      {membershipDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <section className="w-full max-w-lg rounded-2xl border border-g200 bg-w p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="membership-decision-title">
            <h2 id="membership-decision-title" className="text-lg font-bold text-g900">
              {membershipDecision.decision === "approve" ? "Approve facility membership?" : "Reject facility request?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-g600">
              {membershipDecision.decision === "approve"
                ? "This links the account to your facility. Licence review remains separate, and professional tools stay locked until licence approval."
                : "The applicant will not be linked to this facility. Provide a clear reason for the decision."}
            </p>
            {membershipDecision.decision === "reject" && (
              <label className="mt-4 block text-sm font-medium text-g700">Reason<textarea required rows={3} maxLength={1000} value={membershipReason} onChange={(event) => setMembershipReason(event.target.value)} className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2" /></label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setMembershipDecision(null)} disabled={saving} className="rounded-lg border border-g200 px-4 py-2 text-sm">Cancel</button>
              <button type="button" onClick={() => void decideMembership()} disabled={saving || (membershipDecision.decision === "reject" && !membershipReason.trim())} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${membershipDecision.decision === "approve" ? "bg-p" : "bg-red-700"}`}>{saving ? "Savingâ€¦" : membershipDecision.decision === "approve" ? "Approve membership" : "Reject request"}</button>
            </div>
          </section>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <form onSubmit={(event) => void saveUser(event)} className="w-full max-w-lg rounded-2xl border border-g200 bg-w p-6 shadow-2xl" aria-labelledby="edit-user-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-user-title" className="text-lg font-bold text-g900">Update user details</h2>
                <p className="mt-1 text-sm text-g500">Change the userâ€™s contact information. Role and licence changes require their own authorized workflow.</p>
              </div>
              <button type="button" onClick={() => setEditTarget(null)} aria-label="Close edit dialog" className="rounded-md p-1 text-g500 hover:bg-g100"><X className="size-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["first_name", "First name", "text"],
                ["last_name", "Last name", "text"],
                ["email", "Email address", "email"],
                ["phone", "Phone number", "tel"],
              ] as const).map(([key, label, type]) => (
                <label key={key} className="block text-sm font-medium text-g700">
                  {label}
                  <input required={key !== "phone"} type={type} value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-g200 px-3 py-2 text-sm" />
                </label>
              ))}
            </div>
            {notice && <p role="status" className="mt-3 text-sm text-err">{notice}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg border border-g200 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Savingâ€¦" : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <div className="w-full max-w-md rounded-2xl border border-g200 bg-w p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title">
            <h2 id="delete-user-title" className="text-lg font-bold text-g900">Delete this user?</h2>
            <p className="mt-2 text-sm leading-6 text-g600">This will remove <strong>{deleteTarget.name ?? `${deleteTarget.first_name ?? ""} ${deleteTarget.last_name ?? ""}`}</strong> from active user lists and disable access. The backend should retain an audited soft-deleted record.</p>
            {notice && <p role="status" className="mt-3 text-sm text-err">{notice}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-g200 px-4 py-2 text-sm">Cancel</button>
              <button type="button" onClick={() => void confirmDelete()} disabled={saving} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Deletingâ€¦" : "Delete user"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
