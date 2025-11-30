import { useCallback, useMemo } from "react";
import type { MouseEvent } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  type Node,
  type Edge,
  type NodeProps,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useCollectionVisualizationQuery } from "../hook/useCollectionVisualizationQuery";

interface CollectionVisualizationViewProps {
  collectionId?: string;
}

type CustomNodeData = {
  title: string;
  connections: number;
};

// ---------- Node custom ----------

const CustomNode = ({ data }: NodeProps<CustomNodeData>) => {
  const connections = data.connections ?? 0;

  return (
    <div className="group relative px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-400 hover:border-blue-600 transition-colors min-w-[140px]">
      {/* TOP */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* RIGHT */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* BOTTOM */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* LEFT */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="w-2! h-2! bg-blue-500! opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <div className="text-sm font-semibold text-gray-800">{data.title}</div>
      </div>

      <div className="text-xs text-gray-500 mt-1">
        {connections} connexion{connections > 1 ? "s" : ""}
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

type RawNode = { id: string };
type RawEdge = { sourceId: string; targetId: string };

function calculateLayeredLayout(
  nodes: RawNode[],
  edges: RawEdge[]
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  if (!nodes.length) return positions;

  const levels: Record<string, number> = {};
  const inDegree: Record<string, number> = {};
  const outAdj: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    outAdj[n.id] = [];
  });

  edges.forEach((e) => {
    if (!(e.sourceId in outAdj)) outAdj[e.sourceId] = [];
    outAdj[e.sourceId].push(e.targetId);
    if (e.targetId in inDegree) {
      inDegree[e.targetId]++;
    }
  });

  const queue: string[] = [];

  // Nodes racines = ceux avec le moins d'entrées
  const minIn = Math.min(...Object.values(inDegree));
  nodes.forEach((n) => {
    if (inDegree[n.id] === minIn) {
      levels[n.id] = 0;
      queue.push(n.id);
    }
  });

  while (queue.length) {
    const id = queue.shift() as string;
    const lvl = levels[id];

    for (const next of outAdj[id] || []) {
      if (levels[next] === undefined) {
        levels[next] = lvl + 1;
        queue.push(next);
      }
    }
  }

  // Pour les nœuds isolés / non atteints
  const existingLevels = Object.values(levels);
  const baseLevel = existingLevels.length ? Math.max(...existingLevels) + 1 : 0;
  nodes.forEach((n) => {
    if (levels[n.id] === undefined) {
      levels[n.id] = baseLevel;
    }
  });

  // Groupement par niveau
  const grouped: Record<number, string[]> = {};
  Object.entries(levels).forEach(([id, lvl]) => {
    if (!grouped[lvl]) grouped[lvl] = [];
    grouped[lvl].push(id);
  });

  const verticalGap = 150;
  const horizontalGap = 220;

  const lvlKeys = Object.keys(grouped)
    .map((k) => Number(k))
    .sort((a, b) => a - b);

  lvlKeys.forEach((lvl) => {
    const ids = grouped[lvl];
    const totalWidth = (ids.length - 1) * horizontalGap;
    const startX = -totalWidth / 2;

    ids.forEach((id, index) => {
      positions[id] = {
        x: startX + index * horizontalGap,
        y: lvl * verticalGap,
      };
    });
  });

  return positions;
}

export function CollectionVisualizationView({
  collectionId,
}: CollectionVisualizationViewProps) {
  const { data, isLoading, isError } =
    useCollectionVisualizationQuery(collectionId);

  // nombre de connexions par nœud
  const nodeConnections = useMemo(() => {
    if (!data) return {} as Record<string, number>;

    const connections: Record<string, number> = {};
    data.nodes.forEach((node) => {
      connections[node.id] = 0;
    });
    data.edges.forEach((edge) => {
      connections[edge.sourceId] = (connections[edge.sourceId] || 0) + 1;
      connections[edge.targetId] = (connections[edge.targetId] || 0) + 1;
    });
    return connections;
  }, [data]);

  // nœuds
  const nodes: Node<CustomNodeData>[] = useMemo(() => {
    if (!data) return [];

    const positionsMap = calculateLayeredLayout(data.nodes, data.edges);

    return data.nodes.map((node) => {
      const pos = positionsMap[node.id] ?? { x: 0, y: 0 };
      return {
        id: node.id,
        type: "custom",
        position: pos,
        data: {
          title: node.title,
          connections: nodeConnections[node.id] ?? 0,
        },
      };
    });
  }, [data, nodeConnections]);

  // arêtes React Flow avec choix du côté + offset
  const edges: Edge[] = useMemo(() => {
    if (!data || nodes.length === 0) return [];

    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    return data.edges.map((edge, index) => {
      const sourceNode = nodeById.get(edge.sourceId);
      const targetNode = nodeById.get(edge.targetId);

      if (!sourceNode || !targetNode) {
        return {
          id: `e${edge.sourceId}-${edge.targetId}-${index}`,
          source: edge.sourceId,
          target: edge.targetId,
          type: "smoothstep",
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        } satisfies Edge;
      }

      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;

      let sourceSide: "top" | "bottom" | "left" | "right";
      let targetSide: "top" | "bottom" | "left" | "right";

      if (Math.abs(dx) > Math.abs(dy)) {
        //  horizontal
        sourceSide = dx < 0 ? "left" : "right";
        targetSide = dx < 0 ? "right" : "left";
      } else {
        //  vertical
        sourceSide = dy < 0 ? "top" : "bottom";
        targetSide = dy < 0 ? "bottom" : "top";
      }

      const laneSide = index % 2 === 0 ? 1 : -1;
      const laneLevel = Math.floor(index / 2);
      const offset = laneSide * (20 + laneLevel * 12);

      return {
        id: `e${edge.sourceId}-${edge.targetId}-${index}`,
        source: edge.sourceId,
        target: edge.targetId,
        type: "smoothstep",
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        sourceHandle: `${sourceSide}-source`,
        targetHandle: `${targetSide}-target`,
        pathOptions: {
          offset,
          borderRadius: 16,
        },
      } satisfies Edge;
    });
  }, [data, nodes]);

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node<CustomNodeData>) => {
      console.log("Note sélectionnée:", node);
    },
    []
  );

  // UI états

  if (!collectionId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sélectionnez une collection à gauche pour afficher la visualisation.
      </div>
    );
  }

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

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        Erreur lors du chargement de la visualisation.
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* En-tête */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Visualisation des Notes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.nodes.length} notes • {data.edges.length} connexions
            </p>
          </div>
        </div>
      </div>

      {/* Graphe */}
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
            nodeColor={(node) => {
              const connections =
                (node.data as CustomNodeData | undefined)?.connections ?? 0;
              if (connections > 3) return "#3b82f6";
              if (connections > 1) return "#60a5fa";
              return "#93c5fd";
            }}
          />
        </ReactFlow>
      </div>

      {/* Légende */}
      <div className="border-t bg-background px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-600" />
            <span className="text-muted-foreground">3+ connexions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-400" />
            <span className="text-muted-foreground">2-3 connexions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-200" />
            <span className="text-muted-foreground">0-1 connexion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
