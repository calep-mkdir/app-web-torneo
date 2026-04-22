import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function StatCards({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  const tones = [
    "bg-[linear-gradient(160deg,rgba(17,24,39,0.94)_0%,rgba(14,28,55,0.94)_100%)]",
    "bg-[linear-gradient(160deg,rgba(17,24,39,0.94)_0%,rgba(10,48,62,0.92)_100%)]",
    "bg-[linear-gradient(160deg,rgba(17,24,39,0.94)_0%,rgba(57,15,39,0.92)_100%)]",
    "bg-[linear-gradient(160deg,rgba(17,24,39,0.94)_0%,rgba(42,62,10,0.92)_100%)]",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Card key={item.label} className={tones[index % tones.length]}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{item.value}</div>
            {item.hint ? <p className="mt-2 text-xs text-slate-400">{item.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
