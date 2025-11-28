import { useState } from "react"
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
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [visibility, setVisibility] = useState<CollectionVisibility>(
    initial?.visibility ?? "private"
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      description: description?.trim() || undefined,
      visibility,
    })
  }

  const isEdit = mode === "edit"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="collection-name">Collection name</Label>
        <Input
          id="collection-name"
          placeholder="e.g. Computer Science Fundamentals"
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
          placeholder="Describe what this collection is about…"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label>Visibility</Label>
        <Select
          disabled={loading}
          value={visibility}
          onValueChange={(v) => setVisibility(v as CollectionVisibility)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">
          Private collections are only visible to you. Public ones can be shared.
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
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !name.trim()}>
          {isEdit ? "Save changes" : "Save collection"}
        </Button>
      </div>
    </form>
  )
}
