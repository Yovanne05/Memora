import { ShareDialog } from "@/components/shared/ShareDialog";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCollectionSharing } from "../hooks/useCollectionSharing";

interface CollectionShareDialogProps {
  collectionId: string;
  collectionName: string;
  trigger?: React.ReactNode;
}

export function CollectionShareDialog({
  collectionId,
  collectionName,
  trigger,
}: CollectionShareDialogProps) {
  const { user } = useAuth();
  const { shares, isLoading, addShare, updateShare, removeShare } =
    useCollectionSharing(collectionId);

  if (!user) return null;

  return (
    <ShareDialog
      title={`Share "${collectionName}"`}
      description="Share this collection with other users"
      shares={shares}
      currentUserId={user.id}
      onAddShare={addShare}
      onUpdateShare={updateShare}
      onRemoveShare={removeShare}
      isLoading={isLoading}
      trigger={trigger}
    />
  );
}
