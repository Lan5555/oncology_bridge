# Medicine marketplace — backend handoff


## Common contract

### Who adds inventory: facility admins and authorized pharmacy staff

Inventory intake happens before marketplace listing. Authorized facility staff can use **Inventory** for manual batch entry or **GS1 scanner** to scan/decode and record product identifiers. Both workflows must write to the same facility-scoped inventory source of truth. Marketplace listing then references that inventory batch and adds price, photographs and selling details.

For the designated facility admin responsible for stock, the backend must grant `inventory.manage` and return `pg-inventory`, `pg-scan` and `pg-medicines` in the authenticated user's `allowed_pages`. Grant the same stock capability to staff explicitly authorized to add inventory. These tools are not limited to accounts whose type is `PHARMACY_STORE`: a verified `PHARMACIST` or `DOCTOR` serving as facility admin may receive explicit stock grants. The frontend now honors these page grants across account types and also exposes all three tools when `inventory.manage` is present in user or role permissions.

Example stock-admin claims (merge with the user's other grants):

```json
{
  "account_type": "PHARMACIST",
  "verification_status": "VERIFIED",
  "permissions": ["facility.users.manage", "inventory.manage"],
  "can_manage_facility_users": true,
  "allowed_pages": ["pg-dashboard", "pg-users", "pg-inventory", "pg-scan", "pg-medicines", "pg-marketplace", "pg-settings"]
}
```

`facility.users.manage` and `can_manage_facility_users` govern team management; they do not automatically grant stock mutation permission. Enforce `inventory.manage` (or the backend's equivalent granular stock permissions), verified/active membership, and facility scope on manual intake, scans and catalogue mutations. Derive the facility from the authenticated principal; reject another facility's ID. Unverified accounts remain limited to dashboard and settings even if stock grants are present. Refresh the user's session after assigning new grants so navigation receives them. Marketplace seller eligibility remains as specified below: stock administration does not automatically authorize publishing marketplace listings.

- Base URL: `NEXT_PUBLIC_BASE_URL`. All marketplace requests use the existing bearer JWT client and refresh flow. Enable CORS for the frontend origin, `Authorization`, `Content-Type`, and `Idempotency-Key`.
- Envelope: `{ "success": true, "message": "", "data": {} }`. Errors use `success: false`, a useful `message`, and an appropriate HTTP status. No HTML errors.
- IDs are opaque strings. Dates use ISO 8601. Prices exposed by this UI are numeric NGN (`unitPriceNaira`); store and calculate integer kobo server-side.
- Verified DOCTOR, PHARMACIST and PHARMACY_STORE accounts can browse and buy through `pg-marketplace`. Only verified PHARMACY_STORE members with permission to list stock for their active facility may create listings. The server must enforce authorization, facility ownership and active facility status on every relevant endpoint.
- Medicine catalogue records describe drugs; marketplace listings represent a specific seller's inventory batch and price. Preserve existing catalogue and inventory endpoints.

## 1. GET /api/marketplace/listings

Query parameters actually sent by the frontend:

| Parameter | Values |
| --- | --- |
| `q` | Generic name or brand; empty means all |
| `location` | City or facility name; empty means all |
| `category` | Empty, `Biologics`, `Chemotherapy`, `Supportive care`, `Other` |
| `sort` | `newest`, `price_asc`, `price_desc`, `expiry_asc` |
| `inStock` | String `true` or `false` |
| `page` | Positive integer, starts at 1 |
| `limit` | 12; enforce a server maximum |

Search, sort and filter BEFORE pagination. Return a filtered `total`, not the current page length. Use stable sorting with an ID tie-breaker. Only return published listings belonging to active authorized facilities. Never make quarantined, expired, recalled, disposed or suspended stock purchasable. Availability excludes active reservations.

```json
{
  "success": true,
  "message": "",
  "data": {
    "items": [
      {
        "id": "listing-uuid",
        "inventoryItemId": "inventory-uuid",
        "name": "Medicine generic name",
        "brand": "Brand from medicine record",
        "strength": "Strength from medicine record",
        "category": "Biologics",
        "description": "Supplier's product and pack description",
        "unit": "vial",
        "unitPriceNaira": 125000,
        "availableQuantity": 12,
        "batchNumber": "LOT-001",
        "expiresOn": "2027-12-31",
        "storage": "Product-specific labelled storage requirements",
        "prescriptionRequired": true,
        "images": [
          { "id": "image-uuid", "url": "https://your-cdn.example/product.webp", "alt": "Medicine product packaging" }
        ],
        "seller": {
          "id": "facility-uuid",
          "name": "Supplying pharmacy name",
          "city": "Lagos",
          "verified": true
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 12
  }
}
```

All shown fields are required; `brand`, `strength`, `description`, and `storage` may be empty strings for older records. `images` must always be an array, including `[]` for legacy stock. `seller.verified` must come from verification records. Use numeric prices and quantities, not formatted strings. The example price is illustrative only. Image URLs must be browser-readable HTTPS URLs with a sufficient lifetime, and stable image IDs; put the cover image first. The UI provides a fallback for absent or broken images and a gallery for multiple images. Newly submitted listings must include photos.

## 2. POST /api/marketplace/listings

Authenticated **multipart/form-data**. The browser sets the multipart boundary; do not require a JSON Content-Type.

| Field | Type / validation |
| --- | --- |
| `inventoryItemId` | Required; existing, eligible batch owned by the authenticated facility |
| `category` | One of the four non-empty categories above |
| `unitPriceNaira` | Decimal string, greater than zero, at most 2 decimal places |
| `availableQuantity` | Positive integer string; no greater than unreserved stock |
| `unit` | `vial`, `pack`, `bottle`, `box`; must agree with inventory selling unit |
| `storage` | Required text; validate against approved product requirements |
| `description` | Required text, maximum 2,000 characters |
| `prescriptionRequired` | Literal string `true` or `false`; server may enforce `true` based on drug classification |
| `images` | Repeated binary file field, 1–5 images, each no larger than 5 MiB |

The frontend form currently requests the inventory item ID; name, brand, strength, batch, expiry and facility are derived server-side from that batch. Do not trust client-supplied ownership or verification. Validate facility listing permission even if the UI button was shown. Reject inconsistent pack units and listing quantities, duplicates for the same batch where appropriate, and stock which is not eligible for sale.

Allow JPEG, PNG and WebP only. Validate decoded file content and size, not only extension/MIME; reject corrupt files, sanitize/re-encode, strip metadata, generate safe unique storage keys and alt text, and store in object storage/CDN. Save image order; the first uploaded image is the cover. Roll back listing creation and clean up uploaded objects if any part fails. Avoid orphaned files. Never accept arbitrary remote URLs as substitutes for uploaded files.

Return HTTP 201 with `{ "success": true, "message": "Listing submitted.", "data": { "listing": { "id": "listing-uuid", "status": "PUBLISHED" } } }`. If moderation is required return `PENDING_REVIEW` instead and publish only after approval. The UI shows a generic submission success and reloads listings. Failures keep the entered details and images available for retry. Suggested errors: 403 `NOT_VERIFIED`/`FACILITY_FORBIDDEN`, 409 `STOCK_UNAVAILABLE`, 413 `IMAGE_TOO_LARGE`, 422 `INVALID_IMAGE`/`INVALID_LISTING`.

## 3. POST /api/marketplace/checkout

The frontend calls this from the medicine details form. Header: `Idempotency-Key: <UUID>`. Body:

```json
{ "listingId": "listing-uuid", "quantity": 2, "prescriptionId": "approved-prescription-id" }
```

`prescriptionId` is omitted for drugs that do not require a prescription. For required prescriptions, validate the reference, ownership/access, approval, correct medicine, quantity limits and prior fulfillment **before** initializing payment. The UI requires a reference but never decides clinical approval.

1. Authorize the buyer and seller; re-read current price, pack size, drug classification, expiry, quarantine/recall state and available quantity from the database. Validate positive integer quantity and eligible stock. Never accept the client's price or subtotal as the amount to charge.
2. Atomically reserve stock and create an order/invoice with immutable line item and seller snapshots. Include all payable fees before Paystack initialization. Set a reservation deadline and release unpaid/failed reservations safely.
3. Scope the idempotency key to the authenticated buyer and request payload. Repeated identical calls must return the same checkout/order without reserving twice; reject key reuse with a different payload. Concurrent requests must not oversell. Allow safe retries after network failures.
4. From the BACKEND, initialize a Paystack transaction with the authenticated buyer's email, a unique persisted payment reference, currency NGN, the complete payable amount in integer kobo, and a server-configured allowlisted callback URL. Keep `PAYSTACK_SECRET_KEY` on the server only.
5. Return the authorization URL from Paystack as **camelCase `authorizationUrl`**, as shown below. The frontend allows only HTTPS `checkout.paystack.com` URLs and redirects in the same tab.

```json
{
  "success": true,
  "message": "Checkout ready.",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/transaction-code",
    "reference": "unique-paystack-reference",
    "invoiceReference": "OB-unique-reference",
    "orderId": "order-uuid",
    "totalNaira": 250000,
    "expiresAt": "2026-10-19T15:30:00Z"
  }
}
```

The frontend displays an estimated subtotal; Paystack displays the authoritative final payable amount. Suggested errors: 409 `STOCK_UNAVAILABLE`, `LISTING_CHANGED`, `IDEMPOTENCY_CONFLICT`; 422 `INVALID_QUANTITY`, `PRESCRIPTION_REQUIRED`, `PRESCRIPTION_NOT_APPROVED`; 502 `PAYMENT_INITIALIZATION_FAILED`. Always include a clear human-readable message. Do not return fake payment links when Paystack fails.

## 4. Payment completion and existing invoice screen

Configure callback URL server-side as `<FRONTEND_ORIGIN>/pay/<invoiceReference>` (properly encode the invoice reference). This is the existing frontend invoice route; Paystack appends its transaction reference. Maintain the existing `GET /api/invoices/:reference` response shape used by `InvoicePayment.tsx` and update it from verified server state. Enforce existing invoice access rules and protect buyer information. The existing payment screen must receive the backend-generated Paystack URL through its existing `paystackUrl` field as well.

- Implement a backend Paystack webhook endpoint such as `POST /api/payments/paystack/webhook`. Verify Paystack signatures against the raw request body. Treat duplicate delivery idempotently.
- Verify payment server-side using the stored reference and Paystack verification API. Confirm successful status, matching NGN currency, exact amount and the order's persisted reference before marking paid or providing goods. A callback visit is never proof of payment.
- Apply payment/order updates and stock consumption atomically, once only. Handle webhook/callback races and payments arriving after reservation expiry without overselling. Reconcile pending payments and expose failure/pending states in invoice reads.
- Payment does not itself mean dispensed/delivered. Continue existing order fulfillment and clinical release checks.

Reference: [Paystack accept payments](https://paystack.com/docs/payments/accept-payments/) and [verify payments](https://paystack.com/docs/payments/verify-payments/).

## Suggested persistence

- `marketplace_listings`: inventory item, facility, category, selling unit, integer price kobo, description, storage, enforced prescription flag, publication status, creator, timestamps.
- `marketplace_listing_images`: listing, storage key, public/CDN URL, alt text, sort position, content type, byte size.
- Orders/invoices: buyer, facility, approved prescription, immutable lines, quantity/price/fees/currency snapshots, reservation deadline, fulfillment state, payment status/reference.
- Checkout idempotency records: authenticated buyer + unique key, payload hash, order reference and replayable result.
- Keep stock quantities in the existing inventory source of truth. Do not create a disconnected second stock counter.

## Acceptance checks for the backend team

1. Upload a real eligible inventory batch with multiple photos; refresh and confirm cover/gallery, price, unit, facility, batch, expiry and quantity remain correct.
2. Reject another facility's inventory, unauthorized accounts, expired/quarantined stock, incorrect units, malformed images, >5 images and >5 MiB files server-side.
3. Search/filter/sort a multi-page catalogue; verify totals and pagination after filtering.
4. Reject invalid quantities, insufficient stock and unapproved/mismatched prescriptions before generating links. Change a listing's price and ensure checkout uses the current server price.
5. In Paystack test mode, repeat/concurrently submit the same checkout key and verify one reservation, order and transaction. Simulate an initialization timeout and retry safely.
6. Complete test payment, replay the webhook and reload the invoice: one paid transition and one stock decrement. A spoofed callback, wrong amount, incorrect signature or failed payment must never fulfill an order.
7. Expire an unpaid reservation and test a late payment; confirm reconciliation and no overselling.

Listing editing, image deletion/reordering after submission, seller order management and a multi-item cart are future scope; the current frontend buys one listing at a time and uploads its ordered images at creation.
