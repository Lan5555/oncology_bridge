"use client";

import { useState } from "react";

interface MockInvoicePaymentProps {
  paymentMethods: string[];
}

export default function MockInvoicePayment({
  paymentMethods,
}: MockInvoicePaymentProps) {
  const [method, setMethod] = useState(paymentMethods[0] ?? "Debit card");
  const [simulated, setSimulated] = useState(false);

  return (
    <div className="mt-5 border-t border-[#e5ebe7] pt-5">
      <label className="mb-2 block text-xs font-semibold text-[#52665f]" htmlFor="mock-payment-method">
        Payment method (demo)
      </label>
      <select
        className="w-full rounded-md border border-[#ccd7d2] bg-white px-3 py-3 text-sm text-[#19332f] outline-none focus:border-[#126b5d]"
        id="mock-payment-method"
        onChange={(event) => setMethod(event.target.value)}
        value={method}
      >
        {paymentMethods.map((paymentMethod) => (
          <option key={paymentMethod} value={paymentMethod}>{paymentMethod}</option>
        ))}
      </select>
      <button
        className="mt-3 w-full rounded-md bg-[#173b35] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#126b5d]"
        onClick={() => setSimulated(true)}
        type="button"
      >
        {simulated ? "Demo payment complete" : `Simulate ${method} payment`}
      </button>
      <p aria-live="polite" className="mt-3 text-xs leading-5 text-[#73847b]">
        {simulated
          ? "Demo only: this changed the screen state. No payment was made."
          : "This action only changes the local demo state; it does not contact a payment provider."}
      </p>
    </div>
  );
}