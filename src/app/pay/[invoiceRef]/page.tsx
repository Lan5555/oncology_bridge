import BrandLogo from "@/app/components/BrandLogo";
import { ArrowLeft, CircleAlert, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { BRIDGE_DATA_SERVICE } from "@/app/services/bridge-data/bridge-data-service";
import InvoicePayment from "@/app/components/InvoicePayment";

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
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <main className="min-h-screen bg-g50 px-5 py-8 text-g800">
      <header className="mx-auto flex max-w-[1080px] items-center justify-between">
        <Link
          className="font-display text-lg font-extrabold text-g900"
          href="/"
        >
          <BrandLogo className="h-12 w-32 rounded-lg bg-white" />
        </Link>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-g500">
          <LockKeyhole className="size-4" aria-hidden="true" /> Guest invoice
          lookup
        </div>
      </header>
      <div className="mx-auto mt-14 grid max-w-[1080px] grid-cols-[1fr_0.8fr] gap-10 max-[760px]:grid-cols-1">
        <section>
          <p className="text-xs font-bold uppercase text-[#a04f2a]">
            Invoice reference
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-g900">
            {safeReference}
          </h1>
          <p className="mt-3 max-w-[520px] text-sm leading-7 text-g500">
            Your care team can provide this code. Invoice details and available
            payment methods must be verified by Oncosourz before payment.
          </p>
          {invoice ? (
            <section
              className="mt-8 border border-g200 bg-w p-6"
              aria-labelledby="invoice-detail-title"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2
                    id="invoice-detail-title"
                    className="font-display text-lg font-bold text-g900"
                  >
                    Invoice details
                  </h2>
                  <p className="mt-1 text-sm text-g500">{invoice.pharmacy}</p>
                </div>
                {invoice.isDemo ? (
                  <span className="border border-[#e7c89b] bg-[#fff8eb] px-2.5 py-1 text-xs font-bold text-[#80521e]">
                    DEMO DATA
                  </span>
                ) : null}
              </div>
              <div className="mt-5 divide-y divide-[#e5ebe7] border-y border-g100">
                {invoice.items.map((item) => (
                  <div
                    className="flex justify-between gap-5 py-4 text-sm"
                    key={item.description}
                  >
                    <div>
                      <p className="font-semibold text-g700">
                        {item.description}
                      </p>
                      <p className="mt-1 text-xs text-g500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-g700">
                      {formatNaira(item.quantity * item.unitPriceNaira)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-4 pt-4 font-display text-base font-bold text-g900">
                <span>Total</span>
                <span>
                  {formatNaira(
                    invoice.items.reduce(
                      (total, item) =>
                        total + item.quantity * item.unitPriceNaira,
                      0,
                    ),
                  )}
                </span>
              </div>
            </section>
          ) : (
            <div className="mt-8 border border-g200 bg-w p-5 text-sm leading-6 text-g500">
              No matching invoice was found for this reference. Check the code
              with your care team.
            </div>
          )}
        </section>
        <section className="border border-g200 bg-w p-6">
          <div className="flex items-start gap-3">
            <CircleAlert
              className="mt-0.5 size-5 shrink-0 text-[#a04f2a]"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-display text-base font-bold text-g900">
                Secure checkout
              </h2>
              <p className="mt-2 text-sm leading-6 text-g500">
                Payment is initialized by the backend and processed by its
                configured provider.
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-g100 pt-5 text-xs leading-5 text-g500">
            Payment options are provided by the invoice service.
          </div>
          {invoice ? (
            <InvoicePayment
              paymentMethods={invoice.paymentMethods}
              reference={invoice.reference}
              status={invoice.status}
              paystackUrl={invoice.paystackUrl}
            />
          ) : null}
          <Link
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-p hover:text-g900"
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
