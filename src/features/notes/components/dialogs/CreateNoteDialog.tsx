import { useState } from "react"
import { useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

export function CreateNoteDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: Readonly<CreateNoteDialogProps>) {
  const { data: collections, isLoading: loadingCollections } = useCollectionsListQuery()
  const [tagInput, setTagInput] = useState("")

  const form = useForm<NoteCreateFormInput>({
    resolver: zodResolver(noteCreateFormSchema),
    defaultValues: {
      title: "",
      collectionId: null,
      visibility: "private",
      tags: [],
    },
  })

  const tags = form.watch("tags")
  const titleValue = form.watch("title")

  const addTag = () => {
    const value = tagInput.trim()
    if (!value) return
    if (tags.includes(value)) {
      form.setError("tags", { type: "manual", message: "Ce tag est deja ajoute" })
      return
    }
    const nextTags = [...tags, value]
    form.setValue("tags", nextTags)
    form.clearErrors("tags")
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    const nextTags = tags.filter((t) => t !== tag)
    form.setValue("tags", nextTags)
  }

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      collectionId: values.collectionId ?? null,
      visibility: values.visibility,
      tags: values.tags,
    })
    form.reset()
    setTagInput("")
  })

  const isFormDisabled = submitting || form.formState.isSubmitting

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          form.reset()
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

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la note</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="note-title"
                      disabled={isFormDisabled}
                      placeholder="Ex. Cours de SQL - Chapitre 1"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                      disabled={isFormDisabled || loadingCollections}
                    >
                      <SelectTrigger id="note-collection" className="w-full">
                        <SelectValue placeholder="Choisir une collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune collection</SelectItem>
                        {(collections as Collection[] | undefined)?.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibilite</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(val: NoteVisibility) => field.onChange(val)}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger id="note-visibility" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Privee</SelectItem>
                        <SelectItem value="public">Publique</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags (optionnel)</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Input
                        id="note-tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        placeholder="SQL, bases de donnees, chapitre 1"
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="inline-flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              aria-label={`Supprimer le tag ${tag}`}
                              className="rounded-full p-1 transition hover:bg-muted-foreground/10 disabled:opacity-60"
                              onClick={() => removeTag(tag)}
                              disabled={isFormDisabled}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} disabled={isFormDisabled}>
                Annuler
              </Button>
              <Button type="submit" disabled={isFormDisabled || !titleValue.trim()}>
                {submitting ? "Creation..." : "Creer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
