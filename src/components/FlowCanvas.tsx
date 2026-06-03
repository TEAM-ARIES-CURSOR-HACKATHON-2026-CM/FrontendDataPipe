import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  ReactFlowProvider,
  PanOnScrollMode,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { BlockNodeData, BlockParams, BlockType } from '../types';
import { BlockNode } from './nodes/BlockNode';
import { PipelineEdge } from './edges/PipelineEdge';
import { FlowMarkers } from './background/FlowMarkers';
import { getBlockDef } from '../constants/blocks';
import { isValidConnection } from '../utils/pipelineValidation';

const nodeTypes = { block: BlockNode };
const edgeTypes = { pipeline: PipelineEdge };

const defaultEdgeOptions = {
  type: 'pipeline' as const,
  animated: false,
  interactionWidth: 20,
};

const connectionLineStyle = {
  stroke: '#1a1a1a',
  strokeWidth: 2,
  strokeDasharray: '6 4',
};

let nodeId = 0;
const nextId = () => `node_${++nodeId}`;

interface FlowCanvasInnerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
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
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.target}`,
            type: 'pipeline',
          },
          eds,
        ),
      );
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
    (_: React.MouseEvent, node: Node) => {
      setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
      onSelectionChange(node);
    },
    [setNodes, onSelectionChange],
  );

  const onPaneClick = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    onSelectionChange(null);
  }, [setNodes, onSelectionChange]);

  return (
    <div className="flow-canvas" ref={reactFlowWrapper} data-tour="canvas">
      <div className="flow-canvas__notebook" aria-hidden />
      <FlowMarkers />
      {nodes.length === 0 && (
        <div className="flow-canvas__empty">
          <p><strong>Canevas vide</strong></p>
          <p>Glissez un bloc <strong>CSV</strong> depuis la palette à gauche, puis connectez vos transformations.</p>
        </div>
      )}
      <div className="flow-canvas__viewport">
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
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        fitView={nodes.length > 0}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        translateExtent={[
          [-4000, -4000],
          [4000, 4000],
        ]}
        minZoom={0.2}
        maxZoom={2}
        panOnDrag
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        panOnScrollSpeed={0.85}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick={false}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        className="datapipe-flow"
      >
        <Controls className="flow-controls" showInteractive={false} />
        <MiniMap
          className="flow-minimap"
          nodeColor={(n) => {
            const t = (n.data as BlockNodeData | undefined)?.blockType;
            return t ? getBlockDef(t).color : '#1a1a1a';
          }}
          maskColor="rgba(26, 26, 26, 0.08)"
        />
      </ReactFlow>
      </div>
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

export function createBlockNode(
  blockType: BlockType,
  position: { x: number; y: number },
  params?: BlockParams,
): Node {
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
