import Link from "next/link";

export function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_38%,#f8fafc_100%)]">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/tournaments" className="no-underline">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                Torneos en vivo
              </span>
              <span className="mt-1 block text-lg font-semibold text-slate-950">
                App Web Torneo
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/tournaments">Publico</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
