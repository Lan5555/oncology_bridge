"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ModalId, PageId } from "@/app/lib/types";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Clock3,
  FilePlus2,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import {
  BRIDGE_DATA_SERVICE,
  type OrderRecord,
} from "@/app/services/bridge-data/bridge-data-service";
import { PRESCRIPTION_SERVICE } from "@/app/services/prescription-service/prescription-service";
import { unwrapArray } from "@/app/services/response-utils";
import Link from "next/link";

interface PrescriptionsPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

type PrescriptionTab = "active" | "awaiting" | "completed";
const TAB_CONFIG: {
  id: PrescriptionTab;
  label: string;
  icon: typeof Activity;
}[] = [
  { id: "active", label: "Active orders", icon: Activity },
  { id: "awaiting", label: "Awaiting authorization", icon: Clock3 },
  { id: "completed", label: "Completed", icon: ShieldCheck },
];

export default function PrescriptionsPage({
  onOpenModal,
}: PrescriptionsPageProps) {
  const [activeTab, setActiveTab] = useState<PrescriptionTab>("active");
  const [rows, setRows] = useState<OrderRecord[]>([]);
  const [counts, setCounts] = useState({
    active: 0,
    awaiting: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [stockQuery, setStockQuery] = useState("");
  const [stockLocation, setStockLocation] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [stockLoading, setStockLoading] = useState(false);
  const [quantityByStockId, setQuantityByStockId] = useState<
    Record<string, string>
  >({});
  const [generatedInvoiceRef, setGeneratedInvoiceRef] = useState<string | null>(
    null,
  );
  const [invoiceError, setInvoiceError] = useState("");
  const [stockResults, setStockResults] = useState<Awaited<
    ReturnType<typeof BRIDGE_DATA_SERVICE.searchStock>
  > | null>(null);

  const loadPrescriptions = async () => {
    setLoading(true);
    setLoadError("");
    const response = await PRESCRIPTION_SERVICE.list(activeTab);
    if (!response.success) {
      setRows([]);
      setLoadError(response.message || "Prescriptions could not be loaded.");
      setLoading(false);
      return;
    }
    const data = response.data as any;
    setRows(
      unwrapArray(data).map((row: any) => ({
        id: String(row.id ?? row.display_id ?? row.code ?? ""),
        code: row.code ?? row.icd10 ?? "—",
        drug:
          row.drug ??
          row.medicine?.generic_name ??
          `${row.drugName ?? "Medicine"} ×${row.qty ?? row.quantity ?? 1}`,
        insurer: row.insurer ?? "—",
        pharmacy: row.pharmacy ?? row.pharmacyName ?? "—",
        status: row.status ?? row.auth_status ?? "Pending",
        order: row.order ?? row.order_stage ?? "Waiting",
        statusClass: "bg-pl text-pdd",
        orderClass: "bg-g100 text-g600",
      })),
    );
    if (data?.counts)
      setCounts({
        active: data.counts.active ?? 0,
        awaiting: data.counts.awaiting ?? 0,
        completed: data.counts.completed ?? 0,
      });
    setLoading(false);
  };

  useEffect(() => {
    void loadPrescriptions();
  }, [activeTab]);

  useEffect(() => {
    const refresh = () => void loadPrescriptions();
    window.addEventListener("prescriptions:updated", refresh);
    return () => window.removeEventListener("prescriptions:updated", refresh);
  }, [activeTab]);

  const searchStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStockLoading(true);
    setStockStatus("");
    setGeneratedInvoiceRef(null);
    const results = await BRIDGE_DATA_SERVICE.searchStock(
      stockQuery,
      stockLocation,
    );
    setStockResults(results);
    setStockStatus(
      `${results.length} live stock ${results.length === 1 ? "match" : "matches"}.`,
    );
    setStockLoading(false);
  };

  const generateInvoice = async (stockId: string, unitPriceNaira: number) => {
    setInvoiceError("");
    const invoice = await BRIDGE_DATA_SERVICE.createInvoice(
      stockId,
      Number(quantityByStockId[stockId] ?? 1),
      unitPriceNaira,
    );
    if (!invoice) {
      setGeneratedInvoiceRef(null);
      setInvoiceError(
        "Invoice could not be created. Check the quantity and connection, then try again.",
      );
      return;
    }
    setGeneratedInvoiceRef(invoice.reference);
  };

  const metrics = [
    { label: "Active orders", value: counts.active, icon: Activity },
    { label: "Awaiting authorization", value: counts.awaiting, icon: Clock3 },
    {
      label: "Completed prescriptions",
      value: counts.completed,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pl text-p shadow-sm">
            <ClipboardList className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-g900">
              Prescriptions
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-g500">
              Create and follow clinical orders across your verified oncology
              network.
            </p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-p px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pd hover:shadow-md"
          onClick={() => onOpenModal("modal-prescription")}
          type="button"
        >
          <FilePlus2 className="size-4" aria-hidden="true" />
          New prescription
        </button>
      </header>

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Prescription summary"
      >
        {metrics.map(({ label, value, icon: Icon }) => (
          <article
            className="flex items-center gap-4 rounded-xl border border-g200 bg-w p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            key={label}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-g50 text-p">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-g900">
                {value}
              </p>
              <p className="text-xs font-medium text-g500">{label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-g200 bg-w shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-g100 p-5">
          <div>
            <h2 className="text-base font-bold text-g900">
              Prescription pipeline
            </h2>
            <p className="mt-1 text-xs text-g500">
              Live prescriptions and authorization status from your account.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-g200 px-3 py-2 text-xs font-semibold text-g600 transition hover:border-p hover:text-p"
            onClick={() => void loadPrescriptions()}
            type="button"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-g100 px-4 pt-3">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              aria-pressed={activeTab === id}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${activeTab === id ? "border-p text-p" : "border-transparent text-g500 hover:text-g800"}`}
              key={id}
              onClick={() => setActiveTab(id)}
              type="button"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        {loadError ? (
          <div
            className="m-5 rounded-xl border border-err/20 bg-errl p-4 text-sm text-err"
            role="alert"
          >
            {loadError}
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5" aria-label="Loading prescriptions">
            {[1, 2, 3].map((item) => (
              <div
                className="h-12 animate-pulse rounded-lg bg-g50"
                key={item}
              />
            ))}
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-g50 text-[11px] uppercase tracking-wide text-g500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Patient reference</th>
                  <th className="px-4 py-3 font-semibold">ICD-10</th>
                  <th className="px-4 py-3 font-semibold">Medicine</th>
                  <th className="px-4 py-3 font-semibold">Insurer</th>
                  <th className="px-4 py-3 font-semibold">Pharmacy</th>
                  <th className="px-4 py-3 font-semibold">Authorization</th>
                  <th className="px-5 py-3 font-semibold">Order stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-g100">
                {rows.map((row) => (
                  <tr className="transition hover:bg-g50/70" key={row.id}>
                    <td className="px-5 py-3.5 font-semibold text-g800">
                      {row.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-pl px-2.5 py-1 text-xs font-semibold text-pdd">
                        {row.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-g700">{row.drug}</td>
                    <td className="px-4 py-3.5 text-g600">{row.insurer}</td>
                    <td className="px-4 py-3.5 text-g600">{row.pharmacy}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-pl px-2.5 py-1 text-xs font-semibold text-pdd">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-g600">{row.order}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={ClipboardList}
              title={`No ${activeTab} prescriptions`}
              description="Prescriptions submitted through your verified account will appear here."
              action={
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white transition hover:bg-pd"
                  onClick={() => onOpenModal("modal-prescription")}
                  type="button"
                >
                  Create prescription <ArrowRight className="size-4" />
                </button>
              }
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-g200 bg-w p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-pl text-p">
            <PackageSearch className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold text-g900">
              Search network stock
            </h2>
            <p className="mt-0.5 text-xs text-g500">
              Find live availability by medicine and location.
            </p>
          </div>
        </div>
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={searchStock}
        >
          <label
            className="grid gap-1.5 text-xs font-semibold text-g600"
            htmlFor="stock-search"
          >
            Medicine
            <input
              autoComplete="off"
              className="rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-normal text-g800 outline-none transition focus:border-p focus:ring-2 focus:ring-p/15"
              id="stock-search"
              onChange={(event) => setStockQuery(event.target.value)}
              placeholder="Generic name or brand"
              value={stockQuery}
            />
          </label>
          <label
            className="grid gap-1.5 text-xs font-semibold text-g600"
            htmlFor="stock-location"
          >
            Location
            <input
              className="rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-normal text-g800 outline-none transition focus:border-p focus:ring-2 focus:ring-p/15"
              id="stock-location"
              onChange={(event) => setStockLocation(event.target.value)}
              placeholder="City or facility"
              value={stockLocation}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-p px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pd disabled:opacity-60"
            disabled={stockLoading}
            type="submit"
          >
            <Search className="size-4" aria-hidden="true" />
            {stockLoading ? "Searching…" : "Search stock"}
          </button>
        </form>
        <p aria-live="polite" className="mt-3 text-xs text-g500">
          {stockStatus ||
            "Search current network stock. Results are returned by the stock search API."}
        </p>
        {stockResults ? (
          stockResults.length ? (
            <div className="mt-4 divide-y divide-g100 rounded-xl border border-g100">
              {stockResults.map((item) => (
                <article
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                  key={item.id}
                >
                  <div>
                    <p className="text-sm font-semibold text-g800">
                      {item.drug}{" "}
                      <span className="font-normal text-g500">
                        {item.brand ? `(${item.brand})` : ""}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-g500">
                      {item.location} · Batch {item.batchNumber} · Expires{" "}
                      {item.expiresOn}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <label
                      className="grid gap-1 text-[11px] font-medium text-g500"
                      htmlFor={`stock-quantity-${item.id}`}
                    >
                      Quantity
                      <input
                        className="w-24 rounded-lg border border-g200 px-2.5 py-2 text-sm text-g800"
                        id={`stock-quantity-${item.id}`}
                        max={item.availableQuantity}
                        min="1"
                        onChange={(event) =>
                          setQuantityByStockId((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        type="number"
                        value={quantityByStockId[item.id] ?? "1"}
                      />
                    </label>
                    <p className="pb-2 text-xs text-g500">
                      {item.availableQuantity} available
                    </p>
                    <button
                      className="rounded-lg border border-g200 px-3 py-2 text-xs font-semibold text-g700 transition hover:border-p hover:text-p disabled:opacity-50"
                      disabled={item.availableQuantity < 1}
                      onClick={() =>
                        void generateInvoice(
                          item.id,
                          Number(item.unitPriceNaira ?? 0),
                        )
                      }
                      type="button"
                    >
                      Create invoice
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              icon={Search}
              title="No stock matches"
              description="Try another medicine name or a nearby location."
            />
          )
        ) : null}
        {generatedInvoiceRef ? (
          <p
            className="mt-4 rounded-lg bg-okl p-3 text-sm text-g700"
            role="status"
          >
            Invoice created:{" "}
            <Link
              className="font-semibold text-p underline"
              href={`/pay/${encodeURIComponent(generatedInvoiceRef)}`}
            >
              {generatedInvoiceRef}
            </Link>
          </p>
        ) : null}
        {invoiceError ? (
          <p className="mt-3 text-sm text-err" role="alert">
            {invoiceError}
          </p>
        ) : null}
      </section>
    </div>
  );
}
