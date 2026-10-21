import {
  ChartColumn,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import type { DashboardFeedback } from "@/app/lib/dashboard-feedback";

export default function DashboardChartState({
  loading,
  error,
  onRetry,
}: {
  loading?: boolean;
  error?: DashboardFeedback;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <div
        className="flex h-full min-h-40 flex-col justify-center gap-4 px-6 py-5"
        aria-busy="true"
      >
        <output className="text-center text-xs font-medium text-g500">
          Loading your insights…
        </output>
        <div
          className="flex h-20 items-end justify-center gap-3 motion-safe:animate-pulse"
          aria-hidden="true"
        >
          {[35, 65, 45, 85, 60, 100, 75].map((height, index) => (
            <span
              key={`${index}-${height}`}
              className="w-5 rounded-t-md bg-p/10"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    );
  if (!error) return null;
  const Icon =
    error.kind === "access"
      ? ShieldCheck
      : error.kind === "session"
        ? KeyRound
        : error.kind === "connection"
          ? WifiOff
          : ChartColumn;
  return (
    <div
      className="flex h-full min-h-40 flex-col items-center justify-center overflow-y-auto px-5 py-4 text-center"
      aria-live="polite"
    >
      <span className="mb-3 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-g200 bg-g50 text-p">
        <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-g800">{error.title}</h3>
      <p className="mt-2 max-w-xs text-xs leading-5 text-g500">
        {error.description}
      </p>
      {error.retryable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-g200 bg-w px-3 py-2 text-xs font-semibold text-p transition hover:border-p focus-visible:outline-2 focus-visible:outline-p"
        >
          <RefreshCw className="size-3.5" />
          Try again
        </button>
      )}
      {error.kind === "access" && (
        <span className="mt-3 rounded-full bg-g50 px-3 py-1 text-[10px] font-medium text-g500">
          Access managed by your administrator
        </span>
      )}
    </div>
  );
}
