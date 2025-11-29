import { useMemo, useState, type FormEvent } from "react"
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
  const [name, setName] = useState<string>(initial?.name ?? "")
  const [description, setDescription] = useState<string>(initial?.description ?? "")
  const [visibility, setVisibility] = useState<CollectionVisibility>(
    initial?.visibility ?? "private"
  )

  const formKey = useMemo(
    () =>
      initial
        ? `${initial.name ?? ""}-${initial.description ?? ""}-${initial.visibility}-${mode}`
        : `create-${mode}`,
    [initial, mode]
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const trimmedDescription = description.trim()

    onSubmit({
      name: trimmedName,
      description: trimmedDescription ? trimmedDescription : undefined,
      visibility,
    })
  }

  const isEdit = mode === "edit"

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="collection-name">Nom de la collection</Label>
        <Input
          id="collection-name"
          placeholder="ex. Fondamentaux de l'informatique"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="collection-description">Description</Label>
        <textarea
          id="collection-description"
          rows={3}
          className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Décrivez l'objectif de cette collection..."
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label>Visibilité</Label>
        <Select
          disabled={loading}
          value={visibility}
          onValueChange={(v) => setVisibility(v as CollectionVisibility)}
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
            disabled={loading}
          >
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={loading || !name.trim()}>
          {isEdit ? "Enregistrer les modifications" : "Enregistrer la collection"}
        </Button>
      </div>
    </form>
  )
}
