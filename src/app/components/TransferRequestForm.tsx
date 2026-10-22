"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  inventoryBatchRows,
  type ListingStock,
  listingStock,
} from "@/app/lib/listing-stock";
import {
  type TransferRecipient,
  transferRecipients,
} from "@/app/lib/transfer-recipients";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { TRANSFER_SERVICE } from "@/app/services/transfer-service/transfer-service";

export default function TransferRequestForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [stock, setStock] = useState<ListingStock[]>([]);
  const [stockId, setStockId] = useState("");
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [recipients, setRecipients] = useState<TransferRecipient[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");
  const [retry, setRetry] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const selected = stock.find((item) => item.id === stockId);

  const loadStock = useCallback(async (nextPage: number) => {
    setStockLoading(true);
    setStockError("");
    try {
      const response = await INVENTORY_SERVICE.list(
        `page=${nextPage}&limit=100`,
      );
      if (!response.success)
        throw new Error(response.message || "Stock could not be loaded.");
      const data = response.data;
      const batches = inventoryBatchRows(data);
      const options = listingStock(batches);
      setStock((current) => [
        ...new Map(
          (nextPage === 1 ? options : [...current, ...options]).map((item) => [
            item.id,
            item,
          ]),
        ).values(),
      ]);
      const total = data?.total ?? data?.pagination?.total ?? data?.meta?.total;
      const limit =
        data?.limit ?? data?.pagination?.limit ?? data?.meta?.limit ?? 100;
      setHasMore(
        batches.length > 0 &&
          (typeof total === "number"
            ? nextPage * limit < total
            : batches.length === 100),
      );
      setPage(nextPage);
    } catch (failure) {
      setStockError(
        failure instanceof Error
          ? failure.message
          : "Stock could not be loaded.",
      );
    } finally {
      setStockLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStock(1);
  }, [loadStock]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry explicitly reloads suggestions for the same batch.
  useEffect(() => {
    let current = true;
    setRecipients([]);
    setRecipientId("");
    setRecipientError("");
    setError("");
    if (!stockId) {
      setRecipientLoading(false);
      return;
    }
    setRecipientLoading(true);
    void TRANSFER_SERVICE.suggest(stockId)
      .then((response) => {
        if (!current) return;
        if (!response.success)
          throw new Error(
            response.message || "Recipient suggestions could not be loaded.",
          );
        setRecipients(transferRecipients(response.data));
      })
      .catch((failure) => {
        if (current)
          setRecipientError(
            failure instanceof Error
              ? failure.message
              : "Recipient suggestions could not be loaded.",
          );
      })
      .finally(() => {
        if (current) setRecipientLoading(false);
      });
    return () => {
      current = false;
    };
  }, [stockId, retry]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const amount = Number(quantity);
    if (
      !selected ||
      !recipients.some((recipient) => recipient.id === recipientId) ||
      recipientLoading ||
      !Number.isInteger(amount) ||
      amount < 1 ||
      amount > selected.quantity
    ) {
      setError(
        "Choose a stock batch and recipient, then enter a whole quantity within the available stock.",
      );
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await TRANSFER_SERVICE.create({
        inventoryItemId: selected.id,
        recipientFacilityId: recipientId,
        quantity: amount,
      });
      if (!response.success)
        throw new Error(
          response.message || "Transfer request could not be submitted.",
        );
      toast.success(response.message || "Transfer request submitted.");
      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Transfer request could not be submitted.",
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm text-g800";
  return (
    <form className="space-y-4 p-6" onSubmit={submit} aria-busy={saving}>
      <p className="text-sm text-g600">
        Choose the medicine batch to send, a suggested recipient facility and
        the quantity. Facility eligibility and stock availability are checked
        when you submit.
      </p>
      <label
        className="block text-sm font-semibold text-g700"
        htmlFor="transfer-stock"
      >
        Medicine and batch
        <select
          id="transfer-stock"
          className={inputClass}
          required
          disabled={saving || stockLoading}
          value={stockId}
          onChange={(event) => {
            setStockId(event.target.value);
            setRecipientId("");
            setQuantity("");
          }}
        >
          <option value="">
            {stockLoading ? "Loading stock…" : "Select a medicine batch"}
          </option>
          {stock.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · Batch {item.batch} · {item.quantity}{" "}
              {item.unit ?? "units (unit unrecorded)"} · Expires{" "}
              {item.expiry.slice(0, 10)}
            </option>
          ))}
        </select>
      </label>
      {stockError && (
        <p role="alert" className="text-sm text-err">
          {stockError}{" "}
          <button
            type="button"
            className="underline"
            disabled={saving || stockLoading}
            onClick={() => void loadStock(page || 1)}
          >
            Try again
          </button>
        </p>
      )}
      {!stockLoading && !stockError && !stock.length && (
        <p className="text-sm text-g600">
          No available, unexpired stock batches found
          {hasMore
            ? " on this page. Load more stock below."
            : ". Add or review your facility inventory first."}
        </p>
      )}
      {hasMore && (
        <button
          type="button"
          className="text-sm font-semibold text-p"
          disabled={saving || stockLoading}
          onClick={() => void loadStock(page + 1)}
        >
          Load more stock
        </button>
      )}
      <label
        className="block text-sm font-semibold text-g700"
        htmlFor="transfer-recipient"
      >
        Recipient facility
        <select
          id="transfer-recipient"
          className={inputClass}
          required
          disabled={saving || !selected || recipientLoading || !!recipientError}
          value={recipientId}
          onChange={(event) => setRecipientId(event.target.value)}
        >
          <option value="">
            {recipientLoading
              ? "Finding recipients…"
              : "Select a recipient facility"}
          </option>
          {recipients.map((recipient) => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name}
              {recipient.city ? ` · ${recipient.city}` : ""}
              {recipient.distanceKm !== null
                ? ` · ${recipient.distanceKm} km`
                : ""}
            </option>
          ))}
        </select>
      </label>
      {recipientError && (
        <p role="alert" className="text-sm text-err">
          {recipientError}{" "}
          <button
            type="button"
            className="underline"
            disabled={saving}
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </p>
      )}
      {selected &&
        !recipientLoading &&
        !recipientError &&
        !recipients.length && (
          <p className="text-sm text-g600">
            No recipient suggestions were returned for this batch. Choose
            another batch or try again later.
          </p>
        )}
      <label
        className="block text-sm font-semibold text-g700"
        htmlFor="transfer-quantity"
      >
        Quantity{selected?.unit ? ` (${selected.unit})` : ""}
        <input
          id="transfer-quantity"
          className={inputClass}
          type="number"
          min={1}
          max={selected?.quantity}
          step={1}
          required
          disabled={saving || !selected}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </label>
      {selected && (
        <p className="text-xs text-g500">
          Available: {selected.quantity}{" "}
          {selected.unit ?? "units; selling unit not recorded"}.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-err">
          {error}
        </p>
      )}
      <footer className="flex justify-end gap-2 border-t border-g100 pt-4">
        <button
          type="button"
          disabled={saving}
          onClick={onClose}
          className="rounded-lg border border-g200 px-4 py-2 text-sm text-g700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            saving ||
            stockLoading ||
            !selected ||
            recipientLoading ||
            !recipientId ||
            !!recipientError
          }
          className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Submitting…" : "Request transfer"}
        </button>
      </footer>
    </form>
  );
}
