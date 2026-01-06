import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ShareForm } from "./ShareForm";
import { ShareList } from "./ShareList";
import type { User } from "@/features/users/models/user.model";
import type { SharePermission } from "@/features/notes/dtos/note-share.dto";

interface Share {
  userId: string;
  permission: SharePermission;
  createdAt: Date;
}

interface ShareDialogProps {
  title: string;
  description?: string;
  shares: Share[];
  currentUserId: string;
  onAddShare: (userId: string, permission: SharePermission) => Promise<void>;
  onUpdateShare: (userId: string, permission: SharePermission) => Promise<void>;
  onRemoveShare: (userId: string) => Promise<void>;
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ShareDialog({
  title,
  description,
  shares,
  currentUserId,
  onAddShare,
  onUpdateShare,
  onRemoveShare,
  isLoading,
  open,
  onOpenChange,
  trigger,
}: Readonly<ShareDialogProps>) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permission, setPermission] = useState<SharePermission>("read");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const excludedUserIds = [
    currentUserId,
    ...shares.map((share) => share.userId),
  ];

  const handleAddShare = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await onAddShare(selectedUser.id, permission);
      setSelectedUser(null);
      setPermission("read");
      toast.success("User added successfully");
    } catch {
      toast.error("Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermission = async (
    userId: string,
    newPermission: SharePermission
  ) => {
    try {
      await onUpdateShare(userId, newPermission);
      toast.success("Permission updated");
    } catch {
      toast.error("Failed to update permission");
    }
  };

  const handleRemoveShare = async (userId: string) => {
    try {
      await onRemoveShare(userId);
      toast.success("User removed");
    } catch {
      toast.error("Failed to remove user");
    }
  };

  return (
    <>
      {trigger !== undefined && (
        <Dialog>
          <DialogTrigger asChild>
            {trigger || (
              <Button variant="outline" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>

            <div className="space-y-4">
              <ShareForm
                selectedUser={selectedUser}
                permission={permission}
                excludedUserIds={excludedUserIds}
                isLoading={isLoading || isSubmitting}
                onUserChange={setSelectedUser}
                onPermissionChange={setPermission}
                onSubmit={handleAddShare}
              />

              <Separator />

              <ShareList
                shares={shares}
                onUpdatePermission={handleUpdatePermission}
                onRemove={handleRemoveShare}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {trigger === undefined && (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
          <DialogContent
            className="max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>

            <div className="space-y-4">
              <ShareForm
                selectedUser={selectedUser}
                permission={permission}
                excludedUserIds={excludedUserIds}
                isLoading={isLoading || isSubmitting}
                onUserChange={setSelectedUser}
                onPermissionChange={setPermission}
                onSubmit={handleAddShare}
              />

              <Separator />

              <ShareList
                shares={shares}
                onUpdatePermission={handleUpdatePermission}
                onRemove={handleRemoveShare}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
