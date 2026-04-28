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
  description?: string;
  primaryHref: Route;
  primaryLabel: string;
  secondaryHref?: Route;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,#0f172a_0%,#111827_40%,#0b1120_100%)] px-6 py-8 text-white shadow-[0_30px_90px_-35px_rgba(0,0,0,0.55)] sm:px-8 sm:py-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_62%)] lg:block" />
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-lime-300/12 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#67e8f9_0%,#bef264_100%)] px-5 py-3 text-sm font-semibold text-slate-950 no-underline shadow-[0_18px_45px_-18px_rgba(103,232,249,0.5)] transition hover:-translate-y-0.5 hover:brightness-105"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
