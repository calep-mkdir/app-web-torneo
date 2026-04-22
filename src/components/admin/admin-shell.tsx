"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, Sparkles, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/tournaments", label: "Vista publica" },
    { href: "/deportes", label: "Deportes" },
    { href: "/organiza", label: "Organiza" },
  ] satisfies ReadonlyArray<{ href: Route; label: string }>;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#fffef7_34%,#f7fbff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="relative overflow-hidden border-b border-white/70 bg-white/78 px-5 py-6 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_48%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_44%)]" />

          <div className="relative mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ec4899_50%,#06b6d4_100%)] p-3 text-white shadow-lg shadow-orange-200/40">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-600">
                  Gestion abierta
                </p>
                <h1 className="text-lg font-semibold text-slate-950">App Web Torneo</h1>
              </div>
            </div>
          </div>

          <nav className="relative space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin" || pathname.startsWith("/admin/")
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  active={isActive}
                  icon={
                    item.href === "/admin" ? (
                      <LayoutDashboard className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )
                  }
                >
                  {item.label}
                </SidebarLink>
              );
            })}
          </nav>

          <div className="relative mt-8 rounded-[1.5rem] border border-white/75 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#eff6ff_100%)] p-4 text-sm text-slate-600 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Sin login
            </div>
            Panel operativo para crear torneos, mover partidos, guardar resultados y saltar a la
            vista publica cuando lo necesites.
          </div>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  active,
  children,
}: {
  href: Route;
  icon: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold no-underline transition",
        active
          ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20"
          : "bg-white/80 text-slate-700 hover:bg-white hover:text-slate-950",
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
