"use client";

import { useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Snowflake,
  Thermometer,
} from "lucide-react";
import { TemperatureHistoryChart } from "@/app/components/Charts";
import EmptyState from "@/app/components/EmptyState";
import { useColdChainMonitor } from "@/app/hooks/useColdChainMonitor";

const dateLabel = (value?: string | null) =>
  value ? new Date(value).toLocaleString("en-NG") : "N/A";

export default function ColdChainPage() {
  const [hours, setHours] = useState(24);
  const [filters, setFilters] = useState({
    unitId: "",
    status: "",
    from: "",
    to: "",
    page: 1,
  });
  const monitor = useColdChainMonitor({ hours, filters });
  const updateFilter = (
    key: "unitId" | "status" | "from" | "to",
    value: string,
  ) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));

  return (
    <div className="block animate-fade-up space-y-5">
      <header className="rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
              <Snowflake size={21} className="text-p" aria-hidden="true" />
              Cold Chain Monitor
            </h1>
            <p className="mt-1 text-[12.5px] text-g500">
              Persisted storage units, temperature readings, and cold-chain
              events for your facility.
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-full border border-g200 bg-w px-3 py-1.5 text-xs font-semibold text-g700"
            role="status"
          >
            <Activity
              size={14}
              className={
                monitor.streamStatus === "live"
                  ? "text-green-600"
                  : "text-amber-600"
              }
            />
            {monitor.streamStatus === "live"
              ? "Live updates"
              : monitor.streamStatus === "reconnecting"
                ? "Reconnecting…"
                : monitor.streamStatus === "error"
                  ? "Live updates unavailable"
                  : monitor.streamStatus === "offline"
                    ? "Offline"
                    : "Connecting…"}
          </div>
        </div>
        {monitor.streamError && (
          <p className="mt-3 text-xs text-err">{monitor.streamError}</p>
        )}
        {monitor.unitsError && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-err bg-errl p-3 text-sm text-err"
          >
            {monitor.unitsError}
          </p>
        )}
      </header>

      <section className="rounded-xl border border-g200 bg-w p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-g900">
              Facility storage units
            </h2>
            <p className="mt-1 text-xs text-g500">
              Current values come from the latest persisted or live reading.
            </p>
          </div>
          {monitor.loading && (
            <span className="text-xs text-g500">Loading…</span>
          )}
        </div>
        {monitor.units.length ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
            {monitor.units.map((unit: any) => {
              const current =
                unit.currentC == null ? null : Number(unit.currentC);
              const state = String(
                unit.readingState ?? "OFFLINE",
              ).toUpperCase();
              const tone =
                state === "BREACH"
                  ? "border-err/40 bg-errl text-err"
                  : state === "OFFLINE"
                    ? "border-g200 bg-g50 text-g500"
                    : "border-green-200 bg-green-50 text-green-700";
              return (
                <article
                  key={unit.id}
                  className={`rounded-lg border p-4 ${tone}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-bold uppercase">
                      {unit.label || "Storage unit"}
                    </p>
                    <span className="text-[10px] font-bold">{state}</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold">
                    {current == null || !Number.isFinite(current)
                      ? "No reading"
                      : `${current.toFixed(1)}°C`}
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    Target {unit.targetMin}–{unit.targetMax}°C
                  </p>
                  <p className="mt-2 truncate text-[11px] opacity-75">
                    {unit.facility?.name ?? unit.facility ?? "Facility"}
                  </p>
                  <p className="mt-1 text-[11px] opacity-75">
                    Last seen {dateLabel(unit.lastSeenAt)}
                  </p>
                </article>
              );
            })}
          </div>
        ) : monitor.loading ? (
          <div className="py-8 text-center text-sm text-g500">
            Loading storage units…
          </div>
        ) : (
          <EmptyState
            icon={Thermometer}
            title="No storage units configured"
            description="Persisted storage units assigned to your facility will appear here."
          />
        )}
      </section>

      <section className="rounded-xl border border-g200 bg-w p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-g900">
              Temperature history
            </h2>
            <p className="mt-1 text-xs text-g500">
              Recorded readings returned by the history API.
            </p>
          </div>
          <label className="text-xs font-medium text-g600">
            Time range{" "}
            <select
              className="ml-2 rounded-md border border-g200 bg-w px-2 py-1.5"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            >
              {[24, 48, 168, 720].map((value) => (
                <option value={value} key={value}>
                  {value < 48 ? `${value} hours` : `${value / 24} days`}
                </option>
              ))}
            </select>
          </label>
        </div>
        {monitor.historyError && (
          <p role="alert" className="mb-3 text-sm text-err">
            {monitor.historyError}
          </p>
        )}
        <div className="h-[260px]">
          <TemperatureHistoryChart
            historyData={monitor.history}
            loading={monitor.loading}
            error={monitor.historyError}
          />
        </div>
      </section>

      <section className="rounded-xl border border-g200 bg-w p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-g900">
              Cold-chain event log
            </h2>
            <p className="mt-1 text-xs text-g500">
              Persisted events, with live breach and resolution updates.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter by storage unit"
              className="rounded-md border border-g200 bg-w px-2 py-1.5 text-xs"
              value={filters.unitId}
              onChange={(e) => updateFilter("unitId", e.target.value)}
            >
              <option value="">All units</option>
              {monitor.units.map((unit: any) => (
                <option value={unit.id} key={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by event status"
              className="rounded-md border border-g200 bg-w px-2 py-1.5 text-xs"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <label className="flex items-center gap-1 rounded-md border border-g200 px-2 text-xs text-g500">
              <Clock3 size={13} />
              <input
                aria-label="Events from date"
                className="max-w-[125px] py-1.5 text-g700"
                type="date"
                value={filters.from}
                onChange={(e) => updateFilter("from", e.target.value)}
              />
            </label>
            <label className="flex items-center gap-1 rounded-md border border-g200 px-2 text-xs text-g500">
              <Clock3 size={13} />
              <input
                aria-label="Events to date"
                className="max-w-[125px] py-1.5 text-g700"
                type="date"
                value={filters.to}
                onChange={(e) => updateFilter("to", e.target.value)}
              />
            </label>
          </div>
        </div>
        {monitor.eventsError && (
          <p role="alert" className="mb-3 text-sm text-err">
            {monitor.eventsError}
          </p>
        )}
        {monitor.events.length ? (
          <div className="divide-y divide-g100">
            {monitor.events.map((event: any, index: number) => (
              <article
                className="py-3"
                key={event.id ?? `${event.at}-${index}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-g800">
                    {event.message || "Cold-chain event"}
                  </p>
                  <span className="rounded-full bg-g100 px-2 py-0.5 text-[10px] font-bold uppercase text-g600">
                    {event.status ??
                      event.state ??
                      event.eventStatus ??
                      event.eventState ??
                      event.severity ??
                      "Event"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-g500">
                  {monitor.units.find(
                    (unit: any) => String(unit.id) === String(event.unitId),
                  )?.label ?? event.unitId}{" "}
                  · {dateLabel(event.at)} ·{" "}
                  {event.severity ?? "Unspecified severity"}
                </p>
                {(event.observedMinCelsius != null ||
                  event.observedMaxCelsius != null) && (
                  <p className="mt-1 text-xs text-g600">
                    Observed: {event.observedMinCelsius ?? "N/A"}°C to{" "}
                    {event.observedMaxCelsius ?? "N/A"}°C
                  </p>
                )}
                {event.actionTaken && (
                  <p className="mt-1 text-xs text-g600">
                    Action taken: {event.actionTaken}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-g500">
                  Last seen {dateLabel(event.lastSeenAt)} ·{" "}
                  {event.resolvedAt
                    ? `Resolved ${dateLabel(event.resolvedAt)}`
                    : "Unresolved"}
                </p>
              </article>
            ))}
          </div>
        ) : monitor.loading ? (
          <p className="py-6 text-center text-sm text-g500">Loading events…</p>
        ) : (
          <EmptyState
            compact
            icon={Snowflake}
            title="No recorded events"
            description="Persisted cold-chain events matching these filters will appear here."
          />
        )}
        <div className="mt-4 flex items-center justify-between border-t border-g100 pt-3 text-xs text-g500">
          <span>
            {monitor.eventTotal == null
              ? `Page ${filters.page}`
              : `${monitor.eventTotal} event${monitor.eventTotal === 1 ? "" : "s"}`}
          </span>
          <div className="flex gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
              className="rounded border border-g200 p-1.5 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-1 py-1.5">{filters.page}</span>
            <button
              disabled={!monitor.hasNextPage}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
              className="rounded border border-g200 p-1.5 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
