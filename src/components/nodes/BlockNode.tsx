import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { BlockNodeData } from '../../types';
import { getBlockDef } from '../../constants/blocks';
import { BlockIcon } from '../../constants/blockIcons';
import { getNodeParamLines } from '../../utils/nodeParamSummary';

function BlockNodeComponent({ data, selected }: NodeProps) {
  const d = data as BlockNodeData;
  const def = getBlockDef(d.blockType);
  const isSource = d.blockType === 'csv';
  const isViz = def.category === 'viz';
  const paramLines = getNodeParamLines(d.blockType, d.params);
  const isCsvLoaded = d.blockType === 'csv' && Boolean(d.params.file_id);

  return (
    <div
      className={`block-node block-node--${def.category} ${selected ? 'block-node--selected' : ''} ${isCsvLoaded ? 'block-node--csv-loaded' : ''}`}
      data-block={d.blockType}
    >
      {!isSource && (
        <Handle
          type="target"
          position={Position.Left}
          className="block-handle block-handle--in"
          id="in"
        />
      )}

      <div className="block-node__disc" title={d.label}>
        <span className="block-node__icon" aria-hidden>
          <BlockIcon type={d.blockType} />
        </span>
      </div>

      <p className="block-node__chip" style={{ borderLeftColor: def.color }}>
        {d.label?.trim() || def.label}
      </p>

      <ul className="block-node__params" aria-label="Paramètres du bloc">
        {paramLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {!isViz && (
        <Handle
          type="source"
          position={Position.Right}
          className="block-handle block-handle--out"
          id="out"
        />
      )}
    </div>
  );
}

export const BlockNode = memo(BlockNodeComponent);
