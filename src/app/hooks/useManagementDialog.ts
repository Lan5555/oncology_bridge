"use client";

import { useEffect, useRef } from "react";

/** Keep keyboard interaction inside an open management dialog and restore focus on close. */
export function useManagementDialog(
  active: string | null,
  busy: boolean,
  onClose: () => void,
) {
  const root = useRef<HTMLDivElement>(null);
  const action = useRef({ busy, onClose });
  useEffect(() => {
    action.current = { busy, onClose };
  });

  useEffect(() => {
    if (!active) return;
    const dialog = root.current?.querySelector<HTMLElement>(
      '[role="dialog"], form[aria-labelledby]',
    );
    if (!dialog) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.setAttribute("tabindex", "-1");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
        ),
      ).filter((item) => item.getClientRects().length > 0);
    (focusable()[0] ?? dialog).focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!action.current.busy) action.current.onClose();
      }
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [active]);
  return root;
}
