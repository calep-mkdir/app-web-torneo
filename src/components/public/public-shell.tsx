"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

export function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/tournaments", label: "Torneos" },
    { href: "/deportes", label: "Circuito" },
    { href: "/organiza", label: "Organiza" },
    { href: "/admin", label: "Panel" },
  ] satisfies ReadonlyArray<{ href: Route; label: string }>;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(190,242,100,0.1),transparent_28%),radial-gradient(circle_at_center,rgba(251,113,133,0.1),transparent_38%)]" />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-[#232730]/82 px-4 py-4 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#22d3ee_0%,#7dd3fc_38%,#d9f99d_100%)] text-slate-950 shadow-[0_18px_40px_-24px_rgba(125,211,252,0.9)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <Link href="/" className="no-underline">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Padel</span>
                <span className="mt-1 block truncate text-xl font-semibold text-white">App Web Torneo</span>
              </Link>
            </div>
          </div>

          <nav className="flex flex-1 flex-wrap items-center gap-2 lg:justify-center">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold no-underline transition",
                    isActive ? "app-nav-active" : "app-nav-idle hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={"/admin" as Route} className="app-cta-primary">
              Crear torneo
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

      <footer className="relative mt-6 border-t border-white/8 bg-black/10 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#22d3ee_0%,#7dd3fc_38%,#d9f99d_100%)] text-slate-950">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Padel</p>
              <p className="text-lg font-semibold text-white">App Web Torneo</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 no-underline transition hover:bg-white/[0.08] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
