import { DateTime, IANAZone } from "luxon";

export function isValidTimezone(value: string): boolean {
  return IANAZone.isValidZone(value);
}

export function isValidDateTimeInput(value: string): boolean {
  return DateTime.fromISO(value).isValid;
}

export function normalizeDateTimeInput(
  value: string | null | undefined,
  timezone: string,
): string | null {
  if (!value) {
    return null;
  }

  if (!isValidTimezone(timezone)) {
    throw new Error(`Zona horaria invalida: ${timezone}.`);
  }

  const dateTime = DateTime.fromISO(value, {
    zone: timezone,
  });

  if (!dateTime.isValid) {
    throw new Error(`Fecha invalida: ${value}.`);
  }

  return (
    dateTime.toUTC().toISO({
      includeOffset: true,
      suppressMilliseconds: true,
      suppressSeconds: false,
    }) ?? null
  );
}

export function toDateTimeLocalValue(
  value: string | null | undefined,
  timezone: string,
): string {
  if (!value) {
    return "";
  }

  const dateTime = DateTime.fromISO(value, {
    setZone: true,
  });

  if (!dateTime.isValid) {
    return "";
  }

  return dateTime.setZone(timezone).toFormat("yyyy-LL-dd'T'HH:mm");
}
