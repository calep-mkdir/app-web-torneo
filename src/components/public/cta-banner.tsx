import type { Route } from "next";
import Link from "next/link";

export function CtaBanner({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: Route;
  primaryLabel: string;
  secondaryHref?: Route;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#f97316_0%,#fb7185_45%,#38bdf8_100%)] px-6 py-8 text-white shadow-[0_30px_90px_-35px_rgba(14,165,233,0.55)] sm:px-8 sm:py-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.24),transparent_62%)] lg:block" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">{description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center rounded-full border border-white/55 bg-white/10 px-5 py-3 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
