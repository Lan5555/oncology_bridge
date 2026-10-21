export type ListingStock = {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  expiry: string;
  unit: string | null;
  storage: string | null;
};

type InventoryBatch = {
  id?: string | number;
  drug?: string;
  medicine?:
    | (MedicineState & {
        generic_name?: string;
        brand_name?: string;
        strength?: string;
        storage_temperature?: string;
        storageTemperature?: string;
      })
    | null;
  medicine_deleted?: boolean;
  medicine_active?: boolean;
  availableQuantity?: number;
  available_quantity?: number;
  qty?: number;
  quantity?: number;
  expiry?: string;
  expiry_date?: string;
  expiryDate?: string;
  expiresOn?: string;
  expires_on?: string;
  lot?: string;
  batchNumber?: string;
  batch_number?: string;
  status?: string;
  unit?: string;
  sellingUnit?: string;
  selling_unit?: string;
};

/** Presentation filter only; the API must recheck ownership and sale eligibility. */
export function listingStock(
  rows: InventoryBatch[],
  now = Date.now(),
): ListingStock[] {
  return rows.flatMap((item) => {
    const quantity = Number(
      item.availableQuantity ??
        item.available_quantity ??
        item.qty ??
        item.quantity,
    );
    const expiry =
      item.expiry ??
      item.expiry_date ??
      item.expiryDate ??
      item.expiresOn ??
      item.expires_on ??
      "";
    const rawUnit = item.sellingUnit ?? item.selling_unit ?? item.unit;
    const unit =
      typeof rawUnit === "string" ? rawUnit.trim().toLowerCase() : "";
    const storage =
      item.medicine?.storage_temperature ?? item.medicine?.storageTemperature;
    if (
      !item.id ||
      linkedMedicineUnavailable(item) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !(Date.parse(expiry) > now) ||
      /quarantin|\bexpired\b|recall|dispos|suspend/i.test(item.status ?? "")
    )
      return [];
    return [
      {
        id: String(item.id),
        name: [
          item.medicine?.generic_name ?? item.drug ?? "Medicine",
          item.medicine?.brand_name,
          item.medicine?.strength,
        ]
          .filter(Boolean)
          .join(" · "),
        batch:
          item.lot ?? item.batchNumber ?? item.batch_number ?? "Not recorded",
        quantity,
        expiry,
        unit: ["vial", "pack", "bottle", "box"].includes(unit) ? unit : null,
        storage: typeof storage === "string" && storage.trim() ? storage : null,
      },
    ];
  });
}

/** Read only recognized inventory containers, including nested API envelopes. */
export function inventoryBatchRows(data: unknown): InventoryBatch[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  for (const key of [
    "items",
    "inventory",
    "inventory_items",
    "inventoryItems",
    "batches",
    "records",
  ]) {
    if (Array.isArray(record[key])) return record[key] as InventoryBatch[];
  }
  return record.data !== undefined ? inventoryBatchRows(record.data) : [];
}

export function unavailableStockMessage(
  rows: InventoryBatch[],
  now = Date.now(),
): string {
  if (!rows.length)
    return "No inventory batches were returned. Refresh stock after adding a batch to your facility.";
  const counts = { medicine: 0, quantity: 0, expiry: 0, status: 0, id: 0 };
  for (const item of rows) {
    if (!item.id) {
      counts.id++;
      continue;
    }
    if (linkedMedicineUnavailable(item)) {
      counts.medicine++;
      continue;
    }
    const quantity = Number(
      item.availableQuantity ??
        item.available_quantity ??
        item.qty ??
        item.quantity,
    );
    if (!Number.isInteger(quantity) || quantity < 1) {
      counts.quantity++;
      continue;
    }
    const expiry =
      item.expiry ??
      item.expiry_date ??
      item.expiryDate ??
      item.expiresOn ??
      item.expires_on ??
      "";
    if (!(Date.parse(expiry) > now)) {
      counts.expiry++;
      continue;
    }
    if (/quarantin|\bexpired\b|recall|dispos|suspend/i.test(item.status ?? ""))
      counts.status++;
  }
  const reasons = [
    counts.id && `${counts.id} missing a batch ID`,
    counts.medicine &&
      `${counts.medicine} linked to removed or inactive medicines`,
    counts.quantity &&
      `${counts.quantity} without a positive whole-number available quantity`,
    counts.expiry &&
      `${counts.expiry} with a missing, invalid, or past expiry date`,
    counts.status && `${counts.status} blocked by stock status`,
  ].filter(Boolean);
  return `Inventory returned ${rows.length} batch(es): ${reasons.join("; ")}. Check these inventory details and refresh stock.`;
}

import {
  linkedMedicineUnavailable,
  type MedicineState,
} from "./medicine-availability";
