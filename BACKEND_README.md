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
- Verified `DOCTOR` / `PHARMACIST`: `pg-network`, `pg-prescriptions`, `pg-coldchain`, `pg-expiry`.
- Verified `PHARMACY_STORE`: `pg-network`, `pg-scan`, `pg-inventory`, `pg-transfers`, `pg-expiry`.
- Unverified users: only dashboard + settings (`VerificationGate` is shown). Every other endpoint returns 403 `NOT_VERIFIED`.
- `pg-facilities`, `pg-users`, `pg-audit` and `/admin`: Network Admin (Role C) only.

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

**storage_units**: `id`, `facility_id`, `label` (e.g. `LUTH Fridge A`, `Transit T-07`), `kind` (`FRIDGE`/`TRANSIT`), `target_min` (2), `target_max` (8), `device_key`.

**temperature_readings**: `id`, `unit_id`, `celsius`, `recorded_at` (index `unit_id, recorded_at`).

**cold_chain_events**: `id`, `unit_id`, `severity`, `message`, `action_taken`, `at`, `resolved_at`.

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
| POST | `/hospital/api/register-facility` | Public (registration). Creates facility + admin user + license record in one transaction; sets status `PENDING`; returns `data:{facility,admin,token}`. 409 on duplicate email/license. |
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
Do not trust `verification_status` from the client: re-run verification server-side.

### 4.4 Dashboard (`pg-dashboard`) - new

- `GET /api/dashboard/summary` -> `{ network:{name,region}, nodes:24, gs1AuthenticatedVials:1847, velocityPct:12, stockOutRiskPct:28, stockOutDeltaPct:-22, valueRecoveredNaira:42800000, chainIntegrityPct:98.4 }` (all computed).
- `GET /api/dashboard/charts` -> `{ inventoryOverTime:[{label,vials}], drugSplit:[{drug,pct}], therapeuticStock:[{drug,qty}], redistributionEfficiency:[{label,days}] }`.
- `GET /api/inventory/near-expiry?limit=7` (store watchlist).
- `POST /api/reports/export` `{type:"PDF|CSV|XLSX", from, to}` -> file stream or job id (Export Report modal).
- `GET /api/notifications`, `PATCH /api/notifications/:id/read` (bell modal).

### 4.5 Inventory (`pg-inventory`) - new

- `GET /api/inventory?category=all|expiry|quarantine|redistributed&facilityId=&q=&page=` -> `{ items:[{id,drug,gtin,lot,facility,qty,expiry,temp,status,category}], stats:{totalVials,gs1VerifiedPct,nearExpiry,quarantined} }`. Return raw values (ISO `expiry`, numeric `tempC`) and let UI format; classes like `statusStyle` stay in the frontend.
- `POST /api/inventory` manual entry `{drug,batchNumber,expiry,quantity,facilityId}`.
- `PATCH /api/inventory/:id`, `DELETE /api/inventory/:id`.
- `GET /api/inventory/export.csv`.
- `POST /api/inventory/:id/quarantine` and `POST /api/inventory/:id/dispose` (Breach modal confirm).

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

- IoT ingest: `POST /iot/readings` (device key auth, `{unitKey,celsius,ts}` array). On `<2` or `>8` create `cold_chain_events`, set linked inventory `Quarantined`, push notification + email to admins, audit `BREACH_ALERT`.
- `GET /api/coldchain/units` -> `[{id,label,facility,currentC,status,history:[...]}]` (6 units on the page, includes transit `T-07`).
- `GET /api/coldchain/history?hours=24` -> multi-series for `TemperatureHistoryChart`.
- `GET /api/coldchain/events` -> breach log `[{at,severity,message,actionTaken}]`.
- Realtime: SSE `GET /api/stream` or WebSocket for live temps and alerts.

### 4.10 Expiry (`pg-expiry`) - new

- `GET /api/expiry?withinDays=60` -> `[{drug,lot,donorFacility,qty,expiry,daysLeft,urgency:"Critical|Warning",nearestRecipient,distanceKm}]`, sorted by `daysLeft`. Header count ("N items require redistribution") comes from `total`. Action buttons call `POST /api/transfers`.
- Daily cron: recompute statuses, notify, audit `NEAR_EXPIRY_FLAG`.

### 4.11 Network (`pg-network`) - new

- `GET /api/network` -> `{ facilities:[{id,name,type,city,lat,lng,online,alert}], links:[{from,to}], analytics:{avgDistanceKm:14.2,avgTransitHrs:1.4,fuelSavedNaira:1200000} }`. Landing `NetworkDiagram` is static and needs no API.

### 4.12 Users and roles (`pg-users`, modal-user) - new

- `GET /api/roles` (with user counts), `GET /api/users?role=&facilityId=`, `POST /api/users` `{name,email,roleId,facilityId}` (sends invite email), `PATCH /api/users/:id`, `POST /api/users/:id/deactivate`, `GET/PUT /api/roles/:id/permissions`.

### 4.13 Audit (`pg-audit`) - new

- `GET /api/audit?type=&actor=&from=&to=&page=` -> `[{id,at,type,severity,detail,actor}]`; `GET /api/audit/export.csv`. Read-only; verify hash chain with `GET /api/audit/verify`.

### 4.14 Settings (`pg-settings`) - new

- `GET/PUT /api/settings` (general, security toggles, sync frequency, offline mode). `POST /api/settings/api-key/rotate`. `POST /api/settings/purge-cache` (Danger Zone; admin only, audited). Enforce IP lockdown and 2FA (TOTP) at login when enabled.
- Profile/verification for gate: `GET /api/me`, `PATCH /api/me`, `POST /api/me/verification/resubmit`.

### 4.15 Admin console (`/admin`) - new

- Admin login: separate `POST /admin/api/login` (replace `localStorage.adminAuth="1"`, which is not secure); role C JWT only, MFA required.
- `GET /admin/api/verifications?status=MANUAL_REVIEW` -> `[{id,name,accountType,license,workplace,submittedAt,registryResult,status}]`.
- `POST /admin/api/verifications/:id/approve|reject` `{reason}` -> sets user `verification_status`, emails the user, audit `VERIFICATION_DECISION`.
- `POST /admin/api/verifications/:id/recheck` -> re-run registry lookup.
- Overview, integrations (registry/Paystack/insurer health), users, facilities and audit sections reuse the endpoints above plus `GET /admin/api/integrations/health`.

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
- Storage units: LUTH Fridge A/B, EKO, UCH Ibadan, Lagos Island GH, Transit T-07.
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
