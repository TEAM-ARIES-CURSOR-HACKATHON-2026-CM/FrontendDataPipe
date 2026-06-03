import type { Connection, Edge, Node } from '@xyflow/react';
import type { BlockNodeData, BlockType } from '../types';
import { isSourceType, isTransformType, isVizType } from '../constants/blocks';
import { SOURCE_FORMATS_LABEL } from '../constants/branding';
import { validatePipelineColumns } from './pipelineColumns';

function getBlockType(node: Node | undefined): BlockType | undefined {
  return (node?.data as BlockNodeData | undefined)?.blockType;
}

export function isValidConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[],
): boolean {
  const source = nodes.find((n) => n.id === connection.source);
  const target = nodes.find((n) => n.id === connection.target);
  const sourceType = getBlockType(source);
  const targetType = getBlockType(target);

  if (!sourceType || !targetType || source?.id === target?.id) return false;

  if (isSourceType(targetType)) return false;
  if (isVizType(sourceType)) return false;

  if (isSourceType(sourceType)) {
    return isTransformType(targetType) || isVizType(targetType);
  }

  if (isTransformType(sourceType)) {
    return isTransformType(targetType) || isVizType(targetType);
  }

  if (isVizType(sourceType)) return false;

  const wouldCycle = createsCycle(connection, edges);
  return !wouldCycle;
}

function createsCycle(connection: Connection, edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const list = adj.get(e.source) ?? [];
    list.push(e.target);
    adj.set(e.source, list);
  }
  const list = adj.get(connection.source!) ?? [];
  list.push(connection.target!);
  adj.set(connection.source!, list);

  const visited = new Set<string>();
  const stack = [connection.target!];

  while (stack.length) {
    const id = stack.pop()!;
    if (id === connection.source) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const next of adj.get(id) ?? []) stack.push(next);
  }
  return false;
}

export function validatePipelineBeforeRun(
  nodes: Node[],
  edges: Edge[],
  uploadColumns: string[] = [],
): string | null {
  const sourceNodes = nodes.filter((n) => isSourceType((n.data as BlockNodeData).blockType));
  if (sourceNodes.length === 0) return `Ajoutez un bloc source (${SOURCE_FORMATS_LABEL}).`;
  if (sourceNodes.length > 1) return `Un seul bloc source (${SOURCE_FORMATS_LABEL}) est autorisé.`;

  const sourceParams = (sourceNodes[0].data as BlockNodeData | undefined)?.params;
  if (!sourceParams?.file_id) {
    return `Sélectionnez le bloc source et importez un fichier (${SOURCE_FORMATS_LABEL}).`;
  }

  const vizNodes = nodes.filter((n) => isVizType((n.data as BlockNodeData).blockType));
  if (vizNodes.length === 0) return 'Ajoutez un bloc de visualisation (tableau ou graphique).';

  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      return 'Connexion invalide dans le pipeline.';
    }
  }

  const reachable = new Set<string>();
  const queue = [sourceNodes[0].id];
  while (queue.length) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const e of edges.filter((x) => x.source === id)) queue.push(e.target);
  }

  const orphan = nodes.find((n) => !reachable.has(n.id));
  if (orphan) return `Le bloc « ${(orphan.data as BlockNodeData).label} » n'est pas connecté au pipeline.`;

  const columnError = validatePipelineColumns(nodes, edges, uploadColumns);
  if (columnError) return columnError;

  return null;
}
