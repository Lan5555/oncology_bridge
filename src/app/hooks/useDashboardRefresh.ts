"use client";

import { useCallback, useEffect, useState } from "react";
import { DASHBOARD_DATA_CHANGED } from "./service/core-service";

export function useDashboardRefresh(enabled = true) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refresh = useCallback(
    () => setRefreshVersion((value) => value + 1),
    [],
  );
  useEffect(() => {
    if (!enabled) return;
    let pending: number | undefined;
    const queueRefresh = () => {
      if (document.visibilityState === "hidden") return;
      window.clearTimeout(pending);
      pending = window.setTimeout(refresh, 200);
    };
    const interval = window.setInterval(queueRefresh, 30000);
    window.addEventListener(DASHBOARD_DATA_CHANGED, queueRefresh);
    window.addEventListener("focus", queueRefresh);
    document.addEventListener("visibilitychange", queueRefresh);
    return () => {
      window.clearTimeout(pending);
      window.clearInterval(interval);
      window.removeEventListener(DASHBOARD_DATA_CHANGED, queueRefresh);
      window.removeEventListener("focus", queueRefresh);
      document.removeEventListener("visibilitychange", queueRefresh);
    };
  }, [enabled, refresh]);
  return { refreshVersion, refresh };
}
