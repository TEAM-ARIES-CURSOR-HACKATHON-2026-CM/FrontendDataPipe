import type { Connection, Edge, Node } from '@xyflow/react';
import type { BlockNodeData } from '../types';
import { isSourceType, isTransformType, isVizType } from '../constants/blocks';
import { createBlockNode } from '../components/FlowCanvas';
import { isValidConnection } from './pipelineValidation';
import type { ParsedBlock } from './pandasToBlock';

function getBlockType(node: Node | undefined): BlockNodeData['blockType'] | undefined {
  return (node?.data as BlockNodeData | undefined)?.blockType;
}

/** Dernière transformation de la chaîne principale (avant les visualisations). */
export function findPipelineAttachNode(nodes: Node[], edges: Edge[]): string | null {
  const sourceNode = nodes.find((n) => isSourceType(getBlockType(n)!));
  if (!sourceNode) {
    const transforms = nodes.filter((n) => {
      const t = getBlockType(n);
      return t && isTransformType(t);
    });
    return transforms.at(-1)?.id ?? null;
  }

  const depths = new Map<string, number>();
  depths.set(sourceNode.id, 0);
  const queue = [sourceNode.id];

  while (queue.length) {
    const id = queue.shift()!;
    const depth = depths.get(id)!;
    for (const e of edges.filter((x) => x.source === id)) {
      const next = depths.get(e.target);
      if (next === undefined || next < depth + 1) {
        depths.set(e.target, depth + 1);
        queue.push(e.target);
      }
    }
  }

  let bestId: string = sourceNode.id;
  let bestDepth = 0;

  for (const [id, depth] of depths) {
    const type = getBlockType(nodes.find((n) => n.id === id));
    if (!type || isVizType(type)) continue;
    if (depth >= bestDepth) {
      bestDepth = depth;
      bestId = id;
    }
  }

  return bestId;
}

function tryConnect(
  source: string,
  target: string,
  nodes: Node[],
  edges: Edge[],
): Edge | null {
  const connection: Connection = {
    source,
    target,
    sourceHandle: null,
    targetHandle: null,
  };
  if (!isValidConnection(connection, nodes, edges)) return null;
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: 'pipeline',
  };
}

/**
 * Insère les blocs IA dans la chaîne ETL : CSV → … → [nouveaux blocs] → visualisation.
 * Reconnecte automatiquement les visualisations qui étaient branchées sur le point d'insertion.
 */
export function appendBlocksToPipeline(
  nodes: Node[],
  edges: Edge[],
  blocks: ParsedBlock[],
): { nodes: Node[]; edges: Edge[]; addedNodeIds: string[] } {
  if (blocks.length === 0) {
    return { nodes, edges, addedNodeIds: [] };
  }

  let nextNodes = [...nodes];
  let nextEdges = [...edges];
  const attachId = findPipelineAttachNode(nextNodes, nextEdges);
  const addedNodeIds: string[] = [];

  if (!attachId) {
    blocks.forEach((block, index) => {
      const newNode = createBlockNode(
        block.blockType,
        { x: 280, y: 120 + (nextNodes.length + index) * 72 },
        block.params,
      );
      nextNodes = [...nextNodes, newNode];
      addedNodeIds.push(newNode.id);
    });
    return { nodes: nextNodes, edges: nextEdges, addedNodeIds };
  }

  const downstreamEdges = nextEdges.filter((e) => e.source === attachId);
  nextEdges = nextEdges.filter((e) => e.source !== attachId);

  let tailId = attachId;
  const baseY = 120 + nextNodes.length * 40;

  blocks.forEach((block, index) => {
    const newNode = createBlockNode(
      block.blockType,
      { x: 280, y: baseY + index * 72 },
      block.params,
    );
    nextNodes = [...nextNodes, newNode];
    addedNodeIds.push(newNode.id);

    const edge = tryConnect(tailId, newNode.id, nextNodes, nextEdges);
    if (edge) nextEdges = [...nextEdges, edge];

    tailId = newNode.id;
  });

  for (const oldEdge of downstreamEdges) {
    const edge = tryConnect(tailId, oldEdge.target, nextNodes, nextEdges);
    if (edge) nextEdges = [...nextEdges, edge];
  }

  return { nodes: nextNodes, edges: nextEdges, addedNodeIds };
}
