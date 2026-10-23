# Admin metrics and prescription review

Frontend implemented: admin overview shows loading/error states and explanatory unavailable metrics; Admin > Orders & payments > Prescription review has a dedicated queue, saved-record review modal, decision reason, explicit approval/rejection, conflict handling and permission-gated writes. Generic record modals now render readable fields rather than raw JSON. Existing backend source was inspected; deployed endpoints and real authorization decisions were not exercised.

## Why the metric cards are missing values

The current sibling backend's `src/dashboard/dashboard.service.ts` returns `nodes` and `nearExpiry`, omits `activeUsers` and `totalInventoryItems`, and explicitly returns `valueRecoveredNaira: null`. A missing aggregate must not be replaced with zero, a vial quantity or the size of a paginated list. An actual zero remains zero. Summary HTTP errors are shown independently from a successful response that lacks some metrics.

Extend existing authenticated `GET /api/dashboard/summary` for network admins; preserve all current fields and scope enforcement:

```ts
data: {
  asOf: string;
  scope: { type: "network" }; // Keep the existing authenticated scope shape
  nodes: number;             // Existing facility count
  activeUsers: number | null;
  totalInventoryItems: number | null;
  nearExpiry: number | null; // Existing reviewed 60-day stock calculation
  valueRecoveredNaira: number | null;
  // Preserve all other existing summary fields.
}
```

`activeUsers` must count enabled, non-deleted accounts within the authorized scope; this is an active-account count, not concurrent visitors. `totalInventoryItems` counts non-deleted inventory records/batches in scope, not summed quantities, vials or distinct medicines. `nearExpiry` retains the existing available-stock logic and returns null if required stock/expiry data are unknown. Financial recovery needs an agreed valuation based on persisted completed redistribution records, with its currency, valuation basis and duplicate/reversal handling defined. Keep it null until that calculation exists. Never invent recovery amounts or treat checkout revenue as recovery value. Compute counts consistently in the authorized scope and do not convert query errors into empty counts.

## New protected admin endpoints

All responses use `{success,message,data}`. Require a bearer JWT, network-admin access and existing MFA checks. Listing/details require `prescription.read`; decisions additionally require `prescription.review`. Facility-admin permission keys must not grant network scope. No permissions are auto-granted by the frontend.

| Method | Endpoint | Response data |
| --- | --- | --- |
| GET | `/admin/api/prescriptions?page=1&limit=20&authStatus=Pending&q=...` | `{items: ReviewPrescription[], pagination:{page,limit,total,totalPages}}` |
| GET | `/admin/api/prescriptions/:id` | `PrescriptionReviewDetail` |
| POST | `/admin/api/prescriptions/:id/decision` | Complete updated `PrescriptionReviewDetail` |

List filters: `authStatus` is `Pending`, `Approved` or `Rejected`; omitted means all. Search `q` matches pseudonymous patient reference, medicine, pharmacy or prescriber display name. Default page 1, limit 20, maximum 100; reject invalid filters. Filter and count after authorization, order newest `created_at` first with stable ID tie breaker. Return empty results as success with total/totalPages 0.

```ts
type ReviewPrescription = {
  id: string;
  patient_ref: string; // Saved pseudonymous reference; never generate a patient name
  description: string | null; // Optional, trimmed, maximum 2,000 characters; preserve line breaks
  icd10: string;
  tnm_stage: string | null;
  insurer: string;     // Saved insurer/payment choice
  qty: number;
  auth_status: string;
  order_stage: string;
  pharmacy: {
    id: string; name: string; city: string | null;
    state: string | null; status: string;
  } | null;
  pharmacy_name: string | null;
  medicine: { id: string; name: string; strength: string | null } | null;
  prescriber: { id: string; name: string } | null;
  created_at: string;
};
type PrescriptionReviewDetail = ReviewPrescription & {
  version: number;
  allowedDecisions: ("APPROVE" | "REJECT")[];
  events: {
    id: string; type: string; message: string;
    createdAt: string; actorName: string | null;
  }[]; // Oldest first, append-only
};
```

Render insurer from `insurer`, pharmacy from `pharmacy.name` or `pharmacy_name`, and patient reference from `patient_ref`. Preserve the selected pharmacy. Do not expose unrelated clinical records, provider secrets, patient names/contact details, raw JWTs or configuration secrets.

Prescription creation accepts optional `description` in POST `/api/prescriptions`. Creation, list and review responses return the saved `description` as string or null. The prescribing doctor can edit it only while `auth_status` is Pending and `order_stage` is Waiting, via PATCH `/api/prescriptions/:id` with `{description}`. Validate authorization and current status transactionally, trim outer whitespace, enforce the 2,000-character limit and increment the same review `version` when the saved description changes. Blank descriptions may be cleared to null. Preserve the other prescription fields. The frontend renders null as “No description provided” and shows a character counter in creation/edit forms. It re-fetches the open review immediately before a decision and blocks submission when the version or available decision changed; server-side expectedVersion validation still protects the remaining race.

Decision request:

```json
{
  "decision": "APPROVE",
  "expectedVersion": 1,
  "reason": "Reason for the recorded authorization decision"
}
```

`decision` is APPROVE or REJECT, `expectedVersion` is a positive integer, and `reason` is required, trimmed, 1–1000 characters. Reject unknown write fields and client-written identities, timestamps or financial states. Return available decisions only after checking reviewer permission and current prescription eligibility; read-only admins, finalized/dispensed/cancelled/ineligible records return `allowedDecisions: []`.

Under a row lock/transaction, revalidate authorization, `expectedVersion` and pending status, and validate the current prescriber/medicine/selected pharmacy eligibility. APPROVE sets `auth_status: "Approved"`; REJECT sets `auth_status: "Rejected"`. Preserve `order_stage` (initially Waiting), the submitted patient reference, selected pharmacy, clinical details and saved insurer. Increment version and atomically append prescription and audit events with reviewer, decision, reason and server timestamp. If the existing checkout uses legacy Cleared for approvals, normalize legacy stored statuses into Approved in these new admin responses and update eligibility checks to support the canonical approved state.

An admin authorization decision does not itself establish external insurer coverage, mark a payment paid, initialize checkout, create a marketplace purchase, dispense stock or send clinical data by email. If insurer confirmation is required, make that a documented backend eligibility condition before offering APPROVE. Protect existing generic PATCH `/api/prescriptions/:id` against bypassing this authorization workflow; do not allow ordinary callers to self-approve or overwrite protected fields.

Return 409 for stale/already-reviewed/ineligible decisions (without repeating events or effects), 400/422 for invalid input, 401 unauthenticated, 403 insufficient privileges and 404 inaccessible/missing prescriptions. The UI reloads on 409 and requires another deliberate review. Provider and server failures must return failure responses rather than simulated approval.

## Verification required on backend

- Missing metrics stay null/unavailable; genuine zeros and currency values are preserved.
- Network/facility access, MFA and explicit review permission are checked server-side.
- Two reviewers racing the same version produce one decision and one 409; transaction rollback cannot leave status without audit/history.
- The selected pharmacy, insurer, patient reference and dispensing stage remain unchanged by review.
- Repeated approval/rejection cannot create purchases, charges, stock deductions or duplicate events.
- Doctor creation still starts Pending/Waiting; prescribers see their own records alongside facility dispensing records after review.
