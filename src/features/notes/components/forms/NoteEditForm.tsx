import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, Save, Trash2, X } from "lucide-react"
import { useCollectionsListQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { Collection } from "@/features/collections/models/collection.model"
import type { Note, NoteVisibility } from "../../models/note.model"

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
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [visibility, setVisibility] = useState<NoteVisibility>(note?.visibility ?? "private")
  const [collectionId, setCollectionId] = useState<string | null>(note?.collectionId ?? null)
  const [tagsInput, setTagsInput] = useState("")
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>()
  const { data: collections, isLoading: loadingCollections } = useCollectionsListQuery()

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setVisibility(note.visibility)
      setCollectionId(note.collectionId)
      setTags(note.tags)
      setLastSavedAt(note.updatedAt)
    }
  }, [note])

  const savedTime = useMemo(() => {
    if (!lastSavedAt) return null
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(lastSavedAt))
  }, [lastSavedAt])

  const handleSubmit = async () => {
    if (!title.trim()) return
    await onSubmit({
      title: title.trim(),
      content,
      visibility,
      collectionId,
      tags,
    })
    setLastSavedAt(new Date().toISOString())
  }

  const addTag = () => {
    const value = tagsInput.trim()
    if (!value || tags.includes(value)) return
    setTags((prev) => [...prev, value])
    setTagsInput("")
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  return (
    <div className="space-y-6">
      <Card className="border border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-foreground">
              <Check className="h-4 w-4" />
              <span className="font-medium">
                {savedTime ? `Enregistrée ${savedTime}` : "Pas encore enregistrée"}
              </span>
            </div>
            {note && (
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mise à jour
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onCancel && (
              <Button
                variant="secondary"
                className="gap-2"
                onClick={onCancel}
                disabled={loading}
              >
                Annuler
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                className="gap-2"
                onClick={onDelete}
                disabled={deleteLoading}
              >
                <Trash2 className="h-4 w-4" />
                {deleteLoading ? "Suppression..." : "Supprimer"}
              </Button>
            )}
            <Button className="gap-2" onClick={handleSubmit} disabled={loading}>
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
            <div className="space-y-2">
              <Label htmlFor="note-title">Titre</Label>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la note"
                className="h-12 text-lg"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-content">Contenu</Label>
              <textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Commencez à rédiger votre note..."
                className="min-h-[360px] w-full rounded-lg border border-input bg-background px-3 py-3 text-base leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Paramètres</CardTitle>
            <CardDescription>Collection, tags et visibilité.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-collection">Collection</Label>
              <Select
                value={collectionId ?? "none"}
                onValueChange={(val) => setCollectionId(val === "none" ? null : val)}
                disabled={loading || loadingCollections}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-visibility">Visibilité</Label>
              <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    {visibility === "public" ? "Publique" : "Privée"}
                  </p>
                  <p className="text-xs text-muted-foreground">Basculer la visibilité de la note.</p>
                </div>
                <Switch
                  id="note-visibility"
                  aria-label="Basculer la visibilité"
                  checked={visibility === "public"}
                  onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-tags">Tags</Label>
              <Input
                id="note-tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="SQL, avancé..."
                disabled={loading}
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
                        onClick={() => removeTag(tag)}
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
