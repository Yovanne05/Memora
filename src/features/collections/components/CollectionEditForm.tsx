import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CollectionVisibility } from "../models/collection.model"
import { collectionFormSchema, type CollectionFormInput } from "../schemas/collection.schema"

export interface CollectionFormValues {
  name: string
  description?: string | null
  visibility: CollectionVisibility
}

interface CollectionEditFormProps {
  mode: "create" | "edit"
  initial?: CollectionFormValues
  loading?: boolean
  onSubmit: (values: CollectionFormValues) => void
  onCancel?: () => void
}

export function CollectionEditForm({
  mode,
  initial,
  loading = false,
  onSubmit,
  onCancel,
}: CollectionEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CollectionFormInput>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? null,
      visibility: initial?.visibility ?? "private",
    },
  })

  const formKey = useMemo(
    () =>
      initial
        ? `${initial.name ?? ""}-${initial.description ?? ""}-${initial.visibility}-${mode}`
        : `create-${mode}`,
    [initial, mode]
  )

  const nameValue = watch("name")
  const visibilityValue = watch("visibility")

  const handleFormSubmit = (data: CollectionFormInput) => {
    onSubmit({
      name: data.name,
      description: data.description ?? undefined,
      visibility: data.visibility,
    })
  }

  const isEdit = mode === "edit"
  const isFormDisabled = loading || isSubmitting

  return (
    <form key={formKey} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="collection-name">Nom de la collection</Label>
        <Input
          id="collection-name"
          placeholder="ex. Fondamentaux de l'informatique"
          disabled={isFormDisabled}
          {...register("name")}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <span id="name-error" className="text-sm text-red-500" role="alert">
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="collection-description">Description</Label>
        <textarea
          id="collection-description"
          rows={3}
          className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Décrivez l'objectif de cette collection..."
          disabled={isFormDisabled}
          {...register("description")}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && (
          <span id="description-error" className="text-sm text-red-500" role="alert">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label>Visibilité</Label>
        <Select
          disabled={isFormDisabled}
          value={visibilityValue}
          onValueChange={(v) => setValue("visibility", v as CollectionVisibility)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir la visibilité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Privée</SelectItem>
            <SelectItem value="public">Publique</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">
          Les collections privées ne sont visibles que par vous. Les collections publiques peuvent être partagées.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isFormDisabled}
          >
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isFormDisabled || !nameValue.trim()}>
          {isEdit ? "Enregistrer les modifications" : "Enregistrer la collection"}
        </Button>
      </div>
    </form>
  )
}
