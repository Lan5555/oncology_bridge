# Redistribution request selection

Update: [API_GAPS_BACKEND_CONTRACT.md](API_GAPS_BACKEND_CONTRACT.md) now defines the dispatch/delivery endpoints, canonical `DELIVERED` completed-list filter and required `allowedActions` response field. Those controls are wired in the frontend; their backend deployment remains unverified.

The new-transfer dialog uses named medicine batches and recipient facilities. Users do not type internal IDs. IDs remain the values sent to the existing transfer endpoint.

- `GET /api/inventory?page=1&limit=100`: return facility-scoped inventory with stable IDs, medicine names, batch numbers, available quantities, units and expiry dates. The dialog supports loading further pages and excludes explicitly unavailable/deleted medicines, nonpositive stock, expired batches and quarantined/disposed stock using the existing inventory presentation filter. The backend remains authoritative for transfer eligibility.
- `GET /api/transfers/suggest?inventoryItemId=<id>`: return recipient suggestions for the selected stock batch. Supported arrays are a direct response array or `recipients`, `suggestions`, `facilities`, `items` or `data`. Each entry needs `{id, name, city?, distanceKm?}`, or `{facility: {id, name, city?}, distanceKm?}`. A direct entry can also supply `facilityId` in place of `id`. Never return unauthorized facilities or the donor itself. Apply the backend's eligibility policy; the frontend does not assume a radius or substitute the general network directory. An empty array means no suggestions, while missing/invalid recipient details display an error.
- `POST /api/transfers`: payload remains `{inventoryItemId, recipientFacilityId, quantity}`. Recheck ownership, caller permissions, recipient eligibility, current available stock, unit consistency, expiry and medicine state atomically. The UI limits whole quantities to displayed stock, but that snapshot may change before submission.

Suggestion failures display a retry action and block submission. Changing the batch clears the recipient selection and fetches new suggestions. Successful creation closes the form and triggers the existing transfer-list refresh. Backend delivery/completion status remains authoritative; approval is not a delivery confirmation.

Deployment acceptance: select named batches from real stock, check pagination, recipient suggestions, changed-batch/stale-response handling, empty and denied responses, stock quantity validation and successful request/approval refresh with actual facility credentials.
