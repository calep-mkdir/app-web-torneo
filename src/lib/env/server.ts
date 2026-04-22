import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .trim()
    .url("NEXT_PUBLIC_SUPABASE_URL debe ser una URL valida."),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY es obligatorio."),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .trim()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY es obligatorio."),
});

const siteUrlSchema = z
  .string()
  .trim()
  .url("NEXT_PUBLIC_SITE_URL debe ser una URL valida.");

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      `Configuracion de servidor invalida: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(" ")}`,
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

export function getOptionalSiteUrl(): URL | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) {
    return undefined;
  }

  const parsed = siteUrlSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  return new URL(parsed.data);
}
