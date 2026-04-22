export interface AdminBasicAuthConfig {
  enabled: boolean;
  partial: boolean;
  username: string;
  password: string;
}

export function getAdminBasicAuthConfig(
  source: Record<string, string | undefined> = process.env,
): AdminBasicAuthConfig {
  const username = source.ADMIN_BASIC_AUTH_USER?.trim() ?? "";
  const password = source.ADMIN_BASIC_AUTH_PASSWORD?.trim() ?? "";
  const enabled = username.length > 0 && password.length > 0;

  return {
    enabled,
    partial: !enabled && (username.length > 0 || password.length > 0),
    username,
    password,
  };
}

export function buildAdminBasicAuthHeaderValue(
  username: string,
  password: string,
): string {
  const rawValue = `${username}:${password}`;

  if (typeof btoa === "function") {
    return btoa(rawValue);
  }

  return Buffer.from(rawValue, "utf-8").toString("base64");
}

export function isAuthorizedAdminRequest(
  authorizationHeader: string | null,
  config: AdminBasicAuthConfig,
): boolean {
  if (!config.enabled || !authorizationHeader) {
    return false;
  }

  return (
    authorizationHeader ===
    `Basic ${buildAdminBasicAuthHeaderValue(config.username, config.password)}`
  );
}
