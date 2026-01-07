import { useState } from "react"

import type { Flashcard } from "../models/flashcard.model"
import { FlashcardAnswersList } from "./flashcard-viewer/FlashcardAnswersList"
import { FlashcardResult } from "./flashcard-viewer/FlashcardResult"
import { FlashcardViewerActions } from "./flashcard-viewer/FlashcardViewerActions"

interface FlashcardViewerProps {
  readonly flashcard: Flashcard
  readonly onClose?: () => void
}

export function FlashcardViewer({
  flashcard,
  onClose,
}: Readonly<FlashcardViewerProps>) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const correctAnswer = flashcard.answers.find((answer) => answer.isCorrect)
  const isCorrect = selectedAnswerId === correctAnswer?.id

  const handleAnswerClick = (answerId: string) => {
    if (!showResult) {
      setSelectedAnswerId(answerId)
      setShowResult(true)
    }
  }

  const handleReset = () => {
    setSelectedAnswerId(null)
    setShowResult(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-base font-semibold mb-4">{flashcard.question}</h3>

        <FlashcardAnswersList
          answers={flashcard.answers}
          selectedAnswerId={selectedAnswerId}
          showResult={showResult}
          onSelect={handleAnswerClick}
        />

        {showResult && (
          <FlashcardResult
            isCorrect={isCorrect}
            correctAnswer={correctAnswer}
          />
        )}
      </div>

      <FlashcardViewerActions
        showResult={showResult}
        onReset={handleReset}
        onClose={onClose}
      />
    </div>
  )
}
