# Marketplace payment providers

The frontend supports `PAYSTACK` (default) and `FLUTTERWAVE` for authenticated marketplace checkout. Legacy prescription invoice lookup remains public and uses Paystack. No frontend SDK, public key, seller payout or split settlement was added.

## Backend contract

`POST /api/marketplace/checkout` uses the buyer bearer token and `Idempotency-Key` UUID, with only `listingId`, `quantity`, optional `prescriptionId`, and `paymentProvider`. The backend derives all payment amounts, currency, buyer details and callback URLs.

The successful envelope's `data` must include `paymentProvider`, `authorizationUrl`, `invoiceReference`, `orderId`, and `expiresAt`. The client saves the invoice/order references before redirecting. It accepts only HTTPS links on `checkout.paystack.com` or `checkout.flutterwave.com`, matched to the selected provider, with no credentials or nonstandard port.

Checkout attempts are saved in browser session storage before initialization. Network/502 errors freeze the selected listing, quantity, prescription, provider and UUID; retry sends the exact same request. Closing/reopening the product or reloading the same tab recovers the saved attempt. A different provider or new purchase requires explicit action after the known reservation expiry. An uncertain attempt without a known expiry requires retry/reconciliation before a new attempt. Browser storage must be available to start checkout. Backend idempotency and reservation rules remain authoritative across devices/tabs.

Both gateways return to `/pay/<invoiceReference>`. Redirect query parameters are ignored. The client reads `GET /api/invoices/<invoiceReference>` with the buyer bearer token; this endpoint must return the direct invoice object and perform backend verification. Buyer requests never fall back to an admin token. A 401 provides a buyer login link that returns to the invoice after sign-in. A 403 remains access denied.

Marketplace invoices include `reference`, `status`, `totalNaira`, `items`, `paymentMethods`, `isDemo`, `paymentProvider`, `authorizationUrl`, `expiresAt`, and `fulfillmentState`. Only `authorizationUrl` resumes marketplace checkout; a null URL never falls back to `paystackUrl`. Pending states (`INITIALIZING`, `INITIALIZATION_UNKNOWN`, `AWAITING_PAYMENT`) poll with delays increasing from 3 to 30 seconds while the page is visible. Only `PAID` displays success. `PAID_REVIEW` displays "Payment received; manual review required" without a payment link. `EXPIRED` and `PAYMENT_FAILED` stop polling and offer a new checkout action. Local expiry hides the payment link without inferring the backend payment outcome. Payment confirmation does not imply clinical release or delivery.

401, 403, 409 stock/conflict/mismatch, 422, 502 and 503 have distinct handling. Failed input remains in the form. A 401 retains the saved request through sign-in. Stock errors refresh marketplace availability. Conflicts and mismatches never cause an automatic new payment or provider switch.

## Deployment and acceptance

Apply backend `database/marketplace-payment-providers.sql` after `marketplace.sql`, retaining `purchase-orders.sql` requirements. Existing orders must be backfilled as Paystack; keep the original marketplace migration unchanged.

Configure backend-only `FLUTTERWAVE_SECRET_KEY` and `FLUTTERWAVE_SECRET_HASH` through the deployment secret manager. Configure the same hash in Flutterwave's v3 dashboard webhook settings. Use HTTPS `FRONTEND_ORIGIN` included in `CORS_ORIGIN`. Keep existing Paystack credentials/webhook. No secrets or environment files were read or changed for this frontend implementation.

Configure `POST <backend>/api/payments/flutterwave/webhook` for the supplied v3 `verif-hash` contract and `charge.completed`, with server verification by stored `tx_ref`. Do not configure v4 HMAC format for that endpoint.

Local automated tests use mocked API responses and no environment files. Live acceptance remains: migration application, provider configuration, real Flutterwave test checkout, callback with retained buyer session, authenticated polling, duplicate webhook delivery, late payment review, and separate live-mode verification.

Flutterwave's [Standard documentation](https://developer.flutterwave.com/docs/flutterwave-standard-1) describes the server-generated hosted URL and redirect flow. The supplied backend handoff governs this integration's API and webhook contract.
