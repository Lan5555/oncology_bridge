# Link inventory batches to catalogue medicines

Medicine Catalog uses its standard form and record list; its Graph view option has been removed. Inventory retains an optional Graph view alongside the original intake form and stock list. Inventory graphs connect a live catalog medicine, Text batch number and Expiry date into Batch details; that record, a Number quantity and Selling unit feed Stock quantity, then Review inventory intake. All required processing inputs need wires. Math and boolean nodes are available, with an optional final condition that must be true when connected.

Inventory graphs require a final preview and explicit Confirm and save. Preview/cancel performs no write, confirmation revalidates the graph against the reviewed payload and current medicine/facility context, and duplicate confirmation is guarded. Stock intake uses the existing `POST /api/inventory` payload below. The graph adds no endpoints. Inventory save requires `inventory.manage`, a current facility ID, a live catalog choice, valid expiry today or later, positive whole quantity and an explicit supported unit. Backend authorization and atomic validation remain required. Success refreshes the page's list and clears source values while keeping nodes/wires; failure retains the modal and draft. Switching views keeps the draft until leaving the page.

Please update manual inventory intake to link each batch to an existing medicine by ID. The frontend now uses a medicine dropdown instead of a free-text drug name and sends:

```http
POST /api/inventory
Authorization: Bearer <facility-user-token>
Content-Type: application/json
```

```json
{
  "medicineId": "<selected medicine ID>",
  "batchNumber": "TEST-BATCH-001",
  "expiry": "2027-12-31",
  "quantity": 10,
  "unit": "vial",
  "facilityId": "<current facility ID>"
}
```

- Accept `medicineId` in the request DTO and persist it as the inventory record's medicine/drug foreign key. Do not match by typed name or create a new medicine during stock intake. The frontend no longer sends `drug`.
- Require `inventory.manage`. Derive the owning facility from the authenticated user and approved membership. If `facilityId` is supplied, reject it when it differs from that scope. Do not trust the client to choose another facility.
- Validate that the medicine exists, is active, and is available to this user under the catalogue's visibility policy. Enforce this independently of what appears in the dropdown. Reject unknown or inaccessible IDs with a clear error. Do not imply that selection grants permission to edit the shared medicine.
- Validate the batch number, expiration date, and positive integer quantity. Return validation failures in the standard error envelope. Define duplicate-batch handling explicitly to avoid accidentally double-counting stock.
- Accept and persist `unit` as the inventory selling unit (`vial`, `pack`, `bottle`, or `box`). Quantity is counted in that unit. Return the reviewed unit as `unit` in inventory responses; the UI also reads `sellingUnit` or `selling_unit` for compatibility. Apply any required review before allowing sale. Marketplace creation now takes its `unit` directly from the selected batch and prevents editing it. The server must compare it against the reviewed inventory unit and reject mismatches. Older batches without a unit must be corrected/reviewed explicitly; do not silently default them to vials or convert quantities. Deploy DTO/storage/response support for `unit` alongside this UI update.
- `GET /api/medicines?page=1&limit=100` should return selectable medicine records with `id`, `generic_name`, `brand_name`, `strength`, `dosage_form`, and `gtin`. Apply the catalogue's access policy server-side. Use `{success:true,data:{items:[...],total,page,limit}}`; return the actual limit if the requested limit is capped. The UI supports loading additional pages when total metadata is present.
- Return the linked medicine in inventory creation/list responses, for example `medicine: {id,generic_name,brand_name,gtin}`, alongside the existing batch fields. Populate `drug` from the medicine's generic name for compatibility and return `gtin` from the linked medicine where appropriate. Keep the existing inventory list envelope and field names (`lot`/`batchNumber`, `qty`/`quantity`, ISO `expiry`, and facility details).
- Audit creation with the actor, facility, medicine, and batch IDs. Preserve existing history and handle older unlinked inventory records explicitly; do not guess ambiguous links from names.

Acceptance: create a catalogue medicine, select it in inventory, add a batch, and confirm the saved foreign key points to that exact medicine. Test medicines with identical generic names but different brands/strengths, missing/deleted/inaccessible IDs, missing permission, cross-facility requests, pagination, and persistence after refresh.

Deployment dependency: the UI now submits `medicineId`; deploy this backend change before testing the new intake flow. Do not fall back silently to name-only linkage if the backend rejects it.

## Approved medicine storage in listing responses

Include `medicine.storage_temperature` in inventory responses with the exact approved storage requirement text from the linked medicine. The marketplace listing modal now fills `storage` from that field automatically, makes it read-only, and submits the text unchanged. It also accepts the response alias `medicine.storageTemperature`. Missing/blank requirements block submission with an actionable message; do not substitute an actual sensor temperature, a generic default, or free-text inventory notes. Continue validating marketplace `storage` against the approved medicine record server-side.

## Editing inventory batches

The Inventory table now exposes an Edit action to users with `inventory.manage`. It submits `PATCH /api/inventory/:id` with `{batchNumber, expiry, quantity, unit}`. Support these mutable fields, validate a non-empty batch number, an ISO date, a nonnegative integer quantity (zero means no stock), and the supported selling unit. The frontend does not submit medicine identity, facility ownership, verification, status, audit fields, or temperature readings through this editor. Reject those fields if supplied by another client. Derive facility scope from the authenticated principal and enforce `inventory.manage` on every update.

Validate quantity against existing reservations/orders and enforce review and selling-unit consistency for linked marketplace listings. Reject incompatible changes with an actionable message, or reconcile affected listings atomically under the backend's policy. Never silently reinterpret ten boxes as ten vials. Audit old/new values and return the updated batch in the standard envelope; the UI refreshes inventory on success and preserves form values on failure. Historical records and product scan identifiers must retain their traceability.

## Medicine deletion and linked inventory

Deleting a medicine currently leaves its batches visible in inventory. Fix this in the backend transaction for `DELETE /api/medicines/:id`:

- Soft-delete the medicine and exclude its linked batches from normal active inventory responses and active-stock statistics. Preserve inventory and transaction history; do not destroy traceability or describe medicine deletion as physical stock disposal.
- Withdraw or suspend linked marketplace listings. Exclude them from buyer catalogue queries and reject new listings, checkout/reservations, intake, and transfers involving the deleted medicine. Independently recheck eligibility on mutation endpoints.
- If retained inventory rows are returned by an authorized historical endpoint, include `medicine: {id,deleted_at,active:false}` or explicit `medicine_deleted:true`. The frontend can filter explicit inactive/deleted flags; it cannot determine that a medicine was deleted when the response returns an apparently active batch with only a name.
- Keep active-list totals, pagination, and dashboard statistics consistent with the deletion policy. Audit the actor, medicine ID, and affected batch/listing IDs atomically. Define how any in-progress orders or reservations are handled before committing deletion.
- Verify that deletion is authorized for the medicine itself; a catalogue deletion must not grant a facility permission to mutate another facility's stock directly. Apply linked-state changes through the backend's catalogue policy.

Acceptance: create a medicine, add linked stock and a listing, delete the medicine, then refresh Inventory and Marketplace in a second browser session. It must disappear from active stock and purchase options, while authorized historical records remain readable. The frontend now refreshes on successful catalogue deletion and excludes explicit deleted/inactive medicine references; backend filtering remains necessary across sessions and APIs.
