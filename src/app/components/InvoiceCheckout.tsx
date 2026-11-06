"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "@/app/components/BrandLogo";
import InvoicePayment from "@/app/components/InvoicePayment";
import {
  CHECKOUT_ATTEMPT_STORAGE,
  hostedPaymentUrl,
  pendingInvoice,
  providerLabel,
  readCheckoutAttempt,
} from "@/app/lib/marketplace-payment";
import type { InvoiceData } from "@/app/services/bridge-data/bridge-data-service";
import { INVOICE_SERVICE } from "@/app/services/invoice-service/invoice-service";

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    value,
  );
const paymentMessage = (status: string) => {
  if (status === "PAID") return "Payment confirmed";
  if (status === "PAID_REVIEW")
    return "Payment received; manual review required";
  if (status === "EXPIRED") return "Checkout expired";
  if (status === "PAYMENT_FAILED") return "Payment failed";
  if (pendingInvoice(status)) return "Payment confirmation pending";
  return "Payment status unavailable";
};

export default function InvoiceCheckout({ reference }: { reference: string }) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(Date.now());
  const validReference = /^[A-Za-z0-9-]{3,64}$/.test(reference);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh explicitly restarts authenticated verification for this reference.
  useEffect(() => {
    if (!validReference) {
      setLoading(false);
      setError("Invalid invoice reference.");
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = 3000;
    let stopped = false;
    let busy = false;
    let buyer = false;
    let savedMarketplace = false;
    try {
      buyer = Boolean(
        JSON.parse(localStorage.getItem("userSession") ?? "null")?.token,
      );
      savedMarketplace = readCheckoutAttempt()?.invoiceReference === reference;
    } catch {
      /* The endpoint will report whether sign-in is needed. */
    }

    const schedule = () => {
      if (!active || stopped || document.visibilityState !== "visible") return;
      timer = setTimeout(() => void load(), delay);
      delay = Math.min(delay * 1.5, 30000);
    };
    const load = async () => {
      if (!active || busy || stopped) return;
      if (savedMarketplace && !buyer) {
        setLoginRequired(true);
        setError("Sign in to your buyer account to verify this invoice.");
        setLoading(false);
        stopped = true;
        return;
      }
      busy = true;
      const response = buyer
        ? await INVOICE_SERVICE.findForBuyer(reference)
        : await INVOICE_SERVICE.find(reference);
      busy = false;
      if (!active) return;
      setLoading(false);
      setNow(Date.now());
      if (!response.success) {
        if (response.status === 401) {
          setLoginRequired(true);
          stopped = true;
        }
        if (
          response.status === 403 ||
          response.code === "PAYMENT_MISMATCH" ||
          response.status === 404 ||
          response.status === 422
        )
          stopped = true;
        setError(
          response.status === 401
            ? "Sign in to your buyer account to verify this invoice."
            : response.status === 403
              ? "Access denied. This invoice is not available to your account."
              : response.code === "PAYMENT_MISMATCH"
                ? "Payment details require support review. Do not make another payment."
                : response.message ||
                  "Payment verification is temporarily unavailable. Your payment is not yet confirmed.",
        );
        if (!stopped && buyer) schedule();
        return;
      }
      const value = response.data as InvoiceData;
      if (
        !value ||
        value.reference !== reference ||
        !Array.isArray(value.items)
      ) {
        setError(
          "The invoice service returned incomplete details. Contact support before paying.",
        );
        stopped = true;
        return;
      }
      if (value.paymentProvider && !buyer) {
        setLoginRequired(true);
        setError("Sign in to your buyer account to verify this invoice.");
        stopped = true;
        return;
      }
      setError("");
      setInvoice(value);
      if (
        buyer &&
        ["PAID", "PAID_REVIEW", "EXPIRED", "PAYMENT_FAILED"].includes(
          value.status,
        )
      ) {
        try {
          if (readCheckoutAttempt()?.invoiceReference === reference)
            sessionStorage.removeItem(CHECKOUT_ATTEMPT_STORAGE);
        } catch {
          /* Verification remains usable when storage is unavailable. */
        }
      }
      if (buyer && value.paymentProvider && pendingInvoice(value.status))
        schedule();
      else stopped = true;
    };
    const onVisibility = () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible" && !stopped) void load();
    };
    document.addEventListener("visibilitychange", onVisibility);
    void load();
    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reference, validReference, refresh]);

  useEffect(() => {
    if (
      !invoice?.paymentProvider ||
      !pendingInvoice(invoice.status) ||
      !invoice.expiresAt
    )
      return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [invoice]);

  const marketplace = Boolean(invoice?.paymentProvider);
  const expired = Boolean(
    invoice?.expiresAt && Date.parse(invoice.expiresAt) <= now,
  );
  const paymentUrl =
    invoice?.paymentProvider &&
    invoice.status === "AWAITING_PAYMENT" &&
    !expired &&
    !error
      ? hostedPaymentUrl(invoice.authorizationUrl, invoice.paymentProvider)
      : null;
  const terminalFailure =
    invoice && ["EXPIRED", "PAYMENT_FAILED"].includes(invoice.status);

  return (
    <main className="min-h-screen bg-g50 px-5 py-8 text-g800">
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/">
          <BrandLogo className="h-12 w-32 rounded-lg bg-white" />
        </Link>
        <span className="text-xs font-semibold text-g500">
          Secure invoice checkout
        </span>
      </header>
      <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-g200 bg-w p-6 sm:p-8">
        <p className="text-xs font-semibold text-g500">Invoice reference</p>
        <h1 className="mt-2 break-all text-2xl font-bold">
          {validReference ? reference : "Invalid reference"}
        </h1>
        {loading && (
          <output className="mt-6 block text-sm">
            Verifying your invoice…
          </output>
        )}
        {error && (
          <p role="alert" className="mt-5 text-sm text-err">
            {error}
          </p>
        )}
        {loginRequired && (
          <Link
            className="mt-4 inline-block font-semibold text-p underline"
            href={`/login?returnTo=${encodeURIComponent(`/pay/${reference}`)}`}
          >
            Sign in to verify payment
          </Link>
        )}
        {invoice && !loginRequired && (
          <>
            {invoice.pharmacy && (
              <p className="mt-4 text-sm">{invoice.pharmacy}</p>
            )}
            {invoice.isDemo && (
              <p className="mt-3 text-sm font-bold">DEMO DATA</p>
            )}
            <div className="mt-5 divide-y divide-g200 border-y border-g200">
              {invoice.items.map((item, index) => (
                <div
                  key={`${item.description}-${index}`}
                  className="flex justify-between gap-4 py-4 text-sm"
                >
                  <div>
                    <p className="font-semibold">{item.description}</p>
                    <p className="mt-1 text-g500">Quantity: {item.quantity}</p>
                  </div>
                  <span>{money(item.quantity * item.unitPriceNaira)}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 flex justify-between font-bold">
              <span>Total</span>
              <span>
                {money(
                  invoice.totalNaira ??
                    invoice.items.reduce(
                      (sum, item) => sum + item.quantity * item.unitPriceNaira,
                      0,
                    ),
                )}
              </span>
            </p>
            {marketplace ? (
              <div className="mt-6 space-y-4 border-t border-g200 pt-5">
                <output aria-live="polite" className="block font-semibold">
                  {paymentMessage(invoice.status)}
                </output>
                <p className="text-xs leading-5 text-g500">
                  Payment confirmation is separate from clinical release and
                  delivery.
                </p>
                {invoice.status === "PAID_REVIEW" && (
                  <p className="text-sm">
                    Do not make another payment. Contact support for review.
                  </p>
                )}
                {invoice.fulfillmentState && (
                  <p className="text-xs text-g500">
                    Fulfillment:{" "}
                    {invoice.fulfillmentState
                      .replaceAll("_", " ")
                      .toLowerCase()}
                  </p>
                )}
                {pendingInvoice(invoice.status) && (
                  <p className="text-xs leading-5 text-g500">
                    We check for confirmation while this page is visible.
                    Provider outages may delay confirmation. If you have already
                    paid, wait for verification before making another payment.
                  </p>
                )}
                {invoice.paymentMethods?.length > 0 &&
                  pendingInvoice(invoice.status) && (
                    <p className="text-xs text-g500">
                      Payment channels: {invoice.paymentMethods.join(", ")}.
                      Availability is determined at checkout.
                    </p>
                  )}
                {paymentUrl && invoice.paymentProvider && (
                  <a
                    className="inline-flex rounded-xl bg-p px-5 py-3 text-sm font-semibold text-white"
                    href={paymentUrl}
                  >
                    Continue to {providerLabel(invoice.paymentProvider)}
                  </a>
                )}
                {terminalFailure && (
                  <Link
                    className="inline-flex rounded-xl bg-p px-5 py-3 text-sm font-semibold text-white"
                    href="/portal"
                  >
                    Start a new marketplace checkout
                  </Link>
                )}
                {pendingInvoice(invoice.status) && (
                  <button
                    type="button"
                    disabled={loading}
                    className="block text-sm font-semibold text-p underline"
                    onClick={() => {
                      setLoading(true);
                      setRefresh((value) => value + 1);
                    }}
                  >
                    Refresh payment status
                  </button>
                )}
              </div>
            ) : (
              <InvoicePayment
                reference={reference}
                status={invoice.status}
                paymentMethods={invoice.paymentMethods}
                paystackUrl={invoice.paystackUrl}
              />
            )}
          </>
        )}
        {!loading && error && !loginRequired && (
          <button
            type="button"
            className="mt-4 block text-sm font-semibold text-p underline"
            onClick={() => {
              setLoading(true);
              setRefresh((value) => value + 1);
            }}
          >
            Retry invoice verification
          </button>
        )}
        <Link
          className="mt-8 inline-block text-sm font-semibold text-p"
          href={marketplace ? "/portal" : "/"}
        >
          Return to {marketplace ? "your dashboard" : "Oncosourz"}
        </Link>
      </section>
    </main>
  );
}
