"use client";

import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { TRANSFER_SERVICE } from "@/app/services/transfer-service/transfer-service";
import { unwrapArray } from "@/app/services/response-utils";

export default function ExpiryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  useEffect(() => {
    void INVENTORY_SERVICE.expiry(60).then((response) => {
      if (response.success) setItems(unwrapArray(response.data));
      else setNotice(response.message || "Expiry data could not be loaded.");
    });
  }, []);
  const requestTransfer = async (item: any) => {
    const recipient = item.nearestRecipient;
    if (!recipient?.id || (!item.inventoryItemId && !item.id)) {
      setNotice(
        "A linked inventory item and eligible recipient are required for a transfer.",
      );
      return;
    }
    setBusyId(item.id);
    const response = await TRANSFER_SERVICE.create({
      inventoryItemId: item.inventoryItemId ?? item.id,
      recipientFacilityId: recipient.id,
      quantity: item.qty ?? item.quantity ?? 1,
    });
    setNotice(
      response.message ||
        (response.success
          ? "Transfer request submitted."
          : "Transfer request failed."),
    );
    setBusyId(null);
  };
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
          <PackageSearch className="size-5 text-p" aria-hidden="true" />
          Near-Expiry Alerts
        </h1>
        <p className="mt-1 text-[12.5px] text-g500">
          Items approaching expiry · Sorted by urgency
        </p>
      </header>
      <div className="mb-5 rounded-xl border border-g200 bg-w p-4 text-sm text-g700">
        {items.length} items require review within the next 60 days.
      </div>
      {notice ? (
        <p className="mb-4 text-sm text-g600" role="status">
          {notice}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-g200 bg-w">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-g50 text-xs uppercase text-g500">
            <tr>
              {[
                "Drug",
                "Lot",
                "Donor facility",
                "Quantity",
                "Expiry",
                "Days left",
                "Nearest recipient",
                "Action",
              ].map((label) => (
                <th className="px-4 py-3" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-t border-g100" key={item.id}>
                <td className="px-4 py-3 font-semibold text-g800">
                  {item.drug ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {item.lot ?? item.batchNumber ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {item.donorFacility?.name ?? item.donorFacility ?? "—"}
                </td>
                <td className="px-4 py-3">{item.qty ?? item.quantity ?? 0}</td>
                <td className="px-4 py-3">
                  {item.expiry
                    ? new Date(item.expiry).toLocaleDateString("en-NG")
                    : "—"}
                </td>
                <td className="px-4 py-3">{item.daysLeft ?? "—"}</td>
                <td className="px-4 py-3">
                  {item.nearestRecipient?.name ?? item.nearestRecipient ?? "—"}
                  {item.distanceKm != null ? ` · ${item.distanceKm} km` : ""}
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={busyId === item.id}
                    onClick={() => void requestTransfer(item)}
                    className="rounded-md bg-p px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {busyId === item.id ? "Sending…" : "Request transfer"}
                  </button>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td className="px-4 py-3" colSpan={8}>
                  <EmptyState
                    compact
                    icon={PackageSearch}
                    title="No near-expiry inventory"
                    description="Inventory nearing its expiry date will appear here."
                  />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
