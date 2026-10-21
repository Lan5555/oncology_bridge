export type DashboardFeedback = {
  kind: "access" | "session" | "connection" | "service";
  title: string;
  description: string;
  retryable: boolean;
};

export function dashboardFeedback(
  message = "",
  status?: number,
): DashboardFeedback {
  if (
    status === 401 ||
    /invalid token|token.*expired|unauthenticated/i.test(message)
  )
    return {
      kind: "session",
      title: "Please sign in again",
      description:
        "Your session has ended. Sign in again to view your dashboard.",
      retryable: false,
    };
  if (
    status === 403 ||
    /missing permission|role required|access denied|forbidden/i.test(message)
  )
    return {
      kind: "access",
      title: "Dashboard access needed",
      description:
        "Ask your facility administrator to enable dashboard access for your account.",
      retryable: false,
    };
  if (status === 0 || /network|failed to fetch|connection/i.test(message))
    return {
      kind: "connection",
      title: "We couldn’t connect",
      description:
        "Check your internet connection, then try loading this chart again.",
      retryable: true,
    };
  return {
    kind: "service",
    title: "These insights aren’t available right now",
    description:
      "We couldn’t load the chart data. Try again in a moment. If this continues, contact your administrator.",
    retryable: true,
  };
}
