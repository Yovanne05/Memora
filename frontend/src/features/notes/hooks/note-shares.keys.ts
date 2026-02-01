export const noteSharesKeys = {
  all: ["note-shares"] as const,
  list: (noteId: string) => [...noteSharesKeys.all, "list", noteId] as const,
  listByUser: (userId: string) =>
    [...noteSharesKeys.all, "user", userId] as const,
};
