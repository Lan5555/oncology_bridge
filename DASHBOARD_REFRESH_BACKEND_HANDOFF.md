# Dashboard integration contract

The backend implementation update retains these paths:

- GET /api/dashboard/summary
- GET /api/dashboard/charts
- GET /api/inventory/near-expiry?limit=7

Facility requests explicitly use userSession without falling back to an admin session. Admin requests explicitly use adminSession. Facility authorization checks current account activity, active undeleted membership, verification/application state, and the persisted dashboard.read grant. Network scope requires ADMIN/SUPERADMIN, admin.access, dashboard.read, and configured MFA checks. Network near-expiry also requires inventory.read. Client-supplied facility parameters must not widen scope.

## Refresh and snapshots

The frontend refreshes after successful authenticated mutations, on focus/visibility changes, every 30 seconds while visible, and through a manual Refresh button. API failures are displayed separately from empty datasets.

The backend reports fresh repeatable-read database snapshots, no aggregate cache, and no intentional worker delay. The next request reflects committed changes. Responses retain {success,message,data}, with data.scope (facility plus facilityId, or network) and data.asOf. Separate summary/chart requests can have different timestamps; the frontend displays them separately. Near-expiry returns its own generation timestamp. Responses use Cache-Control: private, no-store. Database failures propagate as errors.

## Stock and units

Eligible stock belongs to an active undeleted facility, references an undeleted medicine, has positive quantity, has AVAILABLE/NEAR_EXPIRY status, and expires today or later. Exclude disposed, quarantined, expired, and deleted stock. Medicine deletion uses deleted_at, without a separate medicine activity flag in this schema.

- nodes: active facilities in scope, normally one for a facility dashboard.
- quantitiesByUnit: separate vial/box/pack/bottle/unknown quantities. totalVials counts only reviewed vial stock; no package conversion is inferred.
- gs1AuthenticatedVials: distinct qualifying CLEAN serial evidence linked to eligible vial stock, capped by remaining quantity. Manual intake alone does not increase it. This is not exact serial-level custody accounting.
- stockOutRiskPct: percentage of tracked medicines without eligible available stock, not a demand forecast. The UI labels it "Medicines out of stock (%)".
- nearExpiry: eligible batches expiring within 60 days; the watchlist uses the same eligibility and expiry ordering.
- therapeuticStock: {drug,unit,qty}, separated by selling unit in the frontend.
- drugSplit: {drug,unit,pct}, with percentages calculated within each unit. The frontend renders one unit at a time.
- inventoryOverTime: {label,vials,quantitiesByUnit}, with inventoryOverTimeBasis="current_available_stock_by_intake_month". The frontend labels this "Current available stock by intake month" and separates units. It shows current remaining stock by intake cohort, not historical month-end balances. Edits/removals change the corresponding cohort. Empty stock returns empty arrays.

## Delivered transfers and storage health

redistributionEfficiency returns delivered transfers as {id,label,quantity,unit,days:null}. redistributionTimingAvailable=false means delivery duration is unavailable. The frontend labels this "Completed redistributions", shows transfer quantities/units, and does not draw a delivery-speed chart or target.

chainIntegrityPct measures currently healthy registered storage units: ONLINE, recent heartbeat, and no OPEN cold-chain event. monitoredStorageUnits distinguishes zero registered units from observed failure. The UI labels this "Storage units currently healthy (%)" and shows "Not monitored" when no units are registered.

velocityPct, stockOutDeltaPct, and valueRecoveredNaira remain null when unavailable. Do not invent demand trends, recovered value, or historical balances. Payments affect stock only when they change persisted inventory. Prescription/listing creation alone does not increase stock or storage health.

## Deployment acceptance

The backend reports regression coverage in src/dashboard/dashboard.spec.ts using real JWT verification and PostgreSQL queries. Live deployment acceptance still requires applying the migration and checking baseline/mutation/refresh with actual facility and admin sessions. Confirm mixed-unit availability and percentages, box-only cohorts, nullable delivery timing, medicine deletion/disposal, scan evidence, storage-health changes, empty responses, and denied/error responses. A frontend refresh cannot repair an unapplied backend migration or incorrect deployed permissions.
