import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Check, Save } from "lucide-react"
import type { Note, NoteVisibility } from "../../models/note.model"

export interface NoteFormValues {
  title: string
  content: string
  visibility: NoteVisibility
}

interface NoteEditFormProps {
  note?: Note
  loading?: boolean
  onSubmit: (values: NoteFormValues) => void | Promise<void>
  onCancel?: () => void
}

export function NoteEditForm({ note, loading = false, onSubmit, onCancel }: Readonly<NoteEditFormProps>) {
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [visibility, setVisibility] = useState<NoteVisibility>(note?.visibility ?? "private")
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>()

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setVisibility(note.visibility)
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
    await onSubmit({
      title: title.trim(),
      content,
      visibility,
    })
    setLastSavedAt(new Date().toISOString())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {title || "Modifiez votre note"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-foreground">
              <Check className="h-4 w-4" />
              {savedTime ? `Enregistrée ${savedTime}` : "Pas encore enregistrée"}
            </div>
            {note && (
              <span className="rounded-full bg-muted px-3 py-1 text-foreground">
                Mise à jour
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="secondary" className="gap-2" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button className="gap-2" onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la note"
            className="h-12 text-lg"
            disabled={loading}
          />

          <div className="flex items-center gap-3 lg:ml-auto">
            <div className="flex items-center gap-3 rounded-md border px-4 py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Visibilité</p>
                <p className="text-xs text-muted-foreground">
                  {visibility === "public" ? "Publique" : "Privée"}
                </p>
              </div>

              <Switch
                aria-label="Basculer la visibilité"
                checked={visibility === "public"}
                onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Commencez à rédiger votre note..."
          className="min-h-[360px] w-full rounded-md border border-input bg-background px-3 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        />
      </div>
    </div>
  )
}
