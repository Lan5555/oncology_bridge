import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact
          ? "h-full px-3 py-4"
          : "rounded-xl border border-dashed border-g200 bg-gradient-to-br from-g50 via-w to-pll px-6 py-8"
      }`}
    >
      <div className="relative mb-3 flex size-12 items-center justify-center rounded-2xl border border-p/10 bg-pl text-p shadow-sm">
        <span className="absolute inset-1 rounded-xl bg-w/50" />
        <Icon
          className="relative size-5"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
      <h3 className="text-sm font-bold text-g800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-g500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
