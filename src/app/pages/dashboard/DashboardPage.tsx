"use client";

import {
  Activity,
  ArrowRight,
  Boxes,
  Building2,
  ClipboardList,
  Download,
  Network,
  PackageSearch,
  Pill,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Thermometer,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  DrugSplitChart,
  InventoryChart,
  RedistributionEfficiencyChart,
  TherapeuticStockChart,
} from "@/app/components/Charts";
import EmptyState from "@/app/components/EmptyState";
import { useDashboardRefresh } from "@/app/hooks/useDashboardRefresh";
import { getAccountInfo } from "@/app/lib/accounts";
import { unitLabel } from "@/app/lib/dashboard-chart-data";
import { dashboardFeedback } from "@/app/lib/dashboard-feedback";
import type { ModalId, PageId } from "@/app/lib/types";
import { useProvider } from "@/app/providers/provider";
import { DASHBOARD_SERVICE } from "@/app/services/dashboard-service/dashboard-service";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { unwrapArray } from "@/app/services/response-utils";
import ColdChainOverview from "./ColdChainOverview";

interface DashboardPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
  canManageFacilityUsers?: boolean;
  showFacilityTeam?: boolean;
  allowedPages?: PageId[] | null;
}

const ROLE_SECTIONS: Record<
  string,
  { label: string; page: PageId; description: string }[]
> = {
  DOCTOR: [
    {
      label: "Prescriptions",
      page: "pg-prescriptions",
      description: "Create and review patient prescriptions.",
    },
    {
      label: "Network Map",
      page: "pg-network",
      description: "Explore connected oncology facilities.",
    },
    {
      label: "Cold Chain",
      page: "pg-coldchain",
      description: "Review recorded storage units and events.",
    },
  ],
  PHARMACIST: [
    {
      label: "Prescriptions",
      page: "pg-prescriptions",
      description: "Review prescriptions and fulfilment.",
    },
    {
      label: "Medicine Catalog",
      page: "pg-medicines",
      description: "Create and manage medicine identifiers.",
    },
    {
      label: "Cold Chain",
      page: "pg-coldchain",
      description: "Review recorded storage units and events.",
    },
  ],
  PHARMACY_STORE: [
    {
      label: "Inventory",
      page: "pg-inventory",
      description: "Manage stock and inventory records.",
    },
    {
      label: "Scan GS1 Barcode",
      page: "pg-scan",
      description: "Validate and record product identifiers.",
    },
    {
      label: "Medicine Catalog",
      page: "pg-medicines",
      description: "Create and manage medicine identifiers.",
    },
    {
      label: "Redistribution",
      page: "pg-transfers",
      description: "Review and request stock transfers.",
    },
  ],
};

const DashboardPage: React.FC<DashboardPageProps> = ({
  onNav,
  onOpenModal,
  canManageFacilityUsers = false,
  showFacilityTeam = canManageFacilityUsers,
  allowedPages = null,
}) => {
  const { userData } = useProvider();
  const accountType = userData.user?.account_type;
  const role = getAccountInfo(accountType)?.label ?? "Account";
  const WorkspaceIcon =
    accountType === "DOCTOR"
      ? Stethoscope
      : accountType === "PHARMACIST"
        ? Pill
        : Building2;
  const sections = accountType
    ? (ROLE_SECTIONS[accountType] ?? [])
    : [
        {
          label: "Network Map",
          page: "pg-network" as PageId,
          description: "Explore connected oncology facilities.",
        },
        {
          label: "Inventory",
          page: "pg-inventory" as PageId,
          description: "View and manage network inventory.",
        },
        {
          label: "Medicine Catalog",
          page: "pg-medicines" as PageId,
          description: "Create and manage medicine identifiers.",
        },
      ];
  const stockSections: { label: string; page: PageId; description: string }[] =
    [
      {
        label: "Inventory",
        page: "pg-inventory",
        description: "Add batches manually and manage facility stock.",
      },
      {
        label: "Scan GS1 Barcode",
        page: "pg-scan",
        description: "Scan and decode product identifiers to record stock.",
      },
      {
        label: "Medicine Catalog",
        page: "pg-medicines",
        description: "Create and manage medicine identifiers.",
      },
    ];
  const grantedStockSections = stockSections.filter(
    (item) =>
      allowedPages?.includes(item.page) &&
      !sections.some((section) => section.page === item.page),
  );
  const visibleSections = [...grantedStockSections, ...sections].filter(
    (item) => !allowedPages || allowedPages.includes(item.page),
  );
  const isStore = accountType === "PHARMACY_STORE";
  const canViewColdChain =
    !accountType || accountType === "DOCTOR" || accountType === "PHARMACIST";
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [watchlistState, setWatchlistState] = useState("loading");
  const { refreshVersion, refresh } = useDashboardRefresh();
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const summarySnapshot =
    typeof summary.asOf === "string" &&
    Number.isFinite(Date.parse(summary.asOf))
      ? new Date(summary.asOf)
      : null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh reloads summaries after saves and at regular intervals.
  useEffect(() => {
    let active = true;
    setSummaryLoading(true);
    setSummaryError("");
    void DASHBOARD_SERVICE.summary().then((response) => {
      if (!active) return;
      if (response.success && response.data) {
        setSummary(response.data);
        setLastRefreshed(new Date());
      } else
        setSummaryError(
          dashboardFeedback(response.message, response.status).description,
        );
      setSummaryLoading(false);
    });
    if (isStore) {
      setWatchlistState("loading");
      void INVENTORY_SERVICE.nearExpiry(7).then((response) => {
        if (!active) return;
        if (response.success) setWatchlist(unwrapArray(response.data));
        setWatchlistState(response.success ? "ready" : "error");
      });
    }
    return () => {
      active = false;
    };
  }, [isStore, refreshVersion]);

  const metrics = [
    [
      summary.scope?.type === "network"
        ? "Active network facilities"
        : "Facilities in scope",
      summary.nodes,
      Network,
    ],
    ["GS1 Authenticated Vials", summary.gs1AuthenticatedVials, ScanLine],
    [
      "Medicines out of stock (%)",
      summary.stockOutRiskPct == null
        ? undefined
        : `${summary.stockOutRiskPct}%`,
      Activity,
    ],
    [
      "Storage units currently healthy (%)",
      summary.monitoredStorageUnits === 0
        ? "Not monitored"
        : summary.chainIntegrityPct == null
          ? undefined
          : `${summary.chainIntegrityPct}%`,
      ShieldCheck,
    ],
  ] as const;

  return (
    <div className="animate-fade-up">
      <header className="portal-hero mb-6 flex flex-col gap-6 rounded-2xl border border-g200 p-5 sm:p-7 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-(--portal-accent)">
              Oncosourz workspace
            </p>
            {summary.scope?.type === "network" ||
            summary.scope?.type === "facility" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-g200 bg-w px-2.5 py-1 text-[10px] font-semibold text-g600">
                {summary.scope.type === "network" ? (
                  <Network className="size-3" aria-hidden="true" />
                ) : (
                  <Building2 className="size-3" aria-hidden="true" />
                )}
                {summary.scope.type === "network"
                  ? "Network overview"
                  : "Facility overview"}
              </span>
            ) : null}
          </div>
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-g200 bg-w text-(--portal-accent) shadow-sm sm:size-14">
              <WorkspaceIcon
                className="size-5 sm:size-6"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-g900 sm:text-3xl">
                {role} dashboard
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-g600">
                {summary.scope?.type === "network"
                  ? "Monitor network activity and access your operational tools."
                  : "Monitor facility activity and access the tools for your role."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-g200 pt-4 xl:border-t-0 xl:pt-0">
          <button
            type="button"
            disabled={summaryLoading}
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-semibold text-g700 disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${summaryLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => onOpenModal("modal-export")}
            className="inline-flex items-center gap-2 rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-semibold text-g700 shadow-sm transition hover:border-p hover:text-p"
          >
            <Download className="size-4" aria-hidden="true" />
            Export report
          </button>
        </div>
      </header>
      <section
        aria-label="Dashboard data freshness"
        className="portal-freshness mb-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border border-g200 bg-w px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-g50 text-(--portal-accent)">
            <RefreshCw
              aria-hidden="true"
              className={`size-4 ${summaryLoading ? "animate-spin" : ""}`}
            />
          </span>
          <div>
            <p className="text-xs font-semibold text-g900">
              {summaryLoading
                ? "Refreshing summary"
                : summaryError
                  ? "Refresh unsuccessful"
                  : "Summary updated"}
            </p>
            <p className="mt-0.5 text-[11px] text-g500">
              Auto-refresh every 30s while visible
            </p>
          </div>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-3 text-xs sm:ml-auto">
          <div>
            <dt className="text-[11px] text-g500">Last refreshed</dt>
            <dd className="mt-1 font-medium tabular-nums text-g900">
              {lastRefreshed ? (
                <time
                  dateTime={lastRefreshed.toISOString()}
                  title={lastRefreshed.toLocaleString("en-NG")}
                >
                  {lastRefreshed.toLocaleTimeString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              ) : (
                "Awaiting update"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-g500">Summary as of</dt>
            <dd className="mt-1 font-medium tabular-nums text-g900">
              {summarySnapshot ? (
                <time
                  dateTime={summarySnapshot.toISOString()}
                  title={summarySnapshot.toLocaleString("en-NG")}
                >
                  {summarySnapshot.toLocaleString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              ) : (
                "Unavailable"
              )}
            </dd>
          </div>
        </dl>
        <p className="w-full border-t border-g100 pt-2 text-[11px] text-g500">
          Chart update times are shown on each chart.
        </p>
      </section>

      {summaryLoading || summaryError ? (
        <output className="mb-6 block rounded-xl border border-g200 bg-w p-4 text-sm text-g600">
          {summaryLoading ? "Loading your dashboard summary..." : summaryError}
        </output>
      ) : null}
      <section
        className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Dashboard summary"
      >
        {metrics
          .filter(
            ([, value]) =>
              value != null &&
              value !== "" &&
              (typeof value !== "number" || Number.isFinite(value)),
          )
          .map(([label, value, Icon]) => (
            <article
              key={label}
              className="portal-metric flex items-center gap-3 rounded-2xl border border-g200 bg-w p-5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pl text-p">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums text-g900">
                  {value == null
                    ? 0
                    : typeof value === "number"
                      ? value.toLocaleString()
                      : value}
                </p>
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-g500">
                  {label}
                </h2>
              </div>
            </article>
          ))}
      </section>
      {summary.quantitiesByUnit && (
        <section
          aria-label="Available stock by selling unit"
          className="mb-6 rounded-xl border border-g200 bg-w p-4"
        >
          <h2 className="text-sm font-semibold text-g800">
            Available stock by selling unit
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {["vial", "box", "pack", "bottle", "unknown"].map((unit) => {
              const quantity = summary.quantitiesByUnit[unit];
              return typeof quantity === "number" &&
                Number.isFinite(quantity) ? (
                <div key={unit} className="rounded-lg bg-g50 px-4 py-2">
                  <strong className="text-lg text-g900">
                    {quantity.toLocaleString()}
                  </strong>
                  <span className="ml-2 text-xs text-g500">
                    {unitLabel(unit)}
                  </span>
                </div>
              ) : null;
            })}
          </div>
          <p className="mt-3 text-[11px] text-g500">
            Units are shown separately. Unreviewed stock has no confirmed
            selling unit.
          </p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-base font-bold text-g900">
          {summary.scope?.type === "network"
            ? "Network overview"
            : "Facility overview"}
        </h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <article className="portal-panel rounded-2xl border border-g200 bg-w p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-g900">
              <Boxes className="size-4 text-p" aria-hidden="true" />
              Current available stock by intake month
            </h3>
            <p className="mt-1 text-xs text-g500">
              Remaining eligible stock grouped by the month it was added. These
              are not historical month-end balances.
            </p>
            <div className="mt-3 h-[230px]">
              <InventoryChart refreshKey={refreshVersion} />
            </div>
          </article>
          <article className="portal-panel rounded-2xl border border-g200 bg-w p-5">
            <h3 className="text-sm font-bold text-g900">
              <Pill className="mr-2 inline size-4 text-p" aria-hidden="true" />
              Medicine availability split
            </h3>
            <p className="mt-1 text-xs text-g500">
              Medicine shares within the selected selling unit. Different units
              are never combined.
            </p>
            <div className="mt-3 h-[230px]">
              <DrugSplitChart refreshKey={refreshVersion} />
            </div>
          </article>
          <article className="portal-panel rounded-2xl border border-g200 bg-w p-5 xl:col-span-2">
            <h3 className="text-sm font-bold text-g900">
              <ArrowRight
                className="mr-2 inline size-4 text-p"
                aria-hidden="true"
              />
              Completed redistributions
            </h3>
            <p className="mt-1 text-xs text-g500">
              Delivered transfers with quantities in their source selling units.
              Delivery durations are unavailable.
            </p>
            <div className="mt-3 h-[240px]">
              <RedistributionEfficiencyChart refreshKey={refreshVersion} />
            </div>
          </article>
          <article className="rounded-xl border border-g200 bg-w p-5 xl:col-span-2">
            <h3 className="text-sm font-bold text-g900">
              <Activity
                className="mr-2 inline size-4 text-p"
                aria-hidden="true"
              />
              Therapeutic stock levels
            </h3>
            <p className="mt-1 text-xs text-g500">
              Current available quantities by medicine and selling unit.
            </p>
            <div className="mt-3 h-[240px]">
              <TherapeuticStockChart refreshKey={refreshVersion} />
            </div>
          </article>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-bold text-g900">Your workspace</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleSections.map((item) => (
            <button
              type="button"
              key={item.page}
              onClick={() => onNav(item.page)}
              className="portal-tool-card group rounded-2xl border border-g200 bg-w p-5 text-left shadow-sm transition duration-200"
            >
              <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-pl text-p transition group-hover:scale-105">
                {item.page === "pg-prescriptions" ? (
                  <ClipboardList className="size-4" />
                ) : null}
                {item.page === "pg-network" ? (
                  <Network className="size-4" />
                ) : null}
                {item.page === "pg-coldchain" ? (
                  <Thermometer className="size-4" />
                ) : null}
                {item.page === "pg-inventory" ? (
                  <Boxes className="size-4" />
                ) : null}
                {item.page === "pg-scan" ? (
                  <ScanLine className="size-4" />
                ) : null}
                {item.page === "pg-medicines" ? (
                  <Pill className="size-4" />
                ) : null}
                {item.page === "pg-transfers" ? (
                  <ArrowRight className="size-4" />
                ) : null}
                {item.page === "pg-facilities" ? (
                  <Building2 className="size-4" />
                ) : null}
              </span>
              <span className="text-sm font-bold text-g900">{item.label}</span>
              <span className="mt-1 block text-sm text-g500">
                {item.description}
              </span>
            </button>
          ))}
          {showFacilityTeam ? (
            <button
              type="button"
              onClick={() => onNav("pg-users")}
              className="portal-tool-card group rounded-2xl border border-g200 bg-w p-5 text-left shadow-sm transition duration-200"
            >
              <span className="mb-3 flex size-9 items-center justify-center rounded-xl bg-pl text-p transition group-hover:scale-105">
                <Users className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-g900">
                {canManageFacilityUsers
                  ? "Manage facility team"
                  : "Facility team"}
              </span>
              <span className="mt-1 block text-sm text-g500">
                {canManageFacilityUsers
                  ? "Invite team members and manage access for your facility."
                  : "Open facility team access and management information."}
              </span>
            </button>
          ) : null}
        </div>
      </section>

      {isStore ? (
        <section className="rounded-xl border border-g200 bg-w p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-g900">
                Near-expiry watchlist
              </h2>
              <p className="text-sm text-g500">
                Stock approaching expiry from your inventory.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNav("pg-expiry")}
              className="text-sm font-semibold text-p"
            >
              View all
            </button>
          </div>
          {watchlistState !== "ready" ? (
            <output className="block py-4 text-sm text-g500">
              {watchlistState === "loading"
                ? "Loading near-expiry stock..."
                : "Near-expiry stock could not be loaded. Please try again."}
            </output>
          ) : watchlist.length ? (
            <ul className="divide-y divide-g100">
              {watchlist.map((item, index) => (
                <li
                  key={item.id ?? `${item.lot}-${index}`}
                  className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-semibold text-g800">
                    {item.drug ?? "Medicine"} · Lot {item.lot ?? "N/A"}
                  </span>
                  <span className="text-g500">
                    {item.daysLeft ?? "N/A"} days ·{" "}
                    {item.qty ?? item.quantity ?? "Quantity not provided"}{" "}
                    {item.unit ?? "(unit not provided)"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              icon={PackageSearch}
              title="No near-expiry items"
              description="No near-expiry items were returned for your inventory."
            />
          )}
        </section>
      ) : null}

      {canViewColdChain ? <ColdChainOverview onNav={onNav} /> : null}
    </div>
  );
};

export default DashboardPage;
