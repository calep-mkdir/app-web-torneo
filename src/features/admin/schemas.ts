import { isValidDateTimeInput, isValidTimezone } from "@/lib/datetime";
import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

const optionalDatetime = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine((value) => value === null || isValidDateTimeInput(value), {
    message: "Usa una fecha y hora valida.",
  });

const optionalPositiveInt = z
  .union([z.string(), z.number(), z.undefined()])
  .transform((value) => {
    if (value === undefined || value === "") {
      return null;
    }

    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  })
  .refine((value) => value === null || (Number.isInteger(value) && value > 0), {
    message: "Debe ser un entero positivo.",
  });

export const tournamentSchema = z
  .object({
    tournamentId: z.string().uuid().optional(),
    sportId: z.string().uuid("Selecciona un deporte valido."),
    name: z.string().trim().min(3, "El nombre es obligatorio."),
    slug: z
      .string()
      .trim()
      .min(3, "El slug es obligatorio.")
      .regex(slugPattern, "Usa solo minusculas, numeros y guiones."),
    description: optionalString,
    venue: optionalString,
    timezone: z
      .string()
      .trim()
      .min(2, "La zona horaria es obligatoria.")
      .refine(isValidTimezone, {
        message: "Usa una zona horaria IANA valida, por ejemplo Europe/Madrid.",
      }),
    status: z.enum(["draft", "published", "in_progress", "completed", "archived"]),
    isPublic: z.boolean(),
    startAt: optionalDatetime,
    endAt: optionalDatetime,
  })
  .refine(
    (data) => !data.startAt || !data.endAt || data.endAt >= data.startAt,
    {
      path: ["endAt"],
      message: "La fecha de fin no puede ser anterior a la de inicio.",
    },
  );

export const categorySchema = z.object({
  tournamentId: z.string().uuid(),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  slug: z
    .string()
    .trim()
    .min(2, "El slug es obligatorio.")
    .regex(slugPattern, "Usa solo minusculas, numeros y guiones."),
  format: z.enum(["group_only", "knockout_only", "group_to_knockout"]),
  gender: optionalString,
  ageGroup: optionalString,
  maxEntries: optionalPositiveInt,
});

export const participantRegistrationSchema = z.object({
  categoryId: z.string().uuid(),
  displayName: z.string().trim().min(2, "El nombre es obligatorio."),
  countryCode: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value.toUpperCase() : null))
    .refine((value) => value === null || value.length === 2, {
      message: "Usa un codigo de pais de 2 letras.",
    }),
  seed: optionalPositiveInt,
});

export const stageSchema = z.object({
  categoryId: z.string().uuid(),
  stageType: z.enum(["group", "knockout"]),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  sequenceNo: z.coerce.number().int().positive("La secuencia debe ser positiva."),
});

export const stageRoundSchema = z.object({
  stageId: z.string().uuid(),
  roundNo: z.coerce.number().int().positive("La ronda debe ser positiva."),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
});

export const matchSchema = z
  .object({
    categoryId: z.string().uuid(),
    stageId: z.string().uuid(),
    stageRoundId: z.string().uuid().optional().or(z.literal("")).transform((value) => value || null),
    matchNo: optionalPositiveInt,
    bracketPosition: optionalPositiveInt,
    scheduledAt: optionalDatetime,
    venue: optionalString,
    slot1EntryId: z.string().uuid().optional().or(z.literal("")).transform((value) => value || null),
    slot2EntryId: z.string().uuid().optional().or(z.literal("")).transform((value) => value || null),
  })
  .refine((data) => Boolean(data.slot1EntryId || data.slot2EntryId), {
    path: ["slot1EntryId"],
    message: "Debes seleccionar al menos un participante.",
  });

export const resultSchema = z
  .object({
    matchId: z.string().uuid(),
    slot1Score: z.coerce.number().int().min(0, "No puede ser negativo."),
    slot2Score: z.coerce.number().int().min(0, "No puede ser negativo."),
    winnerSlotNo: z
      .union([z.literal("1"), z.literal("2"), z.literal(""), z.undefined()])
      .transform((value) => {
        if (!value) {
          return null;
        }

        return Number(value) as 1 | 2;
      }),
  })
  .refine(
    (data) => data.slot1Score !== data.slot2Score || data.winnerSlotNo !== null,
    {
      path: ["winnerSlotNo"],
      message: "Si hay empate debes indicar el ganador del desempate.",
    },
  );

export type TournamentInput = z.infer<typeof tournamentSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ParticipantRegistrationInput = z.infer<typeof participantRegistrationSchema>;
export type StageInput = z.infer<typeof stageSchema>;
export type StageRoundInput = z.infer<typeof stageRoundSchema>;
export type MatchInput = z.infer<typeof matchSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
