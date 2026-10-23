# Shipment monitoring screen

Buyer/facility navigation: Dashboard > Shipment monitoring, also linked from Orders > Shipment temperatures. Admin navigation: Network & monitoring > Shipment monitoring.

This screen uses the existing backend shipment contract for marketplace purchases and redistribution courier assignments. It displays persisted monitor summaries, latest actual sample and its timestamp, explicit pending/stale/ended status, reviewed thresholds, courier/sensor details, independently paginated reading history and excursion events. Storage-unit cold-chain monitoring is separate.

## Integrated requests

- GET `/api/shipments?page=1&limit=20`
- GET `/api/shipments/:id/temperature`
- GET `/api/shipments/:id/temperature/history?page=1&limit=20`
- GET `/api/shipments/:id/temperature/events?page=1&limit=20`
- POST `/admin/api/shipments/:id/temperature/sync` with `{}` for permitted network operators.

Buyer and facility requests explicitly disable admin-session fallback. The admin screen uses the admin token even though read endpoints share `/api/shipments`. Visibility requires explicit `admin.access` and `coldchain.read`; synchronization additionally requires `coldchain.manage`. Backend authorization and existing MFA guards remain authoritative. No permission grants are added.

Polling uses the returned `pollAfterSeconds` (30 seconds when not yet available), refreshes on focus, and skips hidden-page polling. Provider-pending HTTP 503 is shown as unavailable synchronization, never a successful update. No temperature or range is invented. Empty monitoring lists mean monitoring is not configured for any visible shipment, and empty sample/event lists are displayed without a simulated chart or suitability claim. Earlier excursions stay visible when the latest sample is in range.

Configuration creation/correction remains with the existing backend operator APIs. This screen does not expose raw source-ID forms, create sensors, grant operator permissions, dispatch/deliver shipments, or make clinical release decisions. A later configuration form needs API-backed eligible order, courier and courier-assignment pickers.

Frontend routes/types were checked against `src/shipments/shipments.controller.ts` and `shipments.service.ts` in the sibling backend checkout. This confirms source alignment only; deployed endpoints, authenticated network access and physical sensor connectivity require deployment verification. The supplied backend notes say the production provider adapter remains pending.
