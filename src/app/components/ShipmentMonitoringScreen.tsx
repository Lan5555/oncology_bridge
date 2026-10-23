"use client";

import { RefreshCw, Thermometer, Truck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShipmentQuery } from "../hooks/useShipmentQuery";
import {
  shipmentPollSeconds,
  shipmentTemperature,
} from "../lib/shipment-temperature";
import {
  SHIPMENT_SERVICE,
  type ShipmentEvent,
  type ShipmentMonitor,
  type ShipmentPage,
  type ShipmentReading,
} from "../services/shipment-service/shipment-service";
import styles from "./OrdersScreen.module.css";

const date = (value: string | null | undefined) =>
  value && !Number.isNaN(Date.parse(value))
    ? new Date(value).toLocaleString()
    : "Unavailable";
const labels: Record<string, string> = {
  PENDING_INTEGRATION: "Provider connection pending",
  AWAITING_DATA: "Waiting for first reading",
  RECEIVING: "Receiving readings",
  STALE: "Reading is stale",
  ENDED: "Monitoring ended",
};
const stateLabel = (value?: string) =>
  value
    ? (labels[value] ?? value.toLowerCase().replaceAll("_", " "))
    : "Unavailable";
const sourceLabel = (item: ShipmentMonitor) =>
  item.reference ||
  (item.courierAssignmentId ? "Redistribution shipment" : "Purchase shipment");
const celsius = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${value} °C`
    : "Unavailable";

function Pagination({
  value,
  onPage,
}: {
  value: ShipmentPage<unknown>["pagination"];
  onPage: (page: number) => void;
}) {
  return (
    <footer className={styles.pagination}>
      <span className={styles.muted}>
        {value.total} record{value.total === 1 ? "" : "s"}
      </span>
      <div>
        <button
          type="button"
          className={styles.button}
          disabled={value.page <= 1}
          onClick={() => onPage(value.page - 1)}
        >
          Previous
        </button>
        <span className={styles.muted}>
          Page {value.page} of {Math.max(1, value.totalPages)}
        </span>
        <button
          type="button"
          className={styles.button}
          disabled={value.page >= value.totalPages}
          onClick={() => onPage(value.page + 1)}
        >
          Next
        </button>
      </div>
    </footer>
  );
}
function ErrorMessage({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className={styles.empty}>
      <p className={styles.error} role="alert">
        {message}
      </p>
      <button type="button" className={styles.button} onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export default function ShipmentMonitoringScreen({
  admin = false,
  canSync = false,
}: {
  admin?: boolean;
  canSync?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [pollSeconds, setPollSeconds] = useState(30);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");
  const syncLock = useRef(false);
  const detailsSection = useRef<HTMLElement>(null);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const list = useShipmentQuery<ShipmentPage<ShipmentMonitor>>(
    useCallback(() => SHIPMENT_SERVICE.list(page, admin), [page, admin]),
    revision,
  );
  const detail = useShipmentQuery<ShipmentMonitor>(
    useCallback(
      () => (selected ? SHIPMENT_SERVICE.temperature(selected, admin) : null),
      [selected, admin],
    ),
    revision,
  );
  const history = useShipmentQuery<ShipmentPage<ShipmentReading>>(
    useCallback(
      () =>
        selected
          ? SHIPMENT_SERVICE.history(selected, historyPage, admin)
          : null,
      [selected, historyPage, admin],
    ),
    revision,
  );
  const events = useShipmentQuery<ShipmentPage<ShipmentEvent>>(
    useCallback(
      () =>
        selected ? SHIPMENT_SERVICE.events(selected, eventPage, admin) : null,
      [selected, eventPage, admin],
    ),
    revision,
  );

  useEffect(() => {
    const value =
      detail.data?.pollAfterSeconds ?? list.data?.items?.[0]?.pollAfterSeconds;
    if (value !== undefined) setPollSeconds(shipmentPollSeconds(value));
  }, [detail.data, list.data]);
  useEffect(() => {
    const visibleRefresh = () => {
      if (document.visibilityState === "visible" && !syncLock.current)
        refresh();
    };
    const timer = window.setInterval(visibleRefresh, pollSeconds * 1000);
    window.addEventListener("focus", visibleRefresh);
    document.addEventListener("visibilitychange", visibleRefresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", visibleRefresh);
      document.removeEventListener("visibilitychange", visibleRefresh);
    };
  }, [pollSeconds, refresh]);

  async function synchronize() {
    if (!selected || !admin || !canSync || syncLock.current) return;
    syncLock.current = true;
    setSyncing(true);
    setSyncError("");
    setSyncMessage("");
    try {
      const response = await SHIPMENT_SERVICE.sync(selected);
      if (!response.success)
        throw new Error(
          response.status === 503
            ? "The temperature provider connection is pending or unavailable. No new readings were confirmed."
            : response.message || "Synchronization could not be completed.",
        );
      setSyncMessage(
        "Synchronization completed. Reloading persisted readings.",
      );
    } catch (failure) {
      setSyncError(
        failure instanceof Error ? failure.message : "Synchronization failed.",
      );
    } finally {
      syncLock.current = false;
      setSyncing(false);
      refresh();
    }
  }
  const monitor = detail.data;
  const sample = monitor ? shipmentTemperature(monitor) : null;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            {admin
              ? "Network / Shipment monitoring"
              : "Shipments / Temperature monitoring"}
          </p>
          <h1>Shipment monitoring</h1>
          <p className={styles.muted}>
            Temperature records for marketplace purchases and redistribution
            shipments.
          </p>
        </div>
        <button
          type="button"
          className={styles.button}
          disabled={list.loading || syncing}
          onClick={refresh}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </header>
      <p className={styles.muted}>
        Readings describe recorded temperatures; they do not certify product
        suitability. Storage-unit monitoring is available separately under Cold
        chain. This screen refreshes every {pollSeconds} seconds while visible.
      </p>
      <section
        className={styles.panel}
        aria-label="Monitored shipments"
        aria-busy={list.loading}
      >
        {list.loading ? (
          <output className={styles.empty}>Loading shipments…</output>
        ) : list.error ? (
          <ErrorMessage message={list.error} retry={refresh} />
        ) : list.data &&
          Array.isArray(list.data.items) &&
          list.data.items.length > 0 &&
          list.data.pagination ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Shipment</th>
                    <th scope="col">Courier</th>
                    <th scope="col">Monitoring</th>
                    <th scope="col">Latest sample</th>
                    <th scope="col">Excursions</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {list.data.items.map((item) => {
                    const reading = shipmentTemperature(item);
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{sourceLabel(item)}</strong>
                          <p className={styles.muted}>
                            {item.courierAssignmentId
                              ? "Redistribution"
                              : "Marketplace purchase"}{" "}
                            · {stateLabel(item.shipmentStatus)}
                          </p>
                          <p className={styles.muted}>
                            Configured {date(item.createdAt)}
                          </p>
                        </td>
                        <td>{item.courier?.name || "Unavailable"}</td>
                        <td>
                          <span className={styles.badge}>
                            {stateLabel(item.monitoringStatus)}
                          </span>
                        </td>
                        <td>
                          <strong
                            className={reading.outOfRange ? "text-err" : ""}
                          >
                            {reading.value}
                          </strong>
                          <p className={styles.muted}>{reading.status}</p>
                          <p className={styles.muted}>
                            Sample time: {date(reading.recordedAt)}
                          </p>
                          {item.monitoringStatus === "STALE" && (
                            <p className="text-xs text-err">
                              Stale sample — current temperature unknown
                            </p>
                          )}
                        </td>
                        <td>{item.excursionCount ?? "Unavailable"}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.button}
                            disabled={syncing}
                            aria-expanded={selected === item.id}
                            onClick={() => {
                              setSelected(item.id);
                              setHistoryPage(1);
                              setEventPage(1);
                              setSyncError("");
                              setSyncMessage("");
                              requestAnimationFrame(() =>
                                detailsSection.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                }),
                              );
                            }}
                          >
                            View monitoring
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination value={list.data.pagination} onPage={setPage} />
          </>
        ) : list.data &&
          (!Array.isArray(list.data.items) || !list.data.pagination) ? (
          <ErrorMessage
            message="Shipment records are unavailable. The server returned an unexpected response."
            retry={refresh}
          />
        ) : (
          <div className={styles.empty}>
            <Truck size={30} aria-hidden="true" />
            <h2>Monitoring not configured</h2>
            <p className={styles.muted}>
              No shipment monitoring records are available for your account. A
              network operator must link a shipment, courier and sensor with a
              reviewed temperature range.
            </p>
          </div>
        )}
      </section>

      {selected && (
        <section
          ref={detailsSection}
          className={`${styles.panel} ${styles.detail}`}
          aria-label="Shipment temperature details"
          aria-busy={detail.loading}
        >
          <div className={styles.detailHeading}>
            <h2 className="flex items-center gap-2">
              <Thermometer size={19} />{" "}
              {monitor ? sourceLabel(monitor) : "Shipment details"}
            </h2>
            <button
              type="button"
              className={styles.button}
              disabled={syncing}
              onClick={() => setSelected(null)}
            >
              Close details
            </button>
          </div>
          {detail.loading ? (
            <output className={styles.empty}>
              Loading monitoring details…
            </output>
          ) : detail.error ? (
            <ErrorMessage message={detail.error} retry={refresh} />
          ) : (
            monitor &&
            sample && (
              <>
                {(monitor.providerConfigured === false ||
                  monitor.monitoringStatus === "PENDING_INTEGRATION") && (
                  <p className="mt-5 rounded-xl border border-g200 bg-g50 p-4 text-sm text-g700">
                    Provider connection pending. Live temperature readings are
                    unavailable. Any existing readings below are historical
                    records.
                  </p>
                )}
                <div className={styles.detailsGrid}>
                  <section className={styles.stack}>
                    <div>
                      <h3>Latest recorded temperature</h3>
                      <p
                        className={`text-3xl font-semibold ${sample.outOfRange ? "text-err" : "text-g900"}`}
                      >
                        {sample.value}
                      </p>
                      <p className={styles.muted}>{sample.status}</p>
                      <p className={styles.muted}>
                        Sample time: {date(sample.recordedAt)}
                      </p>
                      <p className={styles.muted}>
                        Received: {date(monitor.latestReading?.receivedAt)}
                      </p>
                      <p
                        className={
                          monitor.monitoringStatus === "STALE"
                            ? "text-sm text-err"
                            : styles.muted
                        }
                      >
                        {stateLabel(monitor.monitoringStatus)}
                        {monitor.monitoringStatus === "STALE"
                          ? ". Current temperature is unknown."
                          : ""}
                      </p>
                    </div>
                    <div>
                      <h3>Excursions recorded</h3>
                      <p className="text-2xl font-semibold">
                        {monitor.excursionCount ?? "Unavailable"}
                      </p>
                      <p className={styles.muted}>
                        Earlier excursions remain recorded even if a later
                        sample is within range.
                      </p>
                    </div>
                  </section>
                  <aside className={styles.stack}>
                    <dl className={styles.facts}>
                      <div>
                        <dt>Reviewed minimum</dt>
                        <dd>{celsius(monitor.limits?.minCelsius)}</dd>
                      </div>
                      <div>
                        <dt>Reviewed maximum</dt>
                        <dd>{celsius(monitor.limits?.maxCelsius)}</dd>
                      </div>
                      <div>
                        <dt>Courier</dt>
                        <dd>{monitor.courier?.name || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Sensor provider</dt>
                        <dd>{monitor.provider || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Sensor identifier</dt>
                        <dd>{monitor.deviceId || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Stale after</dt>
                        <dd>
                          {typeof monitor.staleAfterSeconds === "number"
                            ? `${monitor.staleAfterSeconds} seconds`
                            : "Unavailable"}
                        </dd>
                      </div>
                      <div>
                        <dt>Last synchronized</dt>
                        <dd>{date(monitor.lastSyncedAt)}</dd>
                      </div>
                    </dl>
                    {admin && canSync && (
                      <button
                        type="button"
                        className={styles.button}
                        disabled={
                          syncing || monitor.monitoringStatus === "ENDED"
                        }
                        onClick={() => void synchronize()}
                      >
                        <RefreshCw size={15} />{" "}
                        {syncing ? "Synchronizing…" : "Synchronize provider"}
                      </button>
                    )}
                  </aside>
                </div>
              </>
            )
          )}
          {syncError && (
            <p role="alert" className={`${styles.error} mt-4`}>
              {syncError}
            </p>
          )}
          {syncMessage && (
            <output className={`${styles.notice} mt-4 block`}>
              {syncMessage}
            </output>
          )}
          <div className="mt-8 space-y-8">
            <section
              aria-label="Temperature history"
              aria-busy={history.loading}
            >
              <h3>Temperature history</h3>
              <p className={styles.muted}>
                Actual sensor samples, newest first.
              </p>
              {history.loading ? (
                <output className={styles.empty}>Loading readings…</output>
              ) : history.error ? (
                <ErrorMessage message={history.error} retry={refresh} />
              ) : history.data &&
                Array.isArray(history.data.items) &&
                history.data.pagination ? (
                history.data.items.length ? (
                  <>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th scope="col">Sample time</th>
                            <th scope="col">Received</th>
                            <th scope="col">Temperature</th>
                            <th scope="col">Range check</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.data.items.map((item) => (
                            <tr key={item.id}>
                              <td>{date(item.recordedAt)}</td>
                              <td>{date(item.receivedAt)}</td>
                              <td>{celsius(item.celsius)}</td>
                              <td>
                                {item.outOfRange === true
                                  ? "Outside configured range"
                                  : item.outOfRange === false
                                    ? "Within configured range"
                                    : "Unavailable"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      value={history.data.pagination}
                      onPage={setHistoryPage}
                    />
                  </>
                ) : (
                  <p className="py-5 text-sm text-g500">
                    No temperature readings recorded.{" "}
                    {stateLabel(
                      monitor?.monitoringStatus ??
                        history.data.monitoringStatus,
                    )}
                  </p>
                )
              ) : (
                <p className={styles.error} role="alert">
                  Temperature history is unavailable.
                </p>
              )}
            </section>
            <section
              aria-label="Temperature excursions"
              aria-busy={events.loading}
            >
              <h3>Excursion history</h3>
              {events.loading ? (
                <output className={styles.empty}>Loading excursions…</output>
              ) : events.error ? (
                <ErrorMessage message={events.error} retry={refresh} />
              ) : events.data &&
                Array.isArray(events.data.items) &&
                events.data.pagination ? (
                events.data.items.length ? (
                  <>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th scope="col">Occurred</th>
                            <th scope="col">Temperature</th>
                            <th scope="col">Event</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.data.items.map((item) => (
                            <tr key={item.id}>
                              <td>{date(item.occurredAt)}</td>
                              <td>{celsius(item.celsius)}</td>
                              <td>
                                {item.message ||
                                  "Temperature excursion recorded"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      value={events.data.pagination}
                      onPage={setEventPage}
                    />
                  </>
                ) : (
                  <p className="py-5 text-sm text-g500">
                    No excursion events recorded. An empty event history does
                    not establish shipment suitability.
                  </p>
                )
              ) : (
                <p className={styles.error} role="alert">
                  Excursion history is unavailable.
                </p>
              )}
            </section>
          </div>
        </section>
      )}
    </div>
  );
}
