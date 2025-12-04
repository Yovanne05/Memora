import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePublicCollectionsQuery } from "../hooks/usePublicCollectionsQuery";
import { CollectionCard } from "@/features/collections/components/list/CollectionCard";
import { CollectionsListSkeleton } from "@/features/collections/components/list/CollectionsListSkeleton";
import { CollectionsErrorAlert } from "@/features/collections/components/list/CollectionsErrorAlert";
import type { Collection } from "@/features/collections/models/collection.model";

/**
 * Page de sélection de collections pour la visualisation.
 * Affiche toutes les collections publiques avec recherche et navigation vers le graphe.
 */
export function CollectionSelectionPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: collections = [], isLoading, isError } = usePublicCollectionsQuery();

  // Filter collections by search term
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Visualisation des collections
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez une collection pour visualiser son graphe de connaissances
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une collection..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <CollectionsListSkeleton />
      ) : isError ? (
        <CollectionsErrorAlert />
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

      {/* Stats */}
      {!isLoading && !isError && (
        <p className="text-sm text-muted-foreground text-center">
          {filteredCollections.length} collection{filteredCollections.length > 1 ? "s" : ""} affichée{filteredCollections.length > 1 ? "s" : ""}
          {searchTerm && ` sur ${collections.length} au total`}
        </p>
      )}
    </div>
  );
}
