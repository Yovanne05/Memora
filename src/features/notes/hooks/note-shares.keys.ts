export const noteSharesKeys = {
  all: ["note-shares"] as const,
  list: (noteId: string) => [...noteSharesKeys.all, "list", noteId] as const,
};
