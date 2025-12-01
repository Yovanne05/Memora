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

  const nodeIds = new Set(nodes.map((node) => node.id));
  const validEdges = edges.filter((edge) => {
    const isValid =
      nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId);

    if (!isValid) {
      console.warn(
        `Arete ignorée car elle reference un noeud inconnu: ${edge.sourceId} -> ${edge.targetId}`
      );
    }

    return isValid;
  });

  const levels: Record<string, number> = {};
  const inDegree: Record<string, number> = {};
  const outAdj: Record<string, string[]> = {};

  nodes.forEach((node) => {
    inDegree[node.id] = 0;
    outAdj[node.id] = [];
  });

  validEdges.forEach((edge) => {
    outAdj[edge.sourceId].push(edge.targetId);
    inDegree[edge.targetId]++;
  });

  const orphanNodes = new Set<string>();
  nodes.forEach((node) => {
    const hasIncoming = inDegree[node.id] > 0;
    const hasOutgoing = outAdj[node.id].length > 0;

    if (!hasIncoming && !hasOutgoing) {
      orphanNodes.add(node.id);
    }
  });

  const queue: string[] = [];

  nodes.forEach((node) => {
    if (orphanNodes.has(node.id)) {
      return;
    }

    if (inDegree[node.id] === 0) {
      levels[node.id] = 0;
      queue.push(node.id);
    }
  });

  if (queue.length === 0) {
    const fallback = nodes.find((node) => !orphanNodes.has(node.id));
    if (fallback) {
      levels[fallback.id] = 0;
      queue.push(fallback.id);
    }
  }

  // Propagation des niveaux via les connexions sortantes
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

  const unreachedNodes: string[] = [];

  nodes.forEach((node) => {
    if (levels[node.id] === undefined && !orphanNodes.has(node.id)) {
      unreachedNodes.push(node.id);
    }
  });

  const existingLevels = Object.values(levels);
  let maxLevel = existingLevels.length ? Math.max(...existingLevels) : -1;

  if (unreachedNodes.length > 0) {
    const unreachedLevel = maxLevel >= 0 ? maxLevel + 1 : 0;
    unreachedNodes.forEach((nodeId) => {
      levels[nodeId] = unreachedLevel;
    });
    maxLevel = unreachedLevel;
  }

  if (orphanNodes.size > 0) {
    const hasStructuredNodes = maxLevel >= 0 || unreachedNodes.length > 0;
    const orphanLevel = hasStructuredNodes ? maxLevel + 1 : 0;

    orphanNodes.forEach((nodeId) => {
      levels[nodeId] = orphanLevel;
    });
  }

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

  if (dy !== 0) {
    return {
      sourceSide: dy < 0 ? "top" : "bottom",
      targetSide: dy < 0 ? "bottom" : "top",
    };
  }

  if (dx !== 0) {
    return {
      sourceSide: dx < 0 ? "left" : "right",
      targetSide: dx < 0 ? "right" : "left",
    };
  }

  return {
    sourceSide: "right",
    targetSide: "left",
  };
}

export function calculateEdgeOffset(
  edgeIndex: number,
  totalEdges: number,
  baseOffset: number = 20,
  levelMultiplier: number = 12
): number {
  if (totalEdges <= 1) {
    return 0;
  }

  const laneSide = edgeIndex % 2 === 0 ? 1 : -1;
  const laneLevel = Math.floor(edgeIndex / 2);
  return laneSide * (baseOffset + laneLevel * levelMultiplier);
}

export interface EdgeGroup {
  sourceId: string;
  targetId: string;
  sourceSide: "top" | "bottom" | "left" | "right";
  targetSide: "top" | "bottom" | "left" | "right";
  edgeIndices: number[];
}

export function groupEdgesByConnection(
  edges: LayoutEdge[],
  positions: Record<string, NodePosition>
): EdgeGroup[] {
  const groupMap = new Map<string, EdgeGroup>();

  edges.forEach((edge, index) => {
    const sourcePos = positions[edge.sourceId];
    const targetPos = positions[edge.targetId];

    if (!sourcePos || !targetPos) {
      console.warn(
        `Impossible de positionner l'arete ${edge.sourceId} -> ${edge.targetId} car une position est manquante`
      );
      return;
    }

    const { sourceSide, targetSide } = determineConnectionDirection(
      sourcePos,
      targetPos
    );
    const key = `${edge.sourceId}-${sourceSide}-${edge.targetId}-${targetSide}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        sourceSide,
        targetSide,
        edgeIndices: [],
      });
    }

    groupMap.get(key)!.edgeIndices.push(index);
  });

  return Array.from(groupMap.values());
}
