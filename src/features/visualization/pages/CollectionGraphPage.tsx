import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionVisualizationView } from "../components/CollectionVisualizationView";

/**
 * Page dédiée au graphe de visualisation d'une collection.
 * Affiche uniquement le graphe en plein écran avec le sidebar des notes.
 */
export function CollectionGraphPage() {
  const { id } = useParams({ from: "/app/visualization/collections/$id/" });
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/app/visualization" });
  };

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        className="absolute top-4 left-4 z-10 shadow-lg gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux collections
      </Button>

      {/* Full-Screen Graph */}
      <CollectionVisualizationView collectionId={id} />
    </div>
  );
}
