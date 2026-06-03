import { useCallback, useMemo, useState } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import { uploadCsv, runPipeline, buildPipelineRequest } from './api/client';
import type { BlockNodeData, PipelineResult } from './types';
import { Palette } from './components/Palette';
import { FlowCanvas, handlePaletteDragStart } from './components/FlowCanvas';
import { ExecutionPanel } from './components/ExecutionPanel';
import { RightSidebar } from './components/RightSidebar';
import { validatePipelineBeforeRun } from './utils/pipelineValidation';
import { getInputColumnsAtNode } from './utils/pipelineColumns';
import { isVizType } from './constants/blocks';
import { getPieParamsFromNode, repairPieChartResult } from './utils/chartData';
import { getCsvFileIdFromNodes, getCsvFileNameFromNodes } from './utils/csvNode';
import { appendBlocksToPipeline } from './utils/pipelineConnect';
import type { ParsedBlock } from './utils/pandasToBlock';
import { BRAND } from './constants/branding';
import { BrandMark } from './components/BrandMark';
import { FinanceStrip } from './components/FinanceStrip';
import { PanelLayoutToggles } from './components/PanelLayoutToggles';
import { CopilotNavButton } from './components/CopilotNavButton';
import { CopilotSidebar } from './components/CopilotSidebar';
import { RagChatBubble } from './components/RagChatBubble';
import { HelpModal, HelpNavButton } from './components/HelpModal';
import { ToastStack } from './components/ToastStack';
import { useToasts } from './hooks/useToasts';

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode((prev) => (prev?.id === nodeId ? null : prev));
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      const removedIds = changes
        .filter((c) => c.type === 'remove')
        .map((c) => c.id);
      if (removedIds.length > 0) {
        setEdges((eds) =>
          eds.filter((e) => !removedIds.includes(e.source) && !removedIds.includes(e.target)),
        );
        setSelectedNode((prev) => (prev && removedIds.includes(prev.id) ? null : prev));
      }
    },
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const [columns, setColumns] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const { toasts, showError, showSuccess, dismiss: dismissToast } = useToasts();
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showRagChat, setShowRagChat] = useState(false);
  const [indexedDocs, setIndexedDocs] = useState<{ id: string; label: string }[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  const csvFileId = useMemo(() => getCsvFileIdFromNodes(nodes), [nodes]);
  const csvFileName = useMemo(() => getCsvFileNameFromNodes(nodes), [nodes]);

  const paramColumns = useMemo(() => {
    if (!selectedNode || columns.length === 0) return columns;
    return getInputColumnsAtNode(selectedNode.id, nodes, edges, columns) ?? columns;
  }, [selectedNode, nodes, edges, columns]);

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

  const handleCsvImport = async (nodeId: string, file: File) => {
    setUploadLoading(true);
    try {
      const res = await uploadCsv(file);
      setColumns(res.columns ?? []);

      const newParams = {
        file: file.name,
        file_id: res.file_id,
      };

      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const d = n.data as BlockNodeData;
          return {
            ...n,
            data: { ...d, params: { ...d.params, ...newParams } },
          };
        }),
      );

      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => {
          if (!prev || prev.id !== nodeId) return prev;
          const d = prev.data as BlockNodeData;
          return {
            ...prev,
            data: { ...d, params: { ...d.params, ...newParams } },
          };
        });
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur import CSV');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRun = async () => {
    setResult(null);

    const validationError = validatePipelineBeforeRun(nodes, edges, columns);
    if (validationError) {
      showError(validationError);
      return;
    }

    const fileId = getCsvFileIdFromNodes(nodes);
    if (!fileId) {
      showError('Importez un CSV via le nœud CSV sélectionné.');
      return;
    }

    const vizNode = [...nodes]
      .reverse()
      .find((n) => isVizType((n.data as BlockNodeData).blockType));

    setRunLoading(true);
    try {
      let pipelineResult = await runPipeline(
        buildPipelineRequest(nodes, edges, vizNode?.id),
      );

      if (vizNode && pipelineResult.result_type === 'pie_chart') {
        const pieParams = getPieParamsFromNode((vizNode.data as BlockNodeData).params ?? {});
        if (pieParams) {
          pipelineResult = await repairPieChartResult(pipelineResult, {
            vizNodeId: vizNode.id,
            pieParams,
            fetchTableOutput: () => {
              const tableNodes = nodes.map((n) => {
                if (n.id !== vizNode.id) return n;
                const d = n.data as BlockNodeData;
                return { ...n, data: { ...d, blockType: 'table' as const } };
              });
              return runPipeline(buildPipelineRequest(tableNodes, edges, vizNode.id));
            },
          });
        }
      }

      setResult(pipelineResult);
      setResultsOpen(true);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur exécution');
    } finally {
      setRunLoading(false);
    }
  };

  const handleAiTransformations = useCallback(
    (blocks: ParsedBlock[]) => {
      if (blocks.length === 0) return;

      const { nodes: nextNodes, edges: nextEdges, addedNodeIds } = appendBlocksToPipeline(
        nodes,
        edges,
        blocks,
      );

      setNodes(nextNodes);
      setEdges(nextEdges);

      if (addedNodeIds.length > 0) {
        const lastNode = nextNodes.find((n) => n.id === addedNodeIds.at(-1));
        const label = (lastNode?.data as BlockNodeData | undefined)?.label ?? 'Bloc';
        const countLabel =
          blocks.length > 1
            ? `${blocks.length} blocs ajoutés au pipeline`
            : `« ${label} » ajouté au pipeline`;
        showSuccess(countLabel);
        setSelectedNode(lastNode ?? null);
      }
    },
    [nodes, edges, showSuccess],
  );

  const handleDocIndexed = useCallback(
    (docId: string, label: string) => {
      setIndexedDocs((prev) =>
        prev.some((d) => d.id === docId) ? prev : [...prev, { id: docId, label }],
      );
      setShowRagChat(true);
      showSuccess('Document indexé — posez vos questions dans l’assistant.');
    },
    [showSuccess],
  );

  const layoutGridColumns = [
    showLeftPanel ? '280px' : null,
    'minmax(0, 1fr)',
    showRightPanel ? '300px' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="app">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-header__brand">
            <div className="app-header__mark">
              <BrandMark />
            </div>
            <div className="app-header__titles">
              <h1>{BRAND.name}</h1>
              <p className="app-header__tagline">{BRAND.tagline}</p>
              <FinanceStrip />
            </div>
          </div>
          <div className="app-header__tools">
            <PanelLayoutToggles
              showLeft={showLeftPanel}
              showRight={showRightPanel}
              showBottom={showBottomPanel}
              onToggleLeft={() => setShowLeftPanel((v) => !v)}
              onToggleRight={() => setShowRightPanel((v) => !v)}
              onToggleBottom={() => setShowBottomPanel((v) => !v)}
            />
            <HelpNavButton onClick={() => setShowHelp(true)} />
            <CopilotNavButton
              active={showCopilot}
              onClick={() => setShowCopilot((v) => !v)}
            />
          </div>
        </div>
      </header>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <div className="app-workspace">
      <div className="app-layout" style={{ gridTemplateColumns: layoutGridColumns }}>
        {showLeftPanel && <Palette onDragStart={handlePaletteDragStart} />}

        <main
          className={[
            'app-main',
            !showBottomPanel && 'app-main--hide-bottom',
            resultsOpen && 'app-main--results-open',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            setNodes={setNodes}
            setEdges={setEdges}
            onSelectionChange={setSelectedNode}
          />
          {showBottomPanel && (
            <ExecutionPanel
              csvLinked={Boolean(csvFileId)}
              csvFileName={csvFileName ?? null}
              loading={runLoading}
              result={result}
              resultsOpen={resultsOpen}
              onRun={handleRun}
              onToggleResults={() => setResultsOpen((v) => !v)}
            />
          )}
        </main>

        {showRightPanel && (
          <RightSidebar
            selectedNode={selectedNode}
            columns={paramColumns}
            uploadLoading={uploadLoading}
            onUpdateParams={(id, params) => updateNodeData(id, { params })}
            onUpdateLabel={(id, label) => updateNodeData(id, { label })}
            onCsvImport={handleCsvImport}
            onDeleteNode={deleteNode}
          />
        )}
      </div>

      {showCopilot && (
        <CopilotSidebar
          schema={columns}
          onTransformations={handleAiTransformations}
          onError={showError}
          onClose={() => setShowCopilot(false)}
        />
      )}

      <RagChatBubble
        open={showRagChat}
        onOpenChange={setShowRagChat}
        docs={indexedDocs}
        onDocIndexed={(docId, label) => handleDocIndexed(docId, label)}
        onError={showError}
      />
      </div>

      <footer className="app-footer">
        <span>{BRAND.name}</span>
        <span className="app-footer__sep">·</span>
        <span>Données transactionnelles · Reporting analyste · Prototypage ETL sans code</span>
      </footer>
    </div>
  );
}
