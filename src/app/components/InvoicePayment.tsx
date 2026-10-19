"use client";

import { useState } from "react";
import { INVOICE_SERVICE } from "@/app/services/invoice-service/invoice-service";

interface InvoicePaymentProps {
  paymentMethods: string[];
  reference: string;
  status: "AWAITING_PAYMENT" | "PAID";
  paystackUrl?: string;
}

function safePaymentUrl(value?: string) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" &&
      url.hostname === "checkout.paystack.com" &&
      !url.username &&
      !url.password &&
      !url.port
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default function InvoicePayment({
  reference,
  status,
  paystackUrl,
}: InvoicePaymentProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [paymentUrl, setPaymentUrl] = useState(safePaymentUrl(paystackUrl));
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const checkStatus = async () => {
    setChecking(true);
    setMessage("");
    const response = await INVOICE_SERVICE.find(reference);
    if (response.success && response.data?.status) {
      setCurrentStatus(response.data.status);
      setPaymentUrl(safePaymentUrl(response.data.paystackUrl));
      setMessage(
        response.data.status === "PAID"
          ? "Payment confirmed by the invoice service."
          : "Payment has not been confirmed yet. Please check again shortly.",
      );
    } else
      setMessage(
        response.message ||
          "Could not refresh payment status. Please try again.",
      );
    setChecking(false);
  };
  return (
    <div className="mt-5 space-y-3 border-t border-[#e5ebe7] pt-5">
      <p className="text-sm font-semibold text-[#19332f]">
        {currentStatus === "PAID"
          ? "Payment confirmed"
          : "Awaiting payment confirmation"}
      </p>
      <p className="text-xs leading-5 text-[#73847b]">
        {currentStatus === "PAID"
          ? "Your payment has been recorded. Your pharmacy will continue processing the order."
          : "Payment status comes from the invoice service. If you have just paid, allow a moment for confirmation."}
      </p>
      {currentStatus !== "PAID" && paymentUrl && (
        <a
          href={paymentUrl}
          className="inline-flex rounded-xl bg-[#126b5d] px-4 py-3 text-sm font-semibold text-white"
        >
          Continue to Paystack
        </a>
      )}
      {currentStatus !== "PAID" && (
        <button
          type="button"
          disabled={checking}
          onClick={() => void checkStatus()}
          className="block rounded-xl border border-[#d4dfd9] px-4 py-2 text-sm font-semibold text-[#19332f] disabled:opacity-50"
        >
          {checking ? "Checking…" : "Refresh payment status"}
        </button>
      )}
      <p aria-live="polite" className="text-xs leading-5 text-[#73847b]">
        {message}
      </p>
    </div>
  );
}
