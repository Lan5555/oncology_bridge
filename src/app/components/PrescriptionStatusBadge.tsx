import {
  CircleCheck,
  CircleDashed,
  Clock3,
  type LucideIcon,
  XCircle,
} from "lucide-react";
import styles from "./PrescriptionStatusBadge.module.css";

/** Presentation only: preserve the exact saved status and keep both workflows distinct. */
export default function PrescriptionStatusBadge({
  status,
  kind = "authorization",
}: {
  status: string;
  kind?: "authorization" | "dispensing";
}) {
  const value = status.trim().toUpperCase();
  let tone = styles.neutral;
  let Icon: LucideIcon = CircleDashed;
  if (["REJECTED", "CANCELLED", "CANCELED", "FAILED"].includes(value)) {
    tone = styles.negative;
    Icon = XCircle;
  } else if (
    kind === "authorization" &&
    ["APPROVED", "CLEARED"].includes(value)
  ) {
    tone = styles.positive;
    Icon = CircleCheck;
  } else if (
    kind === "authorization" &&
    ["PENDING", "API ROUTING", "AWAITING AUTHORIZATION"].includes(value)
  ) {
    tone = styles.pending;
    Icon = Clock3;
  } else if (
    kind === "dispensing" &&
    ["DISPENSED", "DELIVERED", "COMPLETED"].includes(value)
  ) {
    tone = styles.positive;
    Icon = CircleCheck;
  }
  return (
    <span className={`${styles.badge} ${tone}`}>
      <Icon size={12} aria-hidden="true" />
      {status}
    </span>
  );
}
