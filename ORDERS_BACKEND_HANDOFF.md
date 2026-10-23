# Purchase orders API implementation contract

Frontend implemented: buyer Dashboard > Orders (also linked from Marketplace) and Admin > Orders & payments > Orders. The frontend integration is ready; these backend endpoints and real checkout reconciliation are not verified by this repository. Keep prescription authorizations and stock redistribution separate from purchase orders.

## Endpoints

All endpoints require a bearer access token and return `{ "success": true, "message": "", "data": ... }`. Failures use appropriate HTTP status plus `{ "success": false, "message": "User-safe explanation", "data": null }`.

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/orders` | List only the authenticated buyer's marketplace purchases. Derive ownership from JWT; never accept a buyer ID to widen scope. |
| GET | `/api/orders/:orderId` | Buyer-owned order detail; return 404 for missing or other buyers' orders. |
| GET | `/admin/api/orders` | Network purchase orders; require admin access and `order.read` within the admin's authorized scope. |
| GET | `/admin/api/orders/:orderId` | Admin detail within authorized scope; require `order.read`. |
| PATCH | `/admin/api/orders/:orderId/fulfillment` | Update fulfillment; require admin access plus `order.manage`. |

Both list endpoints accept `page` (default 1), `limit` (default 20, maximum 100), `q`, `status`, `paymentStatus`. Omit empty filters. Search order reference and purchased medicine names; admin search also includes buyer/facility name. Combine supplied filters with AND. Sort newest `createdAt` first, with `id` as stable tie breaker. Paginate/count after authorization and filtering. Return an empty page as success, never fabricated records. Add `pg-orders` to verified buyer `allowed_pages` where explicit grants are returned.

Order statuses: `PENDING_PAYMENT | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED`.

Payment statuses: `PENDING | PAID | FAILED | REFUNDED | PARTIALLY_REFUNDED`. Keep payment and fulfillment independent; failed payment is not successful fulfillment, and cancellation is not evidence of a refund.

## Exact list response

`data` has this TypeScript shape (also defined in `src/app/services/order-service/order-service.ts`):

```ts
type Order = {
  id: string;                 // Internal UUID, not a user-facing order label
  reference: string;          // Unique human-readable order reference
  createdAt: string;          // ISO 8601 timestamp including timezone
  updatedAt: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  currency: string | null;    // ISO 4217, e.g. NGN
  totalMinor: number | null;  // Integer minor units: NGN kobo, not naira
  buyer: { name: string; facilityName: string | null };
  seller: { name: string };
  itemCount: number;          // Count of order lines, not sum of quantity
};
type OrderPage = {
  items: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;            // Full filtered authorized count
    totalPages: number;       // Math.ceil(total / limit), 0 when empty
  };
};
```

An empty response is `{ "success": true, "message": "", "data": { "items": [], "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } } }`.

All amounts must come from persisted, server-priced checkout snapshots. Use null when genuinely unavailable; zero means an actual zero charge. Reject invalid currencies and non-integer amounts on writes.

## Exact detail response

Both detail endpoints return the order directly as `data`, with all `Order` fields above and:

```ts
type OrderDetailFields = {
  version: number;             // Optimistic concurrency revision
  items: {
    id: string;
    name: string;             // Snapshot of purchased medicine name
    strength: string | null;
    quantity: number;
    unit: string | null;
    unitPriceMinor: number | null;
    totalMinor: number | null;
  }[];
  subtotalMinor: number | null;
  deliveryFeeMinor: number | null;
  paymentReference: string | null;
  paidAt: string | null;
  delivery: {
    recipientName: string | null;
    address: string | null;
    carrier: string | null;
    trackingNumber: string | null;
    estimatedDeliveryAt: string | null;
    deliveredAt: string | null;
  } | null;
  timeline: {
    id: string;
    status: string;            // Order or payment status for this event
    message: string;           // Customer-visible message, no internal notes/secrets
    occurredAt: string;
  }[];                        // Chronological, oldest first; append-only
  allowedTransitions: ("PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED")[];
};
```

Return `allowedTransitions: []` for buyers, read-only admins, terminal orders and ineligible payment states. Admin UI offers only these server-supplied transitions. Do not return payment-provider secrets, raw provider payloads, unrelated patient details, or internal admin notes.

## Fulfillment update

```http
PATCH /admin/api/orders/:orderId/fulfillment
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

```json
{
  "status": "SHIPPED",
  "expectedVersion": 3,
  "note": "Dispatched with the carrier; tracking is now available.",
  "carrier": "Actual carrier name",
  "trackingNumber": "Actual tracking number"
}
```

`note` is required, trimmed, 1–1000 characters, and customer-visible. `carrier` and `trackingNumber` are required for SHIPPED (trimmed, 1–120 characters), omitted for other transitions. Only accept documented fields; never accept client-written payment status, totals, ownership or timestamps. Return the complete updated `OrderDetail` in `data` on HTTP 200.

Enforce the state machine transactionally: verified payment moves PENDING_PAYMENT to CONFIRMED; admin fulfillment moves CONFIRMED to PROCESSING, PROCESSING to SHIPPED, and SHIPPED to DELIVERED. Eligible pre-shipment orders may move to CANCELLED according to backend cancellation policy. No backward movement or changes from terminal states. Require PAID for PROCESSING/SHIPPED/DELIVERED. Do not offer pending-payment cancellation if provider reconciliation cannot safely handle an in-flight payment. Cancellation of paid orders must follow a backend compensation/refund policy; never label them REFUNDED until provider confirmation. If unsupported, exclude CANCELLED for those orders.

Validate permission, current eligibility and `expectedVersion` on every update. Atomically increment version, save fulfillment/delivery data, append a timeline event and an audit event with actor, previous/new status and timestamp. Set `deliveredAt` from server time on delivery. Return 409 for stale version or invalidated transition, 400/422 for invalid input, 401 for unauthenticated, 403 for insufficient permission, and 404 for inaccessible/missing orders. The frontend reloads on 409 and requires review before resubmission.

## Existing checkout integration

The current frontend already POSTs `/api/marketplace/checkout` with `{ listingId, quantity, prescriptionId? }` and an `Idempotency-Key` header, then follows the returned `data.authorizationUrl` to Paystack. Preserve that behavior.

1. Create/persist a buyer-owned order and immutable item/price/currency/seller snapshots during checkout initialization. Return `{ orderId, orderReference, authorizationUrl }` in the existing response. A completed initialization must make the purchase visible in GET `/api/orders` as PENDING_PAYMENT/PENDING. Associate all provider attempts with the order; reusing the same idempotency key and payload must reuse the order, not duplicate it. Reusing a key with a different payload should return 409.
2. Validate seller eligibility, listing stock, price, currency and any prescription authorization on the server. Atomically reserve stock so concurrent checkouts cannot oversell. Handle initialization failures, abandoned/expired payments and reservation release explicitly.
3. Verify payment server-side with the provider. A browser redirect or arbitrary client request must never mark PAID. Validate provider reference, amount, currency and order association. Process duplicate webhook/verification events idempotently and serialize settlement versus reservation expiry/cancellation; prevent late PAID events from creating fulfillable orders with released stock.
4. On verified payment, update payment status/paidAt, confirm the order, consume the stock reservation once and append tracking events in a transaction. Persist actual FAILED/refund states only from authoritative outcomes. Use the existing reusable email/outbox service for confirmed purchases, shipment and delivery, with deduplication; do not expose internal email payloads to the buyer.
5. Keep purchase payment verification distinct from merchant payouts/settlements. This orders UI does not implement seller payouts or a refund API. Existing prescription/invoice purchases must be deliberately mapped into this order model before appearing here; do not treat prescriptions as purchase orders implicitly.

## Acceptance checks

- A buyer sees only their own purchases; substituting another buyer's order ID returns 404. Admin access is scoped and protected even when calling the API directly.
- Simultaneous customer/admin sessions use their respective bearer tokens. Buyer calls never fall back to an admin session.
- Filtering and pagination work on persisted orders; unknown/null fields remain unavailable, never invented.
- Repeated checkout initialization and duplicate payment callbacks create one order and one stock deduction.
- Shipping requires actual carrier/tracking details, permission, paid eligibility and the current version. Duplicate/stale changes return 409 without repeating timeline/email/stock effects.
- Read-only admins receive no allowed transitions. Provider errors and unimplemented endpoints return explicit failures, not an empty success.
- Buyer and admin screens refresh order tracking periodically while visible; fulfillment drafts pause automatic refresh so edits are preserved.
