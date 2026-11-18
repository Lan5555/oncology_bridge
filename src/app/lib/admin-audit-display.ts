export interface AuditEntry {
  id?: string;
  type?: string;
  action?: string;
  detail?: unknown;
  message?: unknown;
  description?: unknown;
  at?: string;
  createdAt?: string;
  created_at?: string;
  actor?: string | { id?: string; name?: string; email?: string } | null;
  object_type?: string;
  severity?: string;
}

const orderTitles: ReadonlyMap<string, string> = new Map([
  ["PENDING_PAYMENT", "Order awaiting payment"],
  ["PAID", "Payment received"],
  ["CONFIRMED", "Order confirmed"],
  ["PROCESSING", "Order being prepared"],
  ["SHIPPED", "Order shipped"],
  ["DELIVERED", "Order delivered"],
  ["CANCELLED", "Order cancelled"],
  ["FAILED", "Payment failed"],
  ["REFUNDED", "Payment refunded"],
  ["PARTIALLY_REFUNDED", "Payment partially refunded"],
]);

const timestampFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "medium",
});
const reportDateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function nonemptyText(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

function readableLabel(value: string): string {
  const words = value.replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatDate(value: unknown, formatter: Intl.DateTimeFormat) {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : formatter.format(date);
}

function parseDetail(value: unknown): unknown {
  if (typeof value !== "string" || !/^\s*[[{]/.test(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function countLabel(value: unknown, singular: string, plural = `${singular}s`) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return `${value.toLocaleString("en-NG")} ${value === 1 ? singular : plural}`;
}

function summarizeDetails(action: string, fields: Record<string, unknown>) {
  if (action === "REPORT_EXPORTED") {
    const from = formatDate(fields.from, reportDateFormat);
    const to = formatDate(fields.to, reportDateFormat);
    let period: string | undefined;
    if (from && to) period = from === to ? from : `${from} to ${to}`;
    else if (from) period = `From ${from}`;
    else if (to) period = `Through ${to}`;
    return [
      nonemptyText(fields.type)?.toUpperCase(),
      period,
      countLabel(fields.rows, "row"),
    ];
  }
  if (action === "INVENTORY_CREATED" || action === "INVENTORY_UNIT_REVIEWED") {
    const batch = nonemptyText(fields.batchNumber);
    const unit = nonemptyText(fields.unit);
    const previousUnit = nonemptyText(fields.previousUnit);
    const unitDetail =
      unit &&
      (previousUnit && previousUnit !== unit
        ? `Unit changed from ${previousUnit} to ${unit}`
        : `Unit ${unit}`);
    const quantity =
      typeof fields.quantity === "number" && Number.isFinite(fields.quantity)
        ? `Quantity ${fields.quantity.toLocaleString("en-NG")}`
        : undefined;
    return [batch && `Batch ${batch}`, quantity, unitDetail];
  }
  if (action === "MEDICINE_REMOVED") {
    return [
      countLabel(
        Array.isArray(fields.suspendedListingIds)
          ? fields.suspendedListingIds.length
          : undefined,
        "listing suspended",
        "listings suspended",
      ),
      countLabel(
        Array.isArray(fields.releasedReservationIds)
          ? fields.releasedReservationIds.length
          : undefined,
        "reservation released",
        "reservations released",
      ),
      countLabel(
        Array.isArray(fields.paidOrderReviewIds)
          ? fields.paidOrderReviewIds.length
          : undefined,
        "paid order flagged for review",
        "paid orders flagged for review",
      ),
    ];
  }
  return [];
}

export function adminAuditDisplay(entry: AuditEntry) {
  const action = nonemptyText(entry.type) ?? nonemptyText(entry.action) ?? "";
  const value = parseDetail(entry.detail ?? entry.message ?? entry.description);
  let detail = nonemptyText(value);
  let title = readableLabel(action) || "Activity recorded";

  if (action === "PURCHASE_ORDER_EVENT") {
    const status = detail?.match(/^Purchase order event:\s*([A-Z_]+)$/i)?.[1];
    title = status
      ? (orderTitles.get(status.toUpperCase()) ??
        `Order status changed to ${readableLabel(status).toLowerCase()}`)
      : "Order activity";
    if (status) detail = undefined;
  } else if (action === "INVENTORY_CREATED") {
    title = "Stock added";
  } else if (action === "INVENTORY_UNIT_REVIEWED") {
    title = "Stock unit reviewed";
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    detail =
      summarizeDetails(action, value as Record<string, unknown>)
        .filter(Boolean)
        .join(" · ") || undefined;
  }

  const actor =
    typeof entry.actor === "string"
      ? nonemptyText(entry.actor)
      : (nonemptyText(entry.actor?.name) ?? nonemptyText(entry.actor?.email));
  const timestamp = entry.at ?? entry.createdAt ?? entry.created_at;
  return {
    title,
    detail,
    actor: actor ?? "No user recorded",
    time: formatDate(timestamp, timestampFormat) ?? "Time unavailable",
  };
}
