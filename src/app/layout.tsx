import type { Metadata } from "next";

import { getOptionalSiteUrl } from "@/lib/env/server";

import "./globals.css";

const siteUrl = getOptionalSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "App Web Torneo",
  title: {
    default: "App Web Torneo",
    template: "%s | App Web Torneo",
  },
  description: "Gestiona torneos y publica cuadros, participantes y partidos en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
