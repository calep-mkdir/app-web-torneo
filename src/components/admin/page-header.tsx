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
    <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/8 bg-white/[0.03] px-6 py-6 shadow-[0_24px_80px_-46px_rgba(0,0,0,0.32)] sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {badge ? (
        <Badge variant="warning" className="self-start">
          {badge}
        </Badge>
      ) : null}
    </div>
  );
}
