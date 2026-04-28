"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, MessageCircle, Send, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/tournaments", label: "Torneos" },
  { href: "/#cuadros", label: "Cuadros" },
  { href: "/#partidos", label: "Partidos" },
  { href: "/#jugadores", label: "Jugadores" },
  { href: "/#ranking", label: "Ranking" },
  { href: "/organiza", label: "Informacion" },
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
    title: "Mas",
    items: [
      { href: "/#jugadores", label: "Jugadores" },
      { href: "/#ranking", label: "Ranking" },
      { href: "/organiza", label: "Informacion" },
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(199,255,47,0.1),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_80%)]" />

      <header className="relative z-50 border-b border-white/6 bg-[#080d14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1560px] items-center gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d6ff72]/20 bg-[#c7ff2f]/10 text-[#c7ff2f] shadow-[0_0_30px_rgba(199,255,47,0.18)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold uppercase tracking-tight text-white">Padel</div>
              <div className="-mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                Tournaments
              </div>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex">
            {navItems.map((item) => {
              const isAnchor = item.href.includes("#");
              const itemPath = isAnchor ? item.href.split("#")[0] || "/" : item.href;
              const isActive = isAnchor
                ? false
                : pathname === itemPath || (itemPath !== "/" && pathname.startsWith(itemPath));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative pb-3 text-sm font-semibold uppercase tracking-[0.08em] no-underline transition",
                    isActive ? "app-nav-active" : "app-nav-idle hover:text-white",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-0.5 rounded-full transition",
                      isActive ? "bg-[#c7ff2f] shadow-[0_0_12px_rgba(199,255,47,0.7)]" : "bg-transparent",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-3 xl:flex">
            <SocialIcon icon={<Camera className="h-4 w-4" />} />
            <SocialIcon icon={<MessageCircle className="h-4 w-4" />} />
            <SocialIcon icon={<Send className="h-4 w-4" />} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="relative mt-10 border-t border-white/6 bg-[#090e16]/96">
        <div className="mx-auto grid max-w-[1560px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.25fr_0.85fr_0.85fr_1.1fr] lg:px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d6ff72]/20 bg-[#c7ff2f]/10 text-[#c7ff2f]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold uppercase tracking-tight text-white">Padel</div>
                <div className="-mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                  Tournaments
                </div>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              El mejor padel. Los mejores torneos. Toda la informacion del circuito en un solo lugar.
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
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Newsletter</h2>
            <p className="text-sm text-slate-400">Recibe fechas, cuadros y resultados.</p>
            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#101722]">
              <input
                type="email"
                placeholder="Tu email"
                className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button type="button" className="app-cta-primary rounded-none border-0 px-4 py-3">
                OK
              </button>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <SocialIcon icon={<Camera className="h-4 w-4" />} />
              <SocialIcon icon={<MessageCircle className="h-4 w-4" />} />
              <SocialIcon icon={<Send className="h-4 w-4" />} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300">
      {icon}
    </span>
  );
}
