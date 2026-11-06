import InvoiceCheckout from "@/app/components/InvoiceCheckout";

export default async function InvoiceCheckoutPage({
  params,
}: PageProps<"/pay/[invoiceRef]">) {
  const { invoiceRef } = await params;
  return <InvoiceCheckout key={invoiceRef} reference={invoiceRef} />;
}
