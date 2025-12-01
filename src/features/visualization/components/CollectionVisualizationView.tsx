import { useCallback } from "react";
import type { MouseEvent } from "react";
import ReactFlow, { Background, Controls, MiniMap, type Node } from "reactflow";
import "reactflow/dist/style.css";
import { useCollectionVisualizationQuery } from "../hooks/useCollectionVisualizationQuery";
import { useVisualizationLayout } from "../hooks/useVisualizationLayout";
import { CustomNode, type CustomNodeData } from "./CustomNode";
import { VisualizationHeader } from "./VisualizationHeader";
import { VisualizationLegend } from "./VisualizationLegend";

interface CollectionVisualizationViewProps {
  collectionId?: string;
}

const nodeTypes = {
  custom: CustomNode,
};

/**
 * Vue principale de la visualisation de collection
 * Composant container qui orchestre l'affichage du graphe de notes
 */
export function CollectionVisualizationView({
  collectionId,
}: CollectionVisualizationViewProps) {
  const { data, isLoading, isError } =
    useCollectionVisualizationQuery(collectionId);

  const { nodes, edges } = useVisualizationLayout(data);

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      console.log("Note sélectionnée:", node);
    },
    []
  );

  // État : Aucune collection sélectionnée
  if (!collectionId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez une collection à gauche pour afficher la visualisation.
      </div>
    );
  }

  // État : Chargement
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Chargement de la visualisation...
          </p>
        </div>
      </div>
    );
  }

  // État : Erreur
  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        Erreur lors du chargement de la visualisation.
      </div>
    );
  }

  // État : Visualisation prête
  return (
    <div className="h-full w-full flex flex-col">
      <VisualizationHeader
        notesCount={data.nodes.length}
        connectionsCount={data.edges.length}
      />

      <div className="flex-1 relative min-h-[400px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          className="bg-muted/30"
          nodesDraggable={true}
          nodesConnectable={false}
        >
          <Background gap={16} />
          <Controls className="border rounded-lg shadow-lg" />
          <MiniMap
            className="border rounded-lg shadow-lg"
            nodeColor={getNodeColor}
          />
        </ReactFlow>
      </div>

      <VisualizationLegend />
    </div>
  );
}

/**
 * Détermine la couleur d'un nœud dans la minimap selon son nombre de connexions
 */
function getNodeColor(node: Node): string {
  const connections = (node.data as CustomNodeData | undefined)?.connections ?? 0;

  if (connections > 3) return "#3b82f6";
  if (connections > 1) return "#60a5fa";
  return "#93c5fd";
}
