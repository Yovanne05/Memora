import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Check, Save, Trash2, X } from "lucide-react"
import { useCollectionsListQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { Collection } from "@/features/collections/models/collection.model"
import type { Note, NoteVisibility } from "../../models/note.model"
import { noteEditFormSchema, type NoteEditFormInput } from "../../schemas/note.schema"

export interface NoteFormValues {
  title: string
  content: string
  visibility: NoteVisibility
  collectionId: string | null
  tags: string[]
}

interface NoteEditFormProps {
  note?: Note
  loading?: boolean
  onSubmit: (values: NoteFormValues) => void | Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  deleteLoading?: boolean
}

export function NoteEditForm({
  note,
  loading = false,
  onSubmit,
  onCancel,
  onDelete,
  deleteLoading = false,
}: Readonly<NoteEditFormProps>) {
  const [tagInput, setTagInput] = useState("")
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(note?.updatedAt)
  const { data: collections, isLoading: loadingCollections } = useCollectionsListQuery()

  const form = useForm<NoteEditFormInput>({
    resolver: zodResolver(noteEditFormSchema),
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
      visibility: note?.visibility ?? "private",
      collectionId: note?.collectionId ?? null,
      tags: note?.tags ?? [],
    },
  })

  useEffect(() => {
    form.reset({
      title: note?.title ?? "",
      content: note?.content ?? "",
      visibility: note?.visibility ?? "private",
      collectionId: note?.collectionId ?? null,
      tags: note?.tags ?? [],
    })
    setLastSavedAt(note?.updatedAt)
    setTagInput("")
  }, [note, form])

  const tags = form.watch("tags")

  const savedTime = useMemo(() => {
    if (!lastSavedAt) return null
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(lastSavedAt))
  }, [lastSavedAt])

  const addTag = () => {
    const value = tagInput.trim()
    if (!value) return
    if (tags.includes(value)) {
      form.setError("tags", { type: "manual", message: "Ce tag est deja ajoute" })
      return
    }
    form.setValue("tags", [...tags, value])
    form.clearErrors("tags")
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    form.setValue("tags", tags.filter((t) => t !== tag))
  }

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      content: values.content,
      visibility: values.visibility,
      collectionId: values.collectionId ?? null,
      tags: values.tags,
    })
    setLastSavedAt(new Date().toISOString())
  })

  const isFormDisabled = loading || form.formState.isSubmitting

  return (
  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        <Card className="border border-border/70 shadow-sm">
          <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-foreground">
                <Check className="h-4 w-4" />
                <span className="font-medium">
                  {savedTime ? `Enregistree ${savedTime}` : "Pas encore enregistree"}
                </span>
              </div>
              {note && (
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mise a jour
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  onClick={onCancel}
                  disabled={isFormDisabled}
                >
                  Annuler
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  onClick={onDelete}
                  disabled={deleteLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteLoading ? "Suppression..." : "Supprimer"}
                </Button>
              )}
              <Button className="gap-2" type="submit" disabled={isFormDisabled}>
                <Save className="h-4 w-4" />
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Card className="border border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Contenu de la note</CardTitle>
              <CardDescription>Retouchez le titre et le corps de votre note.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="note-title"
                        placeholder="Titre de la note"
                        className="h-12 text-lg"
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        id="note-content"
                        placeholder="Commencez a rediger votre note..."
                        className="min-h-[360px] w-full rounded-lg border border-input bg-background px-3 py-3 text-base leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Parametres</CardTitle>
              <CardDescription>Collection, tags et visibilite.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
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
                        <SelectTrigger id="note-collection">
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
                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {field.value === "public" ? "Publique" : "Privee"}
                        </p>
                        <p className="text-xs text-muted-foreground">Basculer la visibilite de la note.</p>
                      </div>
                      <FormControl>
                        <Switch
                          id="note-visibility"
                          aria-label="Basculer la visibilite"
                          checked={field.value === "public"}
                          onCheckedChange={(checked) => field.onChange(checked ? "public" : "private")}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        id="note-tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Tab") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        placeholder="SQL, avance..."
                        disabled={isFormDisabled}
                      />
                    </FormControl>
                    <FormMessage />
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
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  )
}
