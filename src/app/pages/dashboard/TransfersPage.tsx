"use client";

import { useEffect, useState } from "react";
import type { ModalId, PageId } from "../../lib/types";
import { TRANSFER_SERVICE } from "@/app/services/transfer-service/transfer-service";
import { unwrapArray } from "@/app/services/response-utils";
import { ArrowLeftRight } from "lucide-react";

interface Props {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}
type TransferTab = "pending" | "completed";
export default function TransfersPage({ onOpenModal }: Props) {
  const [tab, setTab] = useState<TransferTab>("pending");
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = async () => {
    const status = tab === "pending" ? "PENDING_APPROVAL" : "COMPLETED";
    const [list, counts] = await Promise.all([
      TRANSFER_SERVICE.list(status),
      TRANSFER_SERVICE.stats(),
    ]);
    if (list.success) setRows(unwrapArray(list.data));
    else setNotice(list.message || "Transfers could not be loaded.");
    if (counts.success) setStats(counts.data ?? {});
  };
  useEffect(() => {
    void load();
  }, [tab]);
  const decide = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    const response =
      action === "approve"
        ? await TRANSFER_SERVICE.approve(id)
        : await TRANSFER_SERVICE.reject(id);
    setNotice(
      response.message ||
        (response.success
          ? `Transfer ${action}d.`
          : `Transfer could not be ${action}d.`),
    );
    if (response.success) await load();
    setBusy(null);
  };
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
            <ArrowLeftRight className="size-5 text-p" aria-hidden="true" />
            Redistribution Centre
          </h1>
          <p className="mt-1 text-[12.5px] text-g500">
            Facility stock transfer requests · 80 km eligibility radius
          </p>
        </div>
        <button
          className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white"
          onClick={() => onOpenModal("modal-transfer")}
        >
          New transfer request
        </button>
      </header>
      <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {[
          ["Pending requests", stats.pending ?? 0],
          ["Recent deliveries", stats.recentDeliveries ?? 0],
          ["Quarantined breaches", stats.quarantinedBreaches ?? 0],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-g200 bg-w p-4"
            key={String(label)}
          >
            <p className="text-xs text-g500">{label}</p>
            <p className="mt-1 text-xl font-bold text-g900">{value}</p>
          </article>
        ))}
      </div>
      {notice ? (
        <p role="status" className="mb-4 text-sm text-g600">
          {notice}
        </p>
      ) : null}
      <nav className="mb-4 flex gap-2">
        {(["pending", "completed"] as const).map((value) => (
          <button
            className={`rounded-full px-4 py-2 text-xs font-semibold ${tab === value ? "bg-p text-white" : "bg-g100 text-g600"}`}
            key={value}
            onClick={() => setTab(value)}
          >
            {value === "pending" ? "Pending approval" : "Completed transfers"}
          </button>
        ))}
      </nav>
      <section className="rounded-xl border border-g200 bg-w p-5">
        {rows.map((transfer) => (
          <article
            className="flex flex-wrap items-center justify-between gap-4 border-b border-g100 py-4 last:border-0"
            key={transfer.id}
          >
            <div>
              <h2 className="text-sm font-semibold text-g800">
                {transfer.drug ??
                  transfer.inventoryItem?.drug ??
                  "Inventory transfer"}{" "}
                · {transfer.qty ?? transfer.quantity ?? 0} vials
              </h2>
              <p className="mt-1 text-xs text-g500">
                {transfer.donorFacility?.name ??
                  transfer.donorFacility ??
                  "Donor"}{" "}
                →{" "}
                {transfer.recipientFacility?.name ??
                  transfer.recipientFacility ??
                  "Recipient"}
                {transfer.distanceKm != null
                  ? ` · ${transfer.distanceKm} km`
                  : ""}
              </p>
              <p className="mt-1 text-[11px] text-g400">
                Lot {transfer.lot ?? "—"} · {transfer.status ?? "—"}
              </p>
            </div>
            {tab === "pending" ? (
              <div className="flex gap-2">
                <button
                  disabled={busy === transfer.id}
                  onClick={() => void decide(transfer.id, "approve")}
                  className="rounded-md bg-good px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={busy === transfer.id}
                  onClick={() => void decide(transfer.id, "reject")}
                  className="rounded-md border border-g200 px-3 py-2 text-xs font-semibold text-g700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            ) : (
              <span className="text-xs font-semibold text-good">
                {transfer.deliveredAt
                  ? new Date(transfer.deliveredAt).toLocaleDateString("en-NG")
                  : transfer.status}
              </span>
            )}
          </article>
        ))}
        {!rows.length ? (
          <p className="py-8 text-center text-sm text-g500">
            No {tab === "pending" ? "pending requests" : "completed transfers"}{" "}
            found.
          </p>
        ) : null}
      </section>
    </div>
  );
}
