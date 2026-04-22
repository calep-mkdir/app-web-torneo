import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import type { TournamentCategoryRecord, TournamentEntryRecord } from "@/features/admin/types";

export function ParticipantsTable({
  entries,
  categories,
}: {
  entries: TournamentEntryRecord[];
  categories: TournamentCategoryRecord[];
}) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participantes inscritos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Seed</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Todavia no hay participantes inscritos en este torneo.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.participantName}</TableCell>
                  <TableCell>{categoryMap.get(entry.categoryId) ?? "Sin categoria"}</TableCell>
                  <TableCell>{entry.seed ?? "-"}</TableCell>
                  <TableCell>{entry.entryType}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === "active" ? "success" : "secondary"}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
