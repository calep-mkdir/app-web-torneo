"use client";

import { useActionState } from "react";

import { createCategoryAction } from "@/features/admin/actions";
import { initialAdminActionState } from "@/features/admin/types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select } from "@/components/ui";

import { FieldErrorText, FormFeedback } from "./form-feedback";

export function CategoryForm({ tournamentId }: { tournamentId: string }) {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    initialAdminActionState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva categoria</CardTitle>
        <CardDescription>
          Crea niveles, divisiones o cuadros para organizar mejor el torneo de pádel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tournamentId" value={tournamentId} />
          <FormFeedback state={state} />

          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre</Label>
            <Input id="category-name" name="name" placeholder="Mixto nivel 3" />
            <FieldErrorText errors={state.fieldErrors} name="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input id="category-slug" name="slug" placeholder="mixto-nivel-3" />
            <FieldErrorText errors={state.fieldErrors} name="slug" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select id="format" name="format" defaultValue="group_to_knockout">
                <option value="group_only">Fase de grupos</option>
                <option value="knockout_only">Eliminatoria</option>
                <option value="group_to_knockout">Grupos + knockout</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxEntries">Maximo de inscripciones</Label>
              <Input id="maxEntries" name="maxEntries" type="number" min={1} />
              <FieldErrorText errors={state.fieldErrors} name="maxEntries" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gender">Genero</Label>
              <Input id="gender" name="gender" placeholder="Masculino / Femenino / Mixto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Grupo de edad</Label>
              <Input id="ageGroup" name="ageGroup" placeholder="Sub-18 / Senior" />
            </div>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Creando..." : "Crear categoria"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
