/**
 * Algorithme de positionnement en couches pour la visualisation de graphes
 * Utilise une approche de tri topologique pour organiser les nœuds par niveaux
 */

export interface LayoutNode {
  id: string;
}

export interface LayoutEdge {
  sourceId: string;
  targetId: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

interface LayoutConfig {
  verticalGap?: number;
  horizontalGap?: number;
}

const DEFAULT_CONFIG: Required<LayoutConfig> = {
  verticalGap: 150,
  horizontalGap: 220,
};

/**
 * Calcule les positions des nœuds
 *
 * @param nodes - Liste des nœuds à positionner
 * @param edges - Liste des connexions entre nœuds
 * @param config - Configuration des espacements
 * @returns Map des positions pour chaque nœud
 */
export function calculateLayeredLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  config: LayoutConfig = {}
): Record<string, NodePosition> {
  const { verticalGap, horizontalGap } = { ...DEFAULT_CONFIG, ...config };
  const positions: Record<string, NodePosition> = {};

  if (!nodes.length) return positions;

  const levels: Record<string, number> = {};
  const inDegree: Record<string, number> = {};
  const outAdj: Record<string, string[]> = {};

  nodes.forEach((node) => {
    inDegree[node.id] = 0;
    outAdj[node.id] = [];
  });

  edges.forEach((edge) => {
    if (!(edge.sourceId in outAdj)) {
      outAdj[edge.sourceId] = [];
    }
    outAdj[edge.sourceId].push(edge.targetId);

    if (edge.targetId in inDegree) {
      inDegree[edge.targetId]++;
    }
  });

  const queue: string[] = [];
  const minInDegree = Math.min(...Object.values(inDegree));

  nodes.forEach((node) => {
    if (inDegree[node.id] === minInDegree) {
      levels[node.id] = 0;
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift() as string;
    const currentLevel = levels[nodeId];

    for (const nextId of outAdj[nodeId] || []) {
      if (levels[nextId] === undefined) {
        levels[nextId] = currentLevel + 1;
        queue.push(nextId);
      }
    }
  }

  const existingLevels = Object.values(levels);
  const baseLevel = existingLevels.length ? Math.max(...existingLevels) + 1 : 0;

  nodes.forEach((node) => {
    if (levels[node.id] === undefined) {
      levels[node.id] = baseLevel;
    }
  });

  const nodesByLevel = groupNodesByLevel(levels);

  const sortedLevels = Object.keys(nodesByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  sortedLevels.forEach((level) => {
    const nodeIds = nodesByLevel[level];
    const totalWidth = (nodeIds.length - 1) * horizontalGap;
    const startX = -totalWidth / 2;

    nodeIds.forEach((nodeId, index) => {
      positions[nodeId] = {
        x: startX + index * horizontalGap,
        y: level * verticalGap,
      };
    });
  });

  return positions;
}

function groupNodesByLevel(
  levels: Record<string, number>
): Record<number, string[]> {
  const grouped: Record<number, string[]> = {};

  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!grouped[level]) {
      grouped[level] = [];
    }
    grouped[level].push(nodeId);
  });

  return grouped;
}

/**
 * Détermine la direction optimale de connexion entre deux nœuds
 */
export function determineConnectionDirection(
  sourcePosition: NodePosition,
  targetPosition: NodePosition
): {
  sourceSide: "top" | "bottom" | "left" | "right";
  targetSide: "top" | "bottom" | "left" | "right";
} {
  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      sourceSide: dx < 0 ? "left" : "right",
      targetSide: dx < 0 ? "right" : "left",
    };
  } else {
    return {
      sourceSide: dy < 0 ? "top" : "bottom",
      targetSide: dy < 0 ? "bottom" : "top",
    };
  }
}

export function calculateEdgeOffset(
  edgeIndex: number,
  baseOffset: number = 20,
  levelMultiplier: number = 12
): number {
  const laneSide = edgeIndex % 2 === 0 ? 1 : -1;
  const laneLevel = Math.floor(edgeIndex / 2);
  return laneSide * (baseOffset + laneLevel * levelMultiplier);
}
