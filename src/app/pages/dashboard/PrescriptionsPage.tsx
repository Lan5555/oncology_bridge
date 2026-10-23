"use client";

import { useEffect, useState } from "react";
import type { ModalId, PageId } from "@/app/lib/types";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Clock3,
  FilePlus2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import PrescriptionDetailsDialog from "@/app/components/PrescriptionDetailsDialog";
import { useProvider } from "@/app/providers/provider";
import {
  prescriptionDisplayRow,
  prescriptionLocalTime,
  type PrescriptionDisplayRow,
} from "@/app/lib/prescription-display";
import { PRESCRIPTION_SERVICE } from "@/app/services/prescription-service/prescription-service";
import { unwrapArray } from "@/app/services/response-utils";

interface PrescriptionsPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

type PrescriptionTab = "active" | "awaiting" | "completed";
const TAB_CONFIG: {
  id: PrescriptionTab;
  label: string;
  icon: typeof Activity;
}[] = [
  { id: "active", label: "Active prescriptions", icon: Activity },
  { id: "awaiting", label: "Awaiting authorization", icon: Clock3 },
  { id: "completed", label: "Completed", icon: ShieldCheck },
];

export default function PrescriptionsPage({
  onOpenModal,
  onNav,
}: PrescriptionsPageProps) {
  const { userData } = useProvider();
  const canPrescribe = userData.user?.account_type === "DOCTOR";
  const [activeTab, setActiveTab] = useState<PrescriptionTab>("active");
  const [rows, setRows] = useState<PrescriptionDisplayRow[]>([]);
  const [selected, setSelected] = useState<PrescriptionDisplayRow | null>(null);
  const [counts, setCounts] = useState<
    Partial<Record<PrescriptionTab, number>>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const loadPrescriptions = async () => {
    setLoading(true);
    setLoadError("");
    setCounts({});
    const response = await PRESCRIPTION_SERVICE.list(activeTab);
    if (!response.success) {
      setRows([]);
      setLoadError(response.message || "Prescriptions could not be loaded.");
      setLoading(false);
      return;
    }
    const data = response.data as any;
    setRows(unwrapArray(data).map(prescriptionDisplayRow));
    if (data?.counts)
      setCounts({
        active: data.counts.active ?? undefined,
        awaiting: data.counts.awaiting ?? undefined,
        completed: data.counts.completed ?? undefined,
      });
    setLoading(false);
  };

  useEffect(() => {
    void loadPrescriptions();
  }, [activeTab]);

  useEffect(() => {
    const refresh = () => void loadPrescriptions();
    window.addEventListener("prescriptions:updated", refresh);
    return () => window.removeEventListener("prescriptions:updated", refresh);
  }, [activeTab]);

  const metrics = [
    { label: "Active prescriptions", value: counts.active, icon: Activity },
    { label: "Awaiting authorization", value: counts.awaiting, icon: Clock3 },
    {
      label: "Completed prescriptions",
      value: counts.completed,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pl text-p shadow-sm">
            <ClipboardList className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-g900">
              Prescriptions
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-g500">
              Review patient prescriptions, authorization and dispensing
              progress. Creating a prescription does not approve authorization
              or place a marketplace purchase.
            </p>
          </div>
        </div>
        {canPrescribe && (
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-p px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pd hover:shadow-md"
            onClick={() => onOpenModal("modal-prescription")}
            type="button"
          >
            <FilePlus2 className="size-4" aria-hidden="true" />
            New prescription
          </button>
        )}
      </header>

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Prescription summary"
      >
        {metrics
          .filter(
            ({ value }) => typeof value === "number" && Number.isFinite(value),
          )
          .map(({ label, value, icon: Icon }) => (
            <article
              className="flex items-center gap-4 rounded-xl border border-g200 bg-w p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              key={label}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-g50 text-p">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums text-g900">
                  {value}
                </p>
                <p className="text-xs font-medium text-g500">{label}</p>
              </div>
            </article>
          ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-g200 bg-w shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-g100 p-5">
          <div>
            <h2 className="text-base font-bold text-g900">
              Prescription pipeline
            </h2>
            <p className="mt-1 text-xs text-g500">
              Live prescriptions and authorization status from your account.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-g200 px-3 py-2 text-xs font-semibold text-g600 transition hover:border-p hover:text-p"
            onClick={() => void loadPrescriptions()}
            type="button"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-g100 px-4 pt-3">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              aria-pressed={activeTab === id}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${activeTab === id ? "border-p text-p" : "border-transparent text-g500 hover:text-g800"}`}
              key={id}
              onClick={() => setActiveTab(id)}
              type="button"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        {loadError ? (
          <div
            className="m-5 rounded-xl border border-err/20 bg-errl p-4 text-sm text-err"
            role="alert"
          >
            {loadError}
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5" aria-label="Loading prescriptions">
            {[1, 2, 3].map((item) => (
              <div
                className="h-12 animate-pulse rounded-lg bg-g50"
                key={item}
              />
            ))}
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-g50 text-[11px] uppercase tracking-wide text-g500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Patient reference</th>
                  <th className="px-4 py-3 font-semibold">Created by</th>
                  <th className="px-4 py-3 font-semibold">Created at</th>
                  <th className="px-4 py-3 font-semibold">ICD-10</th>
                  <th className="px-4 py-3 font-semibold">Medicine</th>
                  <th className="px-4 py-3 font-semibold">Insurer</th>
                  <th className="px-4 py-3 font-semibold">Pharmacy</th>
                  <th className="px-4 py-3 font-semibold">Authorization</th>
                  <th className="px-5 py-3 font-semibold">Dispensing stage</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-g100">
                {rows.map((row) => (
                  <tr className="transition hover:bg-g50/70" key={row.id}>
                    <td className="px-5 py-3.5 font-semibold text-g800">
                      {row.patientRef}
                    </td>
                    <td className="px-4 py-3.5 text-g600">{row.createdBy}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-g600">
                      {prescriptionLocalTime(row.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-pl px-2.5 py-1 text-xs font-semibold text-pdd">
                        {row.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-g700">{row.drug}</td>
                    <td className="px-4 py-3.5 text-g600">{row.insurer}</td>
                    <td className="px-4 py-3.5 text-g600">{row.pharmacy}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-pl px-2.5 py-1 text-xs font-semibold text-pdd">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-g600">{row.order}</td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        className="rounded-lg border border-g200 px-3 py-2 text-xs font-semibold text-p"
                        onClick={() => setSelected(row)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={ClipboardList}
              title={`No ${activeTab} prescriptions`}
              description="Prescriptions submitted through your verified account will appear here."
              action={
                canPrescribe ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white transition hover:bg-pd"
                    onClick={() => onOpenModal("modal-prescription")}
                    type="button"
                  >
                    Create prescription <ArrowRight className="size-4" />
                  </button>
                ) : undefined
              }
            />
          </div>
        )}
      </section>

      {selected && (
        <PrescriptionDetailsDialog
          key={selected.id}
          record={selected}
          canEdit={
            canPrescribe &&
            Boolean(userData.user?.id) &&
            selected.prescriberId === userData.user?.id
          }
          onClose={() => setSelected(null)}
          onSaved={(description) =>
            setSelected((current) =>
              current ? { ...current, description } : null,
            )
          }
        />
      )}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-g200 bg-w p-6 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-g900">
            Find medicines for your patients
          </h2>
          <p className="mt-1 text-sm text-g500">
            Browse medicine images, compare prices, and purchase from network
            pharmacies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNav("pg-marketplace")}
          className="inline-flex items-center gap-2 rounded-xl bg-p px-5 py-3 text-sm font-semibold text-white dk:text-navy"
        >
          Explore marketplace <ArrowRight className="size-4" />
        </button>
      </section>
    </div>
  );
}
