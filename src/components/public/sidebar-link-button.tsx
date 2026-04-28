"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
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
    <Button
      type="button"
      variant={variant === "primary" ? "default" : "secondary"}
      onClick={() => router.push(href)}
      className={cn(
        className,
      )}
    >
      {children}
    </Button>
  );
}
