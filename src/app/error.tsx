"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
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
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="app-panel app-panel-strong rounded-[2rem] px-6 py-10">
        <p className="app-kicker">
          Error inesperado
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Algo ha fallado al cargar esta pantalla.
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Puedes reintentar la operacion o volver a la vista principal del torneo.
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
  );
}
