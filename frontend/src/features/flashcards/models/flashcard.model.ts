// FlashcardAnswer Models
export interface FlashcardAnswer {
  id: string
  flashcardId: string
  answerText: string
  createdAt: Date
}

export interface FlashcardAnswerCreate {
  answerText: string
  isCorrect: boolean
}

// Flashcard Models
export interface Flashcard {
  id: string
  noteId: string
  question: string
  answers: FlashcardAnswer[]
  createdAt: Date
  updatedAt: Date
}

export interface FlashcardCreate {
  noteId: string
  question: string
  answers: FlashcardAnswerCreate[]
}

export interface FlashcardUpdate {
  question?: string
  answers?: FlashcardAnswerCreate[]
}

export interface FlashcardDuplicate {
  targetNoteId?: string
}
