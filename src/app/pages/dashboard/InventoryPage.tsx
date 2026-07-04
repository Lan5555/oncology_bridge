import { useState } from "react";
import type { ModalId, PageId } from "../../lib/types";

interface InventoryPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

const INVENTORY_RECORDS = [
  {
    id: "1",
    drug: "Trastuzumab",
    gtin: "GTIN 0304817892",
    lot: "TZ-2204-B",
    facility: "LUTH",
    qty: 8,
    expiry: "Aug 3, 2026",
    temp: "2°C–8°C ✓",
    status: "Near Expiry",
    statusStyle: "a",
    actionLabel: "Transfer",
    actionClass: "btn-ghost",
    category: "expiry",
  },
  {
    id: "2",
    drug: "Rituximab",
    gtin: "GTIN 0812944031",
    lot: "RX-0912-A",
    facility: "EKO Hospital",
    qty: 5,
    expiry: "Jul 28, 2026",
    temp: "2°C–8°C ✓",
    status: "Critical Expiry",
    statusStyle: "r",
    actionLabel: "Redistribute",
    actionClass: "btn-primary",
    category: "expiry",
  },
  {
    id: "3",
    drug: "Bevacizumab",
    gtin: "GTIN 0519273447",
    lot: "BV-1103-C",
    facility: "UCH Ibadan",
    qty: 12,
    expiry: "Sep 12, 2026",
    temp: "2°C–8°C ✓",
    status: "Near Expiry",
    statusStyle: "a",
    actionLabel: "Transfer",
    actionClass: "btn-ghost",
    category: "expiry",
  },
  {
    id: "4",
    drug: "Trastuzumab",
    gtin: "GTIN 0304817893",
    lot: "TZ-2211-A",
    facility: "Lagos Island GH",
    qty: 20,
    expiry: "Jan 15, 2027",
    temp: "2°C–8°C ✓",
    status: "In Stock",
    statusStyle: "g",
    actionLabel: "View",
    actionClass: "btn-ghost",
    category: "all",
  },
  {
    id: "5",
    drug: "Pertuzumab",
    gtin: "GTIN 0321847920",
    lot: "PT-0707-D",
    facility: "Lagos Island GH",
    qty: 3,
    expiry: "Sep 5, 2026",
    temp: "2°C–8°C ✓",
    status: "Near Expiry",
    statusStyle: "a",
    actionLabel: "Transfer",
    actionClass: "btn-ghost",
    category: "expiry",
  },
  {
    id: "6",
    drug: "Rituximab",
    gtin: "GTIN 0812945002",
    lot: "RX-1044-E",
    facility: "LASUTH",
    qty: 7,
    expiry: "Jul 22, 2026",
    temp: "Breach — 11.2°C",
    status: "Quarantined",
    statusStyle: "r",
    actionLabel: "Inspect",
    actionClass: "btn-danger",
    category: "quarantine",
  },
  {
    id: "7",
    drug: "Cetuximab",
    gtin: "GTIN 0621847001",
    lot: "CE-0310-B",
    facility: "LUTH",
    qty: 9,
    expiry: "Mar 20, 2027",
    temp: "2°C–8°C ✓",
    status: "In Stock",
    statusStyle: "g",
    actionLabel: "View",
    actionClass: "btn-ghost",
    category: "all",
  },
  {
    id: "8",
    drug: "Bevacizumab",
    gtin: "GTIN 0519273448",
    lot: "BV-1210-F",
    facility: "UCH Ibadan",
    qty: 15,
    expiry: "Feb 8, 2027",
    temp: "2°C–8°C ✓",
    status: "In Stock",
    statusStyle: "g",
    actionLabel: "View",
    actionClass: "btn-ghost",
    category: "all",
  },
];

const TAB_OPTIONS = [
  { id: "all", label: "All Stock" },
  { id: "expiry", label: "Near Expiry" },
  { id: "quarantine", label: "Quarantined" },
  { id: "redistributed", label: "Redistributed" },
];

const InventoryPage: React.FC<InventoryPageProps> = ({ onNav }) => {
  const [activeTab, setActiveTab] = useState("all");
  const visibleRows = INVENTORY_RECORDS.filter((record) =>
    activeTab === "all"
      ? true
      : activeTab === "redistributed"
        ? record.category === "all"
        : record.category === activeTab,
  );

  return (
    <div className="block active">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:gap-4">
        <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_p]:mt-1 [&_p]:text-[12.5px] [&_p]:text-slate-500">
          <h1>Inventory Ledger</h1>
          <p>GS1-verified stock across all network facilities</p>
        </div>
        <div className="flex flex-wrap gap-2 max-[768px]:w-full [&_.btn]:max-[768px]:w-full [&_.btn]:max-[768px]:justify-center">
          <button type="button" className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 border-slate-200 bg-white text-slate-700 hover:border-blue-800 hover:text-blue-800">
            <svg viewBox="0 0 24 24" role="img" aria-label="Export CSV">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-3.5 py-2 text-[12.5px] font-semibold transition max-[768px]:w-full max-[768px]:justify-center [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-800 text-white hover:bg-blue-900"
            onClick={() => onNav("pg-scan")}
          >
            <svg viewBox="0 0 24 24" role="img" aria-label="Log New Stock">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log New Stock
          </button>
        </div>
      </div>

      <div
        className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 max-[768px]:grid-cols-1"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}
      >
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Vials</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-blue-100 text-blue-900">
              <svg viewBox="0 0 24 24" role="img" aria-label="Vials">
                <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-950">829</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <svg viewBox="0 0 24 24" role="img" aria-label="Increase">
              <polyline points="18,15 12,9 6,15" />
            </svg>
            +42 today
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Verified GS1</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-emerald-50 text-emerald-700">
              <svg viewBox="0 0 24 24" role="img" aria-label="Verified">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-950">821</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <svg viewBox="0 0 24 24" role="img" aria-label="Increase">
              <polyline points="18,15 12,9 6,15" />
            </svg>
            99.0% of stock
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Near Expiry</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-amber-50 text-amber-700">
              <svg viewBox="0 0 24 24" role="img" aria-label="Clock">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-950">7</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">&lt;60 days remaining</div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Quarantined</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-red-50 text-red-700">
              <svg viewBox="0 0 24 24" role="img" aria-label="Shield">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-950">1</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
            <svg viewBox="0 0 24 24" role="img" aria-label="Drop">
              <polyline points="6,9 12,15 18,9" />
            </svg>
            Temp breach T-07
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-5 flex gap-2 overflow-x-auto rounded-full bg-slate-100 p-1">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn${activeTab === tab.id ? " on" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-900/10 [&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-[13px] [&_th]:whitespace-nowrap [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.5px] [&_th]:text-slate-400 [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-4 [&_td]:py-3.5 [&_td]:align-middle [&_td]:text-slate-700 [&_tr:hover_td]:bg-slate-100 [&_tr:last-child_td]:border-b-0">
          <table>
            <thead>
              <tr>
                <th>Drug / GTIN</th>
                <th>Lot Number</th>
                <th>Facility</th>
                <th>Qty</th>
                <th>Expiry Date</th>
                <th>Temp Status</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Drug / GTIN">
                    <div className="text-[13px] font-bold text-slate-950">{row.drug}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{row.gtin}</div>
                  </td>
                  <td
                    data-label="Lot Number"
                    style={{ fontFamily: "monospace", fontSize: "12px" }}
                  >
                    {row.lot}
                  </td>
                  <td data-label="Facility">{row.facility}</td>
                  <td data-label="Qty">
                    <strong>{row.qty}</strong>
                  </td>
                  <td data-label="Expiry Date">{row.expiry}</td>
                  <td data-label="Temp Status">
                    <span className={`badge ${row.statusStyle}`}>
                      {row.temp}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${row.statusStyle}`}>
                      {row.status}
                    </span>
                  </td>
                  <td data-label="Actions" style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className={`btn ${row.actionClass}`}
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                    >
                      {row.actionLabel}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
