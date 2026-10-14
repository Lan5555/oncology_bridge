"use client";

import { useEffect, useState } from "react";
import type React from "react";
import type { ModalId, PageId } from "@/app/lib/types";
import { getAccountInfo } from "@/app/lib/accounts";
import { useProvider } from "@/app/providers/provider";
import { DASHBOARD_SERVICE } from "@/app/services/dashboard-service/dashboard-service";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { unwrapArray } from "@/app/services/response-utils";
import {
  DrugSplitChart,
  InventoryChart,
  RedistributionEfficiencyChart,
  TherapeuticStockChart,
} from "@/app/components/Charts";
import ColdChainOverview from "./ColdChainOverview";
import EmptyState from "@/app/components/EmptyState";
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
  ScanLine,
  ShieldCheck,
  Thermometer,
} from "lucide-react";

interface DashboardPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
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
}) => {
  const { userData } = useProvider();
  const accountType = userData.user?.account_type;
  const role = getAccountInfo(accountType)?.label ?? "Network Admin";
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
  const isStore = accountType === "PHARMACY_STORE";
  const canViewColdChain =
    !accountType || accountType === "DOCTOR" || accountType === "PHARMACIST";
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    void DASHBOARD_SERVICE.summary().then((response) => {
      if (response.success && response.data) setSummary(response.data);
    });
    if (isStore) {
      void INVENTORY_SERVICE.nearExpiry(7).then((response) => {
        if (response.success) setWatchlist(unwrapArray(response.data));
      });
    }
  }, [isStore]);

  const metrics = [
    ["Network Nodes", summary.nodes, Network],
    ["GS1 Authenticated Vials", summary.gs1AuthenticatedVials, ScanLine],
    [
      "Stock-Out Risk",
      summary.stockOutRiskPct == null
        ? undefined
        : `${summary.stockOutRiskPct}%`,
      Activity,
    ],
    [
      "Chain Integrity",
      summary.chainIntegrityPct == null
        ? undefined
        : `${summary.chainIntegrityPct}%`,
      ShieldCheck,
    ],
  ] as const;

  return (
    <div className="animate-fade-up">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-6 shadow-sm">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-p">
            Oncosourz workspace
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-g900">
            {role} dashboard
          </h1>
          <p className="mt-1 text-sm text-g500">
            Your workspace, live network indicators, and role-specific tools.
          </p>
        </div>
        <button
          onClick={() => onOpenModal("modal-export")}
          className="inline-flex items-center gap-2 rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-semibold text-g700 shadow-sm transition hover:border-p hover:text-p"
        >
          <Download className="size-4" aria-hidden="true" />
          Export report
        </button>
      </header>

      <section
        className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Network summary"
      >
        {metrics.map(([label, value, Icon]) => (
          <article
            key={label}
            className="flex items-center gap-3 rounded-xl border border-g200 bg-w p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pl text-p">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-g900">
                {value == null
                  ? "—"
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

      <section className="mb-6">
        <h2 className="mb-3 text-base font-bold text-g900">
          Network performance
        </h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-g200 bg-w p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-g900">
              <Boxes className="size-4 text-p" aria-hidden="true" />
              Inventory over time
            </h3>
            <p className="mt-1 text-xs text-g500">
              Recorded inventory totals returned by the dashboard API.
            </p>
            <div className="mt-3 h-[230px]">
              <InventoryChart />
            </div>
          </article>
          <article className="rounded-xl border border-g200 bg-w p-5">
            <h3 className="text-sm font-bold text-g900">
              <Pill className="mr-2 inline size-4 text-p" aria-hidden="true" />
              Medicine availability split
            </h3>
            <p className="mt-1 text-xs text-g500">
              Current medicine share from the dashboard API.
            </p>
            <div className="mt-3 h-[230px]">
              <DrugSplitChart />
            </div>
          </article>
          <article className="rounded-xl border border-g200 bg-w p-5 xl:col-span-2">
            <h3 className="text-sm font-bold text-g900">
              <ArrowRight
                className="mr-2 inline size-4 text-p"
                aria-hidden="true"
              />
              Redistribution efficiency
            </h3>
            <p className="mt-1 text-xs text-g500">
              Recorded transfer time by medicine or network grouping.
            </p>
            <div className="mt-3 h-[240px]">
              <RedistributionEfficiencyChart />
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
              Current quantities by medicine from the dashboard API.
            </p>
            <div className="mt-3 h-[240px]">
              <TherapeuticStockChart />
            </div>
          </article>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-bold text-g900">Your workspace</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((item) => (
            <button
              key={item.page}
              onClick={() => onNav(item.page)}
              className="group rounded-xl border border-g200 bg-w p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-p hover:shadow-md"
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
              onClick={() => onNav("pg-expiry")}
              className="text-sm font-semibold text-p"
            >
              View all
            </button>
          </div>
          {watchlist.length ? (
            <ul className="divide-y divide-g100">
              {watchlist.map((item, index) => (
                <li
                  key={item.id ?? `${item.lot}-${index}`}
                  className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                >
                  <span className="font-semibold text-g800">
                    {item.drug ?? "Medicine"} · Lot {item.lot ?? "—"}
                  </span>
                  <span className="text-g500">
                    {item.daysLeft ?? "—"} days ·{" "}
                    {item.qty ?? item.quantity ?? "—"} units
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              icon={PackageSearch}
              title="Your stock is in the clear"
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
