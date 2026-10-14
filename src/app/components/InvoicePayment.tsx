"use client";

interface InvoicePaymentProps {
  paymentMethods: string[];
  reference: string;
}

export default function InvoicePayment({ reference }: InvoicePaymentProps) {
  return (
    <div className="mt-5 border-t border-[#e5ebe7] pt-5">
      <p className="text-sm font-semibold text-[#19332f]">
        Payment is not available yet
      </p>
      <p className="mt-2 text-xs leading-5 text-[#73847b]">
        Invoice {reference} can be viewed, but payment checkout and verification
        are not implemented by the connected API yet.
      </p>
    </div>
  );
}
