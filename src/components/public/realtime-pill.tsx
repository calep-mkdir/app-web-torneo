import { Badge } from "@/components/ui";
import type { TournamentConnectionStatus } from "@/features/live";

export function RealtimePill({
  status,
  stale,
}: {
  status: TournamentConnectionStatus;
  stale: boolean;
}) {
  const variant =
    status === "subscribed"
      ? "success"
      : status === "reconnecting" || stale
        ? "warning"
        : status === "error"
          ? "destructive"
          : "secondary";

  const label =
    status === "subscribed"
      ? "Tiempo real activo"
      : status === "reconnecting"
        ? "Reconectando"
        : status === "connecting"
          ? "Conectando"
          : status === "error"
            ? "Conexion con incidencias"
            : "Sincronizacion pendiente";

  return <Badge variant={variant}>{label}</Badge>;
}
