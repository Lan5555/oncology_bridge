const query = (values: Record<string, string | number | undefined | null>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "")
      params.set(key, String(value));
  }
  const value = params.toString();
  return value ? `?${value}` : "";
};
const id = (value: string) => encodeURIComponent(value);

/** API paths and query builders are kept here so service classes stay route agnostic. */
export class Routes {
  static ADMIN_PRESCRIPTIONS = (params = "") => `/admin/api/prescriptions${params ? `?${params}` : ""}`;
  static ADMIN_PRESCRIPTION = (prescriptionId: string) => `/admin/api/prescriptions/${id(prescriptionId)}`;
  static ADMIN_PRESCRIPTION_DECISION = (prescriptionId: string) => `${Routes.ADMIN_PRESCRIPTION(prescriptionId)}/decision`;
  static SHIPMENTS = (page = 1) => `/api/shipments${query({ page, limit: 20 })}`;
  static SHIPMENT_TEMPERATURE = (shipmentId: string) => `/api/shipments/${id(shipmentId)}/temperature`;
  static SHIPMENT_HISTORY = (shipmentId: string, page = 1) => `${Routes.SHIPMENT_TEMPERATURE(shipmentId)}/history${query({ page, limit: 20 })}`;
  static SHIPMENT_EVENTS = (shipmentId: string, page = 1) => `${Routes.SHIPMENT_TEMPERATURE(shipmentId)}/events${query({ page, limit: 20 })}`;
  static SHIPMENT_SYNC = (shipmentId: string) => `/admin/api/shipments/${id(shipmentId)}/temperature/sync`;
  static ORDERS = (params = "") => `/api/orders${params ? `?${params}` : ""}`;
  static ORDER = (orderId: string) => `/api/orders/${id(orderId)}`;
  static ADMIN_ORDERS = (params = "") =>
    `/admin/api/orders${params ? `?${params}` : ""}`;
  static ADMIN_ORDER = (orderId: string) => `/admin/api/orders/${id(orderId)}`;
  static ADMIN_ORDER_FULFILLMENT = (orderId: string) =>
    `${Routes.ADMIN_ORDER(orderId)}/fulfillment`;
  static SIGN_IN = "/auth/api/login";
  static SIGN_OUT = (userId: string) => `/auth/api/log-out/${id(userId)}`;
  static PING_SERVER = "/auth/api/ping-server";
  static REFRESH = "/auth/api/refresh";
  static FORGOT_PASSWORD = "/auth/api/forgot-password";
  static RESET_PASSWORD = "/auth/api/reset-password";

  static REGISTER_FACILITY = "/hospital/api/register-facility";
  static PUBLIC_FACILITIES = (
    params: Record<string, string | number | undefined>,
  ) => `/hospital/api/public-facilities${query(params)}`;
  static REGISTER_TO_FACILITY = "/hospital/api/register-user-to-facility";
  static FACILITIES = (params: Record<string, string | number | undefined>) =>
    `/hospital/api/find-all-facilities${query(params)}`;
  static FACILITY = (facilityId: string) =>
    `/hospital/api/find-one-facility/${id(facilityId)}`;
  static UPDATE_FACILITY = (facilityId: string) =>
    `/hospital/api/update-one-facility/${id(facilityId)}`;
  static DELETE_FACILITY = (facilityId: string) =>
    `/hospital/api/delete-one-facility/${id(facilityId)}`;

  static VERIFY_LICENSE = "/api/verify-license";
  static ME = "/api/me";
  static RESUBMIT_VERIFICATION = "/api/me/verification/resubmit";
  static DASHBOARD_SUMMARY = "/api/dashboard/summary";
  static DASHBOARD_CHARTS = "/api/dashboard/charts";
  static PUBLIC_STATS = "/api/public/stats";
  static FORM_OPTIONS = (context: string) =>
    `/api/form-options${query({ context })}`;
  static PRESCRIPTION_PHARMACIES = (page = 1) =>
    `/api/prescriptions/pharmacies${query({ page, limit: 100 })}`;
  static REPORT_EXPORT = "/api/reports/export";

  static INVENTORY = (params = "") =>
    `/api/inventory${params ? `?${params}` : ""}`;
  static INVENTORY_ITEM = (itemId: string) => `/api/inventory/${id(itemId)}`;
  static INVENTORY_QUARANTINE = (itemId: string) =>
    `${Routes.INVENTORY_ITEM(itemId)}/quarantine`;
  static INVENTORY_DISPOSE = (itemId: string) =>
    `${Routes.INVENTORY_ITEM(itemId)}/dispose`;
  static INVENTORY_EXPORT = "/api/inventory/export.csv";
  static INVENTORY_NEAR_EXPIRY = (limit = 7) =>
    `/api/inventory/near-expiry${query({ limit })}`;
  static EXPIRY = (withinDays = 60) => `/api/expiry${query({ withinDays })}`;

  static SCANS = "/api/scans";
  static SCANS_DECODE = "/api/scans/decode";
  static SCANS_BATCH = "/api/scans/batch";
  static SCANS_RECENT = (limit = 5) => `/api/scans/recent${query({ limit })}`;
  static SCANS_MONTHLY = "/api/scans/monthly";
  static GS1_LOOKUP = (gtin: string) => `/api/gs1/lookup${query({ gtin })}`;
  static MEDICINES = "/api/medicines";
  static MEDICINE_ITEM = (medicineId: string) =>
    `/api/medicines/${id(medicineId)}`;
  static MEDICINE_BY_GTIN = (gtin: string) => `/api/medicines/gtin/${id(gtin)}`;
  static STOCK_SEARCH = (q = "", location = "") =>
    `/api/stock/search${query({ q, location })}`;

  static TRANSFERS = (status?: string) => `/api/transfers${query({ status })}`;
  static TRANSFER_STATS = "/api/transfers/stats";
  static TRANSFER_ACTIVE_ORDER = "/api/transfers/active-order";
  static TRANSFER_SUGGEST = (inventoryItemId: string) =>
    `/api/transfers/suggest${query({ inventoryItemId })}`;
  static TRANSFER_ITEM = (transferId: string) =>
    `/api/transfers/${id(transferId)}`;
  static TRANSFER_APPROVE = (transferId: string) =>
    `${Routes.TRANSFER_ITEM(transferId)}/approve`;
  static TRANSFER_REJECT = (transferId: string) =>
    `${Routes.TRANSFER_ITEM(transferId)}/reject`;
  static TRANSFER_DISPATCH = (transferId: string) =>
    `${Routes.TRANSFER_ITEM(transferId)}/dispatch`;
  static TRANSFER_DELIVER = (transferId: string) =>
    `${Routes.TRANSFER_ITEM(transferId)}/deliver`;

  static PRESCRIPTIONS = (tab?: string) =>
    `/api/prescriptions${query({ tab })}`;
  static PRESCRIPTION_ITEM = (prescriptionId: string) =>
    `/api/prescriptions/${id(prescriptionId)}`;
  static INVOICES = "/api/invoices";
  static INVOICE = (reference: string) => `/api/invoices/${id(reference)}`;

  static STORAGE_UNITS = "/api/storage-units";
  static STORAGE_UNIT = (unitId: string) => `/api/storage-units/${id(unitId)}`;
  static COLD_CHAIN_EVENTS = (
    params: {
      unitId?: string;
      status?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => `/api/cold-chain-events${query(params)}`;
  static COLDCHAIN_HISTORY = (hours = 24, unitId?: string) =>
    `/api/coldchain/history${query({ hours, unitId })}`;
  static COLDCHAIN_STREAM = "/api/coldchain/stream";
  static NETWORK = "/api/network";

  static ROLES = "/api/roles";
  static ROLE_ITEM = (roleId: number | string) =>
    `/api/roles/${id(String(roleId))}`;
  static USERS = (params = "") => `/api/users${params ? `?${params}` : ""}`;
  static AUDIT = (params = "") => `/api/audit${params ? `?${params}` : ""}`;
  static AUDIT_EXPORT = "/api/audit/export.csv";
  static AUDIT_VERIFY = "/api/audit/verify";

  static SETTINGS = "/api/settings";
  static NOTIFICATIONS = "/api/notifications";
  static NOTIFICATION_READ = (notificationId: string) =>
    `/api/notifications/${id(notificationId)}/read`;

  // The current backend exposes the shared login endpoint; authorization for
  // admin APIs is still enforced by the backend using the returned Role C JWT.
  static ADMIN_LOGIN = Routes.SIGN_IN;
  static ADMIN_VERIFICATIONS = (status = "MANUAL_REVIEW") =>
    `/admin/api/verifications${query({ status, page: 1, limit: 50 })}`;
  static ADMIN_VERIFICATION_DECISION = (
    verificationId: string,
    decision: "approve" | "reject",
  ) => `/admin/api/verifications/${id(verificationId)}/${decision}`;
  static ADMIN_VERIFICATION_RECHECK = (verificationId: string) =>
    `/admin/api/verifications/${id(verificationId)}/recheck`;
  static SETTLEMENTS_SUMMARY = "/api/settlements/summary";
  static ADMIN_INTEGRATIONS_HEALTH = "/admin/api/integrations/health";
  static ADMIN_INTEGRATION_CONFIG = (key: string) =>
    `/admin/api/integrations/${id(key)}/configuration`;
  static ADMIN_INTEGRATION_TEST = (key: string) =>
    `/admin/api/integrations/${id(key)}/test`;
  static ADMIN_INTEGRATION_SYNC = (key: string) =>
    `/admin/api/integrations/${id(key)}/sync`;
  static VERIFICATION_APPLICATIONS = (status = "MANUAL_REVIEW") =>
    `/api/verification-applications${query({ status })}`;
  static VERIFICATION_APPLICATION = (applicationId: string) =>
    `/api/verification-applications/${id(applicationId)}`;
  static VERIFICATION_APPLICATION_DECISION = (applicationId: string) =>
    `${Routes.VERIFICATION_APPLICATION(applicationId)}/decision`;
  static USER_UPDATE = (userId: string) =>
    `/users/api/update-one-user/${id(userId)}`;
  static USERS_CREATE = "/api/users";
  static FACILITY_MEMBERSHIP_REQUESTS = (status = "PENDING") =>
    `/api/facility-membership-requests${query({ status })}`;
  static FACILITY_MEMBERSHIP_DECISION = (
    requestId: string,
    decision: "approve" | "reject",
  ) => `/api/facility-membership-requests/${id(requestId)}/${decision}`;
  static FACILITY_MEMBERSHIP_LICENSE_CHECK = (requestId: string) =>
    `/api/facility-membership-requests/${id(requestId)}/license-check`;
  static FACILITY_MEMBERSHIP_LICENSE_LOOKUP = (requestId: string) =>
    `/api/facility-membership-requests/${id(requestId)}/license-lookup`;
  static USER_DELETE = (userId: string) =>
    `/users/api/delete-one-user/${id(userId)}`;
  static RESEARCH_INQUIRIES = "/api/research/inquiries";
  static RESEARCH_STATS = "/api/research/stats";
}
