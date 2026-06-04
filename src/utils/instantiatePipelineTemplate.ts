import type { Edge, Node } from '@xyflow/react';
import { createBlockNode } from '../components/FlowCanvas';
import type { PipelineTemplate } from '../constants/pipelineLibrary';

const STEP_X_GAP = 240;
const BASE_X = 80;
const BASE_Y = 120;

export function instantiatePipelineTemplate(
  template: PipelineTemplate,
): { nodes: Node[]; edges: Edge[] } {
  const nodes = template.steps.map((step, i) =>
    createBlockNode(step.type, { x: BASE_X + i * STEP_X_GAP, y: BASE_Y }, step.params),
  );

  const edges: Edge[] = template.links.map(([from, to], i) => ({
    id: `tpl-e-${template.id}-${i}`,
    source: nodes[from]!.id,
    target: nodes[to]!.id,
    type: 'pipeline',
  }));

  return { nodes, edges };
}
