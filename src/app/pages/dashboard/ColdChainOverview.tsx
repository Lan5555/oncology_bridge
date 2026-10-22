"use client";

import type { PageId } from "@/app/lib/types";
import { useColdChainMonitor } from "@/app/hooks/useColdChainMonitor";
import { TemperatureHistoryChart } from "@/app/components/Charts";
import EmptyState from "@/app/components/EmptyState";
import {
  AlertTriangle,
  Clock3,
  RefreshCw,
  Snowflake,
  Thermometer,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ColdChainOverviewProps {
  onNav: (id: PageId) => void;
}

const streamLabels = {
  connecting: "Connecting to live updates",
  live: "Live updates connected",
  reconnecting: "Reconnecting to live updates",
  offline: "Live updates unavailable",
  error: "Live updates unavailable",
} as const;

export default function ColdChainOverview({ onNav }: ColdChainOverviewProps) {
  const monitor = useColdChainMonitor();
  const recentEvents = [...monitor.events]
    .sort(
      (a, b) =>
        new Date(b.at ?? b.lastSeenAt ?? 0).getTime() -
        new Date(a.at ?? a.lastSeenAt ?? 0).getTime(),
    )
    .slice(0, 3);
  const StreamIcon = monitor.streamStatus === "live" ? Wifi : WifiOff;

  return (
    <section className="mb-6 rounded-2xl border border-g200 bg-w p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-g900">
            <Snowflake className="size-[18px] text-p" aria-hidden="true" />
            Cold chain monitor
          </h2>
          <p className="mt-1 text-sm text-g500">
            Persisted storage readings and events · target range is set per unit
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void monitor.reload()}
            disabled={monitor.loading}
            className="inline-flex items-center gap-2 rounded-lg border border-g200 px-3 py-2 text-xs font-semibold text-g700 hover:border-p disabled:opacity-50"
          >
            <RefreshCw
              className={monitor.loading ? "size-3.5 animate-spin" : "size-3.5"}
              aria-hidden="true"
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => onNav("pg-coldchain")}
            className="rounded-lg bg-p px-3 py-2 text-xs font-semibold text-white transition hover:bg-pd"
          >
            Open monitor
          </button>
        </div>
      </div>

      <div
        className={
          monitor.streamStatus === "live"
            ? "mb-4 flex items-center gap-2 rounded-lg bg-okl px-3 py-2 text-xs font-semibold text-good"
            : monitor.streamStatus === "reconnecting"
              ? "mb-4 flex items-center gap-2 rounded-lg bg-warnl px-3 py-2 text-xs font-semibold text-g700"
              : "mb-4 flex items-center gap-2 rounded-lg bg-g50 px-3 py-2 text-xs font-semibold text-g600"
        }
        role="status"
      >
        <StreamIcon className="size-4" aria-hidden="true" />
        {streamLabels[monitor.streamStatus]}
        {monitor.streamError ? (
          <span className="ml-1 font-normal">{monitor.streamError}</span>
        ) : null}
      </div>

      {monitor.unitsError ? (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-err bg-errl p-3 text-sm text-err"
        >
          {monitor.unitsError}
        </p>
      ) : null}

      {monitor.loading && !monitor.units.length ? (
        <div className="space-y-2 py-3" aria-label="Loading storage units">
          {[1, 2].map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-xl bg-g50" />
          ))}
        </div>
      ) : monitor.units.length ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <article className="flex items-center gap-3 rounded-xl border border-g100 bg-g50 p-4">
              <Thermometer className="size-5 text-p" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-g500">
                  Configured units
                </p>
                <p className="text-xl font-bold tabular-nums text-g900">
                  {monitor.units.length}
                </p>
              </div>
            </article>
            <article className="flex items-center gap-3 rounded-xl border border-g100 bg-g50 p-4">
              <AlertTriangle className="size-5 text-warn" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-g500">
                  Events on this page
                </p>
                <p className="text-xl font-bold tabular-nums text-g900">
                  {monitor.eventTotal ?? monitor.events.length}
                </p>
              </div>
            </article>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {monitor.units.slice(0, 6).map((unit) => {
              const temperature =
                unit.currentC == null ? null : Number(unit.currentC);
              const state = unit.readingState ?? "UNKNOWN";
              const stateClass =
                state === "BREACH"
                  ? "bg-errl text-err"
                  : state !== "NOMINAL"
                    ? "bg-warnl text-g700"
                    : "bg-okl text-good";
              return (
                <article
                  key={unit.id}
                  className="rounded-xl border border-g200 bg-w p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-g800">
                      {unit.label || "Storage unit"}
                    </p>
                    <span
                      className={
                        "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold " +
                        stateClass
                      }
                    >
                      {state}
                    </span>
                  </div>
                  <p
                    className={
                      state === "BREACH"
                        ? "mt-2 text-xl font-bold text-err"
                        : "mt-2 text-xl font-bold text-g900"
                    }
                  >
                    {temperature == null || !Number.isFinite(temperature)
                      ? "No reading"
                      : String(temperature.toFixed(1)) + "°C"}
                  </p>
                  <p className="mt-1 truncate text-xs text-g500">
                    {unit.facility?.name ??
                      (typeof unit.facility === "string"
                        ? unit.facility
                        : "Facility not specified")}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-g400">
                    <Clock3 className="size-3" aria-hidden="true" />
                    Last seen:{" "}
                    {unit.lastSeenAt
                      ? new Date(unit.lastSeenAt).toLocaleString("en-NG")
                      : "Not reported"}
                  </p>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Thermometer}
          title="No storage units configured"
          description="No persisted units are assigned to this facility yet. Readings will appear after a unit is configured and reports sensor data."
        />
      )}

      <div className="mt-5 rounded-xl border border-g200 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-g800">
            Temperature history · last 24 hours
          </h3>
          <span className="text-[11px] text-g500">Persisted readings only</span>
        </div>
        <div className="h-[220px]">
          <TemperatureHistoryChart
            historyData={monitor.history}
            loading={monitor.loading && monitor.history === null}
            error={monitor.historyError}
          />
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-bold text-g800">Latest events</h3>
        {monitor.eventsError ? (
          <p role="alert" className="py-2 text-sm text-err">
            {monitor.eventsError}
          </p>
        ) : recentEvents.length ? (
          <ul className="divide-y divide-g100">
            {recentEvents.map((event) => (
              <li className="py-3" key={event.id}>
                <p className="text-sm font-semibold text-g800">
                  {event.message}
                </p>
                <p className="mt-1 text-xs text-g500">
                  {event.severity} ·{" "}
                  {event.status ?? event.state ?? "Status not provided"} ·{" "}
                  {event.at
                    ? new Date(event.at).toLocaleString("en-NG")
                    : "Time not recorded"}
                  {event.actionTaken ? " · " + event.actionTaken : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            icon={Snowflake}
            title="No recorded events"
            description="Persisted cold-chain alerts for this facility will appear here."
          />
        )}
      </div>
    </section>
  );
}
