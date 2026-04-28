"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { cn } from "@/lib/utils";

import { PadelTournamentsLogo } from "./padel-tournaments-logo";
import { BrandSocials } from "./social-icons";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/tournaments", label: "Torneos" },
  { href: "/#cuadros", label: "Cuadros" },
  { href: "/#partidos", label: "Partidos" },
  { href: "/#jugadores", label: "Jugadores" },
  { href: "/#ranking", label: "Ranking" },
  { href: "/admin", label: "Panel" },
] as const;

const footerGroups = [
  {
    title: "Navegacion",
    items: [
      { href: "/", label: "Inicio" },
      { href: "/tournaments", label: "Torneos" },
      { href: "/#cuadros", label: "Cuadros" },
      { href: "/#partidos", label: "Partidos" },
    ],
  },
  {
    title: "Accesos",
    items: [
      { href: "/#jugadores", label: "Jugadores" },
      { href: "/#ranking", label: "Ranking" },
      { href: "/organiza", label: "Organiza" },
      { href: "/admin", label: "Panel" },
    ],
  },
] as const;

export function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top_left,rgba(199,255,47,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_80%)]" />

      <header className="relative z-50 border-b border-white/6 bg-[#11161d]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1560px] items-center gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="no-underline">
            <PadelTournamentsLogo size="sm" />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} pathname={pathname} />
            ))}
          </nav>

          <BrandSocials className="ml-auto hidden xl:flex" />
        </div>

        <div className="border-t border-white/6 xl:hidden">
          <nav className="mx-auto flex max-w-[1560px] gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} pathname={pathname} mobile />
            ))}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="relative mt-10 border-t border-white/6 bg-[#12171f]/96">
        <div className="mx-auto grid max-w-[1560px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.85fr_0.85fr_1.05fr] lg:px-8">
          <div className="space-y-4">
            <PadelTournamentsLogo size="sm" />
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Torneos, cuadros, partidos y resultados en una sola vista.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{group.title}</h2>
              <div className="mt-4 grid gap-2 text-sm text-slate-400">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className="no-underline transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Siguenos</h2>
            <p className="text-sm text-slate-400">Instagram, Facebook y Twitter.</p>
            <BrandSocials />
            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#0e131a]">
              <input
                type="email"
                placeholder="Tu email"
                className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button type="button" className="app-cta-primary rounded-none border-0 px-4 py-3">
                OK
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  pathname,
  mobile = false,
}: {
  href: Route;
  pathname: string;
  mobile?: boolean;
}) {
  const isAnchor = href.includes("#");
  const itemPath = isAnchor ? href.split("#")[0] || "/" : href;
  const isActive = isAnchor
    ? pathname === itemPath
    : pathname === itemPath || (itemPath !== "/" && pathname.startsWith(itemPath));

  return (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-semibold uppercase tracking-[0.08em] no-underline transition",
        mobile
          ? [
              "shrink-0 rounded-full border px-4 py-2",
              isActive
                ? "border-[#c7ff2f]/40 bg-[#c7ff2f] text-[#11161d]"
                : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/16 hover:text-white",
            ]
          : [
              "pb-3",
              isActive ? "app-nav-active" : "app-nav-idle hover:text-white",
            ],
      )}
    >
      {href === "/" ? "Inicio" : navItems.find((item) => item.href === href)?.label ?? href}
      {!mobile ? (
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 h-0.5 rounded-full transition",
            isActive ? "bg-[#c7ff2f] shadow-[0_0_12px_rgba(199,255,47,0.7)]" : "bg-transparent",
          )}
        />
      ) : null}
    </Link>
  );
}
