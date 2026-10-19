"use client";

import { LockKeyhole, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { InvoiceData } from "@/app/services/bridge-data/bridge-data-service";
import { INVOICE_SERVICE } from "@/app/services/invoice-service/invoice-service";
import InvoicePayment from "../InvoicePayment";

export default function GuestCheckout({
  reference,
  onClose,
}: {
  reference: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    let active = true;
    void INVOICE_SERVICE.find(reference).then((response) => {
      if (!active) return;
      const value = response.data as InvoiceData | null;
      if (
        response.success &&
        value &&
        !value.isDemo &&
        ["PAID", "AWAITING_PAYMENT"].includes(value.status) &&
        Array.isArray(value.items) &&
        value.items.length > 0 &&
        value.items.every(
          (item) =>
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            typeof item.unitPriceNaira === "number" &&
            Number.isFinite(item.unitPriceNaira) &&
            item.unitPriceNaira >= 0,
        )
      ) {
        setInvoice(value);
      } else
        setError(
          (!response.success && response.message) ||
            "This invoice is unavailable. Please check the reference with your care team.",
        );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reference]);

  const money = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(value);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      aria-labelledby="guest-checkout-title"
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-g200 bg-w p-0 text-g900 shadow-2xl backdrop:bg-slate-950/65 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-g200 p-5">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-p">
            <LockKeyhole size={14} /> Patient &amp; family checkout
          </p>
          <h2 id="guest-checkout-title" className="text-lg font-bold">
            Your secure invoice
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close checkout"
          onClick={onClose}
          className="rounded-lg border border-g200 p-2 text-g600"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-5 sm:p-6">
        <p className="mb-4 text-xs text-g500">
          Reference{" "}
          <span className="font-mono font-semibold text-g800">{reference}</span>
        </p>
        {loading ? (
          <output className="block py-8 text-center text-sm text-g500">
            Retrieving your invoice...
          </output>
        ) : error ? (
          <p
            role="alert"
            className="rounded-xl bg-g50 p-4 text-sm leading-6 text-g700"
          >
            {error}
          </p>
        ) : invoice ? (
          <>
            <p className="mb-3 text-sm font-semibold">{invoice.pharmacy}</p>
            <div className="divide-y divide-g200">
              {invoice.items.map((item, index) => (
                <div
                  key={`${item.description}-${index}`}
                  className="flex justify-between gap-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="mt-1 text-xs text-g500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0">
                    {money(item.quantity * item.unitPriceNaira)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between gap-3 rounded-xl bg-g50 p-4 text-lg font-bold">
              <span>Invoice total</span>
              <span>
                {money(
                  invoice.items.reduce(
                    (total, item) =>
                      total + item.quantity * item.unitPriceNaira,
                    0,
                  ),
                )}
              </span>
            </div>
            <InvoicePayment
              reference={reference}
              status={invoice.status}
              paystackUrl={invoice.paystackUrl}
              paymentMethods={invoice.paymentMethods}
            />
            <Link
              href={`/pay/${encodeURIComponent(reference)}`}
              className="mt-4 inline-block text-xs font-semibold text-p underline underline-offset-4"
            >
              Open full invoice
            </Link>
          </>
        ) : null}
        <p className="mt-5 text-xs leading-5 text-g500">
          No patient account required. Card details are entered only on
          Paystack's secure checkout.
        </p>
      </div>
    </dialog>
  );
}
