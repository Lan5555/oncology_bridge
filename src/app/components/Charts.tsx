"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js/auto";
import { Activity, ChartColumn, ChartPie, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import EmptyState from "@/app/components/EmptyState";
import { useProvider } from "@/app/providers/provider";
import { DASHBOARD_SERVICE } from "@/app/services/dashboard-service/dashboard-service";
import { unwrapArray } from "@/app/services/response-utils";
import { SCAN_SERVICE } from "@/app/services/scan-service/scan-service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
);

const AC = "#0D9488";
const OK = "#059669";
const WN = "#F59E0B";
const ER = "#EF4444";

function useChartTheme() {
  const { theme } = useProvider();
  const dark = theme === "dark";
  return {
    P: dark ? "#60A5FA" : "#2563EB",
    GL: dark ? "#26364B" : "#DCE5F1",
    GM: dark ? "#CBD5E1" : "#475569",
    G7: dark ? "#E2E8F0" : "#334155",
  };
}

/** Renders the authenticated, persisted cold-chain history supplied by its monitor. */
export function TemperatureHistoryChart({
  historyData,
  loading = false,
  error = "",
}: {
  historyData: any | null;
  loading?: boolean;
  error?: string;
}) {
  const { P, GL, GM } = useChartTheme();
  const history = historyData;
  if (error)
    return (
      <EmptyState
        compact
        icon={Activity}
        title="History unavailable"
        description={error}
      />
    );

  const readings = unwrapArray(history?.readings);
  const labels: string[] =
    history?.labels ??
    readings.map((reading: any) =>
      new Date(
        reading.recordedAt ?? reading.at ?? reading.timestamp,
      ).toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  const returnedSeries: any[] = Array.isArray(history?.series)
    ? history.series
    : [];
  const series = returnedSeries.length
    ? returnedSeries
    : readings.length
      ? [
          {
            label: "Temperature",
            data: readings.map((reading: any) =>
              Number(
                reading.celsius ?? reading.temperatureC ?? reading.temperature,
              ),
            ),
          },
        ]
      : [];

  if (loading || history === null)
    return (
      <EmptyState
        compact
        icon={Activity}
        title="Loading history"
        description="Fetching recorded readings for the last 24 hours."
      />
    );

  if (!labels.length || !series.some((item) => item.data?.length))
    return (
      <EmptyState
        compact
        icon={Activity}
        title="No readings yet"
        description="Temperature history will appear here when readings have been recorded."
      />
    );

  return (
    <Line
      data={{
        labels,
        datasets: series.map((item, index) => ({
          label: item.label ?? `Unit ${index + 1}`,
          data: item.data,
          borderColor: [P, AC, OK, WN, ER][index % 5],
          backgroundColor: `${[P, AC, OK, WN, ER][index % 5]}18`,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 2,
          fill: false,
        })),
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: series.length > 1, position: "bottom" } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: GM, font: { size: 10 }, maxTicksLimit: 8 },
          },
          y: {
            grid: { color: GL },
            ticks: {
              color: GM,
              font: { size: 10 },
              callback: (value) => `${value}°C`,
            },
            min: 0,
            max: 14,
          },
        },
      }}
    />
  );
}

/** Line chart: Biologic Inventory, Network Wide (dashboard) */
export function InventoryChart() {
  const { P, GL, GM } = useChartTheme();
  const [points, setPoints] = useState<Array<{ label: string; vials: number }>>(
    [],
  );
  useEffect(() => {
    void DASHBOARD_SERVICE.charts().then((response) => {
      const data = response.data as any;
      if (response.success)
        setPoints(
          unwrapArray(data?.inventoryOverTime ?? data)
            .map((point) => ({
              label: point.label,
              vials: Number(point.vials ?? point.qty ?? Number.NaN),
            }))
            .filter((row) => Number.isFinite(row.vials)),
        );
    });
  }, []);
  if (!points.length)
    return (
      <EmptyState
        compact
        icon={ChartColumn}
        title="No inventory trend yet"
        description="This chart will fill in when inventory history is available."
      />
    );
  return (
    <Line
      data={{
        labels: points.map((point) => point.label),
        datasets: [
          {
            label: "Inventory",
            data: points.map((point) => point.vials),
            borderColor: P,
            backgroundColor: `${P}18`,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: P,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: GM, font: { size: 11 } },
          },
          y: {
            grid: { color: GL },
            ticks: {
              color: GM,
              font: { size: 11 },
              callback: (v) => `${v} vials`,
            },
          },
        },
      }}
    />
  );
}

/** Doughnut chart: Drug Availability Split (dashboard) */
export function DrugSplitChart() {
  const { P } = useChartTheme();
  const [split, setSplit] = useState<Array<{ drug: string; pct: number }>>([]);
  useEffect(() => {
    void DASHBOARD_SERVICE.charts().then((response) => {
      const data = response.data as any;
      if (response.success)
        setSplit(
          unwrapArray(data?.drugSplit)
            .map((row) => ({
              drug: row.drug,
              pct: Number(row.pct ?? Number.NaN),
            }))
            .filter((row) => Number.isFinite(row.pct)),
        );
    });
  }, []);
  if (!split.length)
    return (
      <EmptyState
        compact
        icon={ChartPie}
        title="No availability mix yet"
        description="Medicine shares will appear after the catalog and stock data are linked."
      />
    );
  return (
    <Doughnut
      data={{
        labels: split.map((row) => row.drug),
        datasets: [
          {
            data: split.map((row) => row.pct),
            backgroundColor: [P, AC, OK, WN, ER],
            borderWidth: 3,
            borderColor: "#fff",
            hoverOffset: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: true, position: "bottom" },
        },
      }}
    />
  );
}

/** Horizontal bar chart: Network Redistribution Efficiency (dashboard) */
export function RedistributionEfficiencyChart() {
  const { P, GL, GM, G7 } = useChartTheme();
  const [efficiency, setEfficiency] = useState<
    Array<{ label: string; days: number }>
  >([]);
  useEffect(() => {
    void DASHBOARD_SERVICE.charts().then((response) => {
      const data = response.data as any;
      if (response.success)
        setEfficiency(
          unwrapArray(data?.redistributionEfficiency)
            .map((row) => ({
              label: row.label,
              days: Number(row.days ?? Number.NaN),
            }))
            .filter((row) => Number.isFinite(row.days)),
        );
    });
  }, []);
  if (!efficiency.length)
    return (
      <EmptyState
        compact
        icon={Activity}
        title="No transfer trend yet"
        description="Completed transfer records will power this trend."
      />
    );
  return (
    <Bar
      data={{
        labels: efficiency.map((row) => row.label),
        datasets: [
          {
            label: "Avg Days",
            data: efficiency.map((row) => row.days),
            backgroundColor: P,
            borderRadius: 4,
            barThickness: 12,
          },
          {
            label: "Target",
            data: efficiency.map(() => 2),
            backgroundColor: `${AC}20`,
            borderColor: AC,
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 12,
          },
        ],
      }}
      options={{
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: GL },
            ticks: { color: GM, font: { size: 11 }, callback: (v) => `${v}d` },
            max: 4,
          },
          y: {
            grid: { display: false },
            ticks: { color: G7, font: { size: 11, weight: 500 } },
          },
        },
      }}
    />
  );
}

/** Horizontal bar chart: current therapeutic stock from the dashboard API. */
export function TherapeuticStockChart() {
  const { P, GL, GM, G7 } = useChartTheme();
  const [stock, setStock] = useState<Array<{ drug: string; qty: number }>>([]);
  useEffect(() => {
    void DASHBOARD_SERVICE.charts().then((response) => {
      const data = response.data as any;
      if (response.success)
        setStock(
          unwrapArray(data?.therapeuticStock)
            .map((row) => ({
              drug: row.drug,
              qty: Number(row.qty ?? Number.NaN),
            }))
            .filter((row) => Number.isFinite(row.qty)),
        );
    });
  }, []);
  if (!stock.length)
    return (
      <EmptyState
        compact
        icon={Package}
        title="No stock quantities yet"
        description="Therapeutic stock appears when inventory has been recorded."
      />
    );
  return (
    <Bar
      data={{
        labels: stock.map((row) => row.drug),
        datasets: [
          {
            label: "Units in stock",
            data: stock.map((row) => row.qty),
            backgroundColor: P,
            borderRadius: 4,
            barThickness: 16,
          },
        ],
      }}
      options={{
        indexAxis: "y" as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: GL }, ticks: { color: GM, font: { size: 10 } } },
          y: {
            grid: { display: false },
            ticks: { color: G7, font: { size: 11 } },
          },
        },
      }}
    />
  );
}

/** Bar chart: Monthly GS1 Scans (scan page) */
export function MonthlyScansChart() {
  const { P, GM } = useChartTheme();
  const [months, setMonths] = useState<Array<{ month: string; count: number }>>(
    [],
  );
  useEffect(() => {
    void SCAN_SERVICE.monthly().then((response) => {
      if (response.success)
        setMonths(
          unwrapArray(response.data)
            .map((row) => ({
              month: row.month,
              count: Number(row.count ?? Number.NaN),
            }))
            .filter((row) => Number.isFinite(row.count)),
        );
    });
  }, []);
  return (
    <Bar
      data={{
        labels: months.map((row) => row.month),
        datasets: [
          {
            data: months.map((row) => row.count),
            backgroundColor: [
              `${P}88`,
              `${P}88`,
              `${P}88`,
              `${P}88`,
              `${P}88`,
              P,
            ],
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: GM, font: { size: 10 } },
          },
          y: { display: false },
        },
      }}
    />
  );
}
