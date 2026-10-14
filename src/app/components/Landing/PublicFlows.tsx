"use client";

import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const NETWORKS = [
  {
    icon: Stethoscope,
    title: "For doctors",
    body: "Search real-time oncology availability across verified pharmacies and clinics, then reserve stock for a patient.",
    action: "Doctor registration",
    href: "/register",
  },
  {
    icon: Building2,
    title: "For pharmacies",
    body: "Track batches and expiry dates, receive near-expiry alerts, and manage orders from one inventory workspace.",
    action: "Open pharmacy portal",
    href: "/portal",
  },
];

const STEPS = [
  {
    icon: ClipboardCheck,
    number: "01",
    title: "Verify professional credentials",
    body: "Doctors and pharmacy teams submit their relevant professional or store licences for review.",
  },
  {
    icon: Search,
    number: "02",
    title: "Find or list traceable stock",
    body: "Search verified oncology inventory or add batches with quantities and expiry dates.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Share an invoice with the patient",
    body: "A doctor can issue an invoice reference for the patient to use through the guest checkout flow.",
  },
];

export default function PublicFlows() {
  const router = useRouter();
  const [invoiceRef, setInvoiceRef] = useState("");

  const openInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reference = invoiceRef.trim();
    if (reference) router.push(`/pay/${encodeURIComponent(reference)}`);
  };

  return (
    <>
      <section
        className="bg-offwhite px-8 py-24 max-[600px]:px-5 max-[600px]:py-16"
        id="network"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-[600px]">
            <p className="mb-3 text-xs font-bold uppercase text-sky">
              One connected network
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-navy">
              Built around the people moving oncology care forward.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 border-y border-slate-200 max-[700px]:grid-cols-1">
            {NETWORKS.map(({ icon: Icon, ...item }) => (
              <article className="py-8" key={item.title}>
                <Icon className="mb-5 size-7 text-teal" aria-hidden="true" />
                <h3 className="mb-2 font-display text-xl font-bold text-navy">
                  {item.title}
                </h3>
                <p className="max-w-[460px] text-sm leading-7 text-slate-600">
                  {item.body}
                </p>
                <a
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal hover:text-navy"
                  href={item.href}
                >
                  {item.action}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-white px-8 py-24 max-[600px]:px-5 max-[600px]:py-16"
        id="how-it-works"
      >
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-xs font-bold uppercase text-sky">
            How it works
          </p>
          <h2 className="max-w-[600px] font-display text-3xl font-extrabold leading-tight text-navy">
            From verified credentials to a patient-ready invoice.
          </h2>
          <div className="mt-10 grid grid-cols-3 gap-8 max-[760px]:grid-cols-1">
            {STEPS.map(({ icon: Icon, ...step }) => (
              <article
                className="border-t-2 border-teal pt-5"
                key={step.number}
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-teal">
                    {step.number}
                  </span>
                  <Icon className="size-5 text-slate-500" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-navy">
                  {step.title}
                </h3>
                <p className="text-sm leading-7 text-slate-600">{step.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-[780px] border-l-2 border-amber-500 pl-4 text-xs leading-6 text-slate-600">
            Payment processing and automated settlement require a configured
            Paystack merchant account and server-side integration. No payment is
            collected from this preview.
          </p>
        </div>
      </section>

      <section
        className="bg-[#edf5f2] px-8 py-20 max-[600px]:px-5 max-[600px]:py-14"
        id="quick-pay"
      >
        <div className="mx-auto grid max-w-[1100px] grid-cols-[1fr_0.8fr] items-center gap-12 max-[760px]:grid-cols-1">
          <div>
            <p className="mb-3 text-xs font-bold uppercase text-teal">
              Patient and family checkout
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-navy">
              Have an invoice reference?
            </h2>
            <p className="mt-4 max-w-[520px] text-sm leading-7 text-slate-600">
              Enter the code supplied by your care team to look up the invoice.
              You do not need to create an Oncosourz account.
            </p>
          </div>
          <form
            className="border border-slate-200 bg-white p-6"
            onSubmit={openInvoice}
          >
            <label
              className="mb-2 block text-sm font-semibold text-navy"
              htmlFor="invoice-ref"
            >
              Invoice reference
            </label>
            <div className="flex gap-2 max-[480px]:flex-col">
              <input
                autoComplete="off"
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                id="invoice-ref"
                maxLength={64}
                onChange={(event) => setInvoiceRef(event.target.value)}
                pattern="(?:[A-Za-z0-9]|-){3,64}"
                placeholder="e.g. OB-89201"
                required
                value={invoiceRef}
              />
              <button
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-navy px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal"
                type="submit"
              >
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Invoice details and payment options appear only after the
              reference is verified.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
