import { Badge } from "@/components/ui";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/82 px-6 py-6 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.28)] sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {badge ? (
        <Badge variant="secondary" className="self-start bg-amber-100 text-amber-800">
          {badge}
        </Badge>
      ) : null}
    </div>
  );
}
