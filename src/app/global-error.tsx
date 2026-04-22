"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Error global
          </p>
          <h1 className="mt-4 text-3xl font-semibold">
            La aplicacion ha encontrado un error del que no ha podido recuperarse.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Reintenta la carga o vuelve al listado publico de torneos.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Reintentar
            </button>
            <Link
              href="/tournaments"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 no-underline"
            >
              Ir a torneos
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
