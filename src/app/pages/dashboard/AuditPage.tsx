"use client";

import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "@/app/components/EmptyState";
import {
  type AuditEntry,
  adminAuditDisplay,
} from "@/app/lib/admin-audit-display";
import { notifyResult } from "@/app/lib/notifications";
import { AUDIT_SERVICE } from "@/app/services/audit-service/audit-service";
import { unwrapArray } from "@/app/services/response-utils";

export default function AuditPage({
  adminMode = false,
}: {
  adminMode?: boolean;
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    const load = async () => {
      const response = await AUDIT_SERVICE.list("page=1&limit=100", adminMode);
      if (!active) return;
      if (response.success) setEntries(unwrapArray(response.data));
      else setMessage(response.message || "Audit history could not be loaded.");
    };
    void load();
    return () => {
      active = false;
    };
  }, [adminMode]);
  const verify = async () => {
    const response = await AUDIT_SERVICE.verify(adminMode);
    notifyResult(
      response,
      "Audit verification completed.",
      "Audit verification failed.",
    );
    setMessage(
      response.success
        ? response.message || "Audit chain verified."
        : response.message || "Audit chain verification failed.",
    );
  };
  const exportCsv = async () => {
    const response = await AUDIT_SERVICE.exportCsv(adminMode);
    const value =
      (response.data as { csv?: unknown } | null)?.csv ?? response.data;
    if (!response.success || !value) {
      toast.error(response.message || "Audit export failed.");
      setMessage(response.message || "Audit export failed.");
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
    toast.success("Audit export downloaded.");
  };
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
            <ClipboardList className="size-5 text-p" aria-hidden="true" />
            Audit Log
          </h1>
          <p className="mt-1 text-[12.5px] text-g500">
            Read-only activity stream
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void verify()}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-xs font-semibold text-g700"
          >
            Verify hash chain
          </button>
          <button
            type="button"
            onClick={() => void exportCsv()}
            className="rounded-lg bg-p px-3 py-2 text-xs font-semibold text-white"
          >
            Export CSV
          </button>
        </div>
      </header>
      {message ? (
        <output className="mb-4 block text-sm text-g600">{message}</output>
      ) : null}
      <section className="rounded-xl border border-g200 bg-w p-5">
        {entries.map((entry, index) => {
          const display = adminMode ? adminAuditDisplay(entry) : null;
          const legacyDetail = entry.detail ?? entry.message;
          const detail = display
            ? display.detail
            : typeof legacyDetail === "string"
              ? legacyDetail
              : "N/A";
          const actor =
            typeof entry.actor === "string" ? entry.actor : entry.actor?.name;
          return (
            <article
              className="border-b border-g100 py-4 last:border-0"
              key={entry.id ?? index}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-g800">
                  {display?.title ?? entry.type ?? entry.action ?? "Activity"}
                  {!display && entry.object_type
                    ? ` · ${entry.object_type}`
                    : ""}
                </h2>
                <time className="text-xs text-g500">
                  {display?.time ??
                    (entry.at
                      ? new Date(entry.at).toLocaleString("en-NG")
                      : "N/A")}
                </time>
              </div>
              {detail && (
                <p className="mt-1 wrap-break-word text-xs text-g600">
                  {detail}
                </p>
              )}
              <p className="mt-1 wrap-break-word text-xs text-g500">
                {display?.actor ?? actor ?? "Actor not provided"}
                {entry.severity ? ` · ${entry.severity}` : ""}
              </p>
            </article>
          );
        })}
        {!entries.length ? (
          <EmptyState
            icon={ClipboardList}
            title="No audit events yet"
            description="Recorded activity will appear here as users and services make changes."
          />
        ) : null}
      </section>
    </div>
  );
}
