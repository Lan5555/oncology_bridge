"use client";

import { useEffect, useState } from "react";
import {
  type DashboardPoint,
  type DashboardSeriesKey,
  dashboardSeries,
} from "@/app/lib/dashboard-chart-data";
import {
  type DashboardFeedback,
  dashboardFeedback,
} from "@/app/lib/dashboard-feedback";
import { DASHBOARD_SERVICE } from "@/app/services/dashboard-service/dashboard-service";

export function useDashboardChartSeries(
  key: DashboardSeriesKey,
  refreshKey: number,
) {
  const [rows, setRows] = useState<DashboardPoint[]>([]);
  const [asOf, setAsOf] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardFeedback | undefined>();
  const [attempt, setAttempt] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh explicitly reloads the same series after operational changes.
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(undefined);
    void DASHBOARD_SERVICE.charts().then((response) => {
      if (!current) return;
      try {
        if (!response.success) {
          setRows([]);
          setError(dashboardFeedback(response.message, response.status));
          return;
        }
        setRows(dashboardSeries(response.data, key));
        setAsOf(
          typeof response.data?.asOf === "string"
            ? response.data.asOf
            : undefined,
        );
      } catch (failure) {
        setRows([]);
        setError(
          dashboardFeedback(failure instanceof Error ? failure.message : ""),
        );
      } finally {
        setLoading(false);
      }
    });
    return () => {
      current = false;
    };
  }, [key, refreshKey, attempt]);
  return {
    rows,
    loading,
    error,
    asOf,
    retry: () => setAttempt((value) => value + 1),
  };
}
