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
  applicationName: "Padel Tournaments",
  title: {
    default: "Padel Tournaments",
    template: "%s | Padel Tournaments",
  },
  description: "Torneos de padel, cuadros, resultados y panel.",
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
