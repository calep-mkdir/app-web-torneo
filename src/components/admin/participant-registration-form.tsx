"use client";

import { useActionState } from "react";

import { registerParticipantAction } from "@/features/admin/actions";
import { initialAdminActionState, type TournamentCategoryRecord } from "@/features/admin/types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select } from "@/components/ui";

import { FieldErrorText, FormFeedback } from "./form-feedback";

export function ParticipantRegistrationForm({
  categories,
}: {
  categories: TournamentCategoryRecord[];
}) {
  const [state, formAction, pending] = useActionState(
    registerParticipantAction,
    initialAdminActionState,
  );
  const hasCategories = categories.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anadir participante</CardTitle>
        <CardDescription>
          Crea el participante y lo registra directamente en una categoria.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormFeedback state={state} />

          {!hasCategories ? (
            <p className="text-sm text-muted-foreground">
              Antes de registrar participantes debes crear al menos una categoria.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <Select id="categoryId" name="categoryId" defaultValue={categories[0]?.id}>
              <option value="">Selecciona una categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <FieldErrorText errors={state.fieldErrors} name="categoryId" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre visible</Label>
            <Input id="displayName" name="displayName" placeholder="Carlos Perez" />
            <FieldErrorText errors={state.fieldErrors} name="displayName" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="countryCode">Pais</Label>
              <Input id="countryCode" name="countryCode" placeholder="ES" maxLength={2} />
              <FieldErrorText errors={state.fieldErrors} name="countryCode" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed</Label>
              <Input id="seed" name="seed" type="number" min={1} />
              <FieldErrorText errors={state.fieldErrors} name="seed" />
            </div>
          </div>

          <Button type="submit" disabled={pending || !hasCategories}>
            {pending ? "Guardando..." : "Registrar participante"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
