import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { ArrowLeft, CalendarClock, Globe, Lock, NotebookPen, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

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

import { useDeleteNoteMutation } from "../hooks/useDeleteNoteMutation"
import { useNoteQuery } from "../hooks/useNoteQuery"
import { UserDisplay } from "@/features/users/components/UserDisplay"

const formatDate = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date))

const formatDateTime = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date))

export function NoteDetailPage({ noteId }: { noteId: string }) {
    const { data: note, isLoading, isError, error } = useNoteQuery(noteId)

    const deleteNoteMutation = useDeleteNoteMutation()
    const router = useRouter()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const paragraphs = note?.content
        .split(/\n+/)
        .map((block) => block.trim())
        .filter(Boolean)

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    <Link to="/app/notes" className="hover:text-foreground">
                        Notes
                    </Link>
                    <span className="text-muted-foreground">/</span>
                    {isLoading ? (
                        <Skeleton className="h-4 w-32" />
                    ) : (
                        <span className="font-medium text-foreground">{note?.title}</span>
                    )}
                </div>

                <Card className="border border-border/70 shadow-sm">
                    <CardContent className="space-y-4 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-24" />
                                    ) : (
                                        <Badge variant="secondary" className="text-xs">
                                            Aucune collection
                                        </Badge>
                                    )}

                                    {isLoading ? (
                                        <Skeleton className="h-6 w-20" />
                                    ) : (
                                        <Badge variant="outline" className="flex items-center gap-1 text-xs capitalize">
                                            {note?.visibility === "public" ? (
                                                <Globe className="h-3.5 w-3.5" />
                                            ) : (
                                                <Lock className="h-3.5 w-3.5" />
                                            )}
                                            {note?.visibility === "public" ? "note publique" : "note privée"}
                                        </Badge>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-64" />
                                        <Skeleton className="h-4 w-80" />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                                            {note?.title}
                                        </h1>
                                        <p className="max-w-3xl text-base leading-relaxed text-muted-foreground line-clamp-3">
                                            {paragraphs?.[0] ?? ""}
                                        </p>
                                    </>
                                )}

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    {isLoading ? (
                                        <Skeleton className="h-4 w-32" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <NotebookPen className="h-4 w-4" />
                                            Propriétaire <UserDisplay userId={note?.ownerId || ""} />
                                        </span>
                                    )}

                                    <Separator orientation="vertical" className="h-4" />

                                    {isLoading ? (
                                        <Skeleton className="h-4 w-28" />
                                    ) : (
                                        <span>Créée le {note && formatDate(note.createdAt)}</span>
                                    )}

                                    <Separator orientation="vertical" className="h-4" />

                                    {isLoading ? (
                                        <Skeleton className="h-4 w-28" />
                                    ) : (
                                        <span>Mise à jour le {note && formatDate(note.updatedAt)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button className="gap-2" variant="secondary" asChild>
                                    <Link to="/app/notes/$id/edit" params={{ id: noteId }}>
                                        <Pencil className="h-4 w-4" /> Modifier la note
                                    </Link>
                                </Button>

                                {/* Delete Button + Dialog */}
                                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="gap-2"
                                            disabled={deleteNoteMutation.isPending || isLoading}
                                        >
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
                                                onClick={async () => {
                                                    await deleteNoteMutation.mutateAsync(noteId)
                                                    setIsDeleteDialogOpen(false)
                                                    router.navigate({ to: "/app/notes" })
                                                }}
                                                disabled={deleteNoteMutation.isPending}
                                            >
                                                {deleteNoteMutation.isPending ? "Suppression..." : "Supprimer"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <Card className="border border-border/70 shadow-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Contenu</CardTitle>
                        <p className="text-sm text-muted-foreground">Tous les détails de la note sélectionnée.</p>
                    </CardHeader>

                    <CardContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
                        {isLoading && (
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-4/5" />
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-5 w-3/5" />
                            </div>
                        )}

                        {isError && !isLoading && (
                            <p className="text-destructive">
                                {error?.message ?? "Impossible de charger la note."}
                            </p>
                        )}

                        {!isLoading && !isError && paragraphs?.length ? (
                            <div className="space-y-4">
                                {paragraphs.map((block, index) => (
                                    <p key={index} className="whitespace-pre-line text-foreground">
                                        {block}
                                    </p>
                                ))}
                            </div>
                        ) : null}

                        {!isLoading && !isError && !paragraphs?.length && (
                            <p className="text-muted-foreground">Aucun contenu à afficher pour cette note.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="border border-border/70 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Détails</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-4/6" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <NotebookPen className="h-4 w-4" />
                                        <span className="text-foreground">Propriétaire</span>
                                        <span className="text-muted-foreground">
                                            <UserDisplay userId={note?.ownerId || ""} />
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-foreground">Visibilité</span>
                                        <Badge variant="outline" className="capitalize">
                                            {note?.visibility === "public" ? "Publique" : "Privée"}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        <span className="text-foreground">Créée</span>
                                        <span>{note && formatDateTime(note.createdAt)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarClock className="h-4 w-4" />
                                        <span className="text-foreground">Mise à jour</span>
                                        <span>{note && formatDateTime(note.updatedAt)}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
