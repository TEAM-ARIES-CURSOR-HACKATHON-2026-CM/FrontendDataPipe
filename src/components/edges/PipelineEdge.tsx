import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

export function PipelineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.28,
  });

  const width = selected ? 3 : 2.2;

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="#0a0a0a"
        strokeWidth={width + 2}
        strokeLinecap="round"
        opacity={0.1}
        transform="translate(0, 2)"
      />
      <BaseEdge
        id={id}
        path={path}
        markerEnd="url(#datapipe-arrow)"
        style={{
          stroke: selected ? '#0f0f0f' : '#3d3d3d',
          strokeWidth: width,
          strokeLinecap: 'round',
        }}
        className={`pipeline-edge__main ${selected ? 'pipeline-edge__main--selected' : ''}`}
      />
    </>
  );
}
