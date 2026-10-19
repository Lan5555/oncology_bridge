"use client";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useProvider } from "@/app/providers/provider";
import BrandLogo from "../BrandLogo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/portal", label: "Oncosourz Bridge Portal" },
  { href: "/research", label: "Enterprise & Research" },
  { href: "/#quick-pay", label: "Quick Pay" },
];
export default function Nav() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useProvider();
  return (
    <header className="fixed inset-x-0 top-0 z-[900] border-b border-[var(--landing-border)] bg-[var(--landing-nav)] backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 lg:px-8"
      >
        <Link
          href="/"
          aria-label="Oncosourz home"
          className="shrink-0 rounded-lg bg-white px-1"
        >
          <BrandLogo className="h-12 w-[76px] sm:w-[145px]" />
        </Link>
        <div className="hidden items-center gap-6 xl:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-semibold text-[var(--landing-muted)] transition hover:text-[var(--landing-accent)]"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className="rounded-lg border border-[var(--landing-border)] p-2 text-[var(--landing-text)] transition hover:bg-[var(--landing-soft)]"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--landing-cta)] px-2.5 py-2.5 text-[10px] font-bold text-[var(--landing-on-cta)] sm:px-5 sm:text-xs"
          >
            Log In / Register{" "}
            <ArrowUpRight size={15} className="hidden sm:block" />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="public-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-[var(--landing-border)] p-2 text-[var(--landing-text)] xl:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <nav
          id="public-navigation"
          aria-label="Mobile navigation"
          className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] p-4 xl:hidden"
        >
          {LINKS.map((l) => (
            <Link
              onClick={() => setOpen(false)}
              key={l.href}
              href={l.href}
              className="block rounded-lg px-4 py-3 text-sm font-semibold text-[var(--landing-text)] hover:bg-[var(--landing-soft)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
