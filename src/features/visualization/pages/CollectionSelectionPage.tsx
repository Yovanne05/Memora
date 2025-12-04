import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePublicCollectionsQuery } from "../hooks/usePublicCollectionsQuery";
import { CollectionCard } from "@/features/collections/components/list/CollectionCard";
import { CollectionsListSkeleton } from "@/features/collections/components/list/CollectionsListSkeleton";
import { CollectionsErrorAlert } from "@/features/collections/components/list/CollectionsErrorAlert";
import type { Collection } from "@/features/collections/models/collection.model";


export function CollectionSelectionPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: collections = [], isLoading, isError } = usePublicCollectionsQuery();

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCollectionClick = (collection: Collection) => {
    navigate({
      to: "/app/visualization/collections/$id",
      params: { id: collection.id },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Visualisation des collections
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez une collection pour visualiser son graphe de connaissances
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une collection..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <CollectionsListSkeleton />
      ) : isError ? (
        <CollectionsErrorAlert message=""/>
      ) : filteredCollections.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border text-muted-foreground">
          {searchTerm ? (
            <p>Aucune collection trouvée pour "{searchTerm}"</p>
          ) : (
            <p>Aucune collection publique disponible</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onCardClick={handleCollectionClick}
              readOnly
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <p className="text-sm text-muted-foreground text-center">
          {filteredCollections.length} collection{filteredCollections.length > 1 ? "s" : ""} affichée{filteredCollections.length > 1 ? "s" : ""}
          {searchTerm && ` sur ${collections.length} au total`}
        </p>
      )}
    </div>
  );
}
