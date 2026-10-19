# Admin portal backend implementation contract

This contract covers the controls exposed by `/admin`: registration review, facility status management, user/role administration, overview metrics, audit events, settlements, and integration health. Admin login uses the existing `POST /auth/api/login`; after authentication, all `/admin/api/*` routes require the returned admin access token. The deployed role rows are `ADMIN` (id 1, Network Administrator), `PHARMACIST` (id 2), `ONCOLOGIST` (id 3), and `SUPERADMIN` (id 4, Super Administrator). `ADMIN` and `SUPERADMIN` may enter the admin portal, subject to server-side permissions; the UI does not grant access. MFA should be required where configured.

**Login must exempt administrative roles from facility/licence review gates.** An ADMIN or SUPERADMIN account is an operator identity, not a facility registrant: it must be active and authenticated by its admin role, and it does not need a facility, professional licence, or `VERIFIED` facility registration. Apply the facility/license pending check only to facility-linked clinical/pharmacy accounts. The backend should check `active` and authenticate credentials, resolve the role, then apply role-specific authorization rules. This prevents an administrator from receiving “Registration is awaiting facility and license review.”

## Registration review queue

### List applications

`GET /admin/api/verifications?status=ALL&page=1&limit=50&q=<optional>`

Return a paginated envelope (the frontend accepts either a direct array or `data.applications` / `data.items`):

```json
{
  "success": true,
  "message": "Registration applications loaded.",
  "data": {
    "applications": [
      {
        "id": "application-uuid",
        "status": "MANUAL_REVIEW",
        "registry": "MDCN",
        "registry_result": "UNAVAILABLE",
        "license_number": "MDCN/R/48211",
        "submitted_at": "2026-10-15T10:00:00.000Z",
        "checked_at": "2026-10-15T10:05:00.000Z",
        "reviewed_at": null,
        "reason": null,
        "user": {
          "id": "user-uuid",
          "first_name": "Ada",
          "last_name": "Okafor",
          "email": "ada@example.org",
          "phone": "+234...",
          "account_type": "DOCTOR",
          "verification_status": "MANUAL_REVIEW",
          "active": false
        },
        "facility": {
          "id": "facility-uuid",
          "name": "Example Oncology Centre",
          "facility_type": "CANCER_CENTER",
          "hospital_code": "LG-EXAMPLE-001",
          "status": "PENDING",
          "email": "records@example.org",
          "phone": "+234...",
          "address": "12 Example Road",
          "city": "Lagos",
          "state": "Lagos State"
        }
      }
    ],
    "page": 1,
    "limit": 50,
    "total": 1
  }
}
```

Supported status filters: `ALL`, `PENDING`, `MANUAL_REVIEW`, `VERIFIED`, and `REJECTED`. Include applicant identity/contact, account type, licence/registry/result/last-check time, facility name/type/code/contact/address/status, review reason, and submission time because the review screen displays these as separate sections. Paginate and search server-side; never include password hashes, tokens, device secrets, or unrelated patient data. Facility fields may be `null` where the registration flow did not collect a separate official facility contact or street address.

The public registration endpoint creates a facility in `PENDING` and a linked initial admin who is inactive and `MANUAL_REVIEW`. The compatibility fields `license.verification_status` and `license.registry_result` from public registration are not authoritative. The review queue reads the backend's persisted application, user, and facility state.

### Recheck a licence

`POST /admin/api/verifications/:applicationId/recheck` with an empty JSON object (or no body). The backend resolves the registry and licence from the stored application; do not trust replacement licence data from the browser.

Return the updated application or at minimum `{ registryResult, status, checkedAt }`. Store the result and timestamp, preserve `MANUAL_REVIEW` until an authorized decision, and audit the recheck. Registry `MATCH` is evidence for the reviewer, not automatic account activation.

### Approve or reject

`POST /admin/api/verifications/:applicationId/approve`

`POST /admin/api/verifications/:applicationId/reject`

Request body:

```json
{ "reason": "Reviewed against the issuing registry and supporting records." }
```

`reason` is optional for approval and required for rejection. Derive the reviewer identity from the authenticated admin token, never from a client-supplied `reviewer_id`. Validate legal state transitions, and write the application, user, facility, notification, and audit updates transactionally.

Approval must:

1. Set the application and user's `verification_status` to `VERIFIED`, record reviewer/time/reason, and update the stored registry result if appropriate. If the backend has a separate licence/credential table or verification flag used by login, update that authoritative record too. The login handler and review queue must read the same source of truth.
2. Set the facility to `ACTIVE` and the initial admin user to `active=true` only after the review decision succeeds. This is required because public registration creates both as pending/inactive and the UI tells the admin approval activates the account.
3. Notify the registrant that the account can now sign in, and append an immutable `VERIFICATION_DECISION` audit event.

Rejection must:

1. Set application and user's verification status to `REJECTED`, record reviewer/time/reason, keep the user inactive, and set the facility to `REJECTED`.
2. Notify the registrant with the safe, actionable reason and append an immutable audit event.

Return the updated application with its user verification status, active flag, facility status, and authoritative licence status. Re-read the persisted records after the transaction before returning success; do not return an optimistic status. Errors should use stable codes: `404` for an unknown application, `409` for an invalid/repeated transition, `422` for a missing rejection reason, and `403` for insufficient admin permission. Do not report a successful decision until all transactional writes succeed.

## Facility management

The existing frontend routes are:

- `GET /hospital/api/find-all-facilities?page=1&limit=100&status=&q=`
- `GET /hospital/api/find-one-facility/:facilityId`
- `PATCH /hospital/api/update-one-facility/:facilityId`
- `DELETE /hospital/api/delete-one-facility/:facilityId`

The list response should contain `{ facilities, counts }`. Each facility row should include `id`, `name`, `hospital_code`, `facility_type`, `city`, `state`, `phone`, `email`, `status`, `ip_whitelist`, device summary, and last activity when available. Status values: `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`.

PATCH accepts only allowed fields, including `status`, `ip_whitelist`, `details` (admin reason/note), facility details, and approved device changes. Validate transitions. A direct admin status update must not silently activate a facility whose required licence/admin checks are incomplete. If a status change reactivates access, require eligibility or an explicit audited override reason. DELETE is a soft delete and must be audited. Return the updated facility so the UI can reconcile its row after a save.

## Users and roles

The admin portal reads:

- `GET /api/users?take=50&skip=0` (also support role/facility filters)
- `GET /api/roles` with permission names and user counts
- `GET/PUT /api/roles/:roleId/permissions` (return assigned and available permission keys; PUT accepts `{ "permissions": ["facility.read", "facility.update"] }`)
- `PATCH /users/api/update-one-user/:userId` to update an allowlist of profile fields (`first_name`, `last_name`, normalized `email`, `phone`) or deactivate with `{ "is_active": false }`.
- `DELETE /users/api/delete-one-user/:userId` to soft-delete a user and revoke active sessions.
- `POST /api/roles`, `PATCH /api/roles/:roleId`, `DELETE /api/roles/:roleId`
- `GET/PUT /api/roles/:roleId/permissions`
- `POST /api/users` to send a user invitation (facility admins are always scoped to the facility in their authenticated principal; network admins must provide an allowed `facility_id`).
- `GET /api/facility-membership-requests?status=PENDING` for pending public requests to join a facility.
- `POST /api/facility-membership-requests/:requestId/approve` and `/reject` for membership decisions; rejection requires `{ "reason": "..." }`.
- `POST /api/facility-membership-requests/:requestId/license-check` for a facility-scoped registry recheck of the applicant on that request.

The admin user list must return the user fields needed by the full-details panel: `id`, `first_name`, `last_name`, `email`, `phone`, `active`, `account_type`, `license_number`, `license_registry`, `verification_status`, `registry_result`, `last_login`, `created_at`, `updated_at`, role summary, and facility summary (`id`, `name`, `hospital_code`, `facility_type`, `status`, `email`, `phone`, `address`, `city`, `state`). Nested licence/facility representations are also acceptable if they include the same information. Do not return `password`, `password_hash`, access/refresh tokens, device secrets, or patient data. Values that are not applicable should be `null` rather than fabricated.

Facility user invitations accept `{ first_name, last_name, email, phone, account_type, role_id }`; only a network admin may also specify `facility_id`. A facility admin's facility is derived from the authenticated principal, never from a client-supplied ID. Permit only facility-level roles such as `PHARMACIST` and `ONCOLOGIST`; reject `ADMIN` and `SUPERADMIN`. Send a one-time invitation link instead of creating a password in the admin browser. The invited member remains inactive and cannot use clinical or pharmacy tools until account setup, required licence verification, and facility approval are complete. Return the invitation/user status without exposing secrets. Every invite must be rate-limited, audited, and constrained by `facility.users.manage`.

Public join requests are scoped to the facility admin's authenticated facility. The request list should include applicant name/email, account type, submitted licence number and verification status, request time, and request status. Approval must transactionally mark membership `APPROVED` and link the user to the facility; it must not verify their licence or grant professional permissions. Then recompute activation from the independent gates: if the facility is `ACTIVE`, membership is approved, the user's licence is `VERIFIED`, and account setup is complete, set the user `active=true` and allow login. If any gate is incomplete, keep the user inactive and return the specific pending gate(s), such as `verification_status=MANUAL_REVIEW` or facility status, so the UI can explain why. Rejection requires a reason and leaves the user inactive. Network admins may review across facilities according to their permission set. Record every decision in the audit log and return the updated membership, user (`active`, verification status), and facility state in the same response.

The facility membership review panel may request a registry recheck with `POST /api/facility-membership-requests/:requestId/license-check` and an empty JSON body. Require `facility.users.manage`, derive the facility from the authenticated principal, and reject requests belonging to another facility. Resolve the user's licence number, registry, account type, and (for person licences) last name from the stored request/user; never accept replacement credential fields from the browser. Persist the latest facility review evidence and timestamp, then append an audit event. Return `{ facility_license_review: { registry, registry_result, checked_at }, user: { verification_status, active } }`. This action records evidence for the facility's membership decision only: it must not set the user's authoritative `verification_status`, activate the user, or bypass the network licence-review workflow. A registry `MATCH` is evidence, not an approval. Apply registry-check rate limits and return a stable error when the licence data is missing or the registry is unavailable.

Every network-wide mutation requires the appropriate Role C permission. Facility user invitations, membership decisions, profile updates, deactivation, and soft deletion require `facility.users.manage` and must be limited to members of the authenticated facility; the server derives facility scope from the token rather than trusting a request field. All mutations are audited and return the updated resource. Profile updates must reject unknown/immutable properties, validate email/phone and uniqueness, and must never accept password hashes, licence verification, facility status, or role changes through the profile editor. User deletion is a soft delete: set the user inactive, revoke sessions, retain the record and audit history, and exclude it from normal lists. Reject deleting the authenticated admin or the last usable network administrator unless an explicit recovery workflow is completed. A facility admin also cannot remove/deactivate the last designated facility owner unless an explicit ownership-transfer workflow is completed. The permissions GET response should include `{permissions:[...assigned keys...],availablePermissions:[...all assignable keys...]}` so the role editor can add and remove grants without guessing the permission catalogue. Do not allow an admin to deactivate the last usable network administrator without an explicit recovery policy. Role deletion must be rejected while referenced or require an audited reassignment workflow. Public facility registration must never assign Role C.

### Role-specific tool visibility

The authenticated user response should include server-derived `allowed_pages` (page IDs such as `pg-prescriptions` and `pg-inventory`) and `can_manage_facility_users`. Derive these from the user's RBAC permissions, account type, facility membership, and verification/activation state. Use explicit permissions for privileged pages: `network.read` for the network map, `facility.read` for network facility management, `audit.read` for audit views, and `facility.users.manage` for facility team management. A verified user with a facility membership may see the facility team entry point, but invitation, membership decision, profile edit and removal controls require `facility.users.manage`; the primary facility admin must receive that capability. Do not include network-wide pages by default for legacy accounts or infer them from account type. The dashboard/sidebar uses these values to show only permitted workspaces; an unverified or inactive user remains limited to dashboard/settings. This is a presentation aid only: every underlying API must still enforce the same permission and facility scope. Never infer facility-admin capability solely from the `PHARMACIST`, `ONCOLOGIST`, or `PHARMACY_STORE` account type.

Facility admins responsible for adding stock, and explicitly authorized pharmacy staff, must receive `inventory.manage` and the `pg-inventory`, `pg-scan`, and `pg-medicines` page grants. These grants may extend the default workspace of a verified `PHARMACIST` or `DOCTOR`; the frontend must not discard them because of account type. Inventory offers manual batch intake and GS1 scanner offers scan/decode intake. Enforce authenticated facility scope and inventory mutation permissions on the corresponding APIs. Team-management permission alone does not grant stock access. Return updated claims after a permission change; see `read.md` for an example.

Admin sessions should return permission keys with the authenticated user/role. The admin portal shows the Roles & permissions tab to both `ADMIN` and `SUPERADMIN` operator roles. Grant `role.manage` to these roles and enforce it on role and permission APIs. Other sections are filtered by their matching permission: `dashboard.read`, `verification.review`, `user.read`, `facility.read`, `audit.read`, `integration.read`, and `settlement.read`. Enforce permissions on every API; showing a tab is not authorization.

## Overview, audit, settlements, and integration health

The portal consumes:

- `GET /api/dashboard/summary` with admin auth for network counts.
- `GET /api/settlements/summary` with admin auth for transaction volume, fees, and queued payouts.
- `GET /api/audit?page=1&limit=7` with admin auth for recent activity.
- `GET /api/audit/export.csv` for audit export; exports must respect filters and audit the export action.
- `GET /admin/api/integrations/health` with admin auth. Return an array or `{ integrations: [...] }` with `name`/`key`, `status`, `description` or safe status detail, and `lastCheckedAt`. Do not return credentials, secret values, raw connection strings, or sensitive provider errors.

The integration panel supports health refresh, server-managed configuration, connection tests, and manual sync. The frontend calls the following routes; implement them before using these actions against production integrations:

- `GET /admin/api/integrations/:integrationKey/configuration` returns only a field schema and safe metadata, for example `{ fields: [{ key, label, type, required, configured, description, value? }] }`. Supported field types are `text`, `url`, `secret`, and `boolean`. `value` may be returned for non-secret settings only; never return stored secret values. `configured` may indicate whether a secret exists.
- `PUT /admin/api/integrations/:integrationKey/configuration` accepts `{ values: { ... } }`. Validate keys/types against the server-owned schema, store credentials in the backend secret manager, and return only safe configuration metadata. An omitted or blank configured secret means preserve the stored value; provide a separate explicitly authorized clear-secret operation if removal is needed. Never echo the submitted secret.
- `POST /admin/api/integrations/:integrationKey/test` accepts `{}` and tests the stored server-side configuration. Return a safe status (`HEALTHY`, `DEGRADED`, or `FAILED`), check time, and redacted summary. Do not send credentials to or through the browser as part of the test.
- `POST /admin/api/integrations/:integrationKey/sync` accepts `{}` and starts a sync using server-side credentials. Return `{ jobId, status, startedAt }`; report completion through health/job status, and make retries safe or idempotent where the provider supports it.

Require `integration.read` for health, `integration.manage` for configuration schema/updates and connection tests, and `integration.sync` for manual sync. Derive the actor from the authenticated ADMIN/SUPERADMIN session and enforce MFA and permissions server-side. Audit configuration changes (redacting values), tests, and sync requests; rate-limit tests/syncs and avoid exposing provider stack traces, credentials, raw connection strings, or patient data. The UI submits credentials directly to these endpoints, keeps them only in transient form state, never stores them in browser storage, and never pre-fills saved secrets. If a backend has not implemented these routes or provided a configuration schema, the corresponding action cannot complete and should show the returned backend error/schema-unavailable state.

## Security and operational requirements

- Use admin-only bearer authentication on each admin route. The shared login endpoint must issue an admin-capable session only for `ADMIN` or `SUPERADMIN`, complete MFA where configured, and bypass facility/licence review requirements for those operator roles. Validate token issuer/audience, expiry, MFA state, and the specific role permission on every admin endpoint; reserve destructive/global actions for `SUPERADMIN` if that is the policy.
- Apply pagination bounds, query validation, rate limits on login and registry rechecks, and generic error handling that does not leak account existence or infrastructure secrets.
- Derive reviewer and actor IDs from the authenticated principal.
- Commit each decision and its audit event atomically. Notifications should use a transactional outbox or retryable job so notification outages do not lose the decision.
- Keep audit records append-only and include actor, action, object ID, timestamp, request correlation ID, and redacted before/after status. Never log passwords, bearer tokens, or full licence documents.
- Re-check facility and user activation state in authorization middleware on every operational API. Frontend buttons and hidden sections are not access control.

## Acceptance checks

- The review list includes pending registrations with applicant, licence, facility, statuses, and submission time, supports `ALL` and status/search/pagination filters, and returns no secrets.
- Registry recheck reads the stored application and does not change a pending account to verified by itself.
- Approval verifies the user, activates the facility and initial admin, records reviewer/time, notifies the registrant, and audits the transition atomically.
- Login and the review queue agree on the same persisted licence-verification source of truth after approval; the approved user can sign in without a stale "licence not verified" gate.
- Rejection requires a reason, leaves the user inactive, rejects the facility, notifies the registrant, and audits atomically.
- Facility status updates validate transitions and cannot bypass required onboarding checks without an explicit audited override.
- User, role, audit, settlement, and integration responses match the fields the frontend consumes. Global admin controls enforce Role C; facility invitations, membership decisions, and member management require `facility.users.manage` and are restricted to the authenticated facility.
- Facility admins can invite allowed facility roles but cannot assign `ADMIN`/`SUPERADMIN` or change the invitation's facility scope.
- Pending join requests can be approved/rejected with reasons and audit evidence; membership approval never substitutes for licence verification.
- Approving a join request activates an account only when the facility is active, membership is approved, licence status is verified, and account setup is complete; the endpoint returns the resulting `user.active` value and any unmet activation gate.
- Authenticated sessions expose server-derived role-specific `allowed_pages` and facility-user-management capability; operational API authorization independently enforces each permission.
- Admins can edit a user's name, email, and phone; email collisions and invalid fields are rejected. User deletion revokes access and records an audited soft delete, while protecting the current and last usable network administrator. Facility admins may manage only their own facility's members and cannot remove its last designated owner.
- Integration health responses contain safe status metadata only.
- Integration configuration reads expose schemas and non-secret values only; secret values are never returned, echoed, logged, or stored by the browser. Save, test, and sync endpoints enforce their distinct permissions and append redacted audit events.

## Network-wide operational visibility in the admin console

`ADMIN` and `SUPERADMIN` operators must be able to review all operational areas, including medicines and inventory, directly inside `/admin`. This differs from a `FACILITY_ADMIN`, whose records remain limited to their own facility. The frontend exposes read navigation for all network operators. The backend must authorize these reads using the operator's JWT and grant the corresponding read permissions; displaying a navigation item does not bypass API authorization. Existing mutations keep their own permission requirements.

Every new operational view explicitly sends the **adminSession** bearer token, even when a facility user is also signed in. Do not silently scope an authenticated network operator to one facility. Return network-wide records, including the supplying/owning facility where applicable. Sensitive credentials and password/token fields must never be returned.

| Admin section | GET endpoint | Read permission |
| --- | --- | --- |
| Drug catalogue | `/api/medicines` | `medicine.read` |
| Inventory | `/api/inventory` | `inventory.read` |
| Marketplace | `/admin/api/marketplace/listings` | `marketplace.read` |
| Prescriptions and orders | `/api/prescriptions` | `prescription.read` |
| Invoices and payments | `/api/invoices` | `invoice.read` |
| Redistribution | `/api/transfers` | `transfer.read` |
| GS1 scan records | `/api/scans` | `scan.read` |
| Storage units | `/api/storage-units` | `coldchain.read` |
| Cold chain events | `/api/cold-chain-events` | `coldchain.read` |
| Near-expiry stock | `/api/expiry?withinDays=60` | `inventory.read` |
| Network directory | `/api/network` | `network.read` |
| Research inquiries | `/api/research/inquiries` | `research.read` |

Implement the GET methods above where only creation endpoints currently exist (notably invoices, scans, and research inquiries). The admin marketplace endpoint is distinct from the buyer catalogue: it must include draft, pending-review, published, suspended, and withdrawn listings with `status`, seller/facility, images, price, and inventory reference. It must not apply the public catalogue's published-only filter. Existing buyer endpoints retain their restrictions.

All list endpoints accept `page` (starts at 1), `limit=25`, and optional `q`. Apply search before pagination, use a stable ordering, and return the standard envelope with `data: { items: [...], total: <filtered count>, page: <page>, limit: 25 }`. The frontend also accepts existing named arrays such as `medicines`, `facilities`, `invoices`, `scans`, `events`, or `inquiries` during migration. Return `total` (or `pagination.total` / `meta.total`) to enable the Next button; without pagination metadata, the frontend displays returned records and disables forward paging rather than repeating an unpaginated response. Do not ignore page/search inputs on endpoints that claim to support pagination.

Keep existing resource field names. Include IDs and resource attributes needed by the existing frontend, with facility and medicine details where relevant. The record-details dialog displays the returned record and links to uploaded drug images. Do not include identifiable patient data where a pseudonymous order/patient reference is sufficient. Use 403 for unauthorized reads, and an explicit error if a list endpoint is unavailable; do not return a false empty success.

Validation: sign in to a facility and an admin in the same browser, then inspect every operational view. Requests must use the admin JWT and return records from multiple facilities. Test empty states, denied/unavailable APIs, search, pagination, marketplace publication states, and record details. Facility sessions must remain scoped to their facility on the same shared endpoints.
