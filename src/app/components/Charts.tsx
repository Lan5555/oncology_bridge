'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
} from 'chart.js/auto';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip
);

const P = '#0891B2';
const AC = '#0D9488';
const OK = '#059669';
const WN = '#F59E0B';
const ER = '#EF4444';
const GL = '#F1F5F9';
const GM = '#94A3B8';
const G7 = '#334155';
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/** Line chart: Biologic Inventory — Network Wide (dashboard) */
export function InventoryChart() {
  return (
    <Line
      data={{
        labels: MO,
        datasets: [
          {
            label: 'Trastuzumab',
            data: [210, 280, 320, 290, 340, 312],
            borderColor: P,
            backgroundColor: `${P}18`,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: P,
          },
          {
            label: 'Rituximab',
            data: [150, 180, 210, 195, 240, 226],
            borderColor: AC,
            backgroundColor: `${AC}10`,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: AC,
            borderDash: [5, 5],
          },
          {
            label: 'Bevacizumab',
            data: [90, 110, 140, 125, 165, 158],
            borderColor: OK,
            backgroundColor: `${OK}10`,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: OK,
            borderDash: [2, 2],
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: GM, font: { size: 11 } } },
          y: {
            grid: { color: GL },
            ticks: { color: GM, font: { size: 11 }, callback: (v) => `${v} vials` },
          },
        },
      }}
    />
  );
}

/** Doughnut chart: Drug Availability Split (dashboard) */
export function DrugSplitChart() {
  return (
    <Doughnut
      data={{
        labels: ['Trastuzumab', 'Rituximab', 'Bevacizumab', 'Other'],
        datasets: [
          {
            data: [38, 27, 19, 16],
            backgroundColor: [P, AC, OK, WN],
            borderWidth: 3,
            borderColor: '#fff',
            hoverOffset: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend: { display: false } },
      }}
    />
  );
}

/** Horizontal bar chart: Network Redistribution Efficiency (dashboard) */
export function RedistributionEfficiencyChart() {
  return (
    <Bar
      data={{
        labels: ['LUTH', 'EKO Hospital', 'UCH Ibadan', 'LASUTH', 'Lagos Island GH', 'Lagos State Hosp'],
        datasets: [
          {
            label: 'Avg Days',
            data: [1.2, 2.4, 1.8, 3.1, 0.9, 2.1],
            backgroundColor: P,
            borderRadius: 4,
            barThickness: 12,
          },
          {
            label: 'Target',
            data: [2, 2, 2, 2, 2, 2],
            backgroundColor: `${AC}20`,
            borderColor: AC,
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 12,
          },
        ],
      }}
      options={{
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: GL },
            ticks: { color: GM, font: { size: 11 }, callback: (v) => `${v}d` },
            max: 4,
          },
          y: { grid: { display: false }, ticks: { color: G7, font: { size: 11, weight: 500 } } },
        },
      }}
    />
  );
}

/** Bar chart: Monthly GS1 Scans (scan page) */
export function MonthlyScansChart() {
  return (
    <Bar
      data={{
        labels: MO,
        datasets: [
          {
            data: [184, 210, 248, 290, 320, 310],
            backgroundColor: [`${P}88`, `${P}88`, `${P}88`, `${P}88`, `${P}88`, P],
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
          x: { grid: { display: false }, ticks: { color: GM, font: { size: 10 } } },
          y: { display: false },
        },
      }}
    />
  );
}

/** Line chart: Temperature History — 24 Hours (cold chain page) */
export function TemperatureHistoryChart() {
  const hrs = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00'];
  return (
    <Line
      data={{
        labels: hrs,
        datasets: [
          {
            label: 'LUTH',
            data: [4.1, 4.0, 4.2, 4.3, 4.1, 4.2, 4.0, 4.2],
            borderColor: OK,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2,
            fill: false,
          },
          {
            label: 'EKO',
            data: [3.8, 3.9, 3.8, 3.7, 3.9, 3.8, 3.8, 3.8],
            borderColor: P,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2,
            fill: false,
          },
          {
            label: 'Transit T-07',
            data: [4.0, 4.1, 4.2, 4.5, 6.1, 11.2, 11.2, 11.2],
            borderColor: ER,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 3,
            fill: false,
            borderDash: [4, 3],
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: GM, font: { size: 10 } } },
          y: {
            grid: { color: GL },
            ticks: { color: GM, font: { size: 10 }, callback: (v) => `${v}°C` },
            min: 0,
            max: 14,
          },
        },
      }}
    />
  );
}
