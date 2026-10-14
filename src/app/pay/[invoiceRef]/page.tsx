import { ArrowLeft, CircleAlert, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { BRIDGE_DATA_SERVICE } from "@/app/services/bridge-data/bridge-mock-service";
import MockInvoicePayment from "@/app/components/MockInvoicePayment";

export default async function InvoiceCheckoutPage({
  params,
}: PageProps<"/pay/[invoiceRef]">) {
  const { invoiceRef } = await params;
  const safeReference = /^[A-Za-z0-9-]{3,64}$/.test(invoiceRef)
    ? invoiceRef
    : "Invalid reference";
  const invoice =
    safeReference === "Invalid reference"
      ? null
      : await BRIDGE_DATA_SERVICE.findInvoiceByReference(safeReference);
  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <main className="min-h-screen bg-[#f3f6f5] px-5 py-8 text-[#19332f]">
      <header className="mx-auto flex max-w-[1080px] items-center justify-between">
        <Link
          className="font-display text-lg font-extrabold text-[#173b35]"
          href="/"
        >
          Oncosourz
        </Link>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#60726d]">
          <LockKeyhole className="size-4" aria-hidden="true" /> Guest invoice
          lookup
        </div>
      </header>
      <div className="mx-auto mt-14 grid max-w-[1080px] grid-cols-[1fr_0.8fr] gap-10 max-[760px]:grid-cols-1">
        <section>
          <p className="text-xs font-bold uppercase text-[#a04f2a]">
            Invoice reference
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-[#173b35]">
            {safeReference}
          </h1>
          <p className="mt-3 max-w-[520px] text-sm leading-7 text-[#5d6e69]">
            Your care team can provide this code. Invoice details and available
            payment methods must be verified by Oncosourz before payment.
          </p>
          {invoice ? (
            <section className="mt-8 border border-[#d4dfd9] bg-white p-6" aria-labelledby="invoice-detail-title">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 id="invoice-detail-title" className="font-display text-lg font-bold text-[#173b35]">Invoice details</h2>
                  <p className="mt-1 text-sm text-[#5d6e69]">{invoice.pharmacy}</p>
                </div>
                <span className="border border-[#e7c89b] bg-[#fff8eb] px-2.5 py-1 text-xs font-bold text-[#80521e]">DEMO DATA</span>
              </div>
              <div className="mt-5 divide-y divide-[#e5ebe7] border-y border-[#e5ebe7]">
                {invoice.items.map((item) => (
                  <div className="flex justify-between gap-5 py-4 text-sm" key={item.description}>
                    <div>
                      <p className="font-semibold text-[#263f39]">{item.description}</p>
                      <p className="mt-1 text-xs text-[#71807b]">Quantity: {item.quantity}</p>
                    </div>
                    <span className="shrink-0 text-[#263f39]">{formatNaira(item.quantity * item.unitPriceNaira)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-4 pt-4 font-display text-base font-bold text-[#173b35]">
                <span>Total</span>
                <span>{formatNaira(invoice.items.reduce((total, item) => total + item.quantity * item.unitPriceNaira, 0))}</span>
              </div>
            </section>
          ) : (
            <div className="mt-8 border border-[#d4dfd9] bg-white p-5 text-sm leading-6 text-[#5d6e69]">
              No matching demo invoice was found for this reference. Check the code with your care team.
            </div>
          )}
        </section>
        <section className="border border-[#d4dfd9] bg-white p-6">
          <div className="flex items-start gap-3">
            <CircleAlert
              className="mt-0.5 size-5 shrink-0 text-[#a04f2a]"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-display text-base font-bold text-[#173b35]">
                Demonstration checkout
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5d6e69]">
                This screen uses local mock invoice data. No payment is sent to
                Paystack, no funds move, and no real pharmacy order is created.
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-[#e5ebe7] pt-5 text-xs leading-5 text-[#76847f]">
            Payment methods shown in a live checkout must be enabled by the
            merchant and confirmed by the external payment backend.
          </div>
          {invoice ? <MockInvoicePayment paymentMethods={invoice.paymentMethods} /> : null}
          <Link
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#126b5d] hover:text-[#173b35]"
            href="/"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Return to
            Oncosourz
          </Link>
        </section>
      </div>
    </main>
  );
}
