export function formatDateTime(
  value: string | null | undefined,
  locale = "es-ES",
  timeZone?: string,
) {
  if (!value) {
    return "Sin programar";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Sin programar";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

export function formatDateRange(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
  locale = "es-ES",
  timeZone?: string,
) {
  if (!startAt && !endAt) {
    return "Fechas pendientes";
  }

  const startLabel = formatDateTime(startAt, locale, timeZone);
  const endLabel = formatDateTime(endAt, locale, timeZone);

  if (startAt && endAt) {
    return `${startLabel} - ${endLabel}`;
  }

  return startAt ? `Desde ${startLabel}` : `Hasta ${endLabel}`;
}
