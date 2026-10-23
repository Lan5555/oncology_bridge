# Admin professional account types

## Integration status

This document reflects the backend contract supplied on 23 October 2026. It replaces the earlier backend-gap report. Backend tests/build were reported in the supplied handoff; production database execution and deployment have not been verified by this frontend task.

Frontend integration is implemented:

- Admin → People & access → Users & account types shows and filters professional types in the existing user directory. The directory currently loads `GET /api/users?take=50&skip=0`; filters apply to those loaded records.
- The editor requires both `admin.access` and `user.update`, a known actor ID, and an eligible target. Own accounts and administrator-role targets (including facility administrators) are read-only. The backend remains the authorization authority.
- Changes require a reason. The editor explains that the account will become inactive and the user must provide new licence evidence. It confirms saved `data.account_type` before showing success and reloads the directory.
- `/verification/resubmit` is a public credential-based form linked from sign-in and the manual-review gate. It collects email, current password, the updated professional type, and a new licence number. The selected type determines the registry; only the four required API fields are sent. No bodyless resubmission remains.
- The request uses `auth:false`: neither a workspace nor admin bearer token is attached, and credential failures do not clear existing sessions. Passwords are not stored in application/browser storage and the password input is cleared after each attempt. The screen handles HTTP 429 without automatic retries and never creates a workspace session after submission.
- The page uses noindex metadata and the same referrer/CSP headers as password recovery. Success states that evidence was submitted and access still requires review and facility/membership checks.

## Account update

`PATCH /users/api/update-one-user/:id` (also `/api/users/api/update-one-user/:id`) accepts contact-only updates as before. A type update requires an active ADMIN or SUPERADMIN with both `admin.access` and `user.update`. Admin session user responses include the current database-backed `permissions` array.

```json
{
  "first_name": "Ada",
  "account_type": "PHARMACIST",
  "expected_account_type": "DOCTOR",
  "account_type_change_reason": "Corrected classification after review."
}
```

Types are `DOCTOR`, `PHARMACIST`, `PHARMACY_STORE`. Expected type must be present and may be null for an unassigned account. Reasons are trimmed and must contain 1–1000 characters. Administrator-role targets, including facility administrators, and self-reclassification are forbidden. Unknown payload properties are rejected by the existing global validation pipe.

The user row is locked and re-read in a transaction. A stale expected type returns 409 without saving contacts. A real change sets `active=false`, `verification_status=MANUAL_REVIEW`, clears current licence references, revokes refresh sessions, and writes `USER_ACCOUNT_TYPE_CHANGED` in the same transaction. Historical applications are retained; any current licence not already represented there is also recorded in the audit description. The audit includes actor, target, old/new type, reason, timestamp and resulting verification state.

Derived professional roles change to ONCOLOGIST for DOCTOR and PHARMACIST for the pharmacy types, matching registration. Independently assigned roles/grants remain subject to normal active, verified membership checks. Existing access tokens fail database-backed authentication while the account is inactive; tokens carrying a previous professional type also fail after approval. Refresh responses recompute permissions and navigation from the current database state.

Success uses `{success,message,data}`, including saved `data.account_type`, `verification_status`, `active`, safe contacts and role. No password hashes, blind indexes, tokens or nested facility entity are returned. Directory responses expose nullable `account_type`. Validation/authentication/authorization, missing user and concurrency errors use the standard envelope with HTTP 400/401/403/404/409 respectively.

## New evidence after a change

`POST /api/me/verification/resubmit` takes credentials rather than requiring a bearer token. Inactive accounts cannot obtain a workspace session.

```json
{
  "email": "ada@example.test",
  "password": "the user's current password",
  "registry": "PCN",
  "license_number": "NEW12345"
}
```

The route verifies credentials and permits only inactive MANUAL_REVIEW accounts awaiting new evidence. It accepts MDCN for doctors, PCN for pharmacists, and PCN_PREMISES for pharmacy stores. It creates a fresh review application and audit entry, keeping the account inactive. Five attempts per minute per IP are allowed per backend process (HTTP 429 thereafter). Multi-instance deployments should apply an equivalent shared gateway limit. No provider verification is fabricated.

Existing admin review routes recheck/decide only the latest application whose licence and registry match the user's current profession. Review locks the user row, preventing approval from racing a type change. Re-reviewing a member of an already active facility does not change that facility's status. Approval restores access only under the existing facility/membership conditions.

## Deployment and verification

No schema migration or new permission seed is needed per the supplied backend handoff. Existing `users`, `user_sessions`, `verification_applications`, `audit_logs` and role-permission tables must already be installed. No business email was added.

Backend validation reported by the supplied contract: `npm.cmd test -- --runInBand`, `npm.cmd run build`. This frontend task does not re-run or claim those backend checks.

Frontend validation: `npx.cmd tsc --noEmit` passed; 27 targeted tests in `tests/admin-session.test.cjs` and `tests/user-account-type.test.cjs` passed. Biome error checks passed for the changed form, gate, helper, services, route and Next configuration; existing `any` warnings remain in older code. Tests cover authorization and target restrictions, audit reason validation, expected-type preservation, returned-type confirmation, profession/registry mapping, exact public credential payloads, session isolation, and failed/throttled resubmission requests. A production build was not run because Next loads `.env` files prohibited by this workspace's secret-handling rule. Authenticated end-to-end saving, credential validation, review approval and deployed response headers still require verification against the running backend.
