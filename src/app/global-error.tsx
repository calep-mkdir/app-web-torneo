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
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <div className="app-panel app-panel-strong rounded-[2rem] px-6 py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Error global
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              La aplicacion ha encontrado un error del que no ha podido recuperarse.
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Reintenta la carga o vuelve al listado publico de torneos.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={reset} className="app-cta-primary px-4 py-2">
                Reintentar
              </button>
              <Link href="/tournaments" className="app-cta-secondary px-4 py-2">
                Ir a torneos
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
