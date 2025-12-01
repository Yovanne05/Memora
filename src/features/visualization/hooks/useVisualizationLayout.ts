import { useMemo } from "react";
import type { Node, Edge } from "reactflow";
import type { CustomNodeData } from "../components/CustomNode";
import type {
  CollectionVisualization,
  NodeConnectionsMap,
} from "../types/visualization.type";
import {
  calculateLayeredLayout,
  determineConnectionDirection,
  calculateEdgeOffset,
} from "../lib/layoutEngine";

interface UseVisualizationLayoutResult {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  nodeConnections: NodeConnectionsMap;
}

/**
 * Calcule les positions des nœuds, les connexions et génère les arêtes React Flow
 *
 * @param data - Données de visualisation contenant les nœuds et les arêtes
 * @returns Nœuds et arêtes formatés pour React Flow avec leurs positions
 */
export function useVisualizationLayout(
  data?: CollectionVisualization
): UseVisualizationLayoutResult {
  const nodeConnections = useMemo<NodeConnectionsMap>(() => {
    if (!data) return {};

    const connections: NodeConnectionsMap = {};

    data.nodes.forEach((node) => {
      connections[node.id] = 0;
    });

    data.edges.forEach((edge) => {
      connections[edge.sourceId] = (connections[edge.sourceId] || 0) + 1;
      connections[edge.targetId] = (connections[edge.targetId] || 0) + 1;
    });

    return connections;
  }, [data]);

  const nodes = useMemo<Node<CustomNodeData>[]>(() => {
    if (!data) return [];

    const positions = calculateLayeredLayout(data.nodes, data.edges);

    return data.nodes.map((node) => {
      const position = positions[node.id] ?? { x: 0, y: 0 };

      return {
        id: node.id,
        type: "custom",
        position,
        data: {
          title: node.title,
          connections: nodeConnections[node.id] ?? 0,
        },
      };
    });
  }, [data, nodeConnections]);

  const edges = useMemo<Edge[]>(() => {
    if (!data || nodes.length === 0) return [];

    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    return data.edges.map((edge, index) => {
      const sourceNode = nodeById.get(edge.sourceId);
      const targetNode = nodeById.get(edge.targetId);

      const baseEdge: Edge = {
        id: `e${edge.sourceId}-${edge.targetId}-${index}`,
        source: edge.sourceId,
        target: edge.targetId,
        type: "smoothstep",
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      };

      // Si les nœuds n'existent pas, retourner l'arête de base
      if (!sourceNode || !targetNode) {
        return baseEdge;
      }

      // Direction optimale de connexion
      const { sourceSide, targetSide } = determineConnectionDirection(
        sourceNode.position,
        targetNode.position
      );

      // Evite la superposition des arêtes
      const offset = calculateEdgeOffset(index);

      return {
        ...baseEdge,
        sourceHandle: `${sourceSide}-source`,
        targetHandle: `${targetSide}-target`,
        pathOptions: {
          offset,
          borderRadius: 16,
        },
      };
    });
  }, [data, nodes]);

  return {
    nodes,
    edges,
    nodeConnections,
  };
}
