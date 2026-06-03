import type { Node } from '@xyflow/react';
import type { BlockNodeData } from '../types';

function getNodeData(node: Node | undefined): BlockNodeData | undefined {
  if (!node?.data) return undefined;
  return node.data as BlockNodeData;
}

export function getCsvNodes(nodes: Node[]): Node[] {
  return nodes.filter((n) => getNodeData(n)?.blockType === 'csv');
}

export function getPipelineCsvNode(nodes: Node[]): Node | undefined {
  return getCsvNodes(nodes)[0];
}

export function getCsvFileIdFromNodes(nodes: Node[]): string | undefined {
  return getNodeData(getPipelineCsvNode(nodes))?.params?.file_id;
}

export function getCsvFileNameFromNodes(nodes: Node[]): string | undefined {
  return getNodeData(getPipelineCsvNode(nodes))?.params?.file;
}
