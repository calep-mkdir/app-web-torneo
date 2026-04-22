import { describe, expect, it } from "vitest";

import { normalizeDateTimeInput, toDateTimeLocalValue } from "./datetime";

describe("datetime helpers", () => {
  it("normalizes local tournament datetimes to UTC", () => {
    expect(normalizeDateTimeInput("2026-04-22T10:00", "Europe/Madrid")).toBe(
      "2026-04-22T08:00:00Z",
    );
  });

  it("formats stored UTC dates back into the tournament timezone for form inputs", () => {
    expect(
      toDateTimeLocalValue("2026-04-22T08:00:00Z", "Europe/Madrid"),
    ).toBe("2026-04-22T10:00");
  });
});
