"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/portal", label: "Oncosourz Bridge Portal" },
  { href: "/research", label: "Enterprise & Research" },
  { href: "#quick-pay", label: "Quick Pay" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMob = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-[900] flex h-16 items-center justify-between px-10 transition-[background,box-shadow] duration-400 max-[600px]:px-5 ${
          scrolled
            ? "bg-navy/95 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[16px]"
            : "bg-linear-to-b from-navy/80 to-transparent"
        }`}
        id="mainNav"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Oncosourz home"
        >
          <div className="flex size-[34px] items-center justify-center rounded-[9px] bg-linear-135 from-sky to-cyan">
            <svg
              viewBox="0 0 24 24"
              className="size-[18px] fill-none stroke-white stroke-[2.2]"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="font-display text-[15px] font-bold tracking-[-0.3px] text-white max-[860px]:text-sm">
              Oncosourz
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[1px] text-cyan max-[860px]:text-[8px]">
              Lagos–Ibadan Network
            </div>
          </div>
        </Link>

        <div className="flex gap-8 max-[860px]:hidden">
          {LINKS.map((l) => (
            <Link
              href={l.href}
              key={l.href}
              className="text-[13.5px] font-medium text-white/65 transition-colors duration-200 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg border border-white/15 bg-transparent px-[18px] py-2 font-display text-[13px] font-bold text-white/70 transition-all duration-200 hover:border-white/40 hover:text-white max-[860px]:px-2.5 max-[860px]:py-1.5 max-[860px]:text-[11px]"
          >
            Log In / Register
          </Link>
        </div>

        <button
          type="button"
          className="hidden cursor-pointer flex-col gap-1 border-0 bg-transparent p-1 max-[860px]:flex"
          id="hamburger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobileNav"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-[22px] rounded-[2px] bg-white transition-all duration-300 ${mobileOpen ? "[transform:rotate(45deg)_translate(4px,4px)]" : ""}`}
          />
          <span
            className={`block h-0.5 w-[22px] rounded-[2px] bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-[22px] rounded-[2px] bg-white transition-all duration-300 ${mobileOpen ? "[transform:rotate(-45deg)_translate(4px,-4px)]" : ""}`}
          />
        </button>
      </nav>

      <div
        className={`fixed inset-x-0 top-16 z-[800] hidden flex-col border-b border-white/10 bg-navy/[0.98] pt-2 pb-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-[16px] ${mobileOpen ? "max-[860px]:flex" : ""}`}
        id="mobileNav"
      >
        {LINKS.map((l) => (
          <Link
            href={l.href}
            key={l.href}
            onClick={closeMob}
            className="border-b border-white/5 px-8 py-[13px] text-[15px] font-medium text-white/70 transition-colors duration-200 hover:text-white"
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/login"
          onClick={closeMob}
          className="px-8 py-[13px] text-[15px] font-bold text-cyan"
        >
          Log In / Register
        </Link>
      </div>
    </>
  );
}
