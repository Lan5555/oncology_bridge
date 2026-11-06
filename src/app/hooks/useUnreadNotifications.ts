"use client";

import { useEffect, useState } from "react";
import {
  isNotificationUnread,
  NOTIFICATIONS_CHANGED,
} from "@/app/lib/notification-state";
import { NOTIFICATION_SERVICE } from "@/app/services/notification-service/notification-service";
import { unwrapArray } from "@/app/services/response-utils";

export function useUnreadNotifications(userId?: string) {
  const [result, setResult] = useState<{
    userId: string;
    count: number;
  } | null>(null);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    let request = 0;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      const current = ++request;
      const response = await NOTIFICATION_SERVICE.list(userId);
      if (!active || current !== request) return;
      if (response.success) {
        setResult({
          userId,
          count: unwrapArray(response.data).filter(isNotificationUnread).length,
        });
      } else if (response.status === 401 || response.status === 403) {
        setResult(null);
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 30000);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [userId]);
  return result?.userId === userId ? (result?.count ?? null) : null;
}
