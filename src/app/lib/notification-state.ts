export const NOTIFICATIONS_CHANGED = "notifications-changed";

export function isNotificationUnread(notification: {
  readAt?: string | null;
  read_at?: string | null;
  read?: boolean;
}): boolean {
  return (
    !notification.readAt && !notification.read_at && notification.read !== true
  );
}
