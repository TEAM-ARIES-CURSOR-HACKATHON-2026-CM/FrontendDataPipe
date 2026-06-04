import type { Node } from '@xyflow/react';
import type { BlockNodeData, PipelineRunMeta } from '../types';
import { isTransformType } from '../constants/blocks';

export function countTransformBlocks(nodes: Node[]): number {
  let n = 0;
  for (const node of nodes) {
    if (isTransformType((node.data as BlockNodeData).blockType)) n += 1;
  }
  return n;
}

export function formatRunMetrics(meta: PipelineRunMeta): string {
  const s = (meta.durationMs / 1000).toFixed(2);
  const lignes = meta.rowCount === 1 ? 'ligne' : 'lignes';
  const trans =
    meta.transformCount === 1 ? 'transformation' : 'transformations';
  return `${meta.rowCount} ${lignes} · ${meta.transformCount} ${trans} · ${s} s`;
}
