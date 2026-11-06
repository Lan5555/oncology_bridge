export type PaymentProvider = "PAYSTACK" | "FLUTTERWAVE";
export type InvoiceStatus =
  | "INITIALIZING"
  | "INITIALIZATION_UNKNOWN"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "PAID_REVIEW"
  | "EXPIRED"
  | "PAYMENT_FAILED";
export interface CheckoutBody {
  listingId: string;
  quantity: number;
  prescriptionId?: string;
  paymentProvider: PaymentProvider;
}
export interface CheckoutAttempt {
  key: string;
  body: CheckoutBody;
  invoiceReference?: string;
  orderId?: string;
  expiresAt?: string;
}
export const CHECKOUT_ATTEMPT_STORAGE = "marketplaceCheckoutAttempt";
export const providerLabel = (provider: PaymentProvider) =>
  provider === "FLUTTERWAVE" ? "Flutterwave" : "Paystack";
export const pendingInvoice = (status: string) =>
  ["INITIALIZING", "INITIALIZATION_UNKNOWN", "AWAITING_PAYMENT"].includes(
    status,
  );
export const newCheckoutAllowed = (
  attempt: CheckoutAttempt,
  now = Date.now(),
) => Boolean(attempt.expiresAt && Date.parse(attempt.expiresAt) <= now);

/** Only the server's selected gateway may supply the hosted payment URL. */
export function hostedPaymentUrl(
  value: unknown,
  provider: PaymentProvider,
): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const host =
      provider === "FLUTTERWAVE"
        ? "checkout.flutterwave.com"
        : provider === "PAYSTACK"
          ? "checkout.paystack.com"
          : "";
    return url.protocol === "https:" &&
      url.hostname === host &&
      !url.username &&
      !url.password &&
      !url.port
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function readCheckoutAttempt(): CheckoutAttempt | null {
  const raw = sessionStorage.getItem(CHECKOUT_ATTEMPT_STORAGE);
  if (!raw) return null;
  const value = JSON.parse(raw) as CheckoutAttempt;
  if (
    !value?.key ||
    !value.body?.listingId ||
    !Number.isInteger(value.body.quantity) ||
    !["PAYSTACK", "FLUTTERWAVE"].includes(value.body.paymentProvider)
  ) {
    throw new Error(
      "Saved checkout details are unavailable. Contact support before starting another payment.",
    );
  }
  return value;
}

export function checkoutErrorMessage(status?: number, code?: string): string {
  if (status === 401)
    return "Sign in to your buyer account again, then retry this same checkout.";
  if (status === 403)
    return "Access denied. Your buyer account cannot use this checkout.";
  if (code === "PAYMENT_MISMATCH")
    return "Payment details require support review. Do not make another payment.";
  if (code === "IDEMPOTENCY_CONFLICT")
    return "This checkout attempt has different saved details. Contact support before paying again.";
  if (code === "STOCK_UNAVAILABLE")
    return "Stock is no longer available for this checkout. Refresh availability before starting again.";
  if (status === 422)
    return "Check the quantity, approved prescription and checkout details before retrying.";
  if (status === 503)
    return "This payment provider is unavailable. Your input has been preserved.";
  if (status === 502 || status === 0)
    return "Checkout confirmation is uncertain. Retry the same attempt; keep the same provider and details.";
  return "Checkout could not be confirmed. Retry this same attempt or contact support.";
}
