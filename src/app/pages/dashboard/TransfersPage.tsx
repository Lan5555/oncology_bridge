"use client";

import { ArrowLeftRight } from "lucide-react";

import { useEffect, useState } from "react";
import TransferGraph from "@/app/components/TransferGraph";
import { useDashboardRefresh } from "@/app/hooks/useDashboardRefresh";
import { notifyResult } from "@/app/lib/notifications";
import { TRANSFER_SERVICE } from "@/app/services/transfer-service/transfer-service";
import type { ModalId, PageId } from "../../lib/types";

interface Props {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}
type TransferTab = "pending" | "approved" | "transit" | "completed";
type TransferAction = "approve" | "reject" | "dispatch" | "deliver";
const TRANSFER_TABS = {
  pending: { label: "Pending approval", status: "PENDING_APPROVAL" },
  approved: { label: "Approved", status: "APPROVED" },
  transit: { label: "In transit", status: "IN_TRANSIT" },
  completed: { label: "Completed transfers", status: "DELIVERED" },
} as const;
const ACTION_LABELS = {
  approve: "Approve",
  reject: "Reject",
  dispatch: "Confirm dispatch",
  deliver: "Confirm receipt",
};
type Transfer = {
  id: string;
  drug?: unknown;
  qty?: number;
  quantity?: number;
  unit?: string;
  donorFacility?: unknown;
  recipientFacility?: unknown;
  distanceKm?: number;
  lot?: string;
  status?: string;
  deliveredAt?: string;
  allowedActions?: TransferAction[];
  inventoryItem?: {
    medicine?: unknown;
    drug?: unknown;
    unit?: string;
    batchNumber?: string;
  };
};
function displayText(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object" && "name" in value) {
    return displayText(value.name);
  }
  return null;
}

function transferRows(data: unknown): Transfer[] {
  const validate = (rows: unknown[]): Transfer[] => {
    if (
      rows.some(
        (row) =>
          !row ||
          typeof row !== "object" ||
          !("id" in row) ||
          typeof row.id !== "string",
      )
    ) {
      throw new Error("The transfer API returned an invalid list.");
    }
    return rows as Transfer[];
  };
  if (Array.isArray(data)) return validate(data);
  if (data && typeof data === "object") {
    for (const key of ["transfers", "items", "rows", "data"]) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return validate(value);
    }
  }
  throw new Error("The transfer API returned an invalid list.");
}

export default function TransfersPage({ onOpenModal }: Props) {
  const [tab, setTab] = useState<TransferTab>("pending");
  const [rows, setRows] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [notice, setNotice] = useState("");
  const [listError, setListError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "graph">("list");
  const [graphOpened, setGraphOpened] = useState(false);
  const { refreshVersion, refresh } = useDashboardRefresh();
  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh events must reload the selected transfer tab.
  useEffect(() => {
    let current = true;
    setLoading(true);
    setRows([]);
    setStats({});
    setListError("");
    setStatsError("");
    const status = TRANSFER_TABS[tab].status;
    void Promise.allSettled([
      TRANSFER_SERVICE.list(status),
      TRANSFER_SERVICE.stats(),
    ]).then(([list, counts]) => {
      if (!current) return;
      if (list.status === "fulfilled" && list.value.success) {
        try {
          setRows(transferRows(list.value.data));
        } catch {
          setListError("The transfer API returned an invalid list.");
        }
      } else {
        setListError(
          list.status === "fulfilled"
            ? list.value.message || "Transfers could not be loaded."
            : "Transfers could not be loaded.",
        );
      }
      if (
        counts.status === "fulfilled" &&
        counts.value.success &&
        counts.value.data &&
        typeof counts.value.data === "object"
      ) {
        setStats(counts.value.data);
      } else {
        setStatsError("Transfer statistics are unavailable.");
      }
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [tab, refreshVersion]);
  const decide = async (id: string, action: TransferAction) => {
    if (busy) return;
    if (
      (action === "dispatch" || action === "deliver") &&
      !window.confirm(
        action === "dispatch"
          ? "Confirm that this transfer has physically left the donor facility?"
          : "Confirm that the recipient facility has physically received this transfer?",
      )
    )
      return;
    setBusy(id);
    try {
      const response = await TRANSFER_SERVICE[action](id);
      const successMessage = {
        approve: "Transfer approved.",
        reject: "Transfer rejected.",
        dispatch: "Transfer dispatched.",
        deliver: "Transfer receipt confirmed.",
      }[action];
      notifyResult(
        response,
        successMessage,
        "Transfer decision could not be saved.",
      );
      setNotice(
        response.message ||
          (response.success
            ? successMessage
            : "The transfer action could not be saved."),
      );
      if (response.success) refresh();
    } catch {
      setNotice(
        "The transfer action could not be saved. Refresh before trying again.",
      );
    } finally {
      setBusy(null);
    }
  };
  const renderActions = (transfer: Transfer) =>
    transfer.allowedActions?.length ? (
      <div className="flex flex-wrap gap-2">
        {[...new Set(transfer.allowedActions)]
          .filter((action) => Object.hasOwn(ACTION_LABELS, action))
          .map((action) => (
            <button
              key={action}
              type="button"
              disabled={busy !== null}
              onClick={() => void decide(transfer.id, action)}
              className="rounded-md border border-g200 px-3 py-2 text-xs font-semibold text-g700 disabled:opacity-50"
            >
              {ACTION_LABELS[action]}
            </button>
          ))}
      </div>
    ) : (
      <span className="text-xs font-semibold text-good">
        {transfer.deliveredAt &&
        Number.isFinite(new Date(transfer.deliveredAt).getTime())
          ? new Date(transfer.deliveredAt).toLocaleDateString("en-NG")
          : (transfer.status ?? "Delivery date not provided")}
      </span>
    );
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
            <ArrowLeftRight className="size-5 text-p" aria-hidden="true" />
            Redistribution Centre
          </h1>
          <p className="mt-1 text-[12.5px] text-g500">
            Request and review medicine stock transfers between facilities.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="rounded-lg border border-g200 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onOpenModal("modal-transfer")}
          >
            New transfer request
          </button>
        </div>
      </header>
      <p className="mb-4 text-sm text-g600">
        Choose a medicine batch, suggested recipient facility and quantity.
        Review pending requests below; completed transfers appear in their own
        tab.
      </p>
      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {[
          ["Pending requests", stats.pending],
          ["Recent deliveries", stats.recentDeliveries],
          ["Quarantined breaches", stats.quarantinedBreaches],
        ]
          .filter(
            ([, value]) => typeof value === "number" && Number.isFinite(value),
          )
          .map(([label, value]) => (
            <article
              className="rounded-xl border border-g200 bg-w p-4"
              key={String(label)}
            >
              <p className="text-xs text-g500">{String(label)}</p>
              <p className="mt-1 text-xl font-bold text-g900">
                {String(value)}
              </p>
            </article>
          ))}
      </div>
      {statsError && (
        <p role="alert" className="mb-4 text-sm text-g600">
          {statsError}
        </p>
      )}
      {notice ? (
        <output className="mb-4 block text-sm text-g600">{notice}</output>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-g500">
          Review transfers in the list or build a new request with connected
          nodes.
        </p>
        <nav
          className="flex rounded-lg border border-g200 bg-w p-1"
          aria-label="Transfer view"
        >
          {(["list", "graph"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => {
                setView(option);
                if (option === "graph") setGraphOpened(true);
              }}
              className={`rounded-md px-4 py-2 text-xs font-semibold ${view === option ? "bg-p text-white" : "text-g600"}`}
            >
              {option === "list" ? "List view" : "Graph view"}
            </button>
          ))}
        </nav>
      </div>
      <nav aria-label="Transfer status" className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(TRANSFER_TABS) as TransferTab[]).map((value) => (
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold ${tab === value ? "bg-p text-white" : "bg-g100 text-g600"}`}
            key={value}
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            {TRANSFER_TABS[value].label}
          </button>
        ))}
      </nav>
      {graphOpened && (
        <div hidden={view !== "graph"}>
          <TransferGraph onSubmitted={refresh} />
        </div>
      )}
      <div hidden={view !== "list"}>
        <section
          aria-busy={loading}
          className="rounded-xl border border-g200 bg-w p-5"
        >
          {loading && (
            <output className="block py-8 text-center text-sm text-g500">
              Loading transfers…
            </output>
          )}
          {listError && (
            <p role="alert" className="py-8 text-center text-sm text-err">
              {listError}
            </p>
          )}
          {rows.map((transfer) => (
            <article
              className="flex flex-wrap items-center justify-between gap-4 border-b border-g100 py-4 last:border-0"
              key={transfer.id}
            >
              <div>
                <h2 className="text-sm font-semibold text-g800">
                  {displayText(transfer.drug) ??
                    displayText(transfer.inventoryItem?.medicine) ??
                    displayText(transfer.inventoryItem?.drug) ??
                    "Medicine not provided"}
                  {" · "}
                  {transfer.qty ?? transfer.quantity ?? "Quantity not provided"}{" "}
                  {displayText(transfer.unit) ??
                    displayText(transfer.inventoryItem?.unit) ??
                    "(unit not provided)"}
                </h2>
                <p className="mt-1 text-xs text-g500">
                  {displayText(transfer.donorFacility) ?? "Donor not provided"}{" "}
                  →{" "}
                  {displayText(transfer.recipientFacility) ??
                    "Recipient not provided"}
                  {transfer.distanceKm != null
                    ? ` · ${transfer.distanceKm} km`
                    : ""}
                </p>
                <p className="mt-1 text-[11px] text-g400">
                  Lot{" "}
                  {transfer.lot ??
                    transfer.inventoryItem?.batchNumber ??
                    "not provided"}{" "}
                  · {transfer.status ?? "Status not provided"}
                </p>
              </div>
              {renderActions(transfer)}
            </article>
          ))}
          {!loading && !listError && !rows.length ? (
            <p className="py-8 text-center text-sm text-g500">
              No transfers found in {TRANSFER_TABS[tab].label.toLowerCase()}.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
