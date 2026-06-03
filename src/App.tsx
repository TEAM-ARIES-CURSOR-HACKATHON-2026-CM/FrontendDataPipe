import { useCallback, useState } from 'react';
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import { uploadCsv, runPipeline, generateTransformation } from './api/client';
import type { BlockNodeData, PipelineResult } from './types';
import { Palette } from './components/Palette';
import { FlowCanvas, handlePaletteDragStart, createBlockNode } from './components/FlowCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ExecutionPanel } from './components/ExecutionPanel';
import { AiAssistant } from './components/AiAssistant';
import { validatePipelineBeforeRun } from './utils/pipelineValidation';
import { isVizType } from './constants/blocks';
import './App.css';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [fileId, setFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [lastAiCode, setLastAiCode] = useState<string | null>(null);

  const updateNodeData = useCallback(
    (nodeId: string, patch: Partial<BlockNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...(n.data as BlockNodeData), ...patch } } : n,
        ),
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) =>
          prev ? { ...prev, data: { ...(prev.data as BlockNodeData), ...patch } } : null,
        );
      }
    },
    [setNodes, selectedNode],
  );

  const handleUpload = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const res = await uploadCsv(file);
      setFileId(res.file_id);
      setFileName(file.name);
      setColumns(res.columns ?? []);

      setNodes((nds) =>
        nds.map((n) => {
          const d = n.data as BlockNodeData;
          if (d.blockType !== 'csv') return n;
          return {
            ...n,
            data: { ...d, params: { ...d.params, file: file.name } },
          };
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur upload');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setError(null);
    setResult(null);

    const validationError = validatePipelineBeforeRun(nodes, edges);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!fileId) {
      setError('Téléversez un fichier CSV avant d\'exécuter.');
      return;
    }

    const vizNode = [...nodes]
      .reverse()
      .find((n) => isVizType((n.data as BlockNodeData).blockType));

    setLoading(true);
    try {
      const pipelineResult = await runPipeline({
        file_id: fileId,
        nodes: nodes.map((n) => {
          const d = n.data as BlockNodeData;
          return { id: n.id, type: d.blockType, params: d.params };
        }),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
        output_node_id: vizNode?.id,
      });
      setResult(pipelineResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur exécution');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async (description: string) => {
    setAiLoading(true);
    setError(null);
    try {
      const res = await generateTransformation(description);
      setLastAiCode(res.code);
      if (res.block_type) {
        const newNode = createBlockNode(res.block_type, { x: 280, y: 120 + nodes.length * 40 }, res.params);
        setNodes((nds) => nds.concat(newNode));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur IA');
    } finally {
      setAiLoading(false);
    }
  };

  const loadDemoPipeline = () => {
    const n1 = createBlockNode('csv', { x: 80, y: 200 });
    const n2 = createBlockNode('filter', { x: 300, y: 200 });
    const n3 = createBlockNode('group', { x: 520, y: 200 });
    const n4 = createBlockNode('bar_chart', { x: 740, y: 200 });
    setNodes([
      { ...n1, data: { ...(n1.data as BlockNodeData), params: { file: 'transactions.csv' } } },
      n2,
      n3,
      n4,
    ]);
    setEdges([
      { id: 'e1', source: n1.id, target: n2.id },
      { id: 'e2', source: n2.id, target: n3.id },
      { id: 'e3', source: n3.id, target: n4.id },
    ]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>DataPipe</h1>
          <p>ETL visuel — Hackathon J.U.I.N 2026</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={loadDemoPipeline}>
          Charger pipeline démo
        </button>
      </header>

      <div className="app-layout">
        <Palette onDragStart={handlePaletteDragStart} />

        <main className="app-main">
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            setNodes={setNodes}
            setEdges={setEdges}
            onSelectionChange={setSelectedNode}
          />
          <ExecutionPanel
            fileName={fileName}
            columns={columns}
            loading={loading}
            error={error}
            result={result}
            onUpload={handleUpload}
            onRun={handleRun}
          />
        </main>

        <div className="app-sidebar">
          <PropertiesPanel
            selectedNode={selectedNode}
            columns={columns}
            onUpdateParams={(id, params) =>
              updateNodeData(id, { params })
            }
            onUpdateLabel={(id, label) => updateNodeData(id, { label })}
          />
          <AiAssistant loading={aiLoading} onGenerate={handleAiGenerate} lastCode={lastAiCode} />
        </div>
      </div>
    </div>
  );
}
