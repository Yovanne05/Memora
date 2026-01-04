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
import { Input } from "@/components/ui/input"
import { TagInput } from "@/components/ui/tag-input"
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
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { NoteVisibility } from "../../models/note.model"
import { noteCreateFormSchema, type NoteCreateFormInput } from "../../schemas/note.schema"
import { RichTextEditor } from "@/components/editor/RichTextEditor"

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
  const { data: collectionsData, isLoading: loadingCollections } = useCollectionsQuery()
  const collections = collectionsData?.items ?? []

  const form = useForm<NoteCreateFormInput>({
    resolver: zodResolver(noteCreateFormSchema),
    defaultValues: {
      title: "",
      collectionId: null,
      visibility: "private",
      tags: [],
    },
  })

  const titleValue = form.watch("title")

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      collectionId: values.collectionId ?? null,
      visibility: values.visibility,
      tags: values.tags,
    })
    form.reset()
  })

  const isFormDisabled = submitting || form.formState.isSubmitting

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          form.reset()
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
                        {collections.map((collection) => (
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optionnel)</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Ajouter des tags (Entrée ou virgule pour valider)"
                      maxTags={20}
                      disabled={isFormDisabled}
                      error={form.formState.errors.tags?.message}
                    />
                  </FormControl>
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
