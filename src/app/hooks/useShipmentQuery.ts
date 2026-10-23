"use client";

import { useEffect, useState } from "react";
import type { NetResponse } from "./service/net-response";

export function useShipmentQuery<T>(
  loader: () => Promise<NetResponse> | null,
  revision: number,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // biome-ignore lint/correctness/useExhaustiveDependencies: revision triggers manual refresh and visible-page polling.
  useEffect(() => {
    let current = true;
    const request = loader();
    setData(null);
    setError("");
    setLoading(Boolean(request));
    if (!request) return;
    void request
      .then((response) => {
        if (!current) return;
        if (!response.success)
          throw new Error(
            response.message || "Monitoring data could not be loaded.",
          );
        if (!response.data || typeof response.data !== "object")
          throw new Error("Monitoring data is unavailable.");
        setData(response.data as T);
      })
      .catch((failure) => {
        if (current)
          setError(
            failure instanceof Error
              ? failure.message
              : "Monitoring data could not be loaded.",
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [loader, revision]);
  return { data, loading, error };
}
