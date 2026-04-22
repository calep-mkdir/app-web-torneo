import type { Route } from "next";
import Link from "next/link";
import { LayoutDashboard, Settings2, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r bg-white px-5 py-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin</p>
                <h1 className="text-lg font-semibold">App Web Torneo</h1>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </SidebarLink>
            <SidebarLink href="/admin" icon={<Settings2 className="h-4 w-4" />}>
              Gestion general
            </SidebarLink>
          </nav>

          <div className="mt-8 rounded-xl border bg-slate-50 p-4 text-sm text-muted-foreground">
            Panel funcional orientado a operacion: altas, partidos, resultados y seguimiento.
          </div>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  children,
}: {
  href: Route;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100",
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
