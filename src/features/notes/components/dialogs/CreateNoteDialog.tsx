import { useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCollectionsQuery } from "@/features/collections/hooks/useAllCollectionsQuery"
import type { Collection } from "@/features/collections/models/collection.model"
import type { NoteVisibility } from "../../models/note.model"
import { X } from "lucide-react"

interface CreateNoteDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onSubmit: (payload: {
    title: string
    collectionId: string | null
    visibility: NoteVisibility
    tags: string[]
  }) => Promise<void> | void
  submitting?: boolean
}

interface NoteFormState {
  title: string
  collectionId: string | null
  visibility: NoteVisibility
  tagsInput: string
  tags: string[]
}

function useCreateNoteForm() {
  const [state, setState] = useState<NoteFormState>({
    title: "",
    collectionId: null,
    visibility: "private",
    tagsInput: "",
    tags: [],
  })

  const updateField = <K extends keyof NoteFormState>(key: K, value: NoteFormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const addTag = () => {
    const value = state.tagsInput.trim()
    if (!value || state.tags.includes(value)) return
    setState((prev) => ({ ...prev, tags: [...prev.tags, value], tagsInput: "" }))
  }

  const removeTag = (tag: string) =>
    setState((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))

  const reset = () =>
    setState({
      title: "",
      collectionId: null,
      visibility: "private",
      tagsInput: "",
      tags: [],
    })

  return {
    state,
    addTag,
    removeTag,
    updateField,
    reset,
  }
}

function DialogField({
  label,
  htmlFor,
  children,
}: Readonly<{ label: string; htmlFor: string; children: ReactNode }>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function TitleField({
  value,
  disabled,
  onChange,
}: Readonly<{ value: string; disabled: boolean; onChange: (value: string) => void }>) {
  return (
    <DialogField label="Nom de la note" htmlFor="note-title">
      <Input
        id="note-title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex. Cours de SQL - Chapitre 1"
        disabled={disabled}
        autoFocus
      />
    </DialogField>
  )
}

function CollectionField({
  value,
  collections,
  disabled,
  onChange,
}: Readonly<{
  value: string | null
  collections?: Collection[]
  disabled: boolean
  onChange: (value: string | null) => void
}>) {
  return (
    <DialogField label="Collection" htmlFor="note-collection">
      <Select
        value={value ?? "none"}
        onValueChange={(val) => onChange(val === "none" ? null : val)}
        disabled={disabled}
      >
        <SelectTrigger id="note-collection" className="w-full">
          <SelectValue placeholder="Choisir une collection" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucune collection</SelectItem>
          {collections?.map((collection) => (
            <SelectItem key={collection.id} value={collection.id}>
              {collection.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </DialogField>
  )
}

function VisibilityField({
  value,
  disabled,
  onChange,
}: Readonly<{ value: NoteVisibility; disabled: boolean; onChange: (value: NoteVisibility) => void }>) {
  return (
    <DialogField label="Visibilité" htmlFor="note-visibility">
      <Select value={value} onValueChange={(val: NoteVisibility) => onChange(val)} disabled={disabled}>
        <SelectTrigger id="note-visibility" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">Privée</SelectItem>
          <SelectItem value="public">Publique</SelectItem>
        </SelectContent>
      </Select>
    </DialogField>
  )
}

function TagsField({
  value,
  tags,
  disabled,
  onChange,
  onAdd,
  onRemove,
}: Readonly<{
  value: string
  tags: string[]
  disabled: boolean
  onChange: (value: string) => void
  onAdd: () => void
  onRemove: (tag: string) => void
}>) {
  return (
    <DialogField label="Tags (optionnel)" htmlFor="note-tags">
      <div className="space-y-2">
        <Input
          id="note-tags"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onAdd()
            }
          }}
          placeholder="SQL, bases de données, chapitre 1"
          disabled={disabled}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="inline-flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  aria-label={`Supprimer le tag ${tag}`}
                  className="rounded-full p-1 transition hover:bg-muted-foreground/10 disabled:opacity-60"
                  onClick={() => onRemove(tag)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </DialogField>
  )
}

export function CreateNoteDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: Readonly<CreateNoteDialogProps>) {
  const { data: collections, isLoading: loadingCollections } = useCollectionsQuery()
  const { state, addTag, removeTag, updateField, reset } = useCreateNoteForm()

  const handleSubmit = async () => {
    const title = state.title.trim()
    if (!title) return
    await onSubmit({
      title,
      collectionId: state.collectionId,
      visibility: state.visibility,
      tags: state.tags,
    })
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) reset()
        onOpenChange(value)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle note</DialogTitle>
          <DialogDescription>Renseigne le nom, la collection et la visibilité de la note.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <TitleField value={state.title} disabled={submitting} onChange={(val) => updateField("title", val)} />

          <CollectionField
            value={state.collectionId}
            collections={collections as Collection[] | undefined}
            disabled={submitting || loadingCollections}
            onChange={(val) => updateField("collectionId", val)}
          />

          <VisibilityField
            value={state.visibility}
            disabled={submitting}
            onChange={(val) => updateField("visibility", val)}
          />

          <TagsField
            value={state.tagsInput}
            tags={state.tags}
            disabled={submitting}
            onChange={(val) => updateField("tagsInput", val)}
            onAdd={addTag}
            onRemove={removeTag}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !state.title.trim()}>
            {submitting ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
