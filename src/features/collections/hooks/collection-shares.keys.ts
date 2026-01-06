export const collectionSharesKeys = {
  all: ["collection-shares"] as const,
  list: (collectionId: string) =>
    [...collectionSharesKeys.all, "list", collectionId] as const,
};
