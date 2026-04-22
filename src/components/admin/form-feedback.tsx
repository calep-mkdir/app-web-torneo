"use client";

import { Loader2 } from "lucide-react";

import { Badge, Button } from "@/components/ui";
import type { AdminActionState } from "@/features/admin/types";

export function FormFeedback({ state }: { state: AdminActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <div className="mb-4">
      <Badge variant={state.status === "success" ? "success" : "destructive"}>
        {state.message}
      </Badge>
    </div>
  );
}

export function FieldErrorText({
  errors,
  name,
}: {
  errors: Record<string, string[]>;
  name: string;
}) {
  const fieldErrors = errors[name];
  if (!fieldErrors || fieldErrors.length === 0) {
    return null;
  }

  return <p className="mt-1 text-xs text-rose-600">{fieldErrors[0]}</p>;
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
