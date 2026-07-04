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
    <div className="page active">
      <div className="ph">
        <div className="ph-left">
          <h1>Inventory Ledger</h1>
          <p>GS1-verified stock across all network facilities</p>
        </div>
        <div className="ph-actions">
          <button type="button" className="btn btn-outline">
            <svg viewBox="0 0 24 24" role="img" aria-label="Export CSV">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary"
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
        className="stat-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}
      >
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-lbl">Total Vials</span>
            <div className="stat-ico b">
              <svg viewBox="0 0 24 24" role="img" aria-label="Vials">
                <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
          <div className="stat-val">829</div>
          <div className="stat-delta up">
            <svg viewBox="0 0 24 24" role="img" aria-label="Increase">
              <polyline points="18,15 12,9 6,15" />
            </svg>
            +42 today
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-lbl">Verified GS1</span>
            <div className="stat-ico g">
              <svg viewBox="0 0 24 24" role="img" aria-label="Verified">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
          </div>
          <div className="stat-val">821</div>
          <div className="stat-delta up">
            <svg viewBox="0 0 24 24" role="img" aria-label="Increase">
              <polyline points="18,15 12,9 6,15" />
            </svg>
            99.0% of stock
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-lbl">Near Expiry</span>
            <div className="stat-ico a">
              <svg viewBox="0 0 24 24" role="img" aria-label="Clock">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
          </div>
          <div className="stat-val">7</div>
          <div className="stat-delta neutral">&lt;60 days remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-lbl">Quarantined</span>
            <div className="stat-ico r">
              <svg viewBox="0 0 24 24" role="img" aria-label="Shield">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className="stat-val">1</div>
          <div className="stat-delta down">
            <svg viewBox="0 0 24 24" role="img" aria-label="Drop">
              <polyline points="6,9 12,15 18,9" />
            </svg>
            Temp breach T-07
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
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
        <div className="tbl-wrap">
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
                    <div className="drug-name">{row.drug}</div>
                    <div className="drug-meta">{row.gtin}</div>
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
