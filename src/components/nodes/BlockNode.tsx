import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { BlockNodeData } from '../../types';
import { getBlockDef } from '../../constants/blocks';

function BlockNodeComponent({ data, selected }: NodeProps) {
  const d = data as BlockNodeData;
  const def = getBlockDef(d.blockType);
  const isSource = d.blockType === 'csv';
  const isViz = def.category === 'viz';

  return (
    <div
      className={`block-node ${selected ? 'block-node--selected' : ''}`}
      style={{ borderColor: def.color }}
    >
      {!isSource && (
        <Handle type="target" position={Position.Left} className="block-handle" />
      )}
      <div className="block-node__accent" style={{ background: def.color }} />
      <div className="block-node__body">
        <span className="block-node__type">{def.label}</span>
        <span className="block-node__label">{d.label}</span>
      </div>
      {!isViz && (
        <Handle type="source" position={Position.Right} className="block-handle" />
      )}
    </div>
  );
}

export const BlockNode = memo(BlockNodeComponent);
