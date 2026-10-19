"use client";

import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import GuestCheckout from "./GuestCheckout";

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
    body: "Prevent expensive drug write-offs with automated near-expiry alerts. Manage traceable stock, orders, and Paystack card and bank-transfer payments with automated payouts from one workspace.",
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
    body: "Doctors issue Paystack invoice links. Patients and families pay by card, bank transfer or USSD, using the methods available on their invoice.",
  },
];

export default function PublicFlows() {
  const [invoiceRef, setInvoiceRef] = useState("");
  const [checkoutReference, setCheckoutReference] = useState<string | null>(
    null,
  );

  const openInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reference = invoiceRef.trim();
    if (/^[A-Za-z0-9-]{3,64}$/.test(reference)) setCheckoutReference(reference);
  };

  return (
    <>
      {checkoutReference ? (
        <GuestCheckout
          key={checkoutReference}
          reference={checkoutReference}
          onClose={() => setCheckoutReference(null)}
        />
      ) : null}
      <section
        className="bg-[var(--landing-bg)] px-8 py-24 max-[600px]:px-5 max-[600px]:py-16"
        id="network"
      >
        <div className="mx-auto max-w-[1100px]">
          <div data-reveal className="max-w-[600px]">
            <p className="mb-3 text-xs font-bold uppercase text-[var(--landing-accent)]">
              One connected network
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-[var(--landing-text)]">
              Built around the people moving oncology care forward.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 max-[700px]:grid-cols-1">
            {NETWORKS.map(({ icon: Icon, ...item }) => (
              <article
                data-reveal
                data-motion-card
                className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-7 shadow-sm"
                key={item.title}
              >
                <Icon
                  className="mb-5 size-7 text-[var(--landing-accent)]"
                  aria-hidden="true"
                />
                <h3 className="mb-2 font-display text-xl font-bold text-[var(--landing-text)]">
                  {item.title}
                </h3>
                <p className="max-w-[460px] text-sm leading-7 text-[var(--landing-muted)]">
                  {item.body}
                </p>
                <a
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--landing-accent)] hover:text-[var(--landing-text)]"
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
        className="bg-[var(--landing-surface)] px-8 py-24 max-[600px]:px-5 max-[600px]:py-16"
        id="how-it-works"
      >
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-xs font-bold uppercase text-[var(--landing-accent)]">
            How it works
          </p>
          <h2 className="max-w-[600px] font-display text-3xl font-extrabold leading-tight text-[var(--landing-text)]">
            From verified credentials to a patient-ready invoice.
          </h2>
          <div className="mt-10 grid grid-cols-3 gap-8 max-[760px]:grid-cols-1">
            {STEPS.map(({ icon: Icon, ...step }) => (
              <article
                data-reveal
                data-motion-card
                className="border-t-2 border-[var(--landing-accent)] pt-5"
                key={step.number}
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-[var(--landing-accent)]">
                    {step.number}
                  </span>
                  <Icon
                    className="size-5 text-[var(--landing-muted)]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-[var(--landing-text)]">
                  {step.title}
                </h3>
                <p className="text-sm leading-7 text-[var(--landing-muted)]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-[var(--landing-soft)] px-8 py-20 max-[600px]:px-5 max-[600px]:py-14"
        id="quick-pay"
      >
        <div className="mx-auto grid max-w-[1100px] grid-cols-[1fr_0.8fr] items-center gap-12 max-[760px]:grid-cols-1">
          <div>
            <p className="mb-3 text-xs font-bold uppercase text-[var(--landing-accent)]">
              Patient and family checkout
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight text-[var(--landing-text)]">
              Have an invoice reference?
            </h2>
            <p className="mt-4 max-w-[520px] text-sm leading-7 text-[var(--landing-muted)]">
              Enter the code supplied by your care team to look up the invoice.
              You do not need to create an Oncosourz account.
            </p>
          </div>
          <form
            data-reveal
            className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 shadow-xl shadow-slate-900/5"
            onSubmit={openInvoice}
          >
            <label
              className="mb-2 block text-sm font-semibold text-[var(--landing-text)]"
              htmlFor="invoice-ref"
            >
              Invoice reference
            </label>
            <div className="flex gap-2 max-[480px]:flex-col">
              <input
                autoComplete="off"
                className="min-w-0 flex-1 rounded-md border border-[var(--landing-border)] px-3 py-3 text-sm outline-none bg-[var(--landing-surface)] text-[var(--landing-text)] placeholder:text-[var(--landing-muted)] focus:border-[var(--landing-accent)] focus:ring-2 focus:ring-[var(--landing-accent)]/20"
                id="invoice-ref"
                maxLength={64}
                onChange={(event) => setInvoiceRef(event.target.value)}
                pattern="(?:[A-Za-z0-9]|-){3,64}"
                placeholder="e.g. OB-89201"
                required
                value={invoiceRef}
              />
              <button
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--landing-cta)] px-4 py-3 text-sm font-bold text-[var(--landing-on-cta)] transition-colors hover:opacity-90"
                type="submit"
              >
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--landing-muted)]">
              Invoice details and payment options appear only after the
              reference is verified. Debit card, bank transfer, Apple Pay or
              USSD are available where supported and enabled for your checkout.
            </p>
          </form>
        </div>
      </section>
      <section className="bg-[#12334c] px-6 py-16 text-white">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-7">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#a4d3d0]">
              Enterprise &amp; Research
            </p>
            <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
              Better evidence. Stronger supply networks. More connected care.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Connect with Oncosourz on oncology research and enterprise
              partnerships across West Africa.
            </p>
          </div>
          <a
            href="/research"
            className="inline-flex items-center gap-3 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            Explore partnerships <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </>
  );
}
