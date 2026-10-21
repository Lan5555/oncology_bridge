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
import { type ReactNode, useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import DashboardChartState from "@/app/components/DashboardChartState";
import EmptyState from "@/app/components/EmptyState";
import { useDashboardChartSeries } from "@/app/hooks/useDashboardChartSeries";
import { unitLabel, unitSeries } from "@/app/lib/dashboard-chart-data";
import { useProvider } from "@/app/providers/provider";
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

type DashboardChartProps = { refreshKey?: number };

function UnitChartFrame({
  units,
  selected,
  onSelect,
  asOf,
  children,
}: {
  units: string[];
  selected: string;
  onSelect: (unit: string) => void;
  asOf?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <label className="m-0 flex items-center gap-2 text-[10px] text-g500">
          Selling unit
          <select
            aria-label="Chart selling unit"
            value={selected}
            onChange={(event) => onSelect(event.target.value)}
            className="w-auto rounded-lg border border-g200 bg-w px-2 py-1 text-[11px] text-g700"
          >
            {(units.length ? units : [selected]).map((unit) => (
              <option key={unit} value={unit}>
                {unitLabel(unit)}
              </option>
            ))}
          </select>
        </label>
        {asOf && Number.isFinite(Date.parse(asOf)) && (
          <time
            dateTime={asOf}
            className="text-[9px] text-g400"
            title={new Date(asOf).toLocaleString("en-NG")}
          >
            As of{" "}
            {new Date(asOf).toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        )}
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function InventoryChart({ refreshKey = 0 }: DashboardChartProps = {}) {
  const { P, GL, GM } = useChartTheme();
  const { rows, loading, error, retry, asOf } = useDashboardChartSeries(
    "inventoryOverTime",
    refreshKey,
  );
  const [preferred, setPreferred] = useState("vial");
  const series = unitSeries(rows, preferred, true);
  if (loading || error)
    return (
      <DashboardChartState loading={loading} error={error} onRetry={retry} />
    );
  if (!rows.length)
    return (
      <EmptyState
        compact
        icon={ChartColumn}
        title="No available stock yet"
        description="Eligible stock will appear by the month it was added. This view shows current remaining stock, not past month-end balances."
      />
    );
  return (
    <UnitChartFrame
      units={series.units}
      selected={series.selected}
      onSelect={setPreferred}
      asOf={asOf}
    >
      <Bar
        data={{
          labels: series.rows.map((row) => row.label),
          datasets: [
            {
              label: unitLabel(series.selected),
              data: series.rows.map((row) => row.value),
              backgroundColor: P,
              borderRadius: 5,
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
            y: {
              beginAtZero: true,
              grid: { color: GL },
              ticks: { color: GM, precision: 0 },
            },
          },
        }}
      />
    </UnitChartFrame>
  );
}

export function DrugSplitChart({ refreshKey = 0 }: DashboardChartProps = {}) {
  const { P } = useChartTheme();
  const { rows, loading, error, retry, asOf } = useDashboardChartSeries(
    "drugSplit",
    refreshKey,
  );
  const [preferred, setPreferred] = useState("vial");
  const series = unitSeries(rows, preferred);
  if (loading || error)
    return (
      <DashboardChartState loading={loading} error={error} onRetry={retry} />
    );
  if (!rows.some((row) => row.value > 0))
    return (
      <EmptyState
        compact
        icon={ChartPie}
        title="No medicine mix to show"
        description="Available stock will appear here, with separate percentages for each selling unit."
      />
    );
  return (
    <UnitChartFrame
      units={series.units}
      selected={series.selected}
      onSelect={setPreferred}
      asOf={asOf}
    >
      <Doughnut
        data={{
          labels: series.rows.map((row) => row.label),
          datasets: [
            {
              data: series.rows.map((row) => row.value),
              backgroundColor: [P, AC, OK, WN, ER],
              borderWidth: 2,
              hoverOffset: 3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 9, font: { size: 10 } },
            },
            tooltip: {
              callbacks: {
                label: (item) =>
                  `${item.label}: ${item.parsed}% (${unitLabel(series.selected)})`,
              },
            },
          },
        }}
      />
    </UnitChartFrame>
  );
}

export function RedistributionEfficiencyChart({
  refreshKey = 0,
}: DashboardChartProps = {}) {
  const { rows, loading, error, retry, asOf } = useDashboardChartSeries(
    "redistributionEfficiency",
    refreshKey,
  );
  if (loading || error)
    return (
      <DashboardChartState loading={loading} error={error} onRetry={retry} />
    );
  if (!rows.length)
    return (
      <EmptyState
        compact
        icon={Activity}
        title="No completed redistributions yet"
        description="Delivered stock transfers will appear here with their original quantities and selling units."
      />
    );
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <p className="shrink-0 text-[11px] text-g500">
        Delivered transfers. Delivery duration is not recorded.
      </p>
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-g200">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left">Transfer</th>
              <th className="text-right">Quantity</th>
              <th className="text-left">Selling unit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? `${row.label}-${index}`}>
                <td>{row.label}</td>
                <td className="text-right font-semibold">
                  {row.value.toLocaleString()}
                </td>
                <td>{unitLabel(row.unit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {asOf && Number.isFinite(Date.parse(asOf)) && (
        <time dateTime={asOf} className="text-[9px] text-g400">
          As of {new Date(asOf).toLocaleString("en-NG")}
        </time>
      )}
    </div>
  );
}

export function TherapeuticStockChart({
  refreshKey = 0,
}: DashboardChartProps = {}) {
  const { P, GL, GM, G7 } = useChartTheme();
  const { rows, loading, error, retry, asOf } = useDashboardChartSeries(
    "therapeuticStock",
    refreshKey,
  );
  const [preferred, setPreferred] = useState("vial");
  const series = unitSeries(rows, preferred);
  if (loading || error)
    return (
      <DashboardChartState loading={loading} error={error} onRetry={retry} />
    );
  if (!rows.length)
    return (
      <EmptyState
        compact
        icon={Package}
        title="No stock to display"
        description="Add eligible medicine batches in Inventory to see available quantities, separated by selling unit."
      />
    );
  return (
    <UnitChartFrame
      units={series.units}
      selected={series.selected}
      onSelect={setPreferred}
      asOf={asOf}
    >
      <Bar
        data={{
          labels: series.rows.map((row) => row.label),
          datasets: [
            {
              label: unitLabel(series.selected),
              data: series.rows.map((row) => row.value),
              backgroundColor: P,
              borderRadius: 4,
              maxBarThickness: 20,
            },
          ],
        }}
        options={{
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: GL },
              ticks: { color: GM, precision: 0 },
            },
            y: {
              grid: { display: false },
              ticks: { color: G7, font: { size: 11 } },
            },
          },
        }}
      />
    </UnitChartFrame>
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
