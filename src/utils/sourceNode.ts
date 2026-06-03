import type { Node } from '@xyflow/react';
import type { BlockNodeData } from '../types';
import { isSourceType } from '../constants/blocks';

function getNodeData(node: Node | undefined): BlockNodeData | undefined {
  if (!node?.data) return undefined;
  return node.data as BlockNodeData;
}

export function getSourceNodes(nodes: Node[]): Node[] {
  return nodes.filter((n) => {
    const t = getNodeData(n)?.blockType;
    return t && isSourceType(t);
  });
}

export function getPipelineSourceNode(nodes: Node[]): Node | undefined {
  return getSourceNodes(nodes)[0];
}

export function getSourceFileIdFromNodes(nodes: Node[]): string | undefined {
  return getNodeData(getPipelineSourceNode(nodes))?.params?.file_id;
}

export function getSourceFileNameFromNodes(nodes: Node[]): string | undefined {
  return getNodeData(getPipelineSourceNode(nodes))?.params?.file;
}

/** @deprecated Utiliser getSourceFileIdFromNodes */
export const getCsvFileIdFromNodes = getSourceFileIdFromNodes;

/** @deprecated Utiliser getSourceFileNameFromNodes */
export const getCsvFileNameFromNodes = getSourceFileNameFromNodes;

/** @deprecated Utiliser getSourceNodes */
export const getCsvNodes = getSourceNodes;

/** @deprecated Utiliser getPipelineSourceNode */
export const getPipelineCsvNode = getPipelineSourceNode;
