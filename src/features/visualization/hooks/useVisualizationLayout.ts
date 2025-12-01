import { useMemo } from "react";
import type { Node, Edge } from "reactflow";
import type { CustomNodeData } from "../components/CustomNode";
import type {
  CollectionVisualization,
  NodeConnectionsMap,
} from "../types/visualization.type";
import {
  calculateLayeredLayout,
  calculateEdgeOffset,
  groupEdgesByConnection,
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

    const positions = nodes.reduce<Record<string, { x: number; y: number }>>(
      (acc, node) => {
        acc[node.id] = node.position;
        return acc;
      },
      {}
    );

    const validNodeIds = new Set(nodes.map((node) => node.id));
    const validEdges = data.edges.filter((edge) => {
      const isValid =
        validNodeIds.has(edge.sourceId) && validNodeIds.has(edge.targetId);

      if (!isValid) {
        console.warn("Arete ignoree", edge);
      }

      return isValid;
    });

    const edgeGroups = groupEdgesByConnection(validEdges, positions);
    const reactFlowEdges: Edge[] = [];

    edgeGroups.forEach((group) => {
      const totalEdgesInGroup = group.edgeIndices.length;

      group.edgeIndices.forEach((_, localIndex) => {
        const offset = calculateEdgeOffset(localIndex, totalEdgesInGroup);

        reactFlowEdges.push({
          id:
            totalEdgesInGroup === 1
              ? `e${group.sourceId}-${group.targetId}`
              : `e${group.sourceId}-${group.targetId}-${localIndex}`,
          source: group.sourceId,
          target: group.targetId,
          type: "smoothstep",
          sourceHandle: `${group.sourceSide}-source`,
          targetHandle: `${group.targetSide}-target`,
          style: { stroke: "#3b82f6", strokeWidth: 2 },
          pathOptions: {
            offset,
            borderRadius: 16,
          },
        });
      });
    });

    return reactFlowEdges;
  }, [data, nodes]);

  return {
    nodes,
    edges,
    nodeConnections,
  };
}
