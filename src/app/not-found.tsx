import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-950">
        La pagina que buscas no existe o ya no esta disponible.
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Puedes volver al listado publico o entrar al panel de administracion si necesitas seguir operando el torneo.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/tournaments"
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white no-underline"
        >
          Ver torneos
        </Link>
        <Link
          href="/admin"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 no-underline"
        >
          Ir a admin
        </Link>
      </div>
    </div>
  );
}
