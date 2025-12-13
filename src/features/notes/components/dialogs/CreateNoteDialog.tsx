import { useState, type ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { useCollectionsListQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { Collection } from "@/features/collections/models/collection.model"
import type { NoteVisibility } from "../../models/note.model"
import { noteCreateFormSchema, type NoteCreateFormInput } from "../../schemas/note.schema"
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
    <DialogField label="Visibilite" htmlFor="note-visibility">
      <Select value={value} onValueChange={(val: NoteVisibility) => onChange(val)} disabled={disabled}>
        <SelectTrigger id="note-visibility" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">Privee</SelectItem>
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
          placeholder="SQL, bases de donnees, chapitre 1"
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
  const { data: collections, isLoading: loadingCollections } = useCollectionsListQuery()
  const [tagInput, setTagInput] = useState("")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NoteCreateFormInput>({
    resolver: zodResolver(noteCreateFormSchema),
    defaultValues: {
      title: "",
      collectionId: null,
      visibility: "private",
      tags: [],
    },
  })

  const tags = watch("tags")
  const titleValue = watch("title")

  const addTag = () => {
    const value = tagInput.trim()
    if (!value) return
    if (tags.includes(value)) {
      setError("tags", { type: "manual", message: "Ce tag est deja ajoute" })
      return
    }
    const nextTags = [...tags, value]
    setValue("tags", nextTags)
    clearErrors("tags")
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    const nextTags = tags.filter((t) => t !== tag)
    setValue("tags", nextTags)
  }

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      collectionId: values.collectionId ?? null,
      visibility: values.visibility,
      tags: values.tags,
    })
    reset()
    setTagInput("")
  })

  const isFormDisabled = submitting || isSubmitting

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          reset()
          setTagInput("")
        }
        onOpenChange(value)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle note</DialogTitle>
          <DialogDescription>Renseigne le nom, la collection et la visibilite de la note.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <TitleField
              value={titleValue}
              disabled={isFormDisabled}
              onChange={(val) => setValue("title", val)}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Controller
              name="collectionId"
              control={control}
              render={({ field }) => (
                <CollectionField
                  value={field.value ?? null}
                  collections={collections as Collection[] | undefined}
                  disabled={isFormDisabled || loadingCollections}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.collectionId && (
              <p className="text-sm text-destructive">{errors.collectionId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <VisibilityField
                  value={field.value}
                  disabled={isFormDisabled}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.visibility && (
              <p className="text-sm text-destructive">{errors.visibility.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <TagsField
              value={tagInput}
              tags={tags}
              disabled={isFormDisabled}
              onChange={setTagInput}
              onAdd={addTag}
              onRemove={removeTag}
            />
            {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isFormDisabled}>
            Annuler
          </Button>
          <Button onClick={handleFormSubmit} disabled={isFormDisabled || !titleValue.trim()}>
            {submitting ? "Creation..." : "Creer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
