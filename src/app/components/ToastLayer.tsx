"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster, useSonner } from "sonner";

/** Escape page stacking contexts and native dialog layers without blocking the screen. */
export function ToastLayer({
  children,
  active = true,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const element = layer.current;
    if (!element || !active || typeof element.showPopover !== "function")
      return;
    const raise = () => {
      if (element.matches(":popover-open")) element.hidePopover();
      element.showPopover();
    };
    raise();
    const onToggle = (event: Event) => {
      // A newly opened modal enters the top layer above existing popovers.
      if (event.target instanceof HTMLDialogElement && event.target.open)
        raise();
    };
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("toggle", onToggle, true);
      if (element.matches(":popover-open")) element.hidePopover();
    };
  }, [active, mounted]);

  if (!mounted) return null;
  return createPortal(
    <div
      ref={layer}
      popover={active ? "manual" : undefined}
      className="notification-layer"
    >
      {children}
    </div>,
    document.body,
  );
}

export default function AppToaster() {
  const { toasts } = useSonner();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <ToastLayer active={toasts.length > 0}>
      <Toaster richColors closeButton theme={theme} duration={4500} />
    </ToastLayer>
  );
}
