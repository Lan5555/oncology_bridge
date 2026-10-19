"use client";

import { toast } from "sonner";

import { ModalId, PageId } from "../../lib/types";
import React, { useEffect, useMemo, useState } from "react";
import { FACILITY_SERVICE } from "@/app/services/facility-service/facility-service";
import {
  Plus,
  Search,
  Settings,
  MoreVertical,
  Building2,
  MapPin,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Filter,
  X,
  Mail,
  Phone,
  History,
} from "lucide-react";

interface FacilitiesPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
  adminMode?: boolean;
}

// Mirrors the backend enums (Hospital entity) rather than the old prototype's
// "Donor Hub / Recipient Hub" placeholder copy.
type FacilityType = "HOSPITAL" | "CANCER_CENTER" | "CLINIC" | "PHARMACY";
type FacilityStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

interface FacilityRow {
  id: string;
  name: string;
  hospital_code: string;
  facility_type: FacilityType;
  city: string;
  state: string;
  ip: string;
  devices: number;
  lastActive: string;
  status: FacilityStatus;
  phone: string;
  email: string;
}

const initialFacilities: FacilityRow[] = [];

const typeMeta: Record<FacilityType, { label: string; color: string }> = {
  HOSPITAL: { label: "Hospital", color: "#1B3A6B" },
  CANCER_CENTER: { label: "Cancer Center", color: "#6D28D9" },
  CLINIC: { label: "Clinic", color: "#0F766E" },
  PHARMACY: { label: "Pharmacy", color: "#C4622D" },
};

const statusMeta: Record<
  FacilityStatus,
  { label: string; color: string; icon: React.ElementType; description: string }
> = {
  ACTIVE: {
    label: "Active",
    color: "#15803D",
    icon: CheckCircle2,
    description: "Facility can transact and sync inventory normally.",
  },
  PENDING: {
    label: "Pending",
    color: "#C4622D",
    icon: Clock,
    description: "Awaiting credential verification before going live.",
  },
  SUSPENDED: {
    label: "Suspended",
    color: "#B91C1C",
    icon: AlertTriangle,
    description: "Access temporarily blocked, devices cannot sync.",
  },
  REJECTED: {
    label: "Rejected",
    color: "#6B7280",
    icon: Ban,
    description: "Onboarding declined. Facility has no network access.",
  },
};

const statusOrder: FacilityStatus[] = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
];

const primaryCta = "#0B1E3D";
const accentBlue = "var(--p)";

const FacilitiesPage: React.FC<FacilitiesPageProps> = ({
  onOpenModal,
  adminMode = false,
}) => {
  const [facilities, setFacilities] =
    useState<FacilityRow[]>(initialFacilities);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | "ALL">(
    "ALL",
  );

  const [manageTarget, setManageTarget] = useState<FacilityRow | null>(null);
  const [draftStatus, setDraftStatus] = useState<FacilityStatus | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    void FACILITY_SERVICE.findAllFacilities(
      { page: 1, limit: 100 },
      adminMode,
    ).then((response) => {
      if (!response.success) {
        notify(response.message || "Facilities could not be loaded.", true);
        return;
      }
      const data = response.data as any;
      const rows = Array.isArray(data) ? data : (data?.facilities ?? []);
      setFacilities(
        rows.map((facility: any) => ({
          id: facility.id,
          name: facility.name,
          hospital_code: facility.hospital_code ?? facility.hospitalCode ?? "",
          facility_type:
            facility.facility_type ?? facility.facilityType ?? "HOSPITAL",
          city: facility.city ?? "",
          state: facility.state ?? "",
          ip: (facility.ip_whitelist ?? []).join(", "),
          devices: facility.devices?.length ?? 0,
          lastActive: facility.last_active
            ? new Date(facility.last_active).toLocaleString("en-NG")
            : "N/A",
          status: facility.status ?? "PENDING",
          phone: facility.phone ?? "",
          email: facility.email ?? "",
        })),
      );
    });
  }, [adminMode]);

  const notify = (message: string, error = false) => {
    if (error) toast.error(message);
    else toast.success(message);
  };

  const filtered = useMemo(() => {
    return facilities.filter((f) => {
      const matchesSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.hospital_code.toLowerCase().includes(search.toLowerCase()) ||
        f.city.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [facilities, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: facilities.length,
      active: facilities.filter((f) => f.status === "ACTIVE").length,
      pending: facilities.filter((f) => f.status === "PENDING").length,
      suspended: facilities.filter((f) => f.status === "SUSPENDED").length,
    };
  }, [facilities]);

  const applyStatus = async (
    facilityId: string,
    status: FacilityStatus,
    facilityName: string,
  ) => {
    const response = await FACILITY_SERVICE.updateOneFacility(
      facilityId,
      { status },
      adminMode,
    );
    if (!response.success) {
      notify(response.message || "Facility status update failed.", true);
      return;
    }
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, status } : f)),
    );
    notify(`${facilityName} marked as ${statusMeta[status].label}.`);
  };

  const openManage = (f: FacilityRow) => {
    setManageTarget(f);
    setDraftStatus(f.status);
    setStatusNote("");
    setOpenMenuId(null);
  };

  const closeManage = () => {
    setManageTarget(null);
    setDraftStatus(null);
    setStatusNote("");
  };

  const saveManage = async () => {
    if (!manageTarget || !draftStatus) return;
    const changed = draftStatus !== manageTarget.status;
    const response = await FACILITY_SERVICE.updateOneFacility(
      manageTarget.id,
      { status: draftStatus, ...(statusNote ? { details: statusNote } : {}) },
      adminMode,
    );
    if (!response.success) {
      notify(response.message || "Facility changes could not be saved.", true);
      return;
    }
    if (changed) {
      setFacilities((prev) =>
        prev.map((f) =>
          f.id === manageTarget.id ? { ...f, status: draftStatus } : f,
        ),
      );
      notify(
        `${manageTarget.name} status updated to ${statusMeta[draftStatus].label}.`,
      );
    } else {
      notify(`${manageTarget.name} details saved.`);
    }
    closeManage();
  };

  return (
    <div className="font-ui relative space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-g500">
            Network / Facilities
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-g900">
            Facility Access
          </h1>
          <p className="mt-1 text-sm text-g500">
            Credential verification and device IP whitelisting
          </p>
        </div>
        <button
          onClick={() => onOpenModal("modal-onboard")}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_-10px_rgba(11,30,61,0.55)] transition-all duration-150 hover:shadow-[0_14px_28px_-10px_rgba(11,30,61,0.6)] active:scale-[0.98]"
          style={{ backgroundColor: primaryCta }}
        >
          <Plus className="h-4 w-4" />
          Onboard Facility
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total facilities",
            value: counts.total,
            color: accentBlue,
            icon: Building2,
          },
          {
            label: "Active",
            value: counts.active,
            color: "#15803D",
            icon: CheckCircle2,
          },
          {
            label: "Pending review",
            value: counts.pending,
            color: "#C4622D",
            icon: Clock,
          },
          {
            label: "Suspended",
            value: counts.suspended,
            color: "#B91C1C",
            icon: AlertTriangle,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-xl border border-g200 bg-w p-4 shadow-[0_1px_2px_rgba(15,30,61,0.04),0_8px_24px_-16px_rgba(15,30,61,0.12)]"
            >
              <div
                className="absolute inset-y-0 left-0 w-0.75"
                style={{ backgroundColor: s.color }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xl font-medium text-g900">
                    {s.value}
                  </div>
                  <div className="text-xs text-g500">{s.label}</div>
                </div>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${s.color}1A` }}
                >
                  <Icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or city..."
            className="w-full rounded-lg border border-g200 bg-w py-2.5 pl-10 pr-4 text-sm text-g900 outline-none transition-all duration-150 placeholder:text-slate focus:border-[#1B3A6B] focus:bg-w focus:ring-4 focus:ring-[#1B3A6B]/8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "ACTIVE", "PENDING", "SUSPENDED", "REJECTED"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150"
                style={
                  statusFilter === s
                    ? {
                        backgroundColor: "rgba(11,30,61,0.06)",
                        color: accentBlue,
                      }
                    : { color: "var(--g500)" }
                }
              >
                {s === "ALL" ? "All" : statusMeta[s].label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-g200 bg-w shadow-[0_1px_2px_rgba(15,30,61,0.04),0_8px_24px_-16px_rgba(15,30,61,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead>
              <tr className="border-b border-g200 bg-g50">
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  Facility
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  Type
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  Location
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  IP whitelist
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  Devices
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  Last active
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  Status
                </th>
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-g500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const type = typeMeta[f.facility_type];
                const status = statusMeta[f.status];
                const StatusIcon = status.icon;
                return (
                  <tr
                    key={f.id}
                    className="border-b border-g100 transition-colors duration-150 last:border-0 hover:bg-g50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-g900">{f.name}</div>
                      <div className="font-mono text-[11px] text-slate">
                        {f.hospital_code}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${type.color}1A`,
                          color: "var(--p)",
                        }}
                      >
                        {type.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-g600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate" />
                        {f.city}, {f.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-g500">
                      {f.ip}
                    </td>
                    <td className="px-4 py-3 text-g600">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-slate" />
                        {f.devices}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-g500">{f.lastActive}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${status.color}1A`,
                          color:
                            status.label === "Active"
                              ? "var(--status-good)"
                              : status.label === "Pending"
                                ? "var(--status-warn)"
                                : "var(--status-error)",
                        }}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex items-center gap-1">
                        <button
                          onClick={() => openManage(f)}
                          className="flex items-center gap-1.5 rounded-md border border-g200 px-2.5 py-1.5 text-xs font-medium text-g900 transition-colors duration-150 hover:border-[#1B3A6B] hover:bg-g50"
                        >
                          <Settings className="h-3 w-3" />
                          Manage
                        </button>
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === f.id ? null : f.id)
                          }
                          className="rounded-md p-1.5 text-slate transition-colors duration-150 hover:bg-g100 hover:text-g900"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {/* Quick status menu, a fast path for status changes that doesn't
                            require opening the full Manage modal */}
                        {openMenuId === f.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-g200 bg-w py-1 shadow-[0_12px_32px_-8px_rgba(15,30,61,0.25)]">
                              <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-slate">
                                Set status
                              </div>
                              {statusOrder
                                .filter((s) => s !== f.status)
                                .map((s) => {
                                  const meta = statusMeta[s];
                                  const MetaIcon = meta.icon;
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => {
                                        applyStatus(f.id, s, f.name);
                                        setOpenMenuId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-g900 hover:bg-g50"
                                    >
                                      <MetaIcon
                                        className="h-3.5 w-3.5"
                                        style={{ color: meta.color }}
                                      />
                                      Mark as {meta.label}
                                    </button>
                                  );
                                })}
                              <div className="my-1 border-t border-g100" />
                              <button
                                onClick={() => openManage(f)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-g500 hover:bg-g50"
                              >
                                <Settings className="h-3.5 w-3.5" />
                                Open full manage view
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate"
                  >
                    <Filter className="mx-auto mb-2 h-5 w-5 text-g300" />
                    No facilities match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage modal */}
      {manageTarget && draftStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0B1E3D]/40 backdrop-blur-sm"
            onClick={closeManage}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-g200 bg-w shadow-[0_24px_64px_-16px_rgba(15,30,61,0.35)]">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-g100 px-6 py-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-g500">
                  Manage facility
                </p>
                <h2 className="font-display mt-1 text-xl font-semibold text-g900">
                  {manageTarget.name}
                </h2>
                <p className="font-mono text-[11px] text-slate">
                  {manageTarget.hospital_code}
                </p>
              </div>
              <button
                onClick={closeManage}
                className="rounded-md p-1.5 text-slate transition-colors duration-150 hover:bg-g100 hover:text-g900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              {/* Read-only detail grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-slate">
                    Type
                  </p>
                  <span
                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${typeMeta[manageTarget.facility_type].color}1A`,
                      color: "var(--p)",
                    }}
                  >
                    {typeMeta[manageTarget.facility_type].label}
                  </span>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-slate">
                    Location
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-g900">
                    <MapPin className="h-3.5 w-3.5 text-slate" />
                    {manageTarget.city}, {manageTarget.state}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-slate">
                    IP whitelist
                  </p>
                  <p className="font-mono text-xs text-g900">
                    {manageTarget.ip}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-slate">
                    Devices
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-g900">
                    <Smartphone className="h-3.5 w-3.5 text-slate" />
                    {manageTarget.devices} whitelisted
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-slate">
                    Phone
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-g900">
                    <Phone className="h-3.5 w-3.5 text-slate" />
                    {manageTarget.phone}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-slate">
                    Email
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-sm text-g900">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate" />
                    {manageTarget.email}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-slate">
                    Last active
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-g900">
                    <History className="h-3.5 w-3.5 text-slate" />
                    {manageTarget.lastActive}
                  </p>
                </div>
              </div>

              {/* Status update section, the core ask: change a facility's status here */}
              <div className="rounded-xl border border-g200 bg-g50 p-4">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-g500">
                  Update status
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {statusOrder.map((s) => {
                    const meta = statusMeta[s];
                    const MetaIcon = meta.icon;
                    const selected = draftStatus === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setDraftStatus(s)}
                        className="flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all duration-150"
                        style={
                          selected
                            ? {
                                borderColor: meta.color,
                                backgroundColor: `${meta.color}12`,
                                color: "var(--p)",
                              }
                            : {
                                borderColor: "var(--g200)",
                                backgroundColor: "var(--w)",
                                color: "var(--g500)",
                              }
                        }
                      >
                        <MetaIcon className="h-4 w-4" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-g500">
                  {statusMeta[draftStatus].description}
                </p>

                {draftStatus !== manageTarget.status && (
                  <div className="mt-3">
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-slate">
                      Reason (optional, added to audit log)
                    </label>
                    <textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      rows={2}
                      placeholder={`Why is ${manageTarget.name} being marked as ${statusMeta[draftStatus].label.toLowerCase()}?`}
                      className="w-full resize-none rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900 outline-none transition-all duration-150 placeholder:text-slate focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/8"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 border-t border-g100 px-6 py-4">
              <button
                onClick={closeManage}
                className="rounded-lg border border-g200 px-4 py-2 text-sm font-medium text-g900 transition-colors duration-150 hover:bg-g50"
              >
                Cancel
              </button>
              <button
                onClick={saveManage}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-[0_10px_24px_-10px_rgba(11,30,61,0.55)] transition-all duration-150 hover:shadow-[0_14px_28px_-10px_rgba(11,30,61,0.6)] active:scale-[0.98]"
                style={{ backgroundColor: primaryCta }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;
