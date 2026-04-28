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
    <section className="app-panel app-panel-strong relative overflow-hidden rounded-[2rem] px-6 py-8 text-white shadow-[0_30px_90px_-35px_rgba(0,0,0,0.55)] sm:px-8 sm:py-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(199,255,47,0.14),transparent_62%)] lg:block" />
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-[#c7ff2f]/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="app-kicker">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={primaryHref} className="app-cta-primary rounded-full px-5 py-3">
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className="app-cta-secondary rounded-full px-5 py-3">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
