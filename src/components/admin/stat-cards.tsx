import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function StatCards({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  const tones = [
    "bg-[linear-gradient(160deg,#fff7ed_0%,#ffedd5_100%)]",
    "bg-[linear-gradient(160deg,#ecfeff_0%,#dbeafe_100%)]",
    "bg-[linear-gradient(160deg,#fff1f2_0%,#fdf2f8_100%)]",
    "bg-[linear-gradient(160deg,#f0fdf4_0%,#ecfccb_100%)]",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Card key={item.label} className={tones[index % tones.length]}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-950">{item.value}</div>
            {item.hint ? <p className="mt-2 text-xs text-slate-600">{item.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
