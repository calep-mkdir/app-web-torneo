import { describe, expect, it } from "vitest";

import {
  buildAdminBasicAuthHeaderValue,
  getAdminBasicAuthConfig,
  isAuthorizedAdminRequest,
} from "./adminBasicAuth";

describe("admin basic auth", () => {
  it("detects a partial configuration", () => {
    expect(
      getAdminBasicAuthConfig({
        ADMIN_BASIC_AUTH_USER: "admin",
      }).partial,
    ).toBe(true);
  });

  it("authorizes requests with the configured credentials", () => {
    const config = getAdminBasicAuthConfig({
      ADMIN_BASIC_AUTH_USER: "admin",
      ADMIN_BASIC_AUTH_PASSWORD: "secret",
    });

    expect(
      isAuthorizedAdminRequest(
        `Basic ${buildAdminBasicAuthHeaderValue("admin", "secret")}`,
        config,
      ),
    ).toBe(true);
  });
});
