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
    { href: "/deportes", label: "Deportes" },
    { href: "/organiza", label: "Organiza" },
    { href: "/admin", label: "Gestion" },
  ] satisfies ReadonlyArray<{ href: Route; label: string }>;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#fff7ed_0%,#fffef7_34%,#f7fbff_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_36%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_34%),radial-gradient(circle_at_center,rgba(244,114,182,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute left-[-4rem] top-44 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-5rem] top-28 h-52 w-52 rounded-full bg-sky-300/20 blur-3xl" />

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.75rem] border border-white/65 bg-white/72 px-4 py-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ec4899_50%,#06b6d4_100%)] text-white shadow-lg shadow-orange-300/40">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <Link href="/" className="no-underline">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-600">
                  Deporte, alegria y competicion
                </span>
                <span className="mt-1 block truncate text-xl font-semibold text-slate-950">
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
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20"
                      : "bg-white/75 text-slate-700 hover:bg-white hover:text-slate-950",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Experiencia abierta
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>

      <footer className="relative mt-10 border-t border-white/70 bg-white/55 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-fuchsia-600">
              Hecho para seguir torneos con energia
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Resultados, cuadros y participantes en una experiencia mucho mas viva.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Explora torneos, sigue categorias, abre el panel de gestion y comparte competicion desde
              cualquier dispositivo.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 no-underline transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950"
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
