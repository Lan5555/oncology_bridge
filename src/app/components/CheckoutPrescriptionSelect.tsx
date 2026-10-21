"use client";

import { useEffect, useState } from "react";
import {
  type CheckoutPrescription,
  checkoutPrescriptions,
} from "@/app/lib/checkout-prescriptions";
import { PRESCRIPTION_SERVICE } from "@/app/services/prescription-service/prescription-service";
import { unwrapArray } from "@/app/services/response-utils";

export default function CheckoutPrescriptionSelect({
  value,
  onChange,
  disabled,
  medicineId,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  medicineId?: string;
}) {
  const [options, setOptions] = useState<CheckoutPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh explicitly reloads authorization changes for the same medicine and page.
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    if (page === 1) setOptions([]);
    void PRESCRIPTION_SERVICE.checkoutOptions(page).then((response) => {
      if (!current) return;
      if (!response.success) {
        setError(
          response.message || "Approved prescriptions could not be loaded.",
        );
        setLoading(false);
        return;
      }
      const data = response.data;
      const rows = unwrapArray(data);
      const approved = checkoutPrescriptions(rows, medicineId);
      setOptions((previous) => [
        ...new Map(
          (page === 1 ? approved : [...previous, ...approved]).map((item) => [
            item.id,
            item,
          ]),
        ).values(),
      ]);
      const total = data?.total ?? data?.pagination?.total ?? data?.meta?.total;
      const limit =
        data?.limit ?? data?.pagination?.limit ?? data?.meta?.limit ?? 25;
      setHasMore(
        typeof total === "number" && rows.length > 0 && page * limit < total,
      );
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [page, refresh, medicineId]);
  return (
    <div className="space-y-2">
      <label className="grid gap-2 text-xs font-semibold text-g600">
        Approved prescription
        <select
          required
          disabled={disabled || loading || !options.length}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="checkout-prescription-help"
          className="w-full rounded-xl border border-g200 bg-w px-3.5 py-3 text-sm text-g800"
        >
          <option value="" disabled>
            {loading
              ? "Loading prescriptions…"
              : options.length
                ? "Select an approved prescription"
                : "No approved prescriptions available"}
          </option>
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <p
        id="checkout-prescription-help"
        className="text-[11px] leading-5 text-g500"
      >
        {!loading && !options.length && !error
          ? "Create a prescription in Prescriptions and wait for authorization, then refresh this list."
          : "Select the prescription for this medicine. Its approval, remaining quantity, and access are confirmed before payment."}
      </p>
      {error && (
        <p role="alert" className="text-xs text-err">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-p">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => {
            onChange("");
            setPage(1);
            setRefresh((count) => count + 1);
          }}
          className="disabled:opacity-50"
        >
          Refresh prescriptions
        </button>
        {hasMore && (
          <button
            type="button"
            disabled={disabled || loading}
            onClick={() => setPage((current) => current + 1)}
            className="disabled:opacity-50"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
