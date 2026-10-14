# GS1 DataMatrix Scanner: Backend API Requirements

The backend API notes supplied for this project confirm the scanner endpoints below are implemented. This document records their contract and the frontend wiring. It also calls out the remaining deployment prerequisites and scanner UX that are not present in this frontend.

## Implementation status

| Endpoint | Purpose | Status |
| --- | --- | --- |
| `POST /api/scans/decode` | Decode a captured image and return GS1 identifiers for operator review | Implemented; wired to camera capture |
| `POST /api/scans` | Validate and record a confirmed scan in the inventory ledger | Implemented; wired to scan form submission |
| `POST /api/scans/batch` | Submit queued scans for offline synchronization | Implemented; wired to the pending scan queue and sync action |
| `GET /api/scans/recent?limit=5` | Populate the recent-scans list | Implemented; wired to recent-scans list |
| `GET /api/scans/monthly` | Populate the monthly scan chart | Implemented; wired to monthly chart |
| `GET /api/gs1/lookup?gtin=...` | Look up a product by GTIN | Implemented; wired to GTIN lookup and decoded product review |

The route contracts below follow the supplied backend API notes. Before production use, apply the scanner database migration in the backend repository and ensure the frontend origin is included in the backend's comma-separated `CORS_ORIGIN` setting.

## Scanner flow

1. The frontend captures a single still image from the camera; it does not stream video.
2. `POST /api/scans/decode` returns decoded identifiers. It must not create an inventory or scan record.
3. The operator reviews and can correct the returned values.
4. The frontend submits the confirmed values to `POST /api/scans`, which validates, deduplicates, and records the scan.
5. The frontend refreshes the recent-scans list. Monthly counts come from `GET /api/scans/monthly`.

Manual entry skips image decoding and submits directly to `POST /api/scans`.

## 1. Decode a captured image - implemented and wired

```http
POST /api/scans/decode
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

Multipart fields sent by the frontend:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `image` | file | Yes | One camera still image containing a GS1 DataMatrix. Accept JPEG or PNG and enforce an upload limit (for example, 10 MB). |
| `facilityId` | UUID string | Yes | Facility where the scan is taking place. Verify the authenticated user can scan for it. |
| `action` | string | Yes | `NEW`, `AVAILABLE`, or `NEAR_EXPIRY`; validate against the backend enum. |
| `notes` | string | No | Optional operator note. The frontend sends an empty string when omitted. |
| `clientUuid` | UUID string | Yes | Client idempotency key for retry tracking. |
| `clientTs` | ISO 8601 string | Yes | Client capture time. Use server time as authoritative for audit records. |

The endpoint decodes GS1 Application Identifiers `(01)` GTIN, `(10)` lot/batch, `(17)` expiry, and `(21)` serial. Return expiry as `YYYY-MM-DD`. Validate GTIN length and check digit, date validity, and required identifiers. If the code is readable but fails validation, return the decoded values and validation details so the operator can correct them. If no product matches the GTIN, still return identifiers and report that lookup result; do not reject an otherwise readable code solely because the product is not in the catalog.

Successful response (use the normal API envelope):

```json
{
  "success": true,
  "message": "GS1 DataMatrix decoded.",
  "data": {
    "identifiers": {
      "gtin": "09506000134352",
      "lot": "LOT-2407A",
      "expiry": "2027-07-31",
      "serial": "8472901"
    },
    "validation": {
      "valid": true,
      "status": "VALID",
      "messages": []
    },
    "medicine": {
      "id": "<medicine-uuid>",
      "name": "Example medicine"
    }
  }
}
```

`medicine` may be `null` when there is no catalog match. Do not retain the uploaded image after decoding unless retention is explicitly required by policy. Do not create a scan, inventory, or audit event as a side effect of decoding; ledger submission is a separate operator-confirmed action.

Recommended errors:

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Missing image, unsupported image type, or unreadable image |
| `401 Unauthorized` | Missing or invalid bearer token |
| `403 Forbidden` | User is not allowed to scan for the supplied facility |
| `413 Payload Too Large` | Image exceeds the configured limit |
| `422 Unprocessable Entity` | Image is readable but required GS1 values cannot be decoded; include validation details where available |
| `429 Too Many Requests` | Per-user or per-facility decode rate limit exceeded |

## 2. Confirm and record a scan

```http
POST /api/scans
Authorization: Bearer <access-token>
Content-Type: application/json
```

The frontend sends the reviewed form values:

```json
{
  "gtin": "09506000134352",
  "lot": "LOT-2407A",
  "expiry": "2027-07-31",
  "serial": "8472901",
  "facilityId": "<facility-uuid>",
  "action": "NEW",
  "notes": "Received from supplier",
  "clientUuid": "<client-uuid>",
  "clientTs": "2026-10-14T10:30:00.000Z"
}
```

Backend behavior required by the contract:

- Validate `(01)` GTIN-14 including its check digit, `(10)` lot, `(17)` expiry, and `(21)` serial. Validate that the expiry is a real date and normalize it to `YYYY-MM-DD`.
- Verify facility access and allowed action; never trust a facility or user identity supplied only by the client.
- Enforce idempotency on `clientUuid` so retries do not create duplicate records.
- Check serial duplication/counterfeit rules, resolve the medicine by GTIN when possible, upsert inventory as appropriate, and audit the scan (`GS1_SCAN`).
- Return the scan result and validation state in the standard `{ success, message, data }` response envelope. A duplicate/counterfeit result should be explicit and must not silently appear clean.

The supplied backend notes confirm this route is implemented. The frontend sends the captured still image and metadata, prefills the review form from `identifiers`, displays validation messages, and uses the included medicine summary or performs a GTIN lookup.

## 3. Offline batch submission

```http
POST /api/scans/batch
Authorization: Bearer <access-token>
Content-Type: application/json
```

The frontend persists scans when the device is offline or the request fails due to a network error. The operator can review the pending count and sync when reconnected. The service posts an object containing a `scans` array:

```json
{
  "scans": [
    {
      "gtin": "09506000134352",
      "lot": "LOT-2407A",
      "expiry": "2027-07-31",
      "serial": "8472901",
      "facilityId": "<facility-uuid>",
      "action": "NEW",
      "clientUuid": "<client-uuid>",
      "clientTs": "2026-10-14T10:30:00.000Z"
    }
  ]
}
```

Process each item independently and return an item-level result for each `clientUuid`, including validation or duplicate status. Reuse the same validation, facility authorization, idempotency, inventory, and audit behavior as `POST /api/scans`. The supplied backend notes confirm it accepts a raw array or `{ "scans": [...] }`, so the frontend service's wrapped payload is supported. The UI removes only confirmed successful item results from its local queue; failed or unrecognized results remain queued for review/retry.

## 4. Recent scans

```http
GET /api/scans/recent?limit=5
Authorization: Bearer <access-token>
```

Implemented according to the supplied backend notes. Return the most recent scans visible to the signed-in user's facility/role. The UI reads `id`, `gtin`, `lot` or `batchNumber`, `drug`, `result` or `status`, and `at`. Return an array in the normal response envelope; use ISO timestamps. Do not expose scans from facilities the user cannot access.

## 5. Monthly scan totals

```http
GET /api/scans/monthly
Authorization: Bearer <access-token>
```

Implemented according to the supplied backend notes. Return monthly aggregate counts for the signed-in user's permitted scope, suitable for the monthly scan chart. Each row should include a month label and numeric count, for example:

```json
{
  "success": true,
  "data": [
    { "month": "May", "count": 18 },
    { "month": "Jun", "count": 24 }
  ]
}
```

Return real aggregates or an empty array. Do not substitute fabricated chart values when there is no scan history.

## 6. GTIN product lookup

```http
GET /api/gs1/lookup?gtin=09506000134352
```

Implemented as a public lookup according to the supplied backend notes. The frontend calls this route without bearer authentication. Return only public, non-sensitive product identity such as medicine name, brand, and GTIN. Unknown GTINs return `data: null` and do not prevent identifier decoding.

## Deployment checklist

- [ ] **Deployment prerequisite:** apply `database/gs1-scanner.sql` in the backend repository before using persisted idempotency, facility scope, action, and audit fields.
- [ ] **Deployment prerequisite:** add the deployed frontend origin to the backend `CORS_ORIGIN` list.
- [ ] Confirm the deployed backend base URL is configured as `NEXT_PUBLIC_BASE_URL` in the frontend environment.
