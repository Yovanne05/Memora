import { useParams, useNavigate } from "@tanstack/react-router";
import { CollectionVisualizationView } from "../components/CollectionVisualizationView";

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
