import { Badge } from "@/components/ui";

import { formatDateRange } from "./date-utils";

export function PublicPageHero({
  eyebrow,
  title,
  description,
  sportName,
  venue,
  status,
  startAt,
  endAt,
  timezone,
}: {
  eyebrow: string;
  title: string;
  description?: string | null;
  sportName?: string;
  venue?: string | null;
  status?: string;
  startAt?: string | null;
  endAt?: string | null;
  timezone?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/85 shadow-[0_28px_90px_-42px_rgba(14,165,233,0.35)] backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_34%),radial-gradient(circle_at_center,rgba(236,72,153,0.09),transparent_42%)]" />
      <div className="relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-600">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sportName ? <Badge variant="secondary">{sportName}</Badge> : null}
            {status ? (
              <Badge variant={status === "in_progress" ? "warning" : "secondary"}>
                {status.replaceAll("_", " ")}
              </Badge>
            ) : null}
            {venue ? <Badge variant="outline">{venue}</Badge> : null}
          </div>
        </div>

        <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <InfoTile label="Calendario" value={formatDateRange(startAt, endAt, "es-ES", timezone)} />
          <InfoTile label="Zona horaria" value={timezone ?? "UTC"} />
          <InfoTile label="Sede" value={venue ?? "Pendiente"} />
        </div>
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm shadow-slate-200/60">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 font-medium text-slate-900">{value}</div>
    </div>
  );
}
