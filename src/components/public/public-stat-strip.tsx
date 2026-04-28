import { Card, CardContent } from "@/components/ui";

export function PublicStatStrip({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="app-panel bg-white/[0.04]">
          <CardContent className="px-4 py-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {item.value}
            </div>
            {item.hint ? (
              <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
