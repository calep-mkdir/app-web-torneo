import { toDateTimeLocalValue as formatDateTimeLocalValue } from "@/lib/datetime";

export function toDateTimeLocalValue(
  value: string | null | undefined,
  timezone: string,
) {
  return formatDateTimeLocalValue(value, timezone);
}
