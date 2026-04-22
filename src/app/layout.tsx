import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";

import { getOptionalSiteUrl } from "@/lib/env/server";

import "./globals.css";

const siteUrl = getOptionalSiteUrl();
const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "App Web Torneo",
  title: {
    default: "App Web Torneo",
    template: "%s | App Web Torneo",
  },
  description:
    "Plataforma multipagina para organizar torneos, publicar cuadros y seguir competiciones con una experiencia alegre, deportiva y responsive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
