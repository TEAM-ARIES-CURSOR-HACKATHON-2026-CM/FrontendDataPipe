import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { BlockNodeData, BlockParams, BlockType } from '../types';
import { BlockNode } from './nodes/BlockNode';
import { getBlockDef } from '../constants/blocks';
import { isValidConnection } from '../utils/pipelineValidation';

const nodeTypes = { block: BlockNode };

let nodeId = 0;
const nextId = () => `node_${++nodeId}`;

interface FlowCanvasInnerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: ReturnType<typeof useNodesState>[2];
  onEdgesChange: ReturnType<typeof useEdgesState>[2];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onSelectionChange: (node: Node | null) => void;
}

export type FlowCanvasProps = FlowCanvasInnerProps;

function FlowCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  onSelectionChange,
}: FlowCanvasInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection, nodes, edges)) return;
      setEdges((eds) => addEdge({ ...connection, id: `e-${connection.source}-${connection.target}` }, eds));
    },
    [nodes, edges, setEdges],
  );

  const isValid = useCallback(
    (connection: Connection | Edge) =>
      isValidConnection(connection as Connection, nodes, edges),
    [nodes, edges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const blockType = event.dataTransfer.getData('application/datapipe-block') as BlockType;
      if (!blockType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const def = getBlockDef(blockType);
      const newNode: Node = {
        id: nextId(),
        type: 'block',
        position,
        data: {
          label: def.label,
          blockType,
          params: { ...def.defaultParams },
        } satisfies BlockNodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => onSelectionChange(node),
    [onSelectionChange],
  );

  const onPaneClick = useCallback(() => onSelectionChange(null), [onSelectionChange]);

  return (
    <div className="flow-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValid}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{ animated: true, style: { stroke: '#64748b' } }}
      >
        <Background gap={20} color="#1e293b" />
        <Controls />
        <MiniMap nodeColor={(n) => getBlockDef((n.data as BlockNodeData).blockType).color} />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasInnerProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export function createBlockNode(blockType: BlockType, position: { x: number; y: number }, params?: BlockParams): Node {
  const def = getBlockDef(blockType);
  return {
    id: nextId(),
    type: 'block',
    position,
    data: {
      label: def.label,
      blockType,
      params: { ...def.defaultParams, ...params },
    } satisfies BlockNodeData,
  };
}

export function handlePaletteDragStart(event: React.DragEvent, blockType: BlockType) {
  event.dataTransfer.setData('application/datapipe-block', blockType);
  event.dataTransfer.effectAllowed = 'move';
}
