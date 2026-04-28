import { Badge } from "@/components/ui";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";
import { cn } from "@/lib/utils";

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
  details,
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
  details?: Array<{ label: string; value: string }>;
}) {
  const detailItems =
    details ??
    [
      { label: "Fechas", value: formatDateRange(startAt, endAt, "es-ES", timezone) },
      ...(timezone ? [{ label: "Zona", value: timezone }] : []),
      ...(venue ? [{ label: "Club", value: venue }] : []),
    ];

  return (
    <section className="app-panel app-panel-strong relative overflow-hidden rounded-[2rem]">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,rgba(199,255,47,0.11),transparent_32%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_34%),radial-gradient(circle_at_center,rgba(199,255,47,0.03),transparent_42%)]" />
      <div className="relative px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="app-kicker">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sportName ? <Badge variant="secondary">{sportName}</Badge> : null}
            {status ? (
              <Badge variant={getStatusBadgeVariant(status)}>
                {formatStatusLabel(status)}
              </Badge>
            ) : null}
            {venue ? <Badge variant="outline">{venue}</Badge> : null}
          </div>
        </div>

        {detailItems.length > 0 ? (
          <div
            className={cn(
              "mt-8 grid gap-3 text-sm text-slate-400",
              detailItems.length === 1
                ? "sm:grid-cols-1"
                : detailItems.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3",
            )}
          >
            {detailItems.map((item) => (
              <InfoTile key={`${item.label}-${item.value}`} label={item.label} value={item.value} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] px-4 py-4 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.55)]">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-2 font-medium text-slate-100">{value}</div>
    </div>
  );
}
