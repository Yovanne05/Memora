export const NOTE_LINKS_QUERY_KEYS = {
  all: ['note-links'] as const,
  lists: () => [...NOTE_LINKS_QUERY_KEYS.all, 'list'] as const,
  list: (noteId: string) => [...NOTE_LINKS_QUERY_KEYS.lists(), noteId] as const,
}
