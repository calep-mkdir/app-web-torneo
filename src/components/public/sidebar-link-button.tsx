"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export function SidebarLinkButton({
  href,
  variant = "secondary",
  className,
  children,
}: {
  href: Route;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        variant === "primary" ? "app-cta-primary" : "app-cta-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}
