import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function StatCards({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="overflow-hidden">
          <div className="h-1 bg-[#c7ff2f]" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-[#eaff9d]">{item.value}</div>
            {item.hint ? <p className="mt-2 text-xs text-slate-400">{item.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
