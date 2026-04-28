"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = [
    { href: "/admin", label: "Panel" },
    { href: "/tournaments", label: "Web" },
    { href: "/deportes", label: "Circuito" },
    { href: "/organiza", label: "Organiza" },
  ] satisfies ReadonlyArray<{ href: Route; label: string }>;

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="relative overflow-hidden border-b border-white/8 bg-[#232730]/82 px-5 py-6 backdrop-blur lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_48%),radial-gradient(circle_at_top_right,rgba(217,249,157,0.14),transparent_44%)]" />

          <div className="relative mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[linear-gradient(135deg,#22d3ee_0%,#7dd3fc_48%,#d9f99d_100%)] p-3 text-slate-950 shadow-[0_18px_40px_-24px_rgba(125,211,252,0.9)]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Padel</p>
                <h1 className="text-lg font-semibold text-white">App Web Torneo</h1>
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

          <div className="relative mt-8 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-400 shadow-[0_24px_60px_-44px_rgba(0,0,0,0.5)]">
            <div className="mb-3 inline-flex rounded-full bg-cyan-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Atajos
            </div>
            Crea. Edita. Publica.
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
          ? "border border-white/35 bg-[#9ae8ff] text-[#11161d] shadow-[0_18px_45px_-18px_rgba(154,232,255,0.55)]"
          : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white",
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
