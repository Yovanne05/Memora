import { useMemo, useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Check, FileText, Save, Trash2 } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import { useNoteQuery } from "@/features/notes/hooks/useNoteQuery"
import { useDeleteNoteMutation } from "@/features/notes/hooks/useDeleteNoteMutation"
import type { Note } from "@/features/notes/models/note.model"

interface NoteEditPageProps {
    noteId: string
}

function formatTime(dateString?: string) {
    if (!dateString) return "--:--"
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateString))
}

export function NoteEditPage({ noteId }: NoteEditPageProps) {
    const { data: note } = useNoteQuery(noteId)
    const updateNoteMutation = useUpdateNoteMutation()
    const deleteNoteMutation = useDeleteNoteMutation()
    const router = useRouter()

    const [title, setTitle] = useState<string | undefined>()
    const [content, setContent] = useState<string | undefined>()
    const [visibility, setVisibility] = useState<Note["visibility"] | undefined>()
    const [lastSavedAt, setLastSavedAt] = useState<string | undefined>()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const currentTitle = title ?? note?.title ?? ""
    const currentContent = content ?? note?.content ?? ""
    const currentVisibility = visibility ?? note?.visibility ?? "private"

    const savedTime = useMemo(() => formatTime(lastSavedAt ?? note?.updatedAt), [note, lastSavedAt])

    const handleSave = async () => {
        if (!noteId) return

        await updateNoteMutation.mutateAsync({
            noteId,
            payload: {
                title: currentTitle,
                content: currentContent,
                visibility: currentVisibility,
            },
        })

        setLastSavedAt(new Date().toISOString())
    }

    const handleDelete = async () => {
        if (!noteId) return

        await deleteNoteMutation.mutateAsync(noteId)
        setIsDeleteDialogOpen(false)
        router.navigate({ to: "/app/notes" })
    }

    return (
        <div className="space-y-6 p-6">
            <header className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        to="/app/notes"
                        className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-foreground hover:text-foreground"
                    >
                        <FileText className="h-4 w-4" /> Notes
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-foreground">Modifier la note</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight">{currentTitle || "Modifiez votre note"}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-foreground">
                                <Check className="h-4 w-4" /> Enregistrée {savedTime}
                            </div>
                            <span className="rounded-full bg-muted px-3 py-1 text-foreground">Mise à jour</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" className="gap-2" asChild>
                            <Link to="/app/notes/$id" params={{ id: noteId }}>
                                Annuler
                            </Link>
                        </Button>

                        {/* DELETE BUTTON + MODAL */}
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2" disabled={deleteNoteMutation.isPending}>
                                    <Trash2 className="h-4 w-4" /> Supprimer
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer la note</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est définitive. La note sera supprimée de façon permanente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={deleteNoteMutation.isPending}>
                                        Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={deleteNoteMutation.isPending}
                                    >
                                        {deleteNoteMutation.isPending ? "Suppression..." : "Supprimer"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button className="gap-2" onClick={handleSave} disabled={updateNoteMutation.isPending}>
                            <Save className="h-4 w-4" /> Enregistrer
                        </Button>
                    </div>
                </div>
            </header>

            <Card className="shadow-sm">
                <CardContent className="space-y-6 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <Input
                            value={currentTitle}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titre de la note"
                            className="h-12 text-lg"
                        />

                        <div className="flex items-center gap-3 lg:ml-auto">
                            <div className="flex items-center gap-3 rounded-md border px-4 py-2">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">Visibilité</p>
                                    <p className="text-xs text-muted-foreground">
                                        {currentVisibility === "public" ? "Publique" : "Privée"}
                                    </p>
                                </div>

                                <Switch
                                    aria-label="Basculer la visibilité"
                                    checked={currentVisibility === "public"}
                                    onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
                                />
                            </div>
                        </div>
                    </div>

                    <textarea
                        value={currentContent}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Commencez à rédiger votre note..."
                        className="min-h-[360px] w-full rounded-md border border-input bg-background px-3 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
