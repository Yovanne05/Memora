export const collectionSharesKeys = {
  all: ["collection-shares"] as const,
  list: (collectionId: string) =>
    [...collectionSharesKeys.all, "list", collectionId] as const,
  listByUser: (userId: string) =>
    [...collectionSharesKeys.all, "user", userId] as const,
};
