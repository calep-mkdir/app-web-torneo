"use client";

import { useActionState } from "react";

import { createStageAction, createStageRoundAction } from "@/features/admin/actions";
import { initialAdminActionState, type TournamentCategoryRecord, type TournamentStageRecord } from "@/features/admin/types";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select } from "@/components/ui";

import { FieldErrorText, FormFeedback } from "./form-feedback";

export function StageForm({
  categories,
}: {
  categories: TournamentCategoryRecord[];
}) {
  const [state, formAction, pending] = useActionState(
    createStageAction,
    initialAdminActionState,
  );
  const hasCategories = categories.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva fase</CardTitle>
        <CardDescription>
          Define si esta categoria empieza en grupos o va directa al cuadro final.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormFeedback state={state} />

          {!hasCategories ? (
            <p className="text-sm text-muted-foreground">
              Crea primero una categoria para poder definir fases.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="stage-category">Categoria</Label>
            <Select id="stage-category" name="categoryId" defaultValue={categories[0]?.id}>
              <option value="">Selecciona una categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <FieldErrorText errors={state.fieldErrors} name="categoryId" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stage-type">Tipo</Label>
              <Select id="stage-type" name="stageType" defaultValue="knockout">
                <option value="group">Grupos</option>
                <option value="knockout">Knockout</option>
              </Select>
              <FieldErrorText errors={state.fieldErrors} name="stageType" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sequenceNo">Orden</Label>
              <Input id="sequenceNo" name="sequenceNo" type="number" min={1} defaultValue={1} />
              <FieldErrorText errors={state.fieldErrors} name="sequenceNo" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage-name">Nombre</Label>
            <Input id="stage-name" name="name" placeholder="Cuadro principal" />
            <FieldErrorText errors={state.fieldErrors} name="name" />
          </div>

          <Button type="submit" disabled={pending || !hasCategories}>
            {pending ? "Creando..." : "Crear fase"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function StageRoundForm({
  stages,
}: {
  stages: TournamentStageRecord[];
}) {
  const [state, formAction, pending] = useActionState(
    createStageRoundAction,
    initialAdminActionState,
  );
  const hasStages = stages.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva ronda</CardTitle>
        <CardDescription>
          Úsala para ordenar mejor el cuadro: octavos, cuartos, semifinales o final.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormFeedback state={state} />

          {!hasStages ? (
            <p className="text-sm text-muted-foreground">
              Necesitas al menos una fase creada para poder anadir rondas.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="stageId">Fase</Label>
            <Select id="stageId" name="stageId" defaultValue={stages[0]?.id}>
              <option value="">Selecciona una fase</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </Select>
            <FieldErrorText errors={state.fieldErrors} name="stageId" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roundNo">Numero de ronda</Label>
              <Input id="roundNo" name="roundNo" type="number" min={1} defaultValue={1} />
              <FieldErrorText errors={state.fieldErrors} name="roundNo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="round-name">Nombre</Label>
              <Input id="round-name" name="name" placeholder="Semifinal" />
              <FieldErrorText errors={state.fieldErrors} name="name" />
            </div>
          </div>

          <Button type="submit" disabled={pending || !hasStages}>
            {pending ? "Creando..." : "Crear ronda"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
