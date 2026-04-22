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
    <section className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
      <div className="bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_45%,#ffffff_100%)] px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sportName ? <Badge variant="secondary">{sportName}</Badge> : null}
            {status ? <Badge variant={status === "in_progress" ? "warning" : "secondary"}>{status}</Badge> : null}
            {venue ? <Badge variant="outline">{venue}</Badge> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
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
    <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-900">{value}</div>
    </div>
  );
}
