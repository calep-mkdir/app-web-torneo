import { NextResponse, type NextRequest } from "next/server";

import {
  getAdminBasicAuthConfig,
  isAuthorizedAdminRequest,
} from "@/lib/security/adminBasicAuth";

export function proxy(request: NextRequest) {
  const config = getAdminBasicAuthConfig();
  const requiresCredentials = process.env.NODE_ENV === "production" || config.partial;

  if (!config.enabled) {
    if (!requiresCredentials) {
      return NextResponse.next();
    }

    return new NextResponse(
      "El panel de administracion esta deshabilitado hasta configurar ADMIN_BASIC_AUTH_USER y ADMIN_BASIC_AUTH_PASSWORD.",
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }

  if (isAuthorizedAdminRequest(request.headers.get("authorization"), config)) {
    return NextResponse.next();
  }

  return new NextResponse("Autenticacion requerida.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "WWW-Authenticate": 'Basic realm="App Web Torneo Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
