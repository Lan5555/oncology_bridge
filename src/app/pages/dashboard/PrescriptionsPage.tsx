"use client";

import {
  Activity,
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FilePlus2,
  Info,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import PrescriptionDetailsDialog from "@/app/components/PrescriptionDetailsDialog";
import PrescriptionStatusBadge from "@/app/components/PrescriptionStatusBadge";
import {
  type PrescriptionDisplayRow,
  prescriptionDisplayRow,
  prescriptionLocalTime,
} from "@/app/lib/prescription-display";
import type { ModalId, PageId } from "@/app/lib/types";
import { useProvider } from "@/app/providers/provider";
import { PRESCRIPTION_SERVICE } from "@/app/services/prescription-service/prescription-service";
import { unwrapArray } from "@/app/services/response-utils";
import styles from "./PrescriptionsPage.module.css";

interface PrescriptionsPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}
type PrescriptionTab = "active" | "awaiting" | "completed";
const TAB_CONFIG = [
  {
    id: "active",
    label: "Active prescriptions",
    icon: Activity,
    help: "Track current prescription activity.",
  },
  {
    id: "awaiting",
    label: "Awaiting authorization",
    icon: Clock3,
    help: "Follow records awaiting authorization.",
  },
  {
    id: "completed",
    label: "Completed",
    icon: ShieldCheck,
    help: "Refer back to completed prescriptions.",
  },
] as const;
const validCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const requestId = useRef(0);
  const loadPrescriptions = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError("");
    setCounts({});
    const response = await PRESCRIPTION_SERVICE.list(activeTab);
    if (currentRequest !== requestId.current) return;
    if (!response.success) {
      setRows([]);
      setLoadError(response.message || "Prescriptions could not be loaded.");
      setLoading(false);
      return;
    }
    const data = response.data as {
      counts?: Partial<Record<PrescriptionTab, unknown>>;
    } | null;
    setRows(unwrapArray(data).map(prescriptionDisplayRow));
    if (data?.counts)
      setCounts({
        active: validCount(data.counts.active) ? data.counts.active : undefined,
        awaiting: validCount(data.counts.awaiting)
          ? data.counts.awaiting
          : undefined,
        completed: validCount(data.counts.completed)
          ? data.counts.completed
          : undefined,
      });
    setLoading(false);
  }, [activeTab]);
  useEffect(() => {
    void loadPrescriptions();
    const refresh = () => void loadPrescriptions();
    window.addEventListener("prescriptions:updated", refresh);
    return () => {
      requestId.current += 1;
      window.removeEventListener("prescriptions:updated", refresh);
    };
  }, [loadPrescriptions]);

  const statuses = [...new Set(rows.map((row) => row.status))].sort((a, b) =>
    a.localeCompare(b),
  );
  const search = query.trim().toLocaleLowerCase();
  const visibleRows = rows
    .filter(
      (row) =>
        (!statusFilter || row.status === statusFilter) &&
        (!search ||
          [
            row.patientRef,
            row.drug,
            row.pharmacy,
            row.insurer,
            row.code,
            row.createdBy,
          ].some((value) => value.toLocaleLowerCase().includes(search))),
    )
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : Number.NaN;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : Number.NaN;
      if (!Number.isFinite(aTime)) return Number.isFinite(bTime) ? 1 : 0;
      if (!Number.isFinite(bTime)) return -1;
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  const hasFilters = Boolean(query || statusFilter);
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            <span>Clinical workspace</span>
            <ChevronRight size={12} />
            <span>Prescriptions</span>
          </div>
          <div className={styles.titleLine}>
            <span className={styles.titleIcon}>
              <ClipboardList size={23} strokeWidth={1.6} />
            </span>
            <h1>Prescriptions</h1>
          </div>
          <p className={styles.subtitle}>
            A clear view of prescription records, authorization, and dispensing.
          </p>
        </div>
        {canPrescribe && (
          <button
            className={styles.primary}
            onClick={() => onOpenModal("modal-prescription")}
            type="button"
          >
            <FilePlus2 size={16} />
            New prescription
          </button>
        )}
      </header>

      <section className={styles.metrics} aria-label="Prescription summary">
        {TAB_CONFIG.map(({ id, label, icon: Icon, help }) => (
          <article className={styles.metric} key={id}>
            <div className={styles.metricTop}>
              <span>{label}</span>
              <span className={styles.metricIcon}>
                <Icon size={17} strokeWidth={1.7} />
              </span>
            </div>
            <div className={styles.metricValue}>
              {loading ? (
                <span className={styles.metricSkeleton} aria-hidden="true" />
              ) : validCount(counts[id]) ? (
                counts[id]
              ) : (
                <span title="Count unavailable">—</span>
              )}
            </div>
            <p>
              {loading
                ? "Retrieving summary…"
                : validCount(counts[id])
                  ? help
                  : "Summary count not provided"}
            </p>
          </article>
        ))}
      </section>

      <section
        className={styles.pipeline}
        aria-labelledby="prescription-pipeline-heading"
        aria-busy={loading}
      >
        <div className={styles.sectionHeading}>
          <div>
            <div className={styles.sectionTitle}>
              <h2 id="prescription-pipeline-heading">Prescription register</h2>
              <span className={styles.count}>
                {loading
                  ? "Loading…"
                  : loadError
                    ? "Unavailable"
                    : `${rows.length} loaded`}
              </span>
            </div>
            <p>Review saved records and follow each stage of care.</p>
          </div>
          <button
            className={styles.refresh}
            disabled={loading}
            onClick={() => void loadPrescriptions()}
            type="button"
          >
            <RefreshCw
              size={14}
              className={loading ? styles.spin : undefined}
            />
            Refresh
          </button>
        </div>
        <nav className={styles.tabs} aria-label="Prescription views">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              aria-pressed={activeTab === id}
              className={`${styles.tab} ${activeTab === id ? styles.activeTab : ""}`}
              key={id}
              onClick={() => {
                if (activeTab !== id) {
                  setActiveTab(id);
                  setStatusFilter("");
                  setRows([]);
                  setLoading(true);
                  setCounts({});
                }
              }}
              type="button"
            >
              <Icon size={15} />
              {label}
              {validCount(counts[id]) && <span>{counts[id]}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <span className={styles.srOnly}>Search loaded prescriptions</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search patient reference, medicine or pharmacy"
            />
          </label>
          <label className={styles.filter}>
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span className={styles.srOnly}>
              Filter by authorization status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All authorization statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.resultsBar}>
          <p aria-live="polite">
            {loading ? (
              "Retrieving prescription records…"
            ) : loadError ? (
              "Prescriptions unavailable"
            ) : (
              <>
                <strong>{visibleRows.length}</strong>{" "}
                {visibleRows.length === 1 ? "prescription" : "prescriptions"}
                {hasFilters ? " matching your filters" : " in this view"}
              </>
            )}
            {hasFilters && (
              <button
                type="button"
                className={styles.clear}
                onClick={clearFilters}
              >
                Clear filters
                <X size={12} />
              </button>
            )}
          </p>
          <label className={styles.sort}>
            <ArrowDownWideNarrow size={14} />
            <span className={styles.srOnly}>Sort prescriptions</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
        {loadError ? (
          <div className={styles.error} role="alert">
            <Info size={20} />
            <div>
              <h3>Unable to load prescriptions</h3>
              <p>{loadError}</p>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => void loadPrescriptions()}
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className={styles.loading}>
            <Loader2 size={24} className={styles.spin} />
            <output>Loading prescription records…</output>
          </div>
        ) : visibleRows.length ? (
          <>
            <div className={styles.columnHead} aria-hidden="true">
              <span>Patient / diagnosis</span>
              <span>Medicine / pharmacy</span>
              <span>Authorization / insurer</span>
              <span>Dispensing</span>
              <span>Created</span>
              <span>Details</span>
            </div>
            <div>
              {visibleRows.map((row) => (
                <article
                  className={styles.record}
                  key={row.id}
                  aria-label={`Prescription for ${row.patientRef}`}
                >
                  <div className={styles.identity}>
                    <span className={styles.recordIcon}>
                      <ClipboardList size={19} strokeWidth={1.6} />
                    </span>
                    <div>
                      <button
                        type="button"
                        className={styles.patientLink}
                        onClick={() => setSelected(row)}
                        aria-label={`View prescription for ${row.patientRef}`}
                      >
                        {row.patientRef}
                      </button>
                      <p>
                        <span className={styles.code}>ICD-10</span>
                        {row.code}
                      </p>
                    </div>
                  </div>
                  <dl className={styles.detail}>
                    <dt>Medicine / pharmacy</dt>
                    <dd className={styles.medicineName}>{row.drug}</dd>
                    <dd className={styles.muted}>
                      <Building2 size={12} />
                      {row.pharmacy}
                    </dd>
                  </dl>
                  <dl className={styles.detail}>
                    <dt>Authorization / insurer</dt>
                    <dd>
                      <PrescriptionStatusBadge status={row.status} />
                    </dd>
                    <dd className={styles.muted}>{row.insurer}</dd>
                  </dl>
                  <dl className={styles.detail}>
                    <dt>Dispensing stage</dt>
                    <dd>
                      <PrescriptionStatusBadge
                        status={row.order}
                        kind="dispensing"
                      />
                    </dd>
                  </dl>
                  <dl className={styles.detail}>
                    <dt>Created</dt>
                    <dd>
                      <UserRound size={12} />
                      {row.createdBy}
                    </dd>
                    <dd className={styles.muted}>
                      {prescriptionLocalTime(row.createdAt)}
                    </dd>
                  </dl>
                  <button
                    type="button"
                    className={styles.viewButton}
                    onClick={() => setSelected(row)}
                    aria-label={`View details for ${row.patientRef}`}
                    title="View prescription details"
                  >
                    <ArrowUpRight size={17} />
                    <span>View details</span>
                  </button>
                </article>
              ))}
            </div>
            <footer className={styles.registerFooter}>
              <span>
                Showing {visibleRows.length} of {rows.length} loaded
                prescriptions
              </span>
              <span>
                <Info size={13} />
                Times shown in your local timezone
              </span>
            </footer>
          </>
        ) : (
          <div className={styles.empty}>
            <EmptyState
              icon={hasFilters ? Search : ClipboardList}
              title={
                hasFilters
                  ? "No matching prescriptions"
                  : `No ${activeTab === "awaiting" ? "prescriptions awaiting authorization" : `${activeTab} prescriptions`}`
              }
              description={
                hasFilters
                  ? "Try another reference, medicine, pharmacy or authorization status."
                  : "Prescriptions available to your account will appear here. Switch views to explore other stages."
              }
              action={
                hasFilters ? (
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={clearFilters}
                  >
                    <X size={14} />
                    Clear filters
                  </button>
                ) : canPrescribe ? (
                  <button
                    className={styles.primary}
                    onClick={() => onOpenModal("modal-prescription")}
                    type="button"
                  >
                    <FilePlus2 size={15} />
                    New prescription
                  </button>
                ) : undefined
              }
            />
          </div>
        )}
        <aside className={styles.workflowNote}>
          <ShieldCheck size={16} />
          <p>
            Authorization and dispensing are tracked separately. Creating a
            prescription does not confirm coverage or place a marketplace order.
          </p>
        </aside>
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
      <section className={styles.marketplace}>
        <span className={styles.marketplaceIcon}>
          <Building2 size={21} strokeWidth={1.5} />
        </span>
        <div>
          <h2>Find medicines in the network</h2>
          <p>
            Compare available medicines and prices from pharmacy facilities.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNav("pg-marketplace")}
          className={styles.marketplaceLink}
        >
          Explore marketplace
          <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}
