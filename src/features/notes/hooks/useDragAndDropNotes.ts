import type {
  DragEndEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core'
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import type { Note } from '../models/note.model'

export interface DraggedNoteData {
  note: Note
}

export interface DroppableCollectionData {
  collectionId: string | null
  collectionName: string | null
}

export function useDragAndDropNotes(
  onDrop: (noteId: string, targetCollectionId: string | null) => void
) {
  const [activeNote, setActiveNote] = useState<Note | null>(null)

  const sensors: SensorDescriptor<SensorOptions>[] = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts (prevents accidental drags on click)
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedData = active.data.current as DraggedNoteData | undefined

    if (draggedData?.note) {
      setActiveNote(draggedData.note)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveNote(null)

    if (!over) {
      return
    }

    const draggedData = active.data.current as DraggedNoteData | undefined
    const droppableData = over.data.current as
      | DroppableCollectionData
      | undefined

    if (!draggedData?.note) {
      return
    }

    const noteId = draggedData.note.id
    const currentCollectionId = draggedData.note.collectionId
    const targetCollectionId = droppableData?.collectionId ?? null

    // Don't do anything if dropped on same collection
    if (currentCollectionId === targetCollectionId) {
      return
    }

    onDrop(noteId, targetCollectionId)
  }

  const handleDragCancel = () => {
    setActiveNote(null)
  }

  return {
    activeNote,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}
