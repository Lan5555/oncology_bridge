"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./MotionPage.module.css";

/** Animate visible sections once; content stays readable without animation APIs. */
export default function MotionPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>();
    const animations = new Map<HTMLElement, Animation>();
    const targets = Array.from(
      node.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          observer.unobserve(target);
          if (
            seen.has(target) ||
            preference?.matches ||
            typeof target.animate !== "function"
          )
            continue;
          seen.add(target);
          if (target.contains(document.activeElement)) continue;
          const siblingIndex = target.parentElement
            ? Array.from(target.parentElement.children).indexOf(target)
            : 0;
          const animation = target.animate(
            [
              { opacity: 0, transform: "translateY(22px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 650,
              delay: (siblingIndex % 3) * 75,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "backwards",
            },
          );
          animations.set(target, animation);
          animation.onfinish = () => animations.delete(target);
        }
      },
      { threshold: 0.08 },
    );
    const updatePreference = () => {
      observer.disconnect();
      if (preference?.matches) {
        for (const animation of animations.values()) animation.cancel();
        animations.clear();
      } else {
        for (const target of targets)
          if (!seen.has(target)) observer.observe(target);
      }
    };
    // Reveal focused controls immediately rather than moving them during typing.
    const handleFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      for (const [target, animation] of animations) {
        if (target.contains(event.target)) {
          animation.cancel();
          animations.delete(target);
        }
      }
    };
    updatePreference();
    preference?.addEventListener("change", updatePreference);
    node.addEventListener("focusin", handleFocus);
    return () => {
      observer.disconnect();
      preference?.removeEventListener("change", updatePreference);
      node.removeEventListener("focusin", handleFocus);
      for (const animation of animations.values()) animation.cancel();
    };
  }, []);
  return (
    <div ref={root} className={`${styles.page} ${className}`}>
      {children}
    </div>
  );
}
