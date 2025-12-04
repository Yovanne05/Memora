import { useParams, useNavigate } from "@tanstack/react-router";
import { CollectionVisualizationView } from "../components/CollectionVisualizationView";

/**
 * Page d?di?e au graphe de visualisation d'une collection.
 * Affiche uniquement le graphe en plein ?cran avec le sidebar des notes.
 */
export function CollectionGraphPage() {
  const { id } = useParams({ from: "/app/visualization/collections/$id/" });
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/app/visualization" });
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <CollectionVisualizationView collectionId={id} onBack={handleBack} />
    </div>
  );
}
