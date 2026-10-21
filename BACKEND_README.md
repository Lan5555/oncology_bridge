# Oncosourz Backend Build Guide

Spec for a backend that makes every frontend section work. Frontend: Next.js (`src/app`). Backend: any stack (REST + JSON, PostgreSQL recommended).

Product: a live, GS1-authenticated inventory, verification and redistribution network for oncology biologics (Trastuzumab, Rituximab, Bevacizumab, Pertuzumab, Cetuximab) across the Lagos–Ibadan corridor. Compliance: NDPA 2023, NAFDAC, GS1 DataMatrix, ICD-10, 2–8 °C cold chain.

---

## 1. Conventions

- Base URL: `NEXT_PUBLIC_BASE_URL` (frontend env). Backend must enable CORS for the frontend origin.
- Auth: `Authorization: Bearer <JWT>` on every protected call (added by `hooks/service/core-service.ts`).
- Envelope (every response, success or error, `net-response.ts`):
  ```json
  { "success": true, "message": "text", "data": { } }
  ```
  `data` is an object or `null`. Errors: `success:false`, correct HTTP status (400, 401, 403, 404, 409, 422, 429, 500).
- IDs: UUID strings. Timestamps: ISO 8601 UTC. Money: integer kobo in DB, Naira numbers in API (`unitPriceNaira`).
- Frontend `localStorage` keys: `userSession` (`{user, token}`), `web_device_id` (UUID), `theme`, `adminAuth`, `adminTarget`.
- Secrets (Paystack, registry credentials, JWT secret) stay server-side only.

---

## 2. Enums

| Name | Values |
|---|---|
| AccountType | `DOCTOR`, `PHARMACIST`, `PHARMACY_STORE` |
| LicenseRegistry | `MDCN` (doctor), `PCN` (pharmacist), `PCN_PREMISES` (store) |
| VerificationStatus | `PENDING`, `MANUAL_REVIEW`, `VERIFIED`, `REJECTED` |
| RegistryResult | `MATCH`, `NO_MATCH`, `UNAVAILABLE` |
| FacilityStatus | `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED` |
| FacilityType | `HOSPITAL`, `CANCER_CENTER`, `CLINIC`, `PHARMACY` (UI labels: Donor Hub / Recipient Hub / Satellite Clinic) |
| StockStatus | `Available`, `Near expiry`, `Reserved` |
| InventoryStatus | `In Stock`, `Near Expiry`, `Critical Expiry`, `Quarantined`, `Redistributed` |
| InvoiceStatus | `AWAITING_PAYMENT`, `PAID` |
| OrderStage | `Waiting`, `Held`, `Ready`, `In Transit`, `Dispensed`, `Delivered` |
| AuthStatus | `Pending`, `API Routing`, `Cleared`, `Paid` |
| TransferStatus | `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `IN_TRANSIT`, `DELIVERED` |
| AlertSeverity | `BREACH`, `WARNING`, `NOMINAL` |
| Role (RBAC) | A: Submitting Pharmacist, B: Requesting Pharmacist, C: Network Admin |

Page access (enforce server-side too, `lib/accounts.ts`):
- Always: `pg-dashboard`, `pg-settings`.
- Verified professional accounts get their role-specific clinical/pharmacy pages; `pg-network` additionally requires `network.read`.
- Verified `PHARMACY_STORE`: `pg-scan`, `pg-inventory`, `pg-transfers`, `pg-expiry` plus any explicitly granted catalogue pages.
- Unverified users: only dashboard + settings (`VerificationGate` is shown). Every other endpoint returns 403 `NOT_VERIFIED`.
- `pg-facilities` and `pg-audit` require `facility.read` and `audit.read` respectively. `pg-users` is shown for linked facility members as a team access page; management actions and pending join requests require `facility.users.manage`. `/admin` is restricted to ADMIN/SUPERADMIN operator accounts.

---

## 3. Data model (tables)

**users**: `id`, `role_id`, `account_type`, `license_number` (unique), `license_registry`, `verification_status`, `registry_result`, `facility_id`, `first_name`, `last_name`, `email` (unique), `phone`, `password_hash` (argon2/bcrypt), `device_id`, `allowed_ip`, `active`, `last_login`, `created_at`, `updated_at`.

**roles**: `id`, `name`, `description`, `created_at`. Seed A/B/C. Add `permissions` join table.

**facilities**: `id`, `name`, `facility_type`, `hospital_code` (e.g. `LG-LUTH-001`, auto-generated `{STATE}-{NAME}-{SEQ}`), `address`, `city`, `state`, `latitude`, `longitude`, `phone`, `email`, `status`, `ip_whitelist` (text[]), `created_at`, `updated_at`.

**facility_devices**: `id`, `facility_id`, `device_id`, `label`, `approved`, `last_seen`.

**drugs**: `id`, `generic_name`, `brand`, `strength`, `gtin`.

**inventory_items**: `id`, `facility_id`, `drug_id`, `gtin`, `lot`, `serial`, `qty`, `expiry_date`, `status`, `gs1_verified` (bool), `unit_price_naira`, `storage_unit_id`, `created_by`, `created_at`, `updated_at`. Status is derived by a job: expiry <= 60 days -> `Near Expiry`, <= 30 days -> `Critical Expiry`, temp breach -> `Quarantined`.

**scans**: `id`, `facility_id`, `user_id`, `gtin`, `lot`, `expiry`, `serial`, `action` (`AVAILABLE`/`NEW`/`NEAR_EXPIRY`), `notes`, `result` (`CLEAN`/`FLAGGED`), `client_ts`, `synced_at`, `client_uuid` (idempotency key for offline queue).

**transfers**: `id`, `inventory_item_id`, `donor_facility_id`, `recipient_facility_id`, `qty`, `distance_km`, `urgency`, `status`, `requested_by`, `approved_by`, `delivered_at`, `created_at`.

**prescriptions / orders**: `id`, `display_id` (`#0492`), `patient_ref` (pseudonymised, never real name), `icd10`, `tnm_stage`, `drug_id`, `qty`, `insurer`, `pharmacy_facility_id`, `auth_status`, `order_stage`, `prescriber_id`, `created_at`, `updated_at`. Encrypt patient fields (AES-256 field level, NDPA).

**order_events**: `id`, `order_id`, `step` (Stock Ingestion, Prescription Packaged, Order Matched & Reserved, Prior-Authorization Cleared, GS1 Validation Scan, Last-Mile Delivery), `state` (`done`/`active`/`pending`), `at`.

**invoices**: `id`, `reference` (`OB-xxxxx`), `order_id`, `pharmacy_facility_id`, `status`, `total_naira`, `paystack_reference`, `paid_at`, `created_at`. **invoice_items**: `invoice_id`, `description`, `quantity`, `unit_price_naira`.

**storage_units**: `id`, `facility_id`, `label`, `kind` (`FRIDGE`/`TRANSIT`), `target_min` (2), `target_max` (8), latest reading/status fields as needed. Migrate the legacy `device_key` field; do not return or persist raw device credentials here.

**cold_chain_devices**: `id`, `facility_id`, `secret_ref` (secret-manager reference), `credential_fingerprint`, `status` (`ACTIVE`/`REVOKED`), `expected_interval_seconds`, `last_seen_at`, `created_at`, `rotated_at`. **cold_chain_device_units** maps a device to its permitted `unit_id` values.

**temperature_readings**: `id`, `unit_id`, `device_id`, `sequence`, `celsius`, `recorded_at`, `ingested_at` (index `unit_id, recorded_at`; unique `device_id, sequence` when sequence is present).

**cold_chain_events**: `id`, `unit_id`, `severity`, `state`, `message`, `action_taken`, `first_breach_at`, `last_breach_at`, `observed_min_c`, `observed_max_c`, `at`, `resolved_at`.

**audit_logs** (append-only, no UPDATE/DELETE grants): `id`, `at`, `actor_id`, `action` (BREACH_ALERT, GS1_SCAN, TRANSFER_APPROVED, PRESCRIPTION_SENT, NEAR_EXPIRY_FLAG, STOCK_INGESTION, FACILITY_ONBOARDED, JWT_RENEWED, VERIFICATION_DECISION, ...), `object_type`, `object_id`, `detail` (encrypted JSON), `ip`, `prev_hash`, `hash` (hash chain for immutability).

**verification_applications**: `id`, `user_id`, `registry`, `license_number`, `registry_result`, `status`, `reviewer_id`, `reviewed_at`, `reason`, `submitted_at`.

**settlements**: `id`, `invoice_id`, `amount_naira`, `platform_fee_naira` (1.5% of volume), `payout_status` (`QUEUED`/`PAID`), `created_at`.

**research_inquiries**: `id`, `name`, `organisation`, `email`, `message`, `created_at`.

**settings**: `key`, `value` (network name, alert threshold days = 60, currency NGN/USD, notification email, 2FA, biometric, IP lockdown, sync frequency, offline mode).

**notifications**: `id`, `user_id`, `type`, `title`, `body`, `read_at`, `created_at`.

---

## 4. API reference

Existing frontend routes are in `services/api-routes.ts`. Everything under "New" is needed to replace `bridge-mock-service.ts` (swap its `BRIDGE_DATA_SERVICE` methods for these calls; keep the UI-facing types).

### 4.1 Auth (existing)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/api/login` | `{email,password}` | Returns `data:{user,token}`. Rate-limit; lockout after 5 failures; check `device_id` and `allowed_ip` if lockdown on. Update `last_login`. |
| GET | `/auth/api/log-out/:id` | | Revoke token/session. |
| GET | `/auth/api/ping-server` | | `success:true` health check (used by `Loader/ping-server`). |
| POST | `/auth/api/refresh` (new) | | JWT renewal (audit `JWT_RENEWED`). |
| POST | `/auth/api/forgot-password`, `/auth/api/reset-password` (new) | | Email token flow. |

`user` object returned: `id, role, account_type, license_number, verification_status, hospital (Facility), first_name, last_name, email, phone, device_id, allowed_ip, active, last_login, created_at, updated_at`. Never return `password_hash`.

### 4.2 License verification

`POST /api/verify-license` (the Next route was removed; `verification-service.ts` still calls this path on the frontend origin. Either proxy it to the backend through `next.config.ts` rewrites or change the path in the service.)

Request: `{ licenseNumber, registry, lastName? }`. Validate `licenseNumber` with `^[A-Za-z0-9/\-]{4,24}$` and `lastName` with `^[\p{L}\s.'-]{1,60}$`. Rate limit 10/min/IP.
Response `data`: `{ status, registryResult }`.
- Registry match (and last name matches for MDCN/PCN) -> `VERIFIED` / `MATCH`.
- Registry reachable, no record -> `MANUAL_REVIEW` / `NO_MATCH`.
- Registry down or not configured -> `MANUAL_REVIEW` / `UNAVAILABLE` (frontend treats failures the same way).
- Env: `MDCN_REGISTRY_URL`, `PCN_REGISTRY_URL`, `PCN_PREMISES_REGISTRY_URL` (URL template with `{license}`).

### 4.3 Facilities (existing)

| Method | Path | Notes |
|---|---|---|
| POST | `/hospital/api/register-facility` | Public (registration). Creates facility + inactive admin user + license record in one transaction; facility is `PENDING`, user verification is `MANUAL_REVIEW`; returns `data:{facility,admin}` with no token. 409 on duplicate email/license; 429 when rate-limited. |
| GET | `/hospital/api/find-all-facilities` | Admin. Supports `?status=&q=&page=&limit=`. Returns `data:{facilities, counts:{total,active,pending,suspended}}`. |
| GET | `/hospital/api/find-one-facility/:id` | |
| PATCH | `/hospital/api/update-one-facility/:id` | status, ip_whitelist, details, devices. Audit every change. |
| DELETE | `/hospital/api/delete-one-facility/:id` | Soft delete. |

Register payload:
```json
{
  "account_type": "DOCTOR",
  "license": { "number": "MDCN/R/48211", "registry": "MDCN", "verification_status": "MANUAL_REVIEW", "registry_result": "MATCH" },
  "facility": { "name": "", "facility_type": "", "email": "", "phone": "", "address": "", "city": "", "state": "" },
  "admin": { "first_name": "", "last_name": "", "email": "", "phone": "", "password": "", "device_id": "" }
}
```
The registration endpoint accepts `license.verification_status` and `license.registry_result` for payload compatibility only and ignores both submitted values. Create the initial admin as inactive with `verification_status=MANUAL_REVIEW`; an authorized admin review controls activation.

### 4.4 Dashboard (`pg-dashboard`) - new

- `GET /api/dashboard/summary` -> `{ network:{name,region}, nodes:24, gs1AuthenticatedVials:1847, velocityPct:12, stockOutRiskPct:28, stockOutDeltaPct:-22, valueRecoveredNaira:42800000, chainIntegrityPct:98.4 }` (all computed).
- `GET /api/dashboard/charts` -> `{ inventoryOverTime:[{label,vials}], drugSplit:[{drug,pct}], therapeuticStock:[{drug,qty}], redistributionEfficiency:[{label,days}] }`.
- `GET /api/inventory/near-expiry?limit=7` (store watchlist).
- `POST /api/reports/export` `{type:"PDF|CSV|XLSX", from, to}` -> file stream or job id (Export Report modal).
- `GET /api/notifications`, `PATCH /api/notifications/:id/read` (bell modal).

### 4.5 Inventory (`pg-inventory`) - new

- `GET /api/inventory?category=all|expiry|quarantine|redistributed&facilityId=&q=&page=` -> `{ items:[{id,drug,gtin,lot,facility,qty,expiry,temp,status,category}], stats:{totalVials,gs1VerifiedPct,nearExpiry,quarantined} }`. Return raw values (ISO `expiry`, numeric `tempC`) and let UI format; classes like `statusStyle` stay in the frontend.
- `POST /api/inventory` manual entry `{medicineId,batchNumber,expiry,quantity,unit,facilityId}`. Persist the selling `unit` (`vial`, `pack`, `bottle`, or `box`) and count quantity in that unit. Return the reviewed selling unit with inventory records so listings use the same unit. Link the selected existing catalogue medicine by ID; derive and enforce facility ownership from the authenticated session. The frontend no longer sends a free-text `drug`. See `INVENTORY_MEDICINE_BACKEND_HANDOFF.md` for validation, selectable medicine pagination, response compatibility, and rollout requirements.
- `PATCH /api/inventory/:id`, `DELETE /api/inventory/:id`.
- `GET /api/inventory/export.csv`.
- `POST /api/inventory/:id/quarantine` and `POST /api/inventory/:id/dispose` (Breach modal confirm).

### 4.5.1 Medicine catalog (`pg-medicines`)

- `GET /api/medicines` -> persisted medicine records with `id`, `generic_name`, `brand`, `strength`, and `gtin`.
- `POST /api/medicines` accepts `{generic_name,brand,strength,gtin}` and creates a catalog record. Enforce pharmacist and pharmacy-store permissions server-side; doctors may use catalog records when prescribing but cannot create them.
- `PATCH /api/medicines/:id` accepts only `{generic_name,brand,strength,gtin}` and returns the updated record. Validate field lengths and GTIN format/uniqueness; do not permit clients to change IDs, facility ownership, audit fields, or unrelated inventory data.
- `DELETE /api/medicines/:id` removes the catalog entry from active use. Prefer a soft delete when inventory, prescriptions, or historical scans reference it; preserve those records and audit the actor, medicine ID, and removal time. Return a stable success envelope or `404` for an unknown ID. Enforce pharmacist and pharmacy-store permissions server-side for both mutations.

### 4.6 GS1 scan (`pg-scan`) - new

- `POST /api/scans` `{gtin,lot,expiry,serial,facilityId,action,notes,clientUuid,clientTs}`. Validate GS1 (AI 01 GTIN-14 with check digit, 10 lot, 17 expiry YYMMDD, 21 serial); check serial not already dispensed/duplicated (counterfeit flag -> `FLAGGED`); upsert inventory; audit `GS1_SCAN`. Idempotent on `clientUuid`.
- `POST /api/scans/batch` for the offline queue flush (array, per-item results).
- `GET /api/scans/recent?limit=5` and `GET /api/scans/monthly` (chart: `[{month,count}]`).
- `GET /api/gs1/lookup?gtin=` -> drug/brand (pedigree DB).

### 4.7 Transfers (`pg-transfers`, modal-transfer) - new

- `GET /api/transfers?status=PENDING_APPROVAL|COMPLETED` -> list with `drug, route (donor -> recipient), distanceKm, lot, qty, status, deliveredAt`.
- `GET /api/transfers/stats` -> `{pending, recentDeliveries, quarantinedBreaches}`.
- `POST /api/transfers` `{inventoryItemId,qty,recipientFacilityId,urgency}`. Enforce 50-mile (~80 km) radius with haversine on facility lat/long; cold-chain intact; not `Quarantined`.
- `POST /api/transfers/:id/approve|reject` (Network Admin). Reserve stock on approve; audit `TRANSFER_APPROVED`.
- `GET /api/transfers/active-order` -> 6-step timeline (see `order_events`).
- Suggest recipient: `GET /api/transfers/suggest?inventoryItemId=` (nearest recipient by demand and distance).

### 4.8 Prescriptions, stock search, invoices (`pg-prescriptions`, `/pay`) - new

- `GET /api/stock/search?q=&location=` -> `[{id,drug,brand,location,availableQuantity,unitPriceNaira,batchNumber,expiresOn,status}]`.
- `POST /api/prescriptions` (modal-prescription) `{patientRef,icd10,tnmStage,insurer,drugId,qty,pharmacyFacilityId}`; validate ICD-10 `^C\d{2}(\.\d{1,2})?$`; start prior-auth with the HMO (AXA Mansard, Hygeia, NHIA, Reliance, Cash Pay).
- `GET /api/prescriptions?tab=active|awaiting|completed` -> `[{id,code,drug,insurer,pharmacy,status,order}]` plus `counts`.
- `PATCH /api/prescriptions/:id` (auth status / order stage); webhook `POST /webhooks/insurer/:insurer`.
- `POST /api/invoices` `{stockId,quantity}` -> `{reference, url:"/pay/{reference}"}`; reserves stock for a TTL.
- `GET /api/invoices/:reference` (public, no auth, rate-limited, do not leak PII) -> `{reference,pharmacy,status,items:[{description,quantity,unitPriceNaira}],paymentMethods,isDemo}`.
- Payments (server-side Paystack): `POST /api/invoices/:reference/pay` -> Paystack `authorization_url`; `POST /webhooks/paystack` (verify `x-paystack-signature` HMAC SHA512, idempotent) marks `PAID`, creates settlement and releases stock; `GET /api/invoices/:reference/verify`. Payment methods: Debit card, Bank transfer, USSD, Apple Pay. Replaces `MockInvoicePayment`.
- `GET /api/settlements/summary` (admin) -> `{currency:"NGN",transactionCount,transactionVolumeNaira,platformFeesNaira,payoutsQueued}`.

### 4.9 Cold chain (`pg-coldchain`) - new

- The dashboard reads configured storage units from `GET /api/storage-units`, persisted breach events from `GET /api/cold-chain-events`, and recorded temperature history from `GET /api/coldchain/history?hours=24`. Return database-backed data only; never seed or fabricate telemetry.

#### Device registration and authentication

- Provision each sensor or gateway against one or more storage units and a facility. Keep the signing secret in the secret manager and store only its reference/fingerprint with the device registration. Support rotation/revocation, record permitted unit IDs and expected reporting interval, and never expose device secrets to the frontend or accept a user JWT as a sensor credential.
- Accept ingest only over HTTPS. Identify each device with `X-Device-Id` and authenticate using `X-Request-Timestamp`, `X-Request-Nonce`, and `X-Request-Signature`. Compute the HMAC-SHA256 signature over `<timestamp>.<nonce>.<raw-request-body>` using the device secret resolved from the secret manager. Require a short timestamp tolerance, reject reused nonces, compare signatures in constant time, and rate-limit per device. Keep credentials out of logs and error responses.
- Scope each reading to a registered device and storage unit assigned to that device's facility. Reject inactive/revoked devices, unknown units, cross-facility unit IDs, malformed JSON, non-finite temperatures, invalid timestamps, and readings outside configured sensor limits. Return useful `400`, `401`/`403`, `409` (replay/duplicate), and `429` responses without disclosing secrets.

#### Ingest and breach processing

- Implement `POST /iot/readings` as a machine-to-machine endpoint. Accept one or more readings:

```json
{
  "readings": [
    {
      "unitId": "storage-unit-uuid",
      "celsius": 5.2,
      "recordedAt": "2026-10-14T12:30:00.000Z",
      "sequence": 1842
    }
  ]
}
```

- Validate the whole batch, then atomically persist accepted readings and required alert/outbox work. Enforce a unique device/sequence (or equivalent idempotency key) so retries cannot create duplicate readings. Return `202` with `{accepted,duplicates,eventIds}`; duplicate retries count as duplicates and must not re-trigger breach notifications.
- This is a device-only endpoint. Do not add or call a browser-side client for this endpoint from a dashboard, and never expose signing credentials in frontend code.
- Compare readings with the storage unit's configured `target_min` and `target_max` (default 2–8 °C; values exactly at either bound are in range). For an out-of-range reading, create or update one open `cold_chain_events` record for that unit/severity instead of creating an alert for every sample. Record first/last breach times, observed extremes, and affected inventory. When readings return in range, resolve the open event and preserve its full history; do not erase or rewrite readings.
- Quarantine inventory linked through `inventory_items.storage_unit_id` while its unit is in breach. Notify facility cold-chain operators and administrators, append an immutable `BREACH_ALERT` audit event for each breach/resolution transition, and make notification/audit failures observable and retryable. Do not silently drop accepted readings if alert processing fails; enqueue processing transactionally or via an outbox.
- Track last-seen time and expected reporting interval. Mark units `OFFLINE` and issue an operational alert after the configured missed-heartbeat threshold; recover the state when authenticated readings resume. Make heartbeat policy configurable per device/unit.

#### Read APIs and real-time delivery

- `GET /api/storage-units` (JWT; enforce facility/role scope) returns configured units with the latest persisted reading and freshness state, for example `{id,label,facility:{id,name},targetMin,targetMax,currentC,currentReadingAt,readingState}` where `readingState` is `NOMINAL`, `BREACH`, or `OFFLINE`. A missing sensor sample must remain `null`, never a made-up value.
- `GET /api/cold-chain-events` (JWT; enforce facility/role scope) returns persisted events with stable `id`, `unitId`, `severity`, `message`, `actionTaken`, `at`, `resolvedAt`, and event state. Support paging and optional filters such as `unitId`, `status`, `from`, and `to`.
- Implement `GET /api/coldchain/history?hours=24&unitId=<optional>` (JWT; enforce facility/role scope; default `hours=24`, validate and cap the requested range). Return readings in ascending time order and the series form already supported by the frontend chart:

```json
{
  "readings": [
    { "unitId": "storage-unit-uuid", "unitLabel": "Fridge A", "celsius": 5.2, "recordedAt": "2026-10-14T12:30:00.000Z" }
  ],
  "labels": ["12:30"],
  "series": [
    { "unitId": "storage-unit-uuid", "label": "Fridge A", "data": [5.2] }
  ]
}
```

- Implement authenticated `GET /api/coldchain/stream` as Server-Sent Events for the signed-in dashboard, using the user's bearer token and the same role/facility scope as the read APIs. The browser client should consume it with authenticated `fetch` streaming (native `EventSource` cannot attach the current bearer header). Emit `reading`, `breach`, `resolved`, `unit-status`, and `heartbeat` events, include an event ID for reconnection via `Last-Event-ID`, send periodic keepalives, and close/reject streams when the token expires or access is revoked. Never broadcast one facility's sensor data to another.
- The frontend should replace its polling-only refresh with this stream when the endpoint is available, update the current reading/history/event list on incoming events, and reconnect with backoff. Keep the existing REST history and event endpoints as initial load and recovery sources.

#### Operations and acceptance criteria

- Add migrations and indexes for `(unit_id, recorded_at)`, device/sequence idempotency, unresolved event lookup, and facility-scoped event queries. Define retention and archival policy for raw readings without deleting active breach/audit evidence.
- Add tests for valid ingest, bad/revoked credentials, signature tampering, replay, duplicate sequence, cross-facility access, threshold breach, event deduplication/resolution, inventory quarantine/recovery, notification/audit retry, history ordering/filters, stream authorization/reconnect, and missed-heartbeat alerts.
- Configure device secrets through the backend secret manager or `IOT_DEVICE_KEYS`; never commit live keys. Provide a provisioning/rotation procedure and observable ingest metrics (accepted, rejected, duplicate, delayed, breach, offline) without logging credential material.

### 4.10 Expiry (`pg-expiry`) - new

- `GET /api/expiry?withinDays=60` -> `[{drug,lot,donorFacility,qty,expiry,daysLeft,urgency:"Critical|Warning",nearestRecipient,distanceKm}]`, sorted by `daysLeft`. Header count ("N items require redistribution") comes from `total`. Action buttons call `POST /api/transfers`.
- Daily cron: recompute statuses, notify, audit `NEAR_EXPIRY_FLAG`.

### 4.11 Network (`pg-network`) - new

- `GET /api/network` -> `{ facilities:[{id,name,type,city,lat,lng,online,alert}], links:[{from,to}], analytics:{avgDistanceKm:14.2,avgTransitHrs:1.4,fuelSavedNaira:1200000} }`. Landing `NetworkDiagram` is static and needs no API.

### 4.12 Users and roles (`pg-users`, modal-user) - new

- `GET /api/roles` (with user counts), `GET /api/users?role=&facilityId=`, `POST /api/users` (sends a scoped facility invitation), `GET /api/facility-membership-requests?status=PENDING`, `POST /api/facility-membership-requests/:id/approve|reject`, `PATCH /users/api/update-one-user/:id` for allowed profile fields or deactivation, `DELETE /users/api/delete-one-user/:id` for audited soft deletion, `GET/PUT /api/roles/:id/permissions`.
- Public registration supports `GET /hospital/api/public-facilities?status=ACTIVE&q=&page=1&limit=50` and `POST /hospital/api/register-user-to-facility`. Joining a facility creates a pending membership request; the selected facility must be active, and membership approval remains separate from licence verification.
- Authenticated user data should return server-derived `allowed_pages` and `can_manage_facility_users` claims. The UI uses them for navigation only; API authorization must enforce role permissions, licence status, user status, and facility membership on every request.
- Facility admins responsible for stock and authorized inventory staff must receive `inventory.manage` plus `pg-inventory`, `pg-scan` and `pg-medicines` page grants, including when their account type is `PHARMACIST` or `DOCTOR`. The frontend honors explicit grants across account types; team-management capability alone does not imply stock access. Enforce stock permission and authenticated facility scope on inventory, scan and catalogue mutations. See `read.md` for sample claims and the inventory-to-marketplace workflow.
- For a facility-scoped session, `GET /api/users` returns only users in the caller's facility. Return `can_manage_facility_users: true`, `facility.users.manage` and the `pg-users` page grant for the designated primary facility admin. The facility team page remains discoverable to linked members, but invite, edit, decision and removal controls are shown only to managers and every endpoint enforces that same scope and permission. Keep the join-request panel visible with an empty state when no requests are pending.
- Approving a facility join request marks membership approved and attaches the facility. Set the user's `active=true` only when the facility is active, licence verification is `VERIFIED`, and account setup is complete; otherwise keep the user inactive and return `user.active`, current licence/facility status, and the unmet `activation_gate` in the decision response. Membership approval must never change the licence result.

### 4.13 Audit (`pg-audit`) - new

- `GET /api/audit?type=&actor=&from=&to=&page=` -> `[{id,at,type,severity,detail,actor}]`; `GET /api/audit/export.csv`. Read-only; verify hash chain with `GET /api/audit/verify`.

### 4.14 Settings (`pg-settings`) - new

- `GET/PUT /api/settings` (general, security toggles, sync frequency, offline mode). `POST /api/settings/api-key/rotate`. `POST /api/settings/purge-cache` (Danger Zone; admin only, audited). Enforce IP lockdown and 2FA (TOTP) at login when enabled.
- Profile/verification for gate: `GET /api/me`, `PATCH /api/me`, `POST /api/me/verification/resubmit`.

### 4.15 Admin console (`/admin`) - new

- Admin login uses existing `POST /auth/api/login`. The deployed roles are `ADMIN` (id 1) and `SUPERADMIN` (id 4); both are operator identities and must bypass facility/licence review checks, while remaining active and subject to MFA/role checks. Do not return “Registration is awaiting facility and license review” for these roles. Enforce role-specific permissions on every admin route; consider reserving global/destructive actions for `SUPERADMIN`.
- `GET /admin/api/verifications?status=ALL&page=1&limit=50&q=` returns registration applications including applicant identity/email, account type, licence/registry result, facility details/status, application status, and submission time. Support `ALL`, `PENDING`, `MANUAL_REVIEW`, `VERIFIED`, `REJECTED`.
- `POST /admin/api/verifications/:id/approve` `{reason?}` transactionally sets application/user verification to `VERIFIED`, activates the facility and initial admin, records reviewer/time, notifies the user, and audits `VERIFICATION_DECISION`.
- `POST /admin/api/verifications/:id/reject` `{reason}` requires a reason, sets application/user to `REJECTED`, keeps the user inactive, rejects the facility, notifies the user, and audits the decision.
- `POST /admin/api/verifications/:id/recheck` re-runs lookup using the stored licence; update evidence only and do not auto-approve.
- Facility status management uses `GET /hospital/api/find-all-facilities`, `GET /hospital/api/find-one-facility/:id`, `PATCH /hospital/api/update-one-facility/:id`, and soft-delete `DELETE /hospital/api/delete-one-facility/:id`. Validate transitions and audit every mutation.
- Overview, users, roles, and audit reuse their authenticated API routes; `GET /api/settlements/summary` returns the payment summary and `GET /admin/api/integrations/health` returns safe integration status metadata only. See `ADMIN_PORTAL_BACKEND_SPEC.md` for full request/response shapes and acceptance checks.

### 4.16 Research / WAOB (`/research`, `/waob`, landing) - new

- `POST /api/research/inquiries` `{name,organisation,email,message}` (public, CAPTCHA + rate limit, email confirmation). Optional `GET /api/research/stats` for aggregated, de-identified network figures (never row-level patient data).

### 4.17 Landing page

Static. Hero buttons go to `/register` and `/portal`. Public flows use: invoice lookup (`GET /api/invoices/:reference`), stock search preview (`GET /api/stock/search`), and the research inquiry form. Landing statistic counters (Stats section) may be served by `GET /api/public/stats` (cached).

---

## 5. Frontend-to-backend wiring checklist

| Screen / file | Replace | With |
|---|---|---|
| `AuthPages.tsx` login | local logic | `/auth/api/login` |
| `AuthPages.tsx` register | | verify-license + `/hospital/api/register-facility` |
| `VerificationGate.tsx` | static | `/api/me` status polling |
| `pages/dashboard/*Page.tsx` | hardcoded arrays | endpoints in 4.4-4.14 |
| `Charts.tsx` | static datasets | chart endpoints |
| `Modals.tsx` (7 modals) | demo toasts | export, transfer, breach, prescription, notifications, onboard, user endpoints |
| `bridge-mock-service.ts` | all `MOCK_*` | `/api/stock`, `/api/invoices`, `/api/prescriptions`, `/admin/api/verifications`, `/api/settlements/summary`, `/api/research/inquiries` |
| `MockInvoicePayment.tsx` | simulate button | Paystack redirect/inline |
| `pages/admin/page.tsx` | `localStorage.adminAuth` | admin JWT |
| `Camera/camera.tsx` | | decode DataMatrix client-side, post to `/api/scans` |

---

## 6. Cross-cutting requirements

**Security**: JWT (15 min access + refresh), RBAC middleware on every route, object-level checks (users only see their facility unless admin), argon2id passwords, parameterised queries, input validation (zod/joi), rate limiting, helmet headers, CSRF-safe design (Bearer tokens), device ID + IP whitelist checks, MFA for admins, secrets in env/secret manager, never log tokens or patient data.

**Privacy (NDPA 2023)**: data minimisation (patient refs not names), AES-256 field-level encryption of patient/clinical fields, consent and retention policy, breach notification process, data-subject access/erasure endpoints, DPIA, Nigeria/Africa data residency where required, `/legal` page content from privacy/terms.

**Audit**: every state change writes an `audit_logs` row in the same transaction (hash-chained).

**Offline**: scan queue syncs through `/api/scans/batch` with idempotency keys; return per-item status.

**Background jobs**: expiry recompute (daily), cold-chain breach detector (stream), reservation TTL expiry, Paystack reconciliation, email/SMS dispatch, audit hash verification.

**Realtime**: SSE/WebSocket channels for `coldchain`, `transfers`, `notifications`.

**Observability**: `/auth/api/ping-server`, structured logs, metrics, error tracking.

**Testing**: contract tests against the Net envelope, role/permission matrix tests, GS1 parser tests, Paystack webhook signature tests, registry-down fallback test.

---

## 7. Seed data (to match the UI)

- Facilities: LUTH (`LG-LUTH-001`), EKO Hospital, UCH Ibadan (`OY-UCH-002`), LASUTH, Lagos Island GH, MedPlus Ibadan; plus enough satellites for the 24-node network.
- Cold-chain storage units and readings must be provisioned as real facility data; do not seed demo telemetry for dashboard display.
- Drugs: Trastuzumab (Herceptin), Rituximab (MabThera), Bevacizumab (Avastin), Pertuzumab, Cetuximab.
- Insurers: AXA Mansard, Hygeia HMO, NHIA, Reliance HMO, Cash Pay.
- Roles A/B/C, default settings (alert threshold 60 days, NGN).

---

## 8. Environment variables (backend)

```
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
FIELD_ENCRYPTION_KEY=          # 32 bytes, AES-256
CORS_ORIGIN=
MDCN_REGISTRY_URL=
PCN_REGISTRY_URL=
PCN_PREMISES_REGISTRY_URL=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
SMTP_URL=
IOT_DEVICE_KEYS=
PLATFORM_FEE_PCT=1.5
```

Frontend: `NEXT_PUBLIC_BASE_URL=<backend url>`.

---

## 9. Suggested build order

1. Auth, roles, users, facilities, audit core.
2. License verification + admin verification queue (unblocks `VerificationGate`).
3. Inventory, drugs, GS1 scans (incl. offline batch).
4. Cold chain ingest + breach automation.
5. Expiry job + transfers.
6. Prescriptions, stock search, invoices, Paystack, settlements.
7. Dashboard aggregates, network, notifications, exports.
8. Settings, research inquiries, realtime streams, hardening.
