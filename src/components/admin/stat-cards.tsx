import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function StatCards({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{item.value}</div>
            {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
