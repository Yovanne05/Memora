import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharePermissionSelect } from "./SharePermissionSelect";
import type { SharePermission } from "@/features/notes/dtos/note-share.dto";

interface ShareListItemProps {
  userId: string;
  permission: SharePermission;
  onUpdatePermission: (userId: string, permission: SharePermission) => void;
  onRemove: (userId: string) => void;
}

export function ShareListItem({
  userId,
  permission,
  onUpdatePermission,
  onRemove,
}: ShareListItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-2">
      <div className="flex-1 truncate text-sm">{userId}</div>
      <div className="flex items-center gap-2">
        <SharePermissionSelect
          value={permission}
          onChange={(newPermission) => onUpdatePermission(userId, newPermission)}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(userId)}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
