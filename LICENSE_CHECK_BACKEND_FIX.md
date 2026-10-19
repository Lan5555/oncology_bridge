# Facility licence lookup and manual evidence contracts

## Confirmed backend contract

The validation error came from sending an automated lookup request to the manual review endpoint. The backend has confirmed that these are separate actions.

### Automated lookup: Check licence button

POST /api/facility-membership-requests/{requestId}/license-lookup
Authorization: Bearer <facility-user-or-admin-session-token>
Content-Type: application/json

Body: {}

Do not send result, evidence, licence number, registry, facility ID or applicant identity. The server derives these from the pending request, linked applicant and latest verification application. Nonempty request properties are rejected.

The frontend now uses this endpoint and selects the admin token when opened from the network admin console. Local member records need not contain all licence details for the action to run; the backend validates authoritative data.

### Manual evidence submission

POST /api/facility-membership-requests/{requestId}/license-check

Body: { "result": "MATCH", "evidence": "Meaningful reviewer evidence" }

This endpoint remains a manual review action. Result must be MATCH, NO_MATCH, UNAVAILABLE or INCONCLUSIVE. Evidence is trimmed and must be a string of 5 to 4000 characters. The automated button does not use this endpoint.

## Lookup response

Return the persisted review in data.facility_license_review with the canonical result field:

```json
{
  "success": true,
  "message": "Registry check completed. Manual review is required.",
  "data": {
    "facility_license_review": {
      "id": "persisted-check-uuid",
      "membership_request_id": "request-uuid",
      "result": "UNAVAILABLE",
      "evidence": "Server-side registry lookup is not configured. Manual licence review is required.",
      "checked_at": "2026-10-19T12:00:00.000Z",
      "status": "MANUAL_REVIEW"
    }
  }
}
```

HTTP 200 means the outcome was recorded, including UNAVAILABLE and INCONCLUSIVE. It does not mean the licence matched or membership was approved. The frontend displays the recorded result, evidence and timestamp; membership list responses must include the latest persisted facility_license_review so this survives refresh.

Each lookup appends an immutable facility_license_checks row and audit event atomically. Its derived status does not update central application approval, authoritative licence verification, membership decisions or activation. Even MATCH leaves those approval gates in place.

## Authorization and errors

Facility reviewers must be active and verified, have FACILITY_ADMIN and facility.users.manage, and belong to the request's facility. ADMIN/SUPERADMIN operators use their admin bearer token with admin.access and verification.decide; configured network MFA still applies.

The server rechecks applicant details, reviewer permissions and pending membership after the provider call. Return 409 for changed details, 422 for missing licence/application data, 400 for invalid UUIDs, 404 for unknown requests and 403 for forbidden access. Errors are displayed without inventing evidence or a lookup outcome.

## Registry integration

Registry display names must come from backend metadata rather than frontend account-type mappings. Include the configured `registry_name` alongside `registry` in applicant/licence records and `facility_license_review` responses when a full display name is needed. The UI displays the supplied name, falls back to the supplied registry code, and shows "Not provided" when neither exists. Registration uses generic licence labels until a public registry metadata contract is available; required registration registry codes remain unchanged.

The confirmed authenticated configuration endpoint is `PUT /admin/api/integrations/license_registry/configuration`:

```json
{
  "values": {
    "mdcn_registry_name": "Configured MDCN display name",
    "pcn_registry_name": "Configured PCN display name",
    "pcn_premises_registry_name": "Configured premises display name"
  }
}
```

These optional non-secret settings accept single-line text of at most 200 characters. The admin integration form trims them and preserves empty strings to clear names. Empty, unknown or unavailable names return `registry_name: null`. User/session records preserve both the legacy `license_registry` and the supplied `registry` alias, together with `registry_name`.

Display metadata is independent of Vault/provider availability and does not establish a licence match. Renaming a registry does not rewrite codes or historical evidence. The existing configuration JSON stores these fields; no new migration or public enumeration endpoint is needed.

Configure license_registry through integration administration using its HTTPS registry_url and Vault-backed api_key. Live matches require a trusted gateway implementing the backend's application-owned contract. Unconfigured integration, inaccessible secrets, network failures and unsuccessful HTTP responses yield persisted UNAVAILABLE outcomes. Provider calls must not hold database locks.

## Verification

Check that the button sends exactly {} to /license-lookup with the correct session token. Exercise all four outcomes, evidence display, refresh persistence, errors and cross-facility rejection. Confirm that successful lookups leave central approval and activation unchanged. Manual /license-check must retain its validated result/evidence contract.
