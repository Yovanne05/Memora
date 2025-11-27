import type { Collection } from "../types"

function iso(date: string) {
  return new Date(date).toISOString()
}

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    ownerId: "user-1",
    name: "Computer Science Fundamentals",
    description: "Core CS concepts and algorithms",
    visibility: "private",
    createdAt: iso("2024-11-22"),
    updatedAt: iso("2024-11-22"),
    notesCount: 42,
    collaboratorsCount: 3,
  },
  {
    id: "col-2",
    ownerId: "user-1",
    name: "Mathematics for ML",
    description: "Mathematical foundations for machine learning",
    visibility: "private",
    createdAt: iso("2024-11-21"),
    updatedAt: iso("2024-11-21"),
    notesCount: 28,
    collaboratorsCount: 2,
  },
  {
    id: "col-3",
    ownerId: "user-1",
    name: "Web Development",
    description: "Frontend and backend development notes",
    visibility: "public",
    createdAt: iso("2024-11-20"),
    updatedAt: iso("2024-11-20"),
    notesCount: 56,
    collaboratorsCount: 1,
  },
  {
    id: "col-4",
    ownerId: "user-1",
    name: "Project Management",
    description: "Agile, Scrum, and PM best practices",
    visibility: "private",
    createdAt: iso("2024-11-18"),
    updatedAt: iso("2024-11-18"),
    notesCount: 15,
    collaboratorsCount: 0,
  },
]
