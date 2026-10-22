# Frontend API endpoint inventory

Generated with `node scripts/generate-api-inventory.cjs`. This inventories client references, not backend implementation or deployment status. See [API_GAPS_BACKEND_CONTRACT.md](API_GAPS_BACKEND_CONTRACT.md) for the newly integrated gaps and exact response schemas. No authenticated production requests were made to establish server availability.

## Service calls

| Service and method | HTTP | Endpoint expression |
| --- | --- | --- |
| admin-service/admin-resources.ts : list | GET | `url.pathname + url.search` |
| admin-service/admin-service.ts : session | GET | `Routes.ME` |
| admin-service/admin-service.ts : login | POST | `Routes.ADMIN_LOGIN` |
| admin-service/admin-service.ts : verifications | GET | `Routes.ADMIN_VERIFICATIONS(status)` |
| admin-service/admin-service.ts : decide | POST | `Routes.ADMIN_VERIFICATION_DECISION( id, status === "VERIFIED" ? "approve" : "reject", )` |
| admin-service/admin-service.ts : recheck | POST | `Routes.ADMIN_VERIFICATION_RECHECK(id)` |
| admin-service/admin-service.ts : settlements | GET | `Routes.SETTLEMENTS_SUMMARY` |
| admin-service/admin-service.ts : integrationsHealth | GET | `Routes.ADMIN_INTEGRATIONS_HEALTH` |
| admin-service/admin-service.ts : integrationConfiguration | GET | `Routes.ADMIN_INTEGRATION_CONFIG(key)` |
| admin-service/admin-service.ts : saveIntegrationConfiguration | PUT | `Routes.ADMIN_INTEGRATION_CONFIG(key)` |
| admin-service/admin-service.ts : testIntegration | POST | `Routes.ADMIN_INTEGRATION_TEST(key)` |
| admin-service/admin-service.ts : syncIntegration | POST | `Routes.ADMIN_INTEGRATION_SYNC(key)` |
| audit-service/audit-service.ts : list | GET | `Routes.AUDIT(params)` |
| audit-service/audit-service.ts : verify | GET | `Routes.AUDIT_VERIFY` |
| audit-service/audit-service.ts : exportCsv | GET | `Routes.AUDIT_EXPORT` |
| auth-service/auth-service.ts : signIn | POST | `Routes.SIGN_IN` |
| auth-service/auth-service.ts : signOut | GET | `Routes.SIGN_OUT(id)` |
| auth-service/auth-service.ts : pingServer | GET | `Routes.PING_SERVER` |
| auth-service/auth-service.ts : forgotPassword | POST | `Routes.FORGOT_PASSWORD` |
| auth-service/auth-service.ts : resetPassword | POST | `Routes.RESET_PASSWORD` |
| coldchain-service/coldchain-service.ts : storageUnits | GET | `Routes.STORAGE_UNITS` |
| coldchain-service/coldchain-service.ts : createStorageUnit | POST | `Routes.STORAGE_UNITS` |
| coldchain-service/coldchain-service.ts : updateStorageUnit | PATCH | `Routes.STORAGE_UNIT(id)` |
| coldchain-service/coldchain-service.ts : coldChainEvents | GET | `Routes.COLD_CHAIN_EVENTS(params)` |
| coldchain-service/coldchain-service.ts : history | GET | `Routes.COLDCHAIN_HISTORY(hours, unitId)` |
| dashboard-service/dashboard-service.ts : summary | GET | `Routes.DASHBOARD_SUMMARY` |
| dashboard-service/dashboard-service.ts : charts | GET | `Routes.DASHBOARD_CHARTS` |
| dashboard-service/dashboard-service.ts : publicStats | GET | `Routes.PUBLIC_STATS` |
| facility-service/facility-service.ts : registerFacility | POST | `Routes.REGISTER_FACILITY` |
| facility-service/facility-service.ts : publicFacilities | GET | `Routes.PUBLIC_FACILITIES({ q, status: "ACTIVE", limit: 50 })` |
| facility-service/facility-service.ts : registerUserToFacility | POST | `Routes.REGISTER_TO_FACILITY` |
| facility-service/facility-service.ts : findAllFacilities | GET | `Routes.FACILITIES(params)` |
| facility-service/facility-service.ts : findOneFacility | GET | `Routes.FACILITY(id)` |
| facility-service/facility-service.ts : updateOneFacility | PATCH | `Routes.UPDATE_FACILITY(id)` |
| facility-service/facility-service.ts : deleteOneFacility | DELETE | `Routes.DELETE_FACILITY(id)` |
| form-options-service/form-options-service.ts : options | GET | `Routes.FORM_OPTIONS(context)` |
| inventory-service/inventory-service.ts : list | GET | `Routes.INVENTORY(params)` |
| inventory-service/inventory-service.ts : create | POST | `Routes.INVENTORY()` |
| inventory-service/inventory-service.ts : update | PATCH | `Routes.INVENTORY_ITEM(id)` |
| inventory-service/inventory-service.ts : remove | DELETE | `Routes.INVENTORY_ITEM(id)` |
| inventory-service/inventory-service.ts : nearExpiry | GET | `Routes.INVENTORY_NEAR_EXPIRY(limit)` |
| inventory-service/inventory-service.ts : quarantine | POST | `Routes.INVENTORY_QUARANTINE(id)` |
| inventory-service/inventory-service.ts : dispose | POST | `Routes.INVENTORY_DISPOSE(id)` |
| inventory-service/inventory-service.ts : exportCsv | GET | `Routes.INVENTORY_EXPORT` |
| inventory-service/inventory-service.ts : expiry | GET | `Routes.EXPIRY(withinDays)` |
| invoice-service/invoice-service.ts : find | GET | `Routes.INVOICE(reference)` |
| invoice-service/invoice-service.ts : create | POST | `Routes.INVOICES` |
| marketplace-service/marketplace-service.ts : list | GET | ``/api/marketplace/listings?${params}`` |
| marketplace-service/marketplace-service.ts : createListing | POST | `"/api/marketplace/listings"` |
| marketplace-service/marketplace-service.ts : checkout | POST | `"/api/marketplace/checkout"` |
| medicine-service/medicine-service.ts : list | GET | ``${Routes.MEDICINES}${params ? `?${params}` : ""}`` |
| medicine-service/medicine-service.ts : findByGtin | GET | `Routes.MEDICINE_BY_GTIN(gtin)` |
| medicine-service/medicine-service.ts : create | POST | `Routes.MEDICINES` |
| medicine-service/medicine-service.ts : update | PATCH | `Routes.MEDICINE_ITEM(id)` |
| medicine-service/medicine-service.ts : remove | DELETE | `Routes.MEDICINE_ITEM(id)` |
| network-service/network-service.ts : getNetwork | GET | `Routes.NETWORK` |
| notification-service/notification-service.ts : list | GET | `Routes.NOTIFICATIONS` |
| notification-service/notification-service.ts : markRead | PATCH | `Routes.NOTIFICATION_READ(id)` |
| prescription-service/prescription-service.ts : pharmacies | GET | `Routes.PRESCRIPTION_PHARMACIES(page)` |
| prescription-service/prescription-service.ts : checkoutOptions | GET | ``${Routes.PRESCRIPTIONS("active")}&page=${page}&limit=25`` |
| prescription-service/prescription-service.ts : list | GET | `Routes.PRESCRIPTIONS(tab)` |
| prescription-service/prescription-service.ts : create | POST | `Routes.PRESCRIPTIONS()` |
| prescription-service/prescription-service.ts : update | PATCH | `Routes.PRESCRIPTION_ITEM(id)` |
| prescription-service/prescription-service.ts : searchStock | GET | `Routes.STOCK_SEARCH(q, location)` |
| report-service/report-service.ts : export | POST | `Routes.REPORT_EXPORT` |
| research-service/research-service.ts : submitInquiry | POST | `Routes.RESEARCH_INQUIRIES` |
| research-service/research-service.ts : stats | GET | `Routes.RESEARCH_STATS` |
| scan-service/scan-service.ts : decode | POST | `Routes.SCANS_DECODE` |
| scan-service/scan-service.ts : create | POST | `Routes.SCANS` |
| scan-service/scan-service.ts : batch | POST | `Routes.SCANS_BATCH` |
| scan-service/scan-service.ts : recent | GET | `Routes.SCANS_RECENT(limit)` |
| scan-service/scan-service.ts : monthly | GET | `Routes.SCANS_MONTHLY` |
| scan-service/scan-service.ts : lookup | GET | `Routes.GS1_LOOKUP(gtin)` |
| settings-service/settings-service.ts : getSettings | GET | `Routes.SETTINGS` |
| settings-service/settings-service.ts : save | PUT | `Routes.SETTINGS` |
| settings-service/settings-service.ts : me | GET | `Routes.ME` |
| settings-service/settings-service.ts : updateMe | PATCH | `Routes.ME` |
| settings-service/settings-service.ts : resubmitVerification | POST | `Routes.RESUBMIT_VERIFICATION` |
| transfer-service/transfer-service.ts : dispatch | POST | `Routes.TRANSFER_DISPATCH(id)` |
| transfer-service/transfer-service.ts : deliver | POST | `Routes.TRANSFER_DELIVER(id)` |
| transfer-service/transfer-service.ts : list | GET | `Routes.TRANSFERS(status)` |
| transfer-service/transfer-service.ts : stats | GET | `Routes.TRANSFER_STATS` |
| transfer-service/transfer-service.ts : activeOrder | GET | `Routes.TRANSFER_ACTIVE_ORDER` |
| transfer-service/transfer-service.ts : suggest | GET | `Routes.TRANSFER_SUGGEST(inventoryItemId)` |
| transfer-service/transfer-service.ts : create | POST | `Routes.TRANSFERS()` |
| transfer-service/transfer-service.ts : approve | POST | `Routes.TRANSFER_APPROVE(id)` |
| transfer-service/transfer-service.ts : reject | POST | `Routes.TRANSFER_REJECT(id)` |
| user-service/user-service.ts : roles | GET | `Routes.ROLES` |
| user-service/user-service.ts : createRole | POST | `Routes.ROLES` |
| user-service/user-service.ts : updateRole | PATCH | `Routes.ROLE_ITEM(id)` |
| user-service/user-service.ts : deleteRole | DELETE | `Routes.ROLE_ITEM(id)` |
| user-service/user-service.ts : rolePermissions | GET | ``${Routes.ROLE_ITEM(id)}/permissions`` |
| user-service/user-service.ts : updateRolePermissions | PUT | ``${Routes.ROLE_ITEM(id)}/permissions`` |
| user-service/user-service.ts : list | GET | `Routes.USERS(params)` |
| user-service/user-service.ts : createUser | POST | `Routes.USERS_CREATE` |
| user-service/user-service.ts : facilityMembershipRequests | GET | `Routes.FACILITY_MEMBERSHIP_REQUESTS(status)` |
| user-service/user-service.ts : decideFacilityMembership | POST | `Routes.FACILITY_MEMBERSHIP_DECISION(id, decision)` |
| user-service/user-service.ts : lookupFacilityMembershipLicense | POST | `Routes.FACILITY_MEMBERSHIP_LICENSE_LOOKUP(id)` |
| user-service/user-service.ts : updateUser | PATCH | `Routes.USER_UPDATE(id)` |
| user-service/user-service.ts : deleteUser | DELETE | `Routes.USER_DELETE(id)` |
| verification-service/verification-service.ts : verifyLicense | POST | `Routes.VERIFY_LICENSE` |
| verification-service/verification-service.ts : createApplication | POST | `Routes.VERIFICATION_APPLICATIONS("")` |
| verification-service/verification-service.ts : applications | GET | `Routes.VERIFICATION_APPLICATIONS(status)` |
| verification-service/verification-service.ts : decideApplication | POST | `Routes.VERIFICATION_APPLICATION_DECISION(id)` |

The cold-chain hook also uses authenticated GET `/api/coldchain/stream` with an SSE response. Admin record pages use the endpoint definitions in `src/app/services/admin-service/admin-resources.ts`; these include `/admin/api/marketplace/listings`. Shared REST session refresh sends POST `/auth/api/refresh`. All server implementations remain unverified from this frontend repository.

## Route definitions

Function arguments correspond to the calling method above. `id()` URL-encodes path IDs and `query()` omits empty query values.

| Symbol | Definition |
| --- | --- |
| `SIGN_IN` | `"/auth/api/login"` |
| `SIGN_OUT` | `(userId: string) => `/auth/api/log-out/${id(userId)}`` |
| `PING_SERVER` | `"/auth/api/ping-server"` |
| `REFRESH` | `"/auth/api/refresh"` |
| `FORGOT_PASSWORD` | `"/auth/api/forgot-password"` |
| `RESET_PASSWORD` | `"/auth/api/reset-password"` |
| `REGISTER_FACILITY` | `"/hospital/api/register-facility"` |
| `PUBLIC_FACILITIES` | `( params: Record<string, string \| number \| undefined>, ) => `/hospital/api/public-facilities${query(params)}`` |
| `REGISTER_TO_FACILITY` | `"/hospital/api/register-user-to-facility"` |
| `FACILITIES` | `(params: Record<string, string \| number \| undefined>) => `/hospital/api/find-all-facilities${query(params)}`` |
| `FACILITY` | `(facilityId: string) => `/hospital/api/find-one-facility/${id(facilityId)}`` |
| `UPDATE_FACILITY` | `(facilityId: string) => `/hospital/api/update-one-facility/${id(facilityId)}`` |
| `DELETE_FACILITY` | `(facilityId: string) => `/hospital/api/delete-one-facility/${id(facilityId)}`` |
| `VERIFY_LICENSE` | `"/api/verify-license"` |
| `ME` | `"/api/me"` |
| `RESUBMIT_VERIFICATION` | `"/api/me/verification/resubmit"` |
| `DASHBOARD_SUMMARY` | `"/api/dashboard/summary"` |
| `DASHBOARD_CHARTS` | `"/api/dashboard/charts"` |
| `PUBLIC_STATS` | `"/api/public/stats"` |
| `FORM_OPTIONS` | `(context: string) => `/api/form-options${query({ context })}`` |
| `PRESCRIPTION_PHARMACIES` | `(page = 1) => `/api/prescriptions/pharmacies${query({ page, limit: 100 })}`` |
| `REPORT_EXPORT` | `"/api/reports/export"` |
| `INVENTORY` | `(params = "") => `/api/inventory${params ? `?${params}` : ""}`` |
| `INVENTORY_ITEM` | `(itemId: string) => `/api/inventory/${id(itemId)}`` |
| `INVENTORY_QUARANTINE` | `(itemId: string) => `${Routes.INVENTORY_ITEM(itemId)}/quarantine`` |
| `INVENTORY_DISPOSE` | `(itemId: string) => `${Routes.INVENTORY_ITEM(itemId)}/dispose`` |
| `INVENTORY_EXPORT` | `"/api/inventory/export.csv"` |
| `INVENTORY_NEAR_EXPIRY` | `(limit = 7) => `/api/inventory/near-expiry${query({ limit })}`` |
| `EXPIRY` | `(withinDays = 60) => `/api/expiry${query({ withinDays })}`` |
| `SCANS` | `"/api/scans"` |
| `SCANS_DECODE` | `"/api/scans/decode"` |
| `SCANS_BATCH` | `"/api/scans/batch"` |
| `SCANS_RECENT` | `(limit = 5) => `/api/scans/recent${query({ limit })}`` |
| `SCANS_MONTHLY` | `"/api/scans/monthly"` |
| `GS1_LOOKUP` | `(gtin: string) => `/api/gs1/lookup${query({ gtin })}`` |
| `MEDICINES` | `"/api/medicines"` |
| `MEDICINE_ITEM` | `(medicineId: string) => `/api/medicines/${id(medicineId)}`` |
| `MEDICINE_BY_GTIN` | `(gtin: string) => `/api/medicines/gtin/${id(gtin)}`` |
| `STOCK_SEARCH` | `(q = "", location = "") => `/api/stock/search${query({ q, location })}`` |
| `TRANSFERS` | `(status?: string) => `/api/transfers${query({ status })}`` |
| `TRANSFER_STATS` | `"/api/transfers/stats"` |
| `TRANSFER_ACTIVE_ORDER` | `"/api/transfers/active-order"` |
| `TRANSFER_SUGGEST` | `(inventoryItemId: string) => `/api/transfers/suggest${query({ inventoryItemId })}`` |
| `TRANSFER_ITEM` | `(transferId: string) => `/api/transfers/${id(transferId)}`` |
| `TRANSFER_APPROVE` | `(transferId: string) => `${Routes.TRANSFER_ITEM(transferId)}/approve`` |
| `TRANSFER_REJECT` | `(transferId: string) => `${Routes.TRANSFER_ITEM(transferId)}/reject`` |
| `TRANSFER_DISPATCH` | `(transferId: string) => `${Routes.TRANSFER_ITEM(transferId)}/dispatch`` |
| `TRANSFER_DELIVER` | `(transferId: string) => `${Routes.TRANSFER_ITEM(transferId)}/deliver`` |
| `PRESCRIPTIONS` | `(tab?: string) => `/api/prescriptions${query({ tab })}`` |
| `PRESCRIPTION_ITEM` | `(prescriptionId: string) => `/api/prescriptions/${id(prescriptionId)}`` |
| `INVOICES` | `"/api/invoices"` |
| `INVOICE` | `(reference: string) => `/api/invoices/${id(reference)}`` |
| `STORAGE_UNITS` | `"/api/storage-units"` |
| `STORAGE_UNIT` | `(unitId: string) => `/api/storage-units/${id(unitId)}`` |
| `COLD_CHAIN_EVENTS` | `( params: { unitId?: string; status?: string; from?: string; to?: string; page?: number; limit?: number; } = {}, ) => `/api/cold-chain-events${query(params)}`` |
| `COLDCHAIN_HISTORY` | `(hours = 24, unitId?: string) => `/api/coldchain/history${query({ hours, unitId })}`` |
| `COLDCHAIN_STREAM` | `"/api/coldchain/stream"` |
| `NETWORK` | `"/api/network"` |
| `ROLES` | `"/api/roles"` |
| `ROLE_ITEM` | `(roleId: number \| string) => `/api/roles/${id(String(roleId))}`` |
| `USERS` | `(params = "") => `/api/users${params ? `?${params}` : ""}`` |
| `AUDIT` | `(params = "") => `/api/audit${params ? `?${params}` : ""}`` |
| `AUDIT_EXPORT` | `"/api/audit/export.csv"` |
| `AUDIT_VERIFY` | `"/api/audit/verify"` |
| `SETTINGS` | `"/api/settings"` |
| `NOTIFICATIONS` | `"/api/notifications"` |
| `NOTIFICATION_READ` | `(notificationId: string) => `/api/notifications/${id(notificationId)}/read`` |
| `ADMIN_LOGIN` | `Routes.SIGN_IN` |
| `ADMIN_VERIFICATIONS` | `(status = "MANUAL_REVIEW") => `/admin/api/verifications${query({ status, page: 1, limit: 50 })}`` |
| `ADMIN_VERIFICATION_DECISION` | `( verificationId: string, decision: "approve" \| "reject", ) => `/admin/api/verifications/${id(verificationId)}/${decision}`` |
| `ADMIN_VERIFICATION_RECHECK` | `(verificationId: string) => `/admin/api/verifications/${id(verificationId)}/recheck`` |
| `SETTLEMENTS_SUMMARY` | `"/api/settlements/summary"` |
| `ADMIN_INTEGRATIONS_HEALTH` | `"/admin/api/integrations/health"` |
| `ADMIN_INTEGRATION_CONFIG` | `(key: string) => `/admin/api/integrations/${id(key)}/configuration`` |
| `ADMIN_INTEGRATION_TEST` | `(key: string) => `/admin/api/integrations/${id(key)}/test`` |
| `ADMIN_INTEGRATION_SYNC` | `(key: string) => `/admin/api/integrations/${id(key)}/sync`` |
| `VERIFICATION_APPLICATIONS` | `(status = "MANUAL_REVIEW") => `/api/verification-applications${query({ status })}`` |
| `VERIFICATION_APPLICATION` | `(applicationId: string) => `/api/verification-applications/${id(applicationId)}`` |
| `VERIFICATION_APPLICATION_DECISION` | `(applicationId: string) => `${Routes.VERIFICATION_APPLICATION(applicationId)}/decision`` |
| `USER_UPDATE` | `(userId: string) => `/users/api/update-one-user/${id(userId)}`` |
| `USERS_CREATE` | `"/api/users"` |
| `FACILITY_MEMBERSHIP_REQUESTS` | `(status = "PENDING") => `/api/facility-membership-requests${query({ status })}`` |
| `FACILITY_MEMBERSHIP_DECISION` | `( requestId: string, decision: "approve" \| "reject", ) => `/api/facility-membership-requests/${id(requestId)}/${decision}`` |
| `FACILITY_MEMBERSHIP_LICENSE_CHECK` | `(requestId: string) => `/api/facility-membership-requests/${id(requestId)}/license-check`` |
| `FACILITY_MEMBERSHIP_LICENSE_LOOKUP` | `(requestId: string) => `/api/facility-membership-requests/${id(requestId)}/license-lookup`` |
| `USER_DELETE` | `(userId: string) => `/users/api/delete-one-user/${id(userId)}`` |
| `RESEARCH_INQUIRIES` | `"/api/research/inquiries"` |
| `RESEARCH_STATS` | `"/api/research/stats"` |
