import { ArrowRight, Boxes, ShoppingBag } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import InventoryEditDialog, {
  type EditableInventoryBatch,
} from "@/app/components/InventoryEditDialog";
import RecordGraph from "@/app/components/RecordGraph";
import StockListingDialog from "@/app/components/StockListingDialog";
import {
  linkedMedicineUnavailable,
  MEDICINE_CATALOGUE_CHANGED,
  medicineUnavailable,
} from "@/app/lib/medicine-availability";
import { notifyResult } from "@/app/lib/notifications";
import { useProvider } from "@/app/providers/provider";
import type { InventoryRecord } from "@/app/services/bridge-data/bridge-data-service";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { MEDICINE_SERVICE } from "@/app/services/medicine-service/medicine-service";
import { unwrapArray } from "@/app/services/response-utils";
import type { ModalId, PageId } from "../../lib/types";

type CatalogueMedicine = {
  id: string;
  generic_name?: string;
  brand_name?: string;
  brand?: string;
  strength?: string;
  dosage_form?: string;
  gtin?: string;
};

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
  const [entryView, setEntryView] = useState<"standard" | "graph">("standard");
  const [graphOpened, setGraphOpened] = useState(false);
  const { userData } = useProvider();
  const canEditStock =
    userData.user?.permissions.includes("inventory.manage") ?? false;
  const [editBatch, setEditBatch] = useState<EditableInventoryBatch | null>(
    null,
  );
  const [editableBatches, setEditableBatches] = useState<
    Record<string, EditableInventoryBatch>
  >({});
  const [listingOpen, setListingOpen] = useState(false);
  const canListStock =
    userData.user?.account_type === "PHARMACY_STORE" &&
    userData.user?.verification_status === "VERIFIED";
  const [activeTab, setActiveTab] = useState("all");
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(
    [],
  );
  const [inventoryStats, setInventoryStats] = useState<
    Record<string, number | null>
  >({});
  const [medicineId, setMedicineId] = useState("");
  const [medicines, setMedicines] = useState<CatalogueMedicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(true);
  const [medicinesError, setMedicinesError] = useState("");
  const [medicinePage, setMedicinePage] = useState(0);
  const [moreMedicines, setMoreMedicines] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingUnit, setSellingUnit] = useState("");
  const [intakeStatus, setIntakeStatus] = useState("");
  const loadMedicines = useCallback(async (page = 1) => {
    setMedicinesLoading(true);
    setMedicinesError("");
    const response = await MEDICINE_SERVICE.list(`page=${page}&limit=100`);
    if (response.success) {
      const data = response.data;
      const rawRows = unwrapArray(data);
      const rows = rawRows.filter(
        (medicine) => !medicineUnavailable(medicine),
      ) as CatalogueMedicine[];
      setMedicines((current) => {
        const combined = page === 1 ? rows : [...current, ...rows];
        return [
          ...new Map(
            combined.map((medicine) => [String(medicine.id), medicine]),
          ).values(),
        ];
      });
      setMedicinePage(page);
      const total = data?.total ?? data?.pagination?.total ?? data?.meta?.total;
      const limit =
        data?.limit ?? data?.pagination?.limit ?? data?.meta?.limit ?? 100;
      setMoreMedicines(
        typeof total === "number" && rawRows.length > 0 && page * limit < total,
      );
    } else {
      setMedicinesError(response.message || "Medicines could not be loaded.");
    }
    setMedicinesLoading(false);
  }, []);
  useEffect(() => {
    void loadMedicines();
  }, [loadMedicines]);
  const loadInventory = useCallback(async () => {
    setInventoryStats({});
    const response = await INVENTORY_SERVICE.list(
      `category=${encodeURIComponent(activeTab)}&page=1&limit=100`,
    );
    if (!response.success) {
      setIntakeStatus(response.message || "Inventory could not be loaded.");
      return;
    }
    const result = response.data as any;
    const rows = unwrapArray(result?.items ? result.items : result);
    setEditableBatches(
      Object.fromEntries(
        rows
          .filter((item) => !linkedMedicineUnavailable(item))
          .map((item) => {
            const rawExpiry =
              item.expiry ??
              item.expiry_date ??
              item.expiryDate ??
              item.expiresOn ??
              item.expires_on;
            const rawQuantity = item.qty ?? item.quantity;
            const rawUnit = String(
              item.sellingUnit ?? item.selling_unit ?? item.unit ?? "",
            )
              .trim()
              .toLowerCase();
            return [
              String(item.id),
              {
                id: String(item.id),
                medicineName:
                  item.medicine?.generic_name ?? item.drug ?? "Medicine",
                batchNumber:
                  item.lot ?? item.batchNumber ?? item.batch_number ?? "",
                expiry:
                  typeof rawExpiry === "string" ? rawExpiry.slice(0, 10) : "",
                quantity:
                  rawQuantity != null && Number.isFinite(Number(rawQuantity))
                    ? Number(rawQuantity)
                    : null,
                unit: ["vial", "pack", "bottle", "box"].includes(rawUnit)
                  ? rawUnit
                  : "",
              },
            ];
          }),
      ),
    );
    setInventoryRecords(
      rows
        .filter((item) => !linkedMedicineUnavailable(item))
        .map((item: any) => {
          const status = item.status ?? "Not recorded";
          const quarantine = status.toLowerCase().includes("quarantin");
          const expiry =
            status.toLowerCase().includes("expir") ||
            item.category === "expiry";
          const style = quarantine
            ? "bg-errl text-[var(--status-error)]"
            : expiry
              ? "bg-warnl text-[var(--status-warn)]"
              : "bg-okl text-[var(--status-good)]";
          const recordExpiry =
            item.expiry ??
            item.expiry_date ??
            item.expiryDate ??
            item.expiresOn ??
            item.expires_on;
          return {
            id: item.id,
            drug: item.drug ?? item.medicine?.generic_name ?? "N/A",
            gtin: item.gtin ?? "N/A",
            lot: item.lot ?? item.batchNumber ?? item.batch_number ?? "N/A",
            facility: item.facility?.name ?? item.facility ?? "N/A",
            qty: item.qty ?? item.quantity ?? Number.NaN,
            expiry: recordExpiry
              ? new Date(recordExpiry).toLocaleDateString("en-NG", {
                  dateStyle: "medium",
                })
              : "N/A",
            temp: item.tempC == null ? "Not recorded" : `${item.tempC}°C`,
            status,
            statusStyle: style,
            actionLabel: quarantine ? "Dispose" : "Quarantine",
            actionClass: quarantine
              ? "bg-errl text-[var(--status-error)] border border-[#fecaca]"
              : "bg-transparent text-g600 border border-g200 hover:bg-g50",
            category:
              item.category ??
              (expiry ? "expiry" : quarantine ? "quarantine" : "all"),
          };
        }),
    );
    if (result?.stats && !rows.some((item) => linkedMedicineUnavailable(item)))
      setInventoryStats({
        totalVials: result.stats.totalVials ?? null,
        gs1VerifiedPct: result.stats.gs1VerifiedPct ?? null,
        nearExpiry: result.stats.nearExpiry ?? null,
        quarantined: result.stats.quarantined ?? null,
      });
  }, [activeTab]);
  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);
  useEffect(() => {
    const refresh = () => {
      setMedicineId("");
      void loadMedicines();
      void loadInventory();
    };
    window.addEventListener(MEDICINE_CATALOGUE_CHANGED, refresh);
    return () =>
      window.removeEventListener(MEDICINE_CATALOGUE_CHANGED, refresh);
  }, [loadMedicines, loadInventory]);

  const addBatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (
      savingBatch ||
      !medicines.some((medicine) => String(medicine.id) === medicineId) ||
      !batchNumber.trim() ||
      !expiryDate ||
      !["vial", "pack", "bottle", "box"].includes(sellingUnit) ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    )
      return;
    setSavingBatch(true);
    const response = await INVENTORY_SERVICE.create({
      medicineId,
      batchNumber: batchNumber.trim(),
      expiry: expiryDate,
      quantity: parsedQuantity,
      unit: sellingUnit,
      facilityId: userData.user?.hospital?.id,
    });
    setSavingBatch(false);
    notifyResult(
      response,
      "Batch added to inventory.",
      "Batch could not be added.",
    );
    setIntakeStatus(
      response.success
        ? response.message || "Batch added to inventory."
        : response.message || "Batch could not be added.",
    );
    if (response.success) {
      setMedicineId("");
      setBatchNumber("");
      setExpiryDate("");
      setQuantity("");
      setSellingUnit("");
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
          <p>
            Manage your facility’s batches, availability, and stock records.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap max-md:w-full max-md:justify-start">
          <button
            type="button"
            onClick={() =>
              void INVENTORY_SERVICE.exportCsv().then((response) => {
                const value = (response.data as any)?.csv ?? response.data;
                if (!response.success || !value) {
                  toast.error(
                    response.message || "CSV export could not be generated.",
                  );
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
                toast.success("Inventory export downloaded.");
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

      {canListStock && (
        <section className="mb-6 flex flex-col gap-5 rounded-2xl border border-p/20 bg-linear-to-br from-pl/30 via-w to-w p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-p/10 text-p">
              <ShoppingBag className="size-6" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-p">
                Sell from your inventory
              </p>
              <h2 className="mt-1 text-lg font-bold text-g900">
                Make your stock available to the network
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-g500">
                Choose a batch, set your selling price, and add product photos.
                Published listings appear in Marketplace for buyers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setListingOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-p px-5 py-3 text-sm font-semibold text-white transition hover:bg-pd"
          >
            Create listing <ArrowRight className="size-4" />
          </button>
        </section>
      )}
      {listingOpen && canListStock && (
        <StockListingDialog
          onClose={() => setListingOpen(false)}
          onSubmitted={(message) => {
            setListingOpen(false);
            setIntakeStatus(message);
            toast.success(message);
            void loadInventory();
          }}
        />
      )}

      <nav
        aria-label="Inventory entry view"
        className="mb-4 flex flex-wrap gap-2"
      >
        {(["standard", "graph"] as const).map((view) => (
          <button
            key={view}
            type="button"
            aria-pressed={entryView === view}
            onClick={() => {
              setEntryView(view);
              if (view === "graph") setGraphOpened(true);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${entryView === view ? "bg-p text-white" : "border border-g200 bg-w text-g600"}`}
          >
            {view === "standard" ? "Standard view" : "Graph view"}
          </button>
        ))}
      </nav>
      {graphOpened && (
        <div hidden={entryView !== "graph"} className="mb-6">
          <RecordGraph
            mode="inventory"
            medicines={medicines.map((medicine) => ({
              id: String(medicine.id),
              name: [
                medicine.generic_name ?? "Unnamed medicine",
                medicine.brand_name ?? medicine.brand,
                medicine.strength,
                medicine.dosage_form,
                medicine.gtin ? `GTIN ${medicine.gtin}` : null,
              ]
                .filter(Boolean)
                .join(" · "),
            }))}
            facilityId={userData.user?.hospital?.id}
            canCreate={canEditStock}
            optionsLoading={medicinesLoading}
            optionsError={medicinesError}
            hasMore={moreMedicines}
            onReloadOptions={() => void loadMedicines(1)}
            onLoadMore={() => void loadMedicines(medicinePage + 1)}
            onCreated={() => {
              setIntakeStatus("Batch added from graph.");
              void loadInventory();
            }}
          />
        </div>
      )}
      <div hidden={entryView !== "standard"}>
        <form
          className="mb-6 grid grid-cols-1 items-end gap-3 rounded-xl border border-g200 bg-w p-5 md:grid-cols-2 xl:grid-cols-[minmax(180px,1.5fr)_minmax(120px,1fr)_minmax(140px,1fr)_110px_100px_auto]"
          onSubmit={(event: FormEvent<HTMLFormElement>) => void addBatch(event)}
        >
          <div>
            <label htmlFor="intake-drug">Medicine</label>
            <select
              className="w-full rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm text-g900"
              id="intake-drug"
              onChange={(event) => setMedicineId(event.target.value)}
              required
              disabled={
                savingBatch ||
                (medicinesLoading && !medicines.length) ||
                !medicines.length
              }
              value={medicineId}
              aria-describedby="intake-medicine-help"
            >
              <option value="" disabled>
                {medicinesLoading && !medicines.length
                  ? "Loading medicines…"
                  : medicines.length
                    ? "Select a medicine"
                    : "No medicines available"}
              </option>
              {medicines.map((medicine) => (
                <option key={medicine.id} value={String(medicine.id)}>
                  {[
                    medicine.generic_name ?? "Unnamed medicine",
                    medicine.brand_name ?? medicine.brand,
                    medicine.strength,
                    medicine.dosage_form,
                    medicine.gtin ? `GTIN ${medicine.gtin}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </option>
              ))}
            </select>
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
            <label htmlFor="intake-unit">Selling unit</label>
            <select
              id="intake-unit"
              required
              value={sellingUnit}
              onChange={(event) => setSellingUnit(event.target.value)}
              className="rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm text-g900"
              aria-describedby="intake-unit-help"
            >
              <option value="" disabled>
                Select unit
              </option>
              <option value="vial">Vial</option>
              <option value="pack">Pack</option>
              <option value="bottle">Bottle</option>
              <option value="box">Box</option>
            </select>
          </div>
          <div>
            <label htmlFor="intake-quantity">
              Quantity{sellingUnit ? ` (${sellingUnit}s)` : ""}
            </label>
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
            disabled={savingBatch || !medicineId || !sellingUnit}
          >
            {savingBatch ? "Adding…" : "Add batch"}
          </button>
          <p id="intake-unit-help" className="col-span-full text-xs text-g500">
            Count stock in the selected selling unit. For example, 10 boxes
            means quantity 10 and unit Box. Marketplace listings will use this
            same unit.
          </p>
          <div
            id="intake-medicine-help"
            className="col-span-full text-xs text-g500"
          >
            {medicinesError ? (
              <p role="alert" className="text-red-600">
                {medicinesError}
              </p>
            ) : (
              <p>
                {!medicinesLoading && !medicines.length
                  ? "Add a medicine in the Medicines catalogue first, then refresh this list."
                  : "Select the catalogue entry that matches this batch, including its brand and strength."}
              </p>
            )}
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                disabled={medicinesLoading || savingBatch}
                onClick={() => {
                  setMedicineId("");
                  void loadMedicines();
                }}
                className="font-semibold text-p disabled:opacity-50"
              >
                {medicinesLoading ? "Loading…" : "Refresh medicines"}
              </button>
              {moreMedicines && (
                <button
                  type="button"
                  disabled={medicinesLoading || savingBatch}
                  onClick={() => void loadMedicines(medicinePage + 1)}
                  className="font-semibold text-p disabled:opacity-50"
                >
                  Load more medicines
                </button>
              )}
            </div>
          </div>
          <p aria-live="polite" className="col-span-full text-xs text-g500">
            {intakeStatus ||
              "Manual entries are saved to the inventory service."}
          </p>
        </form>
      </div>

      <section
        aria-label="Inventory summary"
        className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          ["Total vials", inventoryStats.totalVials, "Recorded inventory"],
          [
            "Verified GS1",
            inventoryStats.gs1VerifiedPct,
            "Barcode verification share",
          ],
          [
            "Near expiry",
            inventoryStats.nearExpiry,
            "Stock approaching expiry",
          ],
          ["Quarantined", inventoryStats.quarantined, "Stock held for review"],
        ]
          .filter(
            ([, value]) => typeof value === "number" && Number.isFinite(value),
          )
          .map(([label, value, description]) => (
            <article
              key={String(label)}
              className="rounded-xl border border-g200 bg-w p-5"
            >
              <h2 className="text-xs font-semibold text-g500">{label}</h2>
              <p className="my-2 text-2xl font-bold text-g900">
                {Number(value).toLocaleString()}
                {label === "Verified GS1" ? "%" : ""}
              </p>
              <p className="text-xs text-g500">{description}</p>
            </article>
          ))}
      </section>

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
                    <strong>{Number.isFinite(row.qty) ? row.qty : 0}</strong>
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
                    {canEditStock && editableBatches[String(row.id)] && (
                      <button
                        type="button"
                        className="mr-2 inline-flex items-center rounded-lg border border-g200 px-3 py-1 text-xs font-semibold text-g700 hover:bg-g50"
                        aria-label={`Edit ${row.drug} batch ${row.lot}`}
                        onClick={() =>
                          setEditBatch(editableBatches[String(row.id)])
                        }
                      >
                        Edit
                      </button>
                    )}
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
                          notifyResult(
                            response,
                            "Inventory status updated.",
                            "The inventory action failed.",
                          );
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
      {editBatch && canEditStock && (
        <InventoryEditDialog
          batch={editBatch}
          onClose={() => setEditBatch(null)}
          onSaved={(message) => {
            setEditBatch(null);
            setIntakeStatus(message);
            toast.success(message);
            void loadInventory();
          }}
        />
      )}
    </div>
  );
};

export default InventoryPage;
