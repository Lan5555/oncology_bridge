"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProvider } from "@/app/providers/provider";
import { COLDCHAIN_SERVICE } from "@/app/services/coldchain-service/coldchain-service";
import { unwrapArray } from "@/app/services/response-utils";

export type ColdChainEventFilters = {
  unitId: string;
  status: string;
  from: string;
  to: string;
  page: number;
};

type StreamStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline"
  | "error";

const EVENT_LIMIT = 25;
const validReadingState = (state: unknown) =>
  state === "NOMINAL" || state === "BREACH" || state === "OFFLINE";
const unitFacilityId = (unit: any) =>
  String(
    unit?.facility?.id ??
      unit?.facilityId ??
      unit?.facility_id ??
      (typeof unit?.facility === "string" ? unit.facility : ""),
  );
const eventUnitId = (event: any) =>
  String(event?.unitId ?? event?.unit_id ?? event?.unit?.id ?? "");
function storedToken(fallback?: string) {
  try {
    const session = JSON.parse(
      window.localStorage.getItem("userSession") ?? "{}",
    );
    return session.token ?? session.accessToken ?? fallback ?? "";
  } catch {
    return fallback ?? "";
  }
}

function normalizeHistory(value: any, unitIds: Set<string>) {
  const readings = unwrapArray(value?.readings)
    .filter((reading: any) => {
      const id = String(reading.unitId ?? reading.unit_id ?? "");
      return id && unitIds.has(id);
    })
    .sort(
      (left: any, right: any) =>
        new Date(left.recordedAt ?? left.at ?? 0).getTime() -
        new Date(right.recordedAt ?? right.at ?? 0).getTime(),
    );
  return { ...value, readings };
}

function historyFromReadings(readings: any[]) {
  const sorted = [...readings].sort(
    (left, right) =>
      new Date(left.recordedAt ?? left.at ?? 0).getTime() -
      new Date(right.recordedAt ?? right.at ?? 0).getTime(),
  );
  const labels = sorted.map((reading) =>
    new Date(reading.recordedAt ?? reading.at).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const times = sorted.map((reading) =>
    new Date(reading.recordedAt ?? reading.at).getTime(),
  );
  const unitIds = [...new Set(sorted.map((reading) => String(reading.unitId)))];
  const series = unitIds.map((unitId) => {
    const byTime = new Map<number, number>();
    for (const reading of sorted) {
      if (String(reading.unitId) === unitId) {
        byTime.set(
          new Date(reading.recordedAt ?? reading.at).getTime(),
          Number(reading.celsius),
        );
      }
    }
    const first = sorted.find((reading) => String(reading.unitId) === unitId);
    return {
      unitId,
      label: first?.unitLabel ?? first?.label ?? "Storage unit",
      data: times.map((time) => byTime.get(time) ?? null),
    };
  });
  return { readings: sorted, labels, series };
}

export function useColdChainMonitor({
  hours = 24,
  filters = { unitId: "", status: "", from: "", to: "", page: 1 },
  accessToken,
}: {
  hours?: number;
  filters?: ColdChainEventFilters;
  accessToken?: string;
} = {}) {
  const router = useRouter();
  const { userData, sessionReady } = useProvider();
  const [units, setUnits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [history, setHistory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [unitsError, setUnitsError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("connecting");
  const [streamError, setStreamError] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [eventTotal, setEventTotal] = useState<number | null>(null);
  const safeHours = Math.max(1, Math.min(720, Math.floor(Number(hours) || 24)));
  const facilityId = String(
    userData.user?.hospital?.id ??
      userData.user?.facilityId ??
      userData.user?.facility?.id ??
      "",
  );
  const unitsRef = useRef<any[]>([]);
  const historyRef = useRef<any | null>(null);
  const filtersRef = useRef(filters);
  const reloadRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const reload = useCallback(async () => {
    setLoading(true);
    setUnitsError("");
    setEventsError("");
    setHistoryError("");
    const queryFilters = filtersRef.current;
    const [unitResponse, eventResponse, historyResponse] = await Promise.all([
      COLDCHAIN_SERVICE.storageUnits(),
      COLDCHAIN_SERVICE.coldChainEvents({
        unitId: queryFilters.unitId || undefined,
        status: queryFilters.status || undefined,
        from: queryFilters.from || undefined,
        to: queryFilters.to || undefined,
        page: queryFilters.page,
        limit: EVENT_LIMIT,
      }),
      COLDCHAIN_SERVICE.history(safeHours, queryFilters.unitId || undefined),
    ]);

    const persistedUnits = unitResponse.success
      ? unwrapArray(unitResponse.data)
      : [];
    const scopedUnits = facilityId
      ? persistedUnits.filter(
          (unit: any) => unitFacilityId(unit) === facilityId,
        )
      : persistedUnits;
    const allowedUnitIds = new Set(
      scopedUnits.map((unit: any) => String(unit.id)),
    );
    unitsRef.current = scopedUnits;
    setUnits(scopedUnits);
    if (!unitResponse.success)
      setUnitsError(
        unitResponse.message || "Storage units could not be loaded.",
      );

    if (eventResponse.success) {
      const data = eventResponse.data as any;
      const returnedEvents = unwrapArray(data?.events ?? data).filter(
        (event: any) => allowedUnitIds.has(eventUnitId(event)),
      );
      setEvents(returnedEvents);
      setHasNextPage(
        data?.pagination?.hasNextPage ??
          data?.hasNextPage ??
          returnedEvents.length === EVENT_LIMIT,
      );
      const total = data?.pagination?.total ?? data?.total;
      setEventTotal(
        total != null && Number.isFinite(Number(total)) ? Number(total) : null,
      );
    } else {
      setEvents([]);
      setHasNextPage(false);
      setEventTotal(null);
      setEventsError(
        eventResponse.message || "Cold-chain events could not be loaded.",
      );
    }

    if (historyResponse.success) {
      const persistedHistory = normalizeHistory(
        historyResponse.data ?? {},
        allowedUnitIds,
      );
      historyRef.current = persistedHistory;
      setHistory(persistedHistory);
    } else {
      historyRef.current = null;
      setHistory(null);
      setHistoryError(
        historyResponse.message || "Temperature history could not be loaded.",
      );
    }
    setLoading(false);
  }, [facilityId, safeHours]);

  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useEffect(() => {
    if (!sessionReady) return;
    void reload();
  }, [
    filters.unitId,
    filters.status,
    filters.from,
    filters.to,
    filters.page,
    reload,
    safeHours,
    sessionReady,
  ]);

  const applyStreamEvent = useCallback(
    (eventType: string, payload: any) => {
      if (eventType === "heartbeat") return;
      const content = payload?.event ?? payload?.unit ?? payload;
      const id =
        eventUnitId(content) ||
        eventUnitId(payload) ||
        String(payload?.storageUnitId ?? payload?.unit?.id ?? "");
      const knownUnit = unitsRef.current.find((unit) => String(unit.id) === id);
      if (!knownUnit || !id) return;

      if (
        eventType === "reading" ||
        payload?.reading ||
        content?.celsius != null
      ) {
        const reading = payload?.reading ?? content;
        const celsius = Number(
          reading.celsius ?? reading.temperatureC ?? reading.temperature,
        );
        if (!Number.isFinite(celsius)) return;
        const recordedAt =
          reading.recordedAt ??
          reading.at ??
          reading.timestamp ??
          new Date().toISOString();
        const low = Number(knownUnit.targetMin ?? knownUnit.target_min ?? 2);
        const high = Number(knownUnit.targetMax ?? knownUnit.target_max ?? 8);
        const readingState =
          reading.readingState ??
          (celsius < low || celsius > high ? "BREACH" : "NOMINAL");
        const updatedUnit = {
          ...knownUnit,
          currentC: celsius,
          currentReadingAt: recordedAt,
          lastSeenAt: recordedAt,
          readingState: validReadingState(readingState)
            ? readingState
            : "NOMINAL",
        };
        const nextUnits = unitsRef.current.map((unit) =>
          String(unit.id) === id ? updatedUnit : unit,
        );
        unitsRef.current = nextUnits;
        setUnits(nextUnits);

        const activeHistory = historyRef.current;
        const historyUnitFilter = filtersRef.current.unitId;
        if (activeHistory && (!historyUnitFilter || historyUnitFilter === id)) {
          const rows = unwrapArray(activeHistory.readings).filter(
            (row: any) =>
              !(
                String(row.unitId ?? row.unit_id) === id &&
                String(row.recordedAt ?? row.at) === String(recordedAt)
              ),
          );
          rows.push({
            unitId: id,
            unitLabel:
              reading.unitLabel ??
              knownUnit.label ??
              knownUnit.name ??
              "Storage unit",
            celsius,
            recordedAt,
          });
          const cutoff = Date.now() - safeHours * 60 * 60 * 1000;
          const nextHistory = historyFromReadings(
            rows.filter(
              (row: any) =>
                new Date(row.recordedAt ?? row.at).getTime() >= cutoff,
            ),
          );
          historyRef.current = nextHistory;
          setHistory(nextHistory);
        }
      }

      if (
        eventType === "breach" ||
        eventType === "resolved" ||
        payload?.severity ||
        payload?.resolvedAt
      ) {
        const coldChainEvent = payload?.event ?? payload;
        const status =
          coldChainEvent.status ??
          coldChainEvent.state ??
          coldChainEvent.eventStatus ??
          coldChainEvent.eventState;
        const normalized = {
          ...coldChainEvent,
          unitId: id,
          status:
            eventType === "resolved"
              ? (status ?? "RESOLVED")
              : (status ?? "OPEN"),
          state:
            eventType === "resolved"
              ? (status ?? "RESOLVED")
              : (status ?? "OPEN"),
          resolvedAt:
            coldChainEvent.resolvedAt ??
            (eventType === "resolved" ? new Date().toISOString() : null),
        };
        const currentFilters = filtersRef.current;
        const statusMatches =
          !currentFilters.status ||
          String(
            normalized.status ??
              normalized.eventStatus ??
              normalized.eventState,
          ).toUpperCase() === currentFilters.status.toUpperCase();
        const unitMatches =
          !currentFilters.unitId || currentFilters.unitId === id;
        setEvents((current) => {
          const exists = current.some(
            (item) => String(item.id) === String(normalized.id),
          );
          if (exists) {
            if (!unitMatches || !statusMatches)
              return current.filter(
                (item) => String(item.id) !== String(normalized.id),
              );
            return current.map((item) =>
              String(item.id) === String(normalized.id)
                ? { ...item, ...normalized }
                : item,
            );
          }
          if (!unitMatches || !statusMatches || currentFilters.page !== 1)
            return current;
          return [normalized, ...current].slice(0, EVENT_LIMIT);
        });
      }

      if (eventType === "unit-status") {
        const state = content.readingState ?? content.status ?? content.state;
        if (validReadingState(state)) {
          const nextUnits = unitsRef.current.map((unit) =>
            String(unit.id) === id
              ? {
                  ...unit,
                  readingState: state,
                  lastSeenAt: content.lastSeenAt ?? unit.lastSeenAt,
                }
              : unit,
          );
          unitsRef.current = nextUnits;
          setUnits(nextUnits);
        }
      }
    },
    [safeHours],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stopped = false;
    let activeController: AbortController | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let lastEventId = "";

    const wait = (delay: number) =>
      new Promise<void>((resolve) => {
        reconnectTimer = setTimeout(resolve, delay);
      });

    const consume = async (response: Response) => {
      if (!response.body)
        throw new Error("The event stream has no response body.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (!stopped) {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          let eventType = "message";
          let eventId = "";
          const dataLines: string[] = [];
          for (const line of block.split(/\r?\n/)) {
            if (line.startsWith(":")) continue;
            const colon = line.indexOf(":");
            const field = colon < 0 ? line : line.slice(0, colon);
            const value =
              colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
            if (field === "event") eventType = value;
            else if (field === "id") eventId = value;
            else if (field === "data") dataLines.push(value);
          }
          if (eventId) lastEventId = eventId;
          if (!dataLines.length) {
            if (eventType === "heartbeat") applyStreamEvent("heartbeat", {});
            continue;
          }
          try {
            const payload = JSON.parse(dataLines.join("\n"));
            const type =
              eventType === "message" ? (payload.type ?? eventType) : eventType;
            applyStreamEvent(type, payload);
          } catch {
            setStreamError("A live event could not be decoded.");
          }
        }
      }
    };

    const connect = async () => {
      let attempt = 0;
      let hasConnected = false;
      if (!sessionReady) return;
      while (!stopped) {
        if (hasConnected) {
          setStreamStatus("reconnecting");
          await reloadRef.current();
        }
        let token = storedToken(accessToken);
        if (!token) {
          setStreamStatus("offline");
          setStreamError("Sign in to receive live cold-chain updates.");
          return;
        }
        setStreamStatus(hasConnected ? "reconnecting" : "connecting");
        setStreamError("");
        const connectedAt = Date.now();
        activeController = new AbortController();
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
          if (!baseUrl)
            throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
          const headers = new Headers({ Authorization: `Bearer ${token}` });
          if (lastEventId) headers.set("Last-Event-ID", lastEventId);
          const response = await fetch(`${baseUrl}/api/coldchain/stream`, {
            headers,
            signal: activeController.signal,
            cache: "no-store",
          });
          if (response.status === 401) {
            const refreshed = await COLDCHAIN_SERVICE.storageUnits();
            token = storedToken();
            if (!refreshed.success || !token) {
              setStreamStatus("offline");
              setStreamError(
                "Your session expired. Sign in again to reconnect.",
              );
              router.replace("/login");
              return;
            }
            throw new Error("Access token refreshed; reconnecting.");
          }
          if (!response.ok)
            throw new Error(`Live stream request failed (${response.status}).`);
          hasConnected = true;
          setStreamStatus("live");
          await consume(response);
          if (!stopped) setStreamError("The live stream closed. Reconnecting…");
        } catch (error) {
          if (stopped) return;
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          setStreamError(
            error instanceof Error
              ? error.message
              : "Live cold-chain stream is unavailable.",
          );
        }
        if (Date.now() - connectedAt > 30_000) attempt = 0;
        else attempt += 1;
        setStreamStatus("reconnecting");
        await wait(Math.min(30_000, 1_000 * 2 ** Math.min(attempt - 1, 5)));
      }
    };

    void connect();
    return () => {
      stopped = true;
      activeController?.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [accessToken, applyStreamEvent, router, sessionReady]);

  return {
    units,
    events,
    history,
    loading,
    unitsError,
    eventsError,
    historyError,
    streamStatus,
    streamError,
    hasNextPage,
    eventTotal,
    reload,
  };
}
