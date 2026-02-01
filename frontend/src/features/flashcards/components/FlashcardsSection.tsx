import { useState } from "react"

import { Separator } from "@/components/ui/separator"
import { useCreateFlashcardMutation } from "../hooks/useCreateFlashcardMutation"
import { useFlashcardsByNoteQuery } from "../hooks/useFlashcardsByNoteQuery"
import type { FlashcardEditForm } from "../schemas/flashcard.schema"
import { FlashcardList } from "./FlashcardList"
import { FlashcardCreatePanel } from "./flashcards-section/FlashcardCreatePanel"
import { FlashcardsEmpty } from "./flashcards-section/FlashcardsEmpty"
import { FlashcardsError } from "./flashcards-section/FlashcardsError"
import { FlashcardsLoading } from "./flashcards-section/FlashcardsLoading"
import { FlashcardsSectionHeader } from "./flashcards-section/FlashcardsSectionHeader"

interface FlashcardsSectionProps {
  readonly noteId: string
}

export function FlashcardsSection({ noteId }: Readonly<FlashcardsSectionProps>) {
  const [isCreating, setIsCreating] = useState(false)

  const { data: flashcards = [], isLoading, isError } = useFlashcardsByNoteQuery(noteId)
  const createMutation = useCreateFlashcardMutation({
    onSuccess: () => setIsCreating(false),
  })

  const handleCreateFlashcard = async (data: FlashcardEditForm) => {
    await createMutation.mutateAsync({
      noteId: data.noteId,
      question: data.question,
      answers: data.answers,
    })
  }

  return (
    <>
      <Separator />

      <div className="space-y-4">
        <FlashcardsSectionHeader
          count={flashcards.length}
          isCreating={isCreating}
          onStartCreate={() => setIsCreating(true)}
        />

        {isLoading && <FlashcardsLoading />}
        {isError && <FlashcardsError />}

        {!isLoading && !isError && flashcards.length === 0 && !isCreating && (
          <FlashcardsEmpty onStartCreate={() => setIsCreating(true)} />
        )}

        {!isLoading && !isError && flashcards.length > 0 && !isCreating && (
          <FlashcardList flashcards={flashcards} />
        )}

        {isCreating && (
          <FlashcardCreatePanel
            noteId={noteId}
            onSubmit={handleCreateFlashcard}
            onCancel={() => setIsCreating(false)}
            isSubmitting={createMutation.isPending}
          />
        )}
      </div>
    </>
  )
}
