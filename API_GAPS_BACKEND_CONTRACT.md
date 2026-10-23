# Frontend API gaps and implementation contract

This is the current handoff for the integrations added after the frontend data audit. The backend source and authenticated deployment are not available in this repository: **unverified does not mean unimplemented**. Routes below are proposed additions or response extensions, not a claim that existing routes return 404. The frontend calls them now and displays errors until a compatible backend is deployed. No mock choices or success responses are substituted.

The machine-readable contract is [api-contracts/frontend-gaps.openapi.json](api-contracts/frontend-gaps.openapi.json). The full client route inventory is [API_ENDPOINT_INVENTORY.md](API_ENDPOINT_INVENTORY.md). Older specifications remain context; this supplement supersedes their descriptions of the integrations below.

## Implementation checklist

| Priority | Method and endpoint | Gap and connected UI | Status supported by evidence |
| --- | --- | --- | --- |
| P0 | GET `/api/form-options?context=prescription` | Managed insurer/payment choices in Create prescription | New client integration; backend unverified |
| P0 | GET `/api/form-options?context=marketplace` | Category selector in stock listing and marketplace search | New client integration; backend unverified |
| P0 | GET `/api/form-options?context=settings` | Currency selector in Settings | New client integration; backend unverified |
| P0 | GET `/api/form-options?context=reports` | Supported export formats in Export report | New client integration; backend unverified |
| P0 | GET `/api/prescriptions/pharmacies?page=1&limit=100` | Prescription pharmacy selector and Load more pharmacies | New client integration; replaces network-wide directory dependency |
| P1 | POST `/api/transfers/:id/dispatch` | Confirm dispatch on an approved transfer | New client integration; backend unverified |
| P1 | POST `/api/transfers/:id/deliver` | Confirm physical receipt on an in-transit transfer | New client integration; backend unverified |
| P1 | GET `/api/transfers?status=...` response extension | `APPROVED`, `IN_TRANSIT`, `DELIVERED` tabs and authorized actions | Existing route; extended response needed |
| P1 | POST `/api/reports/export` response extension | Download actual CSV/PDF/XLSX files instead of success without a file | Existing route; extended response needed for binary reports |

Required form choices are unavailable until metadata is implemented. General marketplace browsing remains usable without a category filter. Empty metadata groups are valid and mean no choices; a missing group, wrong context or malformed/duplicate options is an error. The frontend never creates a managed choice from a saved value missing from metadata.

## Common protocol

Configure `NEXT_PUBLIC_BASE_URL` and CORS for the frontend origin. All endpoints above require a bearer JWT. Derive facility and permissions from that principal. These lookups and new transfer writes explicitly use the facility user session without falling back to a stored admin session. They should not require `network.read` merely to create a prescription. Administrative account APIs remain separate.

Use real HTTP status codes plus `{success,message,data}`. Errors use `{success:false,message:"Actionable explanation",data:null,code:"STABLE_CODE"}`. Use 401 for invalid auth, 403 for denied scope, 404 for a missing resource, 409 for stale stock/state conflicts, 422 for invalid input, and 429 for rate limiting. A temporary 501 is an explicit missing feature response, not a success with fabricated data. Failed responses must not perform business writes. Sensitive responses should use `Cache-Control: private, no-store`.

## Managed form options

`GET /api/form-options?context=<context>` returns this envelope. Values are managed identifiers accepted unchanged by the downstream write endpoints; labels are human-readable. The example values below illustrate the schema and are **not frontend defaults or seed data**:

```json
{"success":true,"message":"Options loaded","data":{"context":"prescription","options":{"insurers":[{"value":"<managed-payment-code>","label":"<display name>"}]}}}
```

Each context requires exactly its named group: `prescription → insurers`, `marketplace → categories`, `settings → currencies`, `reports → reportFormats`. Each group is an array of unique nonempty string `{value,label}` pairs. Return an empty array if none exist. Never return secrets, account-specific clinical information or unsupported values.

Downstream fields: prescription `insurer`, marketplace multipart `category` and listing-search query `category`, settings `currency`, report request `type`. Metadata is for presentation; each mutation independently validates that the selected value is permitted and current. Report format values must be formats the export implementation can generate. Currency preferences do not change the existing explicitly NGN payment fields or convert money.

## Prescription pharmacy directory

Return `{success:true,message,data:{items:[{id,name,city,status:"ACTIVE",verified:true}],pagination:{page,limit,total}}}`. IDs are facility UUIDs. Pagination is required; the UI appends subsequent pages using `page * limit < total`. Return only verified active pharmacies eligible to receive this caller's prescription. Do not expose the unrestricted facility network or require network-operator permissions. `items:[]` with `total:0` is a successful empty directory.

Creation retains `{patient_ref,icd10,tnm_stage?,insurer,drug_id,qty,pharmacy_facility_id,prescriber_id?}`. The chosen pharmacy is retained; the caller's facility is never substituted. Only a doctor may prescribe, and any supplied prescriber must match the signed-in doctor. A current medicine, eligible pharmacy, positive whole quantity, non-empty ICD-10 value (maximum 200 characters), and current insurer choice are required. ICD-10 values are trimmed and uppercased on creation and update, with no cancer-code prefix or regex restriction; this is input validation, not a registry lookup. Creation and its first event are atomic. Clinical fields are not sent by email. Prescribers can read their own prescriptions alongside their facility's dispensing records.

Prescription creation and list responses include the saved `insurer`, `pharmacy` object (`id`, `name`, `city`, `status`), and `pharmacy_name` display string; the list pharmacy also includes `state`. The existing `facility` field remains an alias of the selected pharmacy. Render the insurer from `insurer` and the pharmacy from `pharmacy.name` (or `pharmacy_name`). New prescriptions start with `auth_status: "Pending"` and `order_stage: "Waiting"`; creation does not approve authorization or create a marketplace purchase. `patient_ref` is the submitted pseudonymous reference, not a generated patient name.

## Transfer lifecycle

List query statuses now use the canonical enum: `PENDING_APPROVAL`, `APPROVED`, `IN_TRANSIT`, `DELIVERED`. The completed tab sends `DELIVERED`; it no longer sends the old frontend-only `COMPLETED` filter.

Return `{success:true,message,data:{items:[{id,drug,quantity,unit,donorFacility:{id,name},recipientFacility:{id,name},lot,status,allowedActions:[],distanceKm?,dispatchedAt?,deliveredAt?}]}}`. The current page expects the full matching scoped list; it does not consume transfer-list pagination yet. `allowedActions` is mandatory and contains only operations authorized **for this caller and current record state**: `approve`, `reject`, `dispatch`, `deliver`. An absent/empty list hides action buttons. Unknown actions are ignored. The server must enforce the same policy on every mutation.

Dispatch/delivery accept `{}` and return `{success:true,message,data:{transfer:<updated transfer>}}`. Dispatch records the donor's confirmed physical departure, transitioning `APPROVED → IN_TRANSIT`. Delivery records recipient-confirmed physical receipt, transitioning `IN_TRANSIT → DELIVERED`. Require donor/recipient custody and the appropriate server permissions, not merely a visible page. Approval and rejection retain their existing routes.

Lock and validate the transfer and stock, enforce reservations/quantity/unit/medicine eligibility, and apply inventory/custody updates atomically under the backend's custody policy. Record actor, timestamps and audit entries. Repeated confirmation of an already-applied transition must not duplicate stock movement or notifications; make same-state retries idempotent or return a conflict with the persisted state. The frontend asks for confirmation and reloads backend state instead of fabricating completion. Queue any business notification with the transaction's EntityManager per the email handoff.

## Report download

Request stays `{type,from,to}`; `type` is a value from `reportFormats`. Return `{success:true,message,data:{fileName,mimeType,contentBase64}}`. Supported MIME types are `text/csv`, `application/pdf`, and `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. `contentBase64` is the file bytes encoded as base64, not a URL or JSON object. `fileName` must be a simple nonempty filename without path separators/control characters. The existing `{csv:"..."}` JSON response remains supported for CSV. Missing/invalid files show a download error instead of a success toast. Validate date range and export permissions, scope records to the principal, and audit exports.

## Professional account-type changes and new licence evidence

See `ADMIN_ACCOUNT_TYPES_BACKEND_HANDOFF.md` for the supplied backend contract and current frontend integration. Admin editing uses the existing user PATCH route with both `admin.access` and `user.update`. New evidence is submitted from `/verification/resubmit` through a public credential-based `POST /api/me/verification/resubmit`; the old authenticated bodyless request is removed. Production deployment and end-to-end review remain separately unverified.

## Already connected: do not create duplicate endpoints

- Team invitation currently posts to `POST /api/users` with `{first_name,last_name,email,phone,account_type,role_id,facility_id?}`. The team page uses the backend roles and facility list; the old modal's unsupported message now links to that page. The backend must constrain roles and derive facility scope for facility managers. Use the supplied email integration, not a new frontend email call. No `/api/users/invitations` endpoint was invented.
- Password recovery, registration and email transactions are covered by `EMAIL_SERVICE_BACKEND_HANDOFF.md`.
- Dashboard, inventory/medicine, scan and transfer suggestions are already referenced in their handoffs and the complete inventory. They require deployment verification rather than an unsupported declaration that they are missing.
- No MFA enrollment, biometric enrollment, cache-purge or secret-rotation endpoint was added speculatively. Existing settings preferences do not prove those security workflows exist. Do not expose a switch as implemented security unless the backend enforces it.

## Acceptance

Implement the schemas, then test with real facility credentials: managed choices and empty groups; wrong/denied contexts; pharmacy pagination and scope; prescription creation with a permitted insurer/pharmacy; listing and search category values; saved currency; each permitted transfer transition and repeated/conflicting requests; CSV/PDF/XLSX downloads; and 401/403/404/409/422/501 responses. Client tests use mocked HTTP only and do not establish that any deployed backend route exists.
