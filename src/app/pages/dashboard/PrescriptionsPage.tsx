import { ModalId, PageId } from "../../lib/types";
import { type FormEvent, JSX, useState } from "react";
import { BRIDGE_DATA_SERVICE, MOCK_ORDERS } from "@/app/services/bridge-data/bridge-mock-service";
import Link from "next/link";

import type React from 'react';
interface PrescriptionsPageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}

type PrescriptionTab = 'active' | 'awaiting' | 'completed';

const TAB_CONFIG: { id: PrescriptionTab; label: string; icon: JSX.Element }[] = [
  {
    id: 'active',
    label: 'Active Orders',
    icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  },
  {
    id: 'awaiting',
    label: 'Awaiting Auth',
    icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  },
];

const PrescriptionsPage: React.FC<PrescriptionsPageProps> = ({ onNav, onOpenModal }) => {
  const [activeTab, setActiveTab] = useState<PrescriptionTab>('active');
  const [stockQuery, setStockQuery] = useState('');
  const [stockLocation, setStockLocation] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [quantityByStockId, setQuantityByStockId] = useState<Record<string, string>>({});
  const [generatedInvoiceRef, setGeneratedInvoiceRef] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState('');
  const [stockResults, setStockResults] = useState<Awaited<ReturnType<typeof BRIDGE_DATA_SERVICE.searchStock>> | null>(null);
  const rows = MOCK_ORDERS[activeTab];
  const counts = {
    active: MOCK_ORDERS.active.length,
    awaiting: MOCK_ORDERS.awaiting.length,
    completed: MOCK_ORDERS.completed.length,
  };

  const searchStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const results = await BRIDGE_DATA_SERVICE.searchStock(stockQuery, stockLocation);
    setStockResults(results);
    setGeneratedInvoiceRef(null);
    setStockStatus(`${results.length} mock stock ${results.length === 1 ? 'match' : 'matches'}; no live inventory was queried.`);
  };

  const generateDemoInvoice = (stockId: string) => {
    const reference = BRIDGE_DATA_SERVICE.createDemoInvoiceReference(
      stockId,
      Number(quantityByStockId[stockId] ?? 1),
    );
    if (!reference) {
      setGeneratedInvoiceRef(null);
      setInvoiceError('Enter a whole quantity within the available demo stock.');
      return;
    }
    setInvoiceError('');
    setGeneratedInvoiceRef(reference);
  };

  return (
    <div className="block animate-fade-up">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap max-md:flex-col max-md:items-stretch max-md:gap-4">
        <div className="[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-g900 [&_h1]:tracking-[-0.4px] [&_p]:text-[12.5px] [&_p]:text-g500 [&_p]:mt-[3px]"><h1>Prescriptions</h1><p>Structured clinical orders · ICD-10 coded · HMO-matched</p></div>
        <div className="flex gap-2 flex-wrap max-md:w-full max-md:justify-start"><button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" onClick={() => onOpenModal('modal-prescription')}><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Prescription</button></div>
      </div>

      <section className="mb-4 grid grid-cols-[1fr_auto] items-end gap-5 rounded-xl border border-g200 bg-w p-5 max-md:grid-cols-1" aria-labelledby="stock-search-title">
        <form className="grid grid-cols-[1fr_180px_auto] items-end gap-3 max-md:grid-cols-1" onSubmit={searchStock}>
          <div>
            <label htmlFor="stock-search" id="stock-search-title">Search oncology stock</label>
            <input
              autoComplete="off"
              className="rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm text-g800 outline-none focus:border-p"
              id="stock-search"
              onChange={(event) => setStockQuery(event.target.value)}
              placeholder="Generic name or brand"
              value={stockQuery}
            />
          </div>
          <div>
            <label htmlFor="stock-location">Location</label>
            <input
              className="rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm text-g800 outline-none focus:border-p"
              id="stock-location"
              onChange={(event) => setStockLocation(event.target.value)}
              placeholder="City or facility"
              value={stockLocation}
            />
          </div>
          <button className="rounded-lg bg-p px-4 py-2.5 text-sm font-semibold text-white hover:bg-pd" type="submit">Search network</button>
        </form>
        <div className="min-w-[220px] text-right max-md:text-left">
          <button className="rounded-lg border border-g200 bg-g50 px-4 py-2.5 text-sm font-semibold text-g400" disabled title="Available after the server-side payment integration is connected" type="button">
            Live Paystack Link
          </button>
          <p className="mt-2 text-[11px] leading-5 text-g500">Use a result below to create a non-payable demo invoice link.</p>
        </div>
        <p aria-live="polite" className="col-span-2 text-xs text-g500 max-md:col-span-1">
          {stockStatus || "Search by generic name, brand, or location. Results are sample data for integration."}
        </p>
        {stockResults ? (
          <div className="col-span-2 grid gap-2 max-md:col-span-1" aria-label="Mock stock search results">
            {stockResults.length ? stockResults.map((item) => (
              <article className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-g100 py-3 text-sm max-sm:grid-cols-1" key={item.id}>
                <div>
                  <p className="font-semibold text-g800">{item.drug} <span className="font-normal text-g500">({item.brand})</span></p>
                  <p className="mt-1 text-xs text-g500">{item.location} · Batch {item.batchNumber} · Expires {item.expiresOn}</p>
                </div>
                <div className="flex items-end gap-2 max-sm:flex-wrap">
                  <div>
                    <label className="mb-1 text-[11px] text-g500" htmlFor={`stock-quantity-${item.id}`}>Qty</label>
                    <input
                      className="w-20 rounded-md border border-g200 px-2 py-2 text-sm"
                      id={`stock-quantity-${item.id}`}
                      max={item.availableQuantity}
                      min="1"
                      onChange={(event) => {
                        setQuantityByStockId((quantities) => ({ ...quantities, [item.id]: event.target.value }));
                        setGeneratedInvoiceRef(null);
                        setInvoiceError('');
                      }}
                      type="number"
                      value={quantityByStockId[item.id] ?? "1"}
                    />
                  </div>
                  <div className="text-right max-sm:text-left">
                  <p className="font-semibold text-g700">{item.availableQuantity} available</p>
                  <p className="mt-1 text-xs text-g500">{item.status} · Demo</p>
                  </div>
                  <button
                    className="rounded-md border border-g200 px-3 py-2 text-xs font-semibold text-g700 hover:border-p hover:text-p disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={item.availableQuantity === 0}
                    onClick={() => generateDemoInvoice(item.id)}
                    type="button"
                  >
                    Generate demo invoice
                  </button>
                </div>
              </article>
            )) : <p className="border-t border-g100 py-3 text-sm text-g500">No mock results match this search.</p>}
            {generatedInvoiceRef ? (
              <p aria-live="polite" className="border-t border-g100 py-3 text-sm text-g700">
                Demo invoice ready: <Link className="font-semibold text-p underline" href={`/pay/${encodeURIComponent(generatedInvoiceRef)}`}>{generatedInvoiceRef}</Link>. No reservation or payment was made.
              </p>
            ) : null}
            {invoiceError ? <p aria-live="polite" className="py-3 text-sm text-err">{invoiceError}</p> : null}
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-[1.55fr_1fr] gap-4 max-lg:grid-cols-1">
        <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
          <div className="mb-4">
            <div className="text-sm font-bold text-g900 mb-1">Prescription pipeline</div>
            <div className="text-xs text-g500">Track order statuses and approvals across the oncology network.</div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-4">
            <div className="bg-g50 border border-g100 rounded-lg p-[0.95rem] [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-g900 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-g500 [&_span]:mt-[3px]"><strong>{counts.active}</strong><span>Active orders</span></div>
            <div className="bg-g50 border border-g100 rounded-lg p-[0.95rem] [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-g900 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-g500 [&_span]:mt-[3px]"><strong>{counts.awaiting}</strong><span>Awaiting authorization</span></div>
            <div className="bg-g50 border border-g100 rounded-lg p-[0.95rem] [&_strong]:block [&_strong]:text-lg [&_strong]:font-bold [&_strong]:text-g900 [&_span]:block [&_span]:text-[11.5px] [&_span]:text-g500 [&_span]:mt-[3px]"><strong>{counts.completed}</strong><span>Completed prescriptions</span></div>
          </div>
          <div className="flex flex-wrap border-b border-g200 rounded-full bg-g50 p-1 gap-2 overflow-x-auto mb-5 max-[520px]:p-1.5 max-[520px]:gap-[0.4rem]">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-[12.5px] font-semibold cursor-pointer rounded-full transition duration-[180ms] whitespace-nowrap max-md:flex-1 max-md:text-center max-[520px]:min-w-[120px] max-[520px]:text-xs max-[520px]:px-3${activeTab === tab.id ? ' text-w bg-p shadow-[0_10px_25px_rgba(37,99,235,0.18)]' : ' text-g500 bg-transparent hover:text-g700 hover:bg-[rgba(15,23,42,0.04)]'}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', stroke: 'currentColor', fill: 'none', strokeWidth: '2.5' }}>
                  {tab.icon}
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl bg-w border border-g100 shadow-[0_14px_30px_rgba(15,23,42,0.08)] max-lg:block max-lg:w-full max-lg:[&_table]:w-auto max-lg:[&_table]:min-w-[720px] max-lg:[&_th]:whitespace-nowrap max-lg:[&_td]:whitespace-nowrap max-md:[&_table]:w-full max-md:[&_table]:min-w-0 max-md:[&_thead]:hidden max-md:[&_tr]:block max-md:[&_tr]:mb-4 max-md:[&_tr]:border max-md:[&_tr]:border-g200 max-md:[&_tr]:rounded-xl max-md:[&_tr]:overflow-hidden max-md:[&_tr]:bg-w max-md:[&_td]:flex max-md:[&_td]:justify-between max-md:[&_td]:items-start max-md:[&_td]:px-3 max-md:[&_td]:py-2.5 max-md:[&_td]:border-0 max-md:[&_td]:border-b max-md:[&_td]:border-g100 max-md:[&_td]:whitespace-normal max-md:[&_td:last-child]:border-b-0 max-md:[&_td]:before:content-[attr(data-label)] max-md:[&_td]:before:basis-[45%] max-md:[&_td]:before:grow-0 max-md:[&_td]:before:shrink-0 max-md:[&_td]:before:text-[11px] max-md:[&_td]:before:font-bold max-md:[&_td]:before:text-g500 max-md:[&_td]:before:mr-2.5 max-md:[&_td]:before:whitespace-nowrap max-md:[&_td_span.badge]:ml-auto max-[520px]:[&_td]:flex-col max-[520px]:[&_td]:items-start max-[520px]:[&_td]:before:mb-1.5 max-[520px]:[&_td]:before:basis-auto">
            <table className="min-w-[720px] w-full">
              <thead><tr><th>Patient ID</th><th>ICD-10</th><th>Drug</th><th>Insurer</th><th>Pharmacy</th><th>Auth Status</th><th>Order</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td data-label="Patient ID"><strong>{row.id}</strong></td>
                    <td data-label="ICD-10"><span className="inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 bg-pl text-pdd dk:bg-[rgba(96,165,250,0.16)] dk:text-[#dbeafe] before:hidden">{row.code}</span></td>
                    <td data-label="Drug">{row.drug}</td>
                    <td data-label="Insurer">{row.insurer}</td>
                    <td data-label="Pharmacy">{row.pharmacy}</td>
                    <td data-label="Auth Status"><span className={`inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 ${row.statusClass}`}>{row.status}</span></td>
                    <td data-label="Order"><span className={`inline-flex items-center gap-[3px] px-2 py-0.5 rounded-[20px] text-[11px] font-semibold whitespace-nowrap before:content-[''] before:size-[5px] before:rounded-full before:bg-current before:shrink-0 ${row.orderClass} before:hidden`}>{row.order}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-w border border-g200 rounded-xl p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)] [&+&]:mt-4">
            <div className="flex items-center justify-between mb-4 gap-2"><div><div className="text-[15px] font-bold text-g900">New Prescription</div><div className="text-xs text-g500 mt-0.5">Doctor micro-interface</div></div></div>
            <div className="mb-4"><label>ICD-10 Diagnosis Code</label><select className="p-2"><option>C50.4 — Breast cancer, upper-outer quadrant</option><option>C85.1 — B-cell lymphoma</option><option>C18.7 — Colon cancer</option></select></div>
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <div className="mb-4"><label>TNM Stage</label><select className="p-2"><option>Stage I</option><option>Stage II</option><option>Stage IIIA</option><option>Stage IV</option></select></div>
              <div className="mb-4"><label>Insurer</label><select className="p-2"><option>AXA Mansard</option><option>NHIA</option><option>Hygeia HMO</option><option>Cash Pay</option></select></div>
            </div>
            <div className="mb-4"><label>Drug (HMO-filtered)</label><select className="p-2"><option>Trastuzumab</option><option>Pertuzumab</option></select></div>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg text-[12.5px] font-semibold cursor-pointer transition duration-150 whitespace-nowrap [&_svg]:size-[14px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 max-md:w-full max-md:justify-center bg-p text-white hover:bg-pd" style={{ width: '100%', justifyContent: 'center' }}><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>Send to Network</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionsPage;
