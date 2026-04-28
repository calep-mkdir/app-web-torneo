import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { TournamentMatchRecord } from "@/features/admin/types";
import { formatStatusLabel, getStatusBadgeVariant } from "@/lib/padel";

export function MatchesTable({ matches }: { matches: TournamentMatchRecord[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Partidos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Fase</TableHead>
              <TableHead>Enfrentamiento</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Todavia no hay partidos creados en este torneo.
                </TableCell>
              </TableRow>
            ) : (
              matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>{match.categoryName}</TableCell>
                  <TableCell>
                    {match.stageName}
                    {match.roundName ? ` - ${match.roundName}` : ""}
                  </TableCell>
                  <TableCell>
                    {match.slot1Label} vs {match.slot2Label}
                  </TableCell>
                  <TableCell>
                    {match.slot1Score ?? "-"} - {match.slot2Score ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(match.status)}>
                      {formatStatusLabel(match.status)}
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
