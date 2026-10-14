import { type FormEvent, useEffect, useState } from "react";
import type { ModalId, PageId } from "../../lib/types";
import type { InventoryRecord } from "@/app/services/bridge-data/bridge-data-service";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { unwrapArray } from "@/app/services/response-utils";
import { useProvider } from "@/app/providers/provider";
import { Boxes } from "lucide-react";

interface InventoryPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

const TAB_OPTIONS = [
  { id: "all", label: "All Stock" },
  { id: "expiry", label: "Near Expiry" },
  { id: "quarantine", label: "Quarantined" },
  { id: "redistributed", label: "Redistributed" },
];

const InventoryPage: React.FC<InventoryPageProps> = ({ onNav }) => {
  const { userData } = useProvider();
  const [activeTab, setActiveTab] = useState("all");
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(
    [],
  );
  const [inventoryStats, setInventoryStats] = useState({
    totalVials: 0,
    gs1VerifiedPct: 0,
    nearExpiry: 0,
    quarantined: 0,
  });
  const [drugName, setDrugName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [intakeStatus, setIntakeStatus] = useState("");
  const loadInventory = async () => {
    const response = await INVENTORY_SERVICE.list(
      `category=${encodeURIComponent(activeTab)}&page=1&limit=100`,
    );
    if (!response.success) {
      setIntakeStatus(response.message || "Inventory could not be loaded.");
      return;
    }
    const result = response.data as any;
    const rows = unwrapArray(result?.items ? result.items : result);
    setInventoryRecords(
      rows.map((item: any) => {
        const status = item.status ?? "In Stock";
        const quarantine = status.toLowerCase().includes("quarantin");
        const expiry =
          status.toLowerCase().includes("expir") || item.category === "expiry";
        const style = quarantine
          ? "bg-errl text-[#7f1d1d]"
          : expiry
            ? "bg-warnl text-[#78350f]"
            : "bg-okl text-[#065f46]";
        return {
          id: item.id,
          drug: item.drug ?? item.medicine?.generic_name ?? "—",
          gtin: item.gtin ?? "—",
          lot: item.lot ?? item.batchNumber ?? "—",
          facility: item.facility?.name ?? item.facility ?? "—",
          qty: item.qty ?? item.quantity ?? 0,
          expiry: item.expiry
            ? new Date(item.expiry).toLocaleDateString("en-NG", {
                dateStyle: "medium",
              })
            : "—",
          temp: item.tempC == null ? "Not recorded" : `${item.tempC}°C`,
          status,
          statusStyle: style,
          actionLabel: quarantine ? "Dispose" : "Quarantine",
          actionClass: quarantine
            ? "bg-errl text-[#991b1b] border border-[#fecaca]"
            : "bg-transparent text-g600 border border-g200 hover:bg-g50",
          category:
            item.category ??
            (expiry ? "expiry" : quarantine ? "quarantine" : "all"),
        };
      }),
    );
    if (result?.stats)
      setInventoryStats({
        totalVials: result.stats.totalVials ?? 0,
        gs1VerifiedPct: result.stats.gs1VerifiedPct ?? 0,
        nearExpiry: result.stats.nearExpiry ?? 0,
        quarantined: result.stats.quarantined ?? 0,
      });
  };
  useEffect(() => {
    void loadInventory();
  }, [activeTab]);

  const addBatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (
      !drugName.trim() ||
      !batchNumber.trim() ||
      !expiryDate ||
      parsedQuantity < 1
    )
      return;
    const response = await INVENTORY_SERVICE.create({
      drug: drugName.trim(),
      batchNumber: batchNumber.trim(),
      expiry: expiryDate,
      quantity: parsedQuantity,
      facilityId: userData.user?.hospital?.id,
    });
    setIntakeStatus(
      response.success
        ? response.message || "Batch added to inventory."
        : response.message || "Batch could not be added.",
    );
    if (response.success) {
      setDrugName("");
      setBatchNumber("");
      setExpiryDate("");
      setQuantity("");
      await loadInventory();
    }
  };
  const visibleRows = inventoryRecords.filter((record) =>
    activeTab === "all"
      ? true
      : activeTab === "redistributed"
        ? record.category === "all"
        : record.category === activeTab,
  );

  return (
    <div className="block animate-fade-up">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm max-md:flex-col max-md:items-stretch max-md:gap-4">
        <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]">
          <h1 className="flex items-center gap-2">
            <Boxes className="size-5 text-p" aria-hidden="true" />
            Inventory Ledger
          </h1>
          <p>GS1-verified stock across all network facilities</p>
        </div>
        <div className="flex gap-2 flex-wrap max-md:w-full max-md:justify-start">
          <button
            type="button"
            onClick={() =>
              void INVENTORY_SERVICE.exportCsv().then((response) => {
                const value = (response.data as any)?.csv ?? response.data;
                if (!response.success || !value) {
                  setIntakeStatus(
                    response.message || "CSV export could not be generated.",
                  );
                  return;
                }
                const blob = new Blob(
                  [typeof value === "string" ? value : JSON.stringify(value)],
                  { type: "text/csv" },
                );
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "inventory.csv";
                link.click();
                URL.revokeObjectURL(link.href);
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-w text-g700 border border-g200 hover:border-p hover:text-p"
          >
            <svg viewBox="0 0 24 24" role="img" aria-label="Export CSV">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd"
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

      <form
        className="mb-6 grid grid-cols-[1.2fr_1fr_1fr_120px_auto] items-end gap-3 rounded-xl border border-g200 bg-w p-5 max-xl:grid-cols-2 max-md:grid-cols-1"
        onSubmit={(event: FormEvent<HTMLFormElement>) => void addBatch(event)}
      >
        <div>
          <label htmlFor="intake-drug">Drug name</label>
          <input
            className="rounded-lg border border-g200 px-3 py-2.5 text-sm"
            id="intake-drug"
            onChange={(event) => setDrugName(event.target.value)}
            required
            value={drugName}
          />
        </div>
        <div>
          <label htmlFor="intake-batch">Batch number</label>
          <input
            className="rounded-lg border border-g200 px-3 py-2.5 text-sm"
            id="intake-batch"
            onChange={(event) => setBatchNumber(event.target.value)}
            required
            value={batchNumber}
          />
        </div>
        <div>
          <label htmlFor="intake-expiry">Expiration date</label>
          <input
            className="rounded-lg border border-g200 px-3 py-2.5 text-sm"
            id="intake-expiry"
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setExpiryDate(event.target.value)}
            required
            type="date"
            value={expiryDate}
          />
        </div>
        <div>
          <label htmlFor="intake-quantity">Quantity</label>
          <input
            className="rounded-lg border border-g200 px-3 py-2.5 text-sm"
            id="intake-quantity"
            min="1"
            onChange={(event) => setQuantity(event.target.value)}
            required
            type="number"
            value={quantity}
          />
        </div>
        <button
          className="rounded-lg bg-p px-4 py-2.5 text-sm font-semibold text-white hover:bg-pd"
          type="submit"
        >
          Add batch
        </button>
        <p aria-live="polite" className="col-span-full text-xs text-g500">
          {intakeStatus || "Manual entries are saved to the inventory service."}
        </p>
      </form>

      <div
        className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[0.9rem] mb-6 max-md:grid-cols-1"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}
      >
        <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">
              Total Vials
            </span>
            <div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-pl text-pd">
              <svg viewBox="0 0 24 24" role="img" aria-label="Vials">
                <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">
            {inventoryStats.totalVials.toLocaleString()}
          </div>
          <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-good">
            <svg viewBox="0 0 24 24" role="img" aria-label="Increase">
              <polyline points="18,15 12,9 6,15" />
            </svg>
            +42 today
          </div>
        </div>
        <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">
              Verified GS1
            </span>
            <div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-okl text-good">
              <svg viewBox="0 0 24 24" role="img" aria-label="Verified">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">
            {inventoryStats.gs1VerifiedPct}%
          </div>
          <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-good">
            <svg viewBox="0 0 24 24" role="img" aria-label="Increase">
              <polyline points="18,15 12,9 6,15" />
            </svg>
            GS1 verified
          </div>
        </div>
        <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">
              Near Expiry
            </span>
            <div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-warnl text-warn">
              <svg viewBox="0 0 24 24" role="img" aria-label="Clock">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">
            {inventoryStats.nearExpiry}
          </div>
          <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-warn">
            &lt;60 days remaining
          </div>
        </div>
        <div className="bg-w border border-g200 rounded-xl p-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-default relative overflow-hidden z-[1] hover:-translate-y-1 hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.1)] hover:border-p before:content-[''] before:absolute before:-top-[20%] before:-right-[10%] before:size-[100px] before:bg-current before:opacity-[0.03] before:rounded-full before:-z-1">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-semibold text-g400 uppercase tracking-[0.5px]">
              Quarantined
            </span>
            <div className="size-8 rounded-lg flex items-center justify-center [&_svg]:size-[16px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 bg-errl text-err">
              <svg viewBox="0 0 24 24" role="img" aria-label="Shield">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className="text-[28px] font-extrabold text-g900 tracking-[-1px] leading-none mb-2 flex items-baseline gap-1">
            {inventoryStats.quarantined}
          </div>
          <div className="flex items-center gap-[3px] text-[11.5px] font-medium [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5] text-err">
            <svg viewBox="0 0 24 24" role="img" aria-label="Drop">
              <polyline points="6,9 12,15 18,9" />
            </svg>
            Temp breach T-07
          </div>
        </div>
      </div>

      <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
        <div className="flex flex-wrap border-b border-g200 rounded-full bg-g50 p-1 gap-2 overflow-x-auto mb-5 max-[520px]:p-1.5 max-[520px]:gap-[0.4rem]">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-[12.5px] font-semibold cursor-pointer rounded-full transition duration-[180ms] whitespace-nowrap max-md:flex-1 max-md:text-center max-[520px]:min-w-[120px] max-[520px]:text-xs max-[520px]:px-3${activeTab === tab.id ? " text-w bg-p shadow-[0_10px_25px_rgba(37,99,235,0.18)]" : " text-g500 bg-transparent hover:text-g700 hover:bg-[rgba(15,23,42,0.04)]"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl bg-w border border-g100 shadow-[0_14px_30px_rgba(15,23,42,0.08)] max-lg:block max-lg:w-full max-lg:[&_table]:w-auto max-lg:[&_table]:min-w-[720px] max-lg:[&_th]:whitespace-nowrap max-lg:[&_td]:whitespace-nowrap max-md:[&_table]:w-full max-md:[&_table]:min-w-0 max-md:[&_thead]:hidden max-md:[&_tr]:block max-md:[&_tr]:mb-4 max-md:[&_tr]:border max-md:[&_tr]:border-g200 max-md:[&_tr]:rounded-xl max-md:[&_tr]:overflow-hidden max-md:[&_tr]:bg-w max-md:[&_td]:flex max-md:[&_td]:justify-between max-md:[&_td]:items-start max-md:[&_td]:px-3 max-md:[&_td]:py-2.5 max-md:[&_td]:border-0 max-md:[&_td]:border-b max-md:[&_td]:border-g100 max-md:[&_td]:whitespace-normal max-md:[&_td:last-child]:border-b-0 max-md:[&_td]:before:content-[attr(data-label)] max-md:[&_td]:before:basis-[45%] max-md:[&_td]:before:grow-0 max-md:[&_td]:before:shrink-0 max-md:[&_td]:before:text-[11px] max-md:[&_td]:before:font-bold max-md:[&_td]:before:text-g500 max-md:[&_td]:before:mr-2.5 max-md:[&_td]:before:whitespace-nowrap max-md:[&_td_span.badge]:ml-auto max-[520px]:[&_td]:flex-col max-[520px]:[&_td]:items-start max-[520px]:[&_td]:before:mb-1.5 max-[520px]:[&_td]:before:basis-auto">
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
                    <div className="font-bold text-g900 text-[13px]">
                      {row.drug}
                    </div>
                    <div className="text-[11px] text-g400 mt-0.5">
                      {row.gtin}
                    </div>
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
                    <span
                      className={`inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 ${row.statusStyle}`}
                    >
                      {row.temp}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span
                      className={`inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 ${row.statusStyle}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td data-label="Actions" style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center ${row.actionClass}`}
                      style={{ padding: "4px 8px", fontSize: "11px" }}
                      onClick={() =>
                        void (
                          row.status.toLowerCase().includes("quarantin")
                            ? INVENTORY_SERVICE.dispose(row.id)
                            : INVENTORY_SERVICE.quarantine(row.id)
                        ).then(async (response) => {
                          setIntakeStatus(
                            response.message ||
                              (response.success
                                ? "Inventory status updated."
                                : "The inventory action failed."),
                          );
                          if (response.success) await loadInventory();
                        })
                      }
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
