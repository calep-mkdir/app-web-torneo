"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Trophy } from "lucide-react";

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
    { href: "/admin", label: "Gestion" },
  ] satisfies ReadonlyArray<{ href: Route; label: string }>;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(217,249,157,0.12),transparent_28%),radial-gradient(circle_at_center,rgba(251,113,133,0.12),transparent_38%)]" />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.8rem] border border-white/8 bg-[#090f1d]/78 px-4 py-4 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#22d3ee_0%,#7dd3fc_38%,#d9f99d_100%)] text-slate-950 shadow-[0_18px_40px_-24px_rgba(125,211,252,0.9)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <Link href="/" className="no-underline">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Padel en directo
                </span>
                <span className="mt-1 block truncate text-xl font-semibold text-white">
                  App Web Torneo
                </span>
              </Link>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
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
                    isActive
                      ? "bg-lime-300 text-slate-950 shadow-[0_18px_35px_-24px_rgba(217,249,157,0.75)]"
                      : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Claro, rapido y visual
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>

      <footer className="relative mt-10 border-t border-white/8 bg-black/20 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
              Hecho para torneos de padel
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Menos ruido, mejor seguimiento y un panel que no te frena.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Sigue partidos, revisa cuadros y entra en gestión desde una interfaz oscura, simple y
              con personalidad propia.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 no-underline transition hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white"
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
