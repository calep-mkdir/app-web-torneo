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
