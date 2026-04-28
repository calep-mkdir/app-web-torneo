export interface SportReference {
  id: string;
  name: string;
  code?: string | null;
}

export function getPadelSport<T extends SportReference>(sports: T[]): T | null {
  return (
    sports.find((sport) => sport.code?.trim().toLowerCase() === "padel") ??
    sports.find((sport) => sport.name.trim().toLowerCase() === "padel") ??
    sports[0] ??
    null
  );
}

export function slugifyTournamentName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function formatStatusLabel(status: string): string {
  switch (status.trim().toLowerCase()) {
    case "draft":
      return "Borrador";
    case "published":
      return "Publicado";
    case "in_progress":
    case "live":
      return "En curso";
    case "completed":
    case "finished":
      return "Finalizado";
    case "archived":
      return "Archivado";
    case "ready":
      return "Listo";
    case "scheduled":
      return "Programado";
    case "pending":
      return "Pendiente";
    case "cancelled":
      return "Cancelado";
    case "active":
      return "Activo";
    case "win":
      return "Victoria";
    case "loss":
      return "Derrota";
    case "draw":
      return "Empate";
    case "bye":
      return "Pasa";
    default:
      return status.replaceAll("_", " ");
  }
}

export function getStatusBadgeVariant(status: string) {
  switch (status.trim().toLowerCase()) {
    case "published":
    case "completed":
    case "finished":
    case "win":
    case "bye":
      return "success" as const;
    case "in_progress":
    case "live":
    case "draw":
      return "warning" as const;
    case "cancelled":
    case "loss":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function formatCategoryFormatLabel(format: string): string {
  switch (format.trim().toLowerCase()) {
    case "group_only":
      return "Grupos";
    case "knockout":
    case "knockout_only":
      return "Cuadro";
    case "group_knockout":
    case "group_to_knockout":
      return "Grupos + cuadro";
    default:
      return format.replaceAll("_", " ");
  }
}
