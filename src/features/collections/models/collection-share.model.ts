import type { SharePermission } from "../dtos/collection-share.dto";

export interface CollectionShare {
  collectionId: string;
  userId: string;
  permission: SharePermission;
  createdAt: Date;
}

export interface CollectionShareCreate {
  userId: string;
  permission: SharePermission;
}

export interface CollectionShareUpdate {
  permission: SharePermission;
}
