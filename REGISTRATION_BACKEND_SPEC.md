# Facility and user registration backend contract

This note describes the registration flow implemented by the frontend in `src/app/components/AuthPages.tsx`, together with the existing API contract in `BACKEND_README.md`. It is intended to be copied into the backend implementation plan or used as its endpoint acceptance contract.

## What the user is registering

Registration on `/register` creates a **facility account** and its initial **primary user/admin** in one operation. The selected account type classifies the professional or premises licence and determines the initial application-level access set. It is not itself an RBAC role ID.

Supported account types and registries:

| `account_type` | Meaning | Required registry | Licence subject |
|---|---|---|---|
| `DOCTOR` | A clinician registering with a facility | `MDCN` | Primary user; registry comparison includes their last name |
| `PHARMACIST` | A pharmacist registering with a facility | `PCN` | Primary user; registry comparison includes their last name |
| `PHARMACY_STORE` | A pharmacy premises/store registering with a facility | `PCN_PREMISES` | Facility premises; no user last name is sent to registry verification |

The facility type is a separate field and must be one of `HOSPITAL`, `CANCER_CENTER`, `CLINIC`, or `PHARMACY`. The UI defaults it to `PHARMACY` for `PHARMACY_STORE`, but lets the registrant choose any listed type. The backend should validate the relationship between account type and facility type; if product policy requires `PHARMACY_STORE` to mean `PHARMACY`, enforce that explicitly and align the UI.

The initial user is the first facility administrator. Give that user the facility-scoped `facility.users.manage` capability so they can invite team members and review join requests after activation. Keep their clinical/pharmacy RBAC role separate; this does not make them a network administrator (Role `ADMIN`/`SUPERADMIN`). A pharmacy store sees the label “Primary Administrator”; doctor and pharmacist accounts see “Your Details”. Do not allow a public registration request to select or assign a network-admin role.

## Joining an existing facility

Step 2 offers two separate paths: create a new facility (the existing `/hospital/api/register-facility` flow) or request to join an existing facility. Existing-facility search uses:

`GET /hospital/api/public-facilities?status=ACTIVE&q=<optional>&page=1&limit=50`

Return only active, non-deleted facilities open to new membership, with a safe public summary: `id`, `name`, `facility_type`, `hospital_code`, `city`, and `state`. Search/paginate on the server. Never expose pending facilities or private contacts in this public endpoint.

The join path submits:

`POST /hospital/api/register-user-to-facility`

```json
{
  "account_type": "DOCTOR",
  "facility_id": "facility-uuid",
  "license": {
    "number": "MDCN/R/48211",
    "registry": "MDCN",
    "verification_status": "MANUAL_REVIEW",
    "registry_result": "UNAVAILABLE"
  },
  "user": {
    "first_name": "Ada",
    "last_name": "Okafor",
    "email": "ada@example.org",
    "phone": "+234...",
    "password": "user-entered-secret",
    "device_id": "browser-generated-uuid"
  }
}
```

The backend must verify that the selected facility is still active, validate the account-type/registry pairing, ignore the client verification fields, recheck the licence, and create a facility-membership request plus verification application atomically. Do not create a new facility or grant the applicant facility-admin/network-admin permissions. The request stays pending until the facility admin approves membership. Membership approval alone must not mark a licence verified or unlock professional tools. Once membership is approved, activate the account only if the selected facility is still active, licence status is `VERIFIED`, and account setup is complete; otherwise leave it inactive and return the unmet gate so login/UI can explain the state. Use `FACILITY_MEMBERSHIP_PENDING` (or a similarly distinct code) at login while membership is pending; do not describe it as a password failure. Rejection keeps the user inactive and returns a safe reason.

## Existing frontend request flow

1. The browser collects account type, licence number, facility details, administrator identity/contact details, password, and a browser-generated persistent `device_id` (`web_device_id` in local storage).
2. Before registration, the browser calls `POST /api/verify-license` with `{ licenseNumber, registry, lastName? }`. For doctors and pharmacists `lastName` is sent; for pharmacy premises it is omitted. Verification failures/unavailable registries are converted to `MANUAL_REVIEW` / `UNAVAILABLE` by the frontend.
3. The browser then calls public `POST /hospital/api/register-facility` with the JSON body below. The frontend currently includes the preliminary verification status and result in the body, but the backend **must not trust these client supplied values**.
4. On success the UI reads `data.facility` and `data.admin`, stores the facility response in app state, and sends the user to the login screen. The registration response has **no token**. Registration is submitted for review; the admin is created inactive with `MANUAL_REVIEW`, so the UI must not establish a signed-in session.

## Request schema

```json
{
  "account_type": "DOCTOR",
  "license": {
    "number": "MDCN/R/48211",
    "registry": "MDCN",
    "verification_status": "MANUAL_REVIEW",
    "registry_result": "MATCH"
  },
  "facility": {
    "name": "Example Oncology Centre",
    "facility_type": "CANCER_CENTER",
    "email": "records@example.org",
    "phone": "+234...",
    "address": "Lagos, Lagos State",
    "city": "Lagos",
    "state": "Lagos State"
  },
  "admin": {
    "first_name": "Ada",
    "last_name": "Okafor",
    "email": "ada@example.org",
    "phone": "+234...",
    "password": "user-entered-secret",
    "device_id": "browser-generated-uuid"
  }
}
```

All values shown are examples. `account_type` and registry must be checked against server-owned enums and their mapping. Reject mismatched account type/registry pairs. The frontend validates the licence with `^[A-Za-z0-9/\\-]{4,24}$`; repeat validation on the server. Normalize email and licence values consistently before uniqueness checks. Require non-empty facility name/type/contact/address/location, and administrator first/last name, email, phone, password, and device ID. Password confirmation is only a UI check and is not sent. `verification_status` and `registry_result` are included for compatibility only: accept them in the request shape, ignore their values, and create the admin with authoritative `MANUAL_REVIEW` status.

### Current frontend payload details to account for

- For `PHARMACY_STORE`, `facility.email` is the separately collected official facility email and `facility.address` is the street address.
- For `DOCTOR` and `PHARMACIST`, the UI currently sends the administrator's `workEmail` as `facility.email`, and synthesizes `facility.address` as `"{city}, {state}"`. There is no street-address or separate official-facility-email field in those branches.
- `admin.email` is always the administrator's `workEmail`.
- The licence-document selector is currently UI-only; the page explicitly says the file is not uploaded or stored. Do not expect a multipart file in this endpoint.
- The payload has no invitation role, facility ID, hospital code, latitude/longitude, or requested verification override.

## Server-side registration behavior

Implement registration as a public, rate-limited endpoint with strict input validation and a single database transaction:

1. Validate request shape, supported `account_type`, registry mapping, facility type, normalized emails, field lengths, phone format as appropriate, licence syntax, password policy, and device ID. Reject unknown properties if the API uses a strict schema.
2. Do not use the browser's `verification_status` or `registry_result` to make an authorization decision. Registration creates the admin with `verification_status=MANUAL_REVIEW` regardless of those compatibility values. Preserve verification evidence/application data as the backend's review workflow requires; never grant verified privileges directly from this public request.
3. Check for duplicate normalized admin email and licence number before or within the transaction. Return `409 Conflict` with a safe, actionable error and do not reveal unrelated account details.
4. Resolve the initial user's RBAC role on the server from trusted business policy. Do not derive an elevated role from the submitted `account_type`, `facility_type`, or any client role field. Keep `account_type` (professional/premises category) distinct from `role` (authorization/permissions). Use least privilege and grant Role C only through a separate authorized admin workflow.
5. Create the facility with `status = PENDING`; generate its unique `hospital_code` server-side. Create the user linked to the facility with `active=false` and `verification_status=MANUAL_REVIEW`; store an Argon2id (preferred) or bcrypt password hash only, persist the selected `device_id` according to device-registration policy, and create a `verification_applications` record linked to that user.
6. Commit all records atomically. On any failure, roll back facility, user, licence, verification application, and audit writes together.
7. Append an audit event such as `FACILITY_ONBOARDED` and a verification submission event with actor/system attribution, without passwords, tokens, or unnecessary personal/licence data in logs. Ensure retries cannot create duplicate facility/user/license records.
8. Return a stable API envelope and never return `password`, `password_hash`, secrets, or internal registry credentials.

Suggested persistence mapping from the current schema:

- `facilities`: facility details, `facility_type`, `status=PENDING`, server-generated `hospital_code`.
- `users`: `facility_id`, names, normalized email, phone, `password_hash`, `device_id`, `account_type`, `license_number`, `license_registry`, authoritative `verification_status` and `registry_result`, server-selected `role_id`, and activation timestamps/state.
- `verification_applications`: `user_id`, registry, licence number, authoritative result/status, submission timestamp; review fields remain empty until a reviewer acts.
- `audit_logs`: immutable registration and verification-submission events.

Enforce verification and facility status in backend authorization middleware, not only in UI navigation. Per the frontend access policy, a user with a non-`VERIFIED` licence should be limited to dashboard/settings while review is pending; a pending/suspended/rejected facility should also be barred from operational workflows. Every protected route must check the authenticated user, facility membership/status, role permission, and (where applicable) licence status.

## Response contract

The current frontend consumes `data.facility` and `data.admin` from the normal service response envelope. Recommended response:

```json
{
  "success": true,
  "message": "Registration received. Your licence is being reviewed.",
  "data": {
    "facility": {
      "id": "facility-uuid",
      "name": "Example Oncology Centre",
      "facility_type": "CANCER_CENTER",
      "hospital_code": "LG-EXAMPLE-001",
      "email": "ada@example.org",
      "phone": "+234...",
      "address": "Lagos, Lagos State",
      "city": "Lagos",
      "state": "Lagos State",
      "status": "PENDING"
    },
    "admin": {
      "id": "user-uuid",
      "role": { "id": "role-id", "name": "..." },
      "account_type": "DOCTOR",
      "license_number": "MDCN/R/48211",
    "verification_status": "MANUAL_REVIEW",
      "first_name": "Ada",
      "last_name": "Okafor",
      "email": "ada@example.org",
      "phone": "+234...",
      "active": false
    }
  }
}
```

Do not return a token from registration. The frontend displays a submission status screen and offers a link back to login. If the user tries to log in before approval, return a distinct pending response (`FACILITY_REVIEW_PENDING`, `FACILITY_MEMBERSHIP_PENDING`, or `LICENSE_REVIEW_PENDING`, with an HTTP status such as `403`) and a clear message describing the outstanding review. The frontend displays that message and does not create or store a session. Do not report the pending state as an incorrect password.

Use `400` for invalid input, `409` for duplicate email/licence, `429` for rate limits, and a generic `5xx` for unexpected failures. Keep response messages safe and avoid indicating whether an arbitrary email is already registered beyond the documented conflict behavior.

## Required follow-up contract decisions

1. **Verification compatibility fields:** The frontend still performs a preliminary verification call and sends its result because the register endpoint currently requires both fields for compatibility. The register endpoint ignores both submitted values and leaves the admin at `MANUAL_REVIEW` pending the backend review process.
2. **Facility approval:** After new-facility registration, the facility remains `PENDING`, and the initial admin is inactive with `MANUAL_REVIEW`. Joining an existing facility creates a separate pending membership request and licence application; neither decision alone grants operational access. Login must return a distinct pending-review code/message and must not grant a session just because credentials are correct.
3. **Role model:** The README seeds broad roles A/B/C (submitting pharmacist, requesting pharmacist, network admin), but public signup has doctor, pharmacist, and pharmacy-store account types. Define least-privilege role/permission assignments for each account type separately; never equate account type with the privileged network-admin role.
4. **Facility contact consistency:** For clinical registrations, the current UI uses the user's email as the facility email and city/state as the facility address. If the backend requires distinct official facility contact/address fields, update the UI contract or make those fields optional with a clear data-quality policy.
5. **Facility versus professional licence scope:** Doctor/pharmacist licences identify the person while `PHARMACY_STORE` identifies premises. Persist which subject the credential belongs to (or infer safely from account type) so uniqueness, review, expiry, and re-verification rules are correct.

## Acceptance checks

- A valid submission creates exactly one pending facility, one linked inactive admin with `MANUAL_REVIEW`, one licence verification application, and audit evidence in one transaction.
- Invalid/mismatched account type and registry combinations are rejected.
- Client-supplied verification fields are accepted for compatibility but ignored; the new admin remains at `MANUAL_REVIEW`.
- Duplicate email or licence produces `409` without partial records.
- Passwords are hashed, and no password/hash/token secret is returned or logged.
- Public registration cannot assign network-admin permissions.
- Pending licence/facility states cannot access operational APIs, even if the UI is bypassed.
- The success envelope contains `data.facility` and `data.admin`, has no token, and matches the current frontend parser.
- A pending login response has a distinct code/message; the frontend shows it without creating a session.
- Duplicate email/licence returns `409`; registration throttling returns `429`; the frontend presents specific messages for both.
- The public facility search returns only active facilities accepting membership and contains no private facility data.
- Joining an existing facility creates no new facility and grants no membership, facility-admin, network-admin, or professional access before the required approvals.
- Facility membership approval and licence verification remain independent gates.
