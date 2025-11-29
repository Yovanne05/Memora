import { useCallback, useMemo, useState } from "react";
import type { Collection } from "../models/collection.model";
import type { CollectionsSort, CollectionsTab } from "../lib/collections-query";
import { applyCollectionsQuery } from "../lib/collections-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  useCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} from "@/features/collections/hooks/useAllCollectionsQuery";
import type { CollectionFormValues } from "../components/forms/CollectionEditForm";

export function useCollectionsManager() {
  const { userId } = useCurrentUser();

  // UI State
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<CollectionsTab>("mine");
  const [sort, setSort] = useState<CollectionsSort>("recent");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  // React Query hooks with callbacks
  const collectionsQuery = useCollectionsQuery();
  const createMutation = useCreateCollectionMutation({
    onSuccess: () => setCreateOpen(false),
  });
  const updateMutation = useUpdateCollectionMutation({
    onSuccess: () => setEditing(null),
  });
  const deleteMutation = useDeleteCollectionMutation({
    onSuccess: () => setDeleteTarget(null),
  });

  // Filtered collections
  const filtered = useMemo(() => {
    if (!userId || !collectionsQuery.data) return [];
    return applyCollectionsQuery(collectionsQuery.data, {
      currentUserId: userId,
      tab,
      search,
      sort,
    });
  }, [collectionsQuery.data, search, sort, tab, userId]);

  // Handlers with useCallback
  const handleCreate = useCallback(
    async (values: CollectionFormValues) => {
      if (!userId) return;
      await createMutation.mutateAsync({
        ownerId: userId,
        name: values.name,
        description: values.description,
        visibility: values.visibility,
      });
    },
    [userId, createMutation]
  );

  const handleEdit = useCallback(
    async (values: CollectionFormValues) => {
      if (!editing) return;
      await updateMutation.mutateAsync({
        id: editing.id,
        data: {
          name: values.name,
          description: values.description,
          visibility: values.visibility,
        },
      });
    },
    [editing, updateMutation]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);

  return {
    collections: filtered,
    loading: collectionsQuery.isPending,
    error: collectionsQuery.error,

    filters: {
      search,
      setSearch,
      tab,
      setTab,
      sort,
      setSort,
    },

    create: {
      isOpen: createOpen,
      open: () => setCreateOpen(true),
      close: () => setCreateOpen(false),
      submit: handleCreate,
      loading: createMutation.isPending,
      error: createMutation.error,
    },

    edit: {
      target: editing,
      open: setEditing,
      close: () => setEditing(null),
      submit: handleEdit,
      loading: updateMutation.isPending,
      error: updateMutation.error,
    },

    deletion: {
      target: deleteTarget,
      open: setDeleteTarget,
      close: () => {
        setDeleteTarget(null);
        deleteMutation.reset();
      },
      confirm: handleDelete,
      loading: deleteMutation.isPending,
      error: deleteMutation.error,
    },

    refetch: collectionsQuery.refetch,
  };
}
