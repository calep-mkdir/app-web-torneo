import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="app-panel app-panel-strong rounded-[2rem] px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          La pagina que buscas no existe o ya no esta disponible.
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Puedes volver al listado publico o entrar al panel de administracion si necesitas seguir operando el torneo.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/tournaments" className="app-cta-primary px-4 py-2">
            Ver torneos
          </Link>
          <Link href="/admin" className="app-cta-secondary px-4 py-2">
            Ir a admin
          </Link>
        </div>
      </div>
    </div>
  );
}
