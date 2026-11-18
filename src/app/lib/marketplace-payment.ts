export type PaymentProvider = "PAYSTACK" | "FLUTTERWAVE";
export const DEFAULT_PAYMENT_PROVIDER: PaymentProvider = "FLUTTERWAVE";
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
    const allowedHost =
      provider === "FLUTTERWAVE"
        ? [
            "checkout.flutterwave.com",
            "checkout-v2.dev-flutterwave.com",
          ].includes(url.hostname)
        : provider === "PAYSTACK" && url.hostname === "checkout.paystack.com";
    return url.protocol === "https:" &&
      allowedHost &&
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

export function checkoutErrorMessage(
  status?: number,
  code?: string,
  detail?: string,
): string {
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
  if (status === 422) {
    if (
      (code === "PRESCRIPTION_REQUIRED" ||
        code === "PRESCRIPTION_NOT_APPROVED" ||
        code === "INVALID_QUANTITY" ||
        code === "INVALID_PAYMENT_PROVIDER") &&
      detail?.trim()
    )
      return detail.trim();
    return "Check the quantity, approved prescription and checkout details before retrying.";
  }
  if (status === 503)
    return "This payment provider is unavailable. Your input has been preserved.";
  if (status === 0)
    return "We could not reach the checkout server. Your details are saved. Use Retry saved checkout when the connection is back.";
  if (status === 408)
    return "Checkout took too long to respond. Use Retry saved checkout.";
  if (status === 502)
    return "We could not confirm a payment link. Use Retry saved checkout to keep the same payment attempt.";
  return "Checkout could not be confirmed. Retry this same attempt or contact support.";
}
