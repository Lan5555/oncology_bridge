"use client";

import { useCallback, useEffect, useState } from "react";
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

export const EMPTY_RECIPIENT_MESSAGE =
  "The server returned no recipient facilities for this batch. Recipient eligibility is decided by the server. Retry suggestions or choose another batch; a transfer needs a recipient returned by the server.";

/** Shared by the form and graph: selections always come from the same APIs. */
export function useTransferRequestOptions(stockId: string) {
  const [stock, setStock] = useState<ListingStock[]>([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    batch: string;
    recipients: TransferRecipient[];
    error: string;
    loaded: boolean;
  }>({ batch: "", recipients: [], error: "", loaded: false });
  const [retry, setRetry] = useState(0);
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry reloads this batch's suggestions.
  useEffect(() => {
    let current = true;
    setSuggestions({
      batch: stockId,
      recipients: [],
      error: "",
      loaded: false,
    });
    if (!stockId) return;
    void TRANSFER_SERVICE.suggest(stockId)
      .then((response) => {
        if (!current) return;
        if (!response.success)
          throw new Error(
            response.message || "Recipient suggestions could not be loaded.",
          );
        setSuggestions({
          batch: stockId,
          recipients: transferRecipients(response.data),
          error: "",
          loaded: true,
        });
      })
      .catch((failure) => {
        if (current)
          setSuggestions({
            batch: stockId,
            recipients: [],
            error:
              failure instanceof Error
                ? failure.message
                : "Recipient suggestions could not be loaded.",
            loaded: true,
          });
      });
    return () => {
      current = false;
    };
  }, [stockId, retry]);
  const current = suggestions.batch === stockId;
  const retryRecipients = () => {
    setSuggestions({
      batch: stockId,
      recipients: [],
      error: "",
      loaded: false,
    });
    setRetry((value) => value + 1);
  };
  return {
    stock,
    stockLoading,
    stockError,
    page,
    hasMore,
    loadStock,
    recipients: current ? suggestions.recipients : [],
    recipientError: current ? suggestions.error : "",
    recipientLoading: !!stockId && (!current || !suggestions.loaded),
    recipientsForBatch:
      current && suggestions.loaded && !suggestions.error
        ? suggestions.batch
        : "",
    retryRecipients,
  };
}
