# Business values and missing data

Update: managed choice APIs have now been specified and wired. See [API_GAPS_BACKEND_CONTRACT.md](API_GAPS_BACKEND_CONTRACT.md) for the authoritative `/api/form-options` integration. The text-input approach described below was the earlier handoff; insurer, category, currency and report-format controls now load managed options from that API and display an error when it is unavailable.

The frontend no longer supplies a fixed insurer list, medicine category list or currency default. Insurer/payment method, listing category, category search and currency settings accept explicit user input. Existing API field names are unchanged. Validate supported values on the backend and return actionable errors. If managed dropdowns are required, expose authorized lookup metadata before introducing frontend options; no lookup endpoint has been invented.

Missing counts, quantities, account types, actors, facility types and workflow statuses display as unavailable/not provided instead of fabricated zeros or states. A real API zero remains zero. Facility status changes still use the existing supported statuses; the presentation-only `UNKNOWN` value cannot be saved. Prescription medicines/pharmacies and transfer batches/recipients continue to use live APIs. A pharmacy with no recorded activity status is not presumed active.

Cold-chain live readings need a valid recorded timestamp. The frontend does not substitute receipt time for missing measurement time. Provide an explicit `NOMINAL`, `BREACH` or `OFFLINE` reading state, or configured `targetMin`/`targetMax` (also accepting the snake-case names) for classification. Missing/invalid limits produce `UNKNOWN`, never an assumed 2–8°C policy or nominal state. Existing authorization rules and supported account, facility, stock-unit and workflow enums remain intact.

Legacy landing components no longer show fabricated percentages or improvement claims, and the public statistics component renders only recorded values with labels matching those metrics. Illustrative network artwork uses generic facility labels. Real deployment statistics, geographic scope and time windows require backend evidence.

Acceptance: check absent/null fields against recorded zero values, medicine categories outside the old fixed list, blank/new currency preferences, unknown account/facility statuses, missing or non-default storage limits and missing measurement timestamps. Verify form validation and backend rejection messages with actual sessions.
