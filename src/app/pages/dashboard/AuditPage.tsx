"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import { AUDIT_SERVICE } from "@/app/services/audit-service/audit-service";
import { unwrapArray } from "@/app/services/response-utils";

export default function AuditPage({
  adminMode = false,
}: {
  adminMode?: boolean;
}) {
  const [entries, setEntries] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    const response = await AUDIT_SERVICE.list("page=1&limit=100", adminMode);
    if (response.success) setEntries(unwrapArray(response.data));
    else setMessage(response.message || "Audit history could not be loaded.");
  };
  useEffect(() => {
    void load();
  }, [adminMode]);
  const verify = async () => {
    const response = await AUDIT_SERVICE.verify(adminMode);
    setMessage(
      response.success
        ? response.message || "Audit chain verified."
        : response.message || "Audit chain verification failed.",
    );
  };
  const exportCsv = async () => {
    const response = await AUDIT_SERVICE.exportCsv(adminMode);
    const value = (response.data as any)?.csv ?? response.data;
    if (!response.success || !value) {
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
            onClick={() => void verify()}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-xs font-semibold text-g700"
          >
            Verify hash chain
          </button>
          <button
            onClick={() => void exportCsv()}
            className="rounded-lg bg-p px-3 py-2 text-xs font-semibold text-white"
          >
            Export CSV
          </button>
        </div>
      </header>
      {message ? (
        <p role="status" className="mb-4 text-sm text-g600">
          {message}
        </p>
      ) : null}
      <section className="rounded-xl border border-g200 bg-w p-5">
        {entries.map((entry, index) => (
          <article
            className="border-b border-g100 py-4 last:border-0"
            key={entry.id ?? index}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-g800">
                {entry.type ?? entry.action ?? "Activity"}
                {entry.object_type ? ` · ${entry.object_type}` : ""}
              </h2>
              <time className="text-xs text-g500">
                {entry.at ? new Date(entry.at).toLocaleString("en-NG") : "—"}
              </time>
            </div>
            <p className="mt-1 text-xs text-g500">
              {entry.detail ?? entry.message ?? "—"}
            </p>
            <p className="mt-1 text-[11px] text-g400">
              {entry.actor?.name ?? entry.actor ?? "System"}
              {entry.severity ? ` · ${entry.severity}` : ""}
            </p>
          </article>
        ))}
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
