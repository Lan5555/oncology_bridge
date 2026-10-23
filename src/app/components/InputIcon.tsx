import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./InputIcon.module.css";

export default function InputIcon({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className={styles.field}>
      <Icon className={styles.icon} strokeWidth={1.7} aria-hidden="true" />
      {children}
    </span>
  );
}
