"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Sprout } from "lucide-react";

const NAV: Array<{ label: string; href: string }> = [
  { label: "Case study", href: "/#case-study" },
  { label: "Solution", href: "/#solution" },
  { label: "Market", href: "/#market" },
  { label: "States", href: "/state" },
  { label: "Traction", href: "/#traction" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-un-line bg-un-cream-50/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-[19px] font-display font-bold tracking-tight text-un-forest"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-un-sage-600">
              <Sprout className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            Unspoiled
          </Link>
          <ul className="hidden items-center gap-7 text-[14px] font-medium text-un-ink-soft lg:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition hover:text-un-forest"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3 text-[14px] font-medium">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-full bg-un-coral-500 px-5 py-2.5 font-semibold text-white shadow-[0_10px_24px_rgba(214,78,42,0.25)] transition hover:-translate-y-px hover:bg-un-coral-600"
          >
            Open dashboard
          </Link>
          <button
            className="rounded-full p-2 text-un-forest lg:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
