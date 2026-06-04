import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { uploadDataFile, runPipeline, buildPipelineRequest } from './api/client';
import type { BlockNodeData, PipelineResult, PipelineRunMeta } from './types';
import type { PipelineRunPhase } from './types/execution';
import { Palette } from './components/Palette';
import { FlowCanvas, handlePaletteDragStart } from './components/FlowCanvas';
import { ExecutionPanel } from './components/ExecutionPanel';
import { RightSidebar } from './components/RightSidebar';
import { validatePipelineBeforeRun } from './utils/pipelineValidation';
import { getInputColumnsAtNode } from './utils/pipelineColumns';
import { isVizType } from './constants/blocks';
import { getPieParamsFromNode, repairPieChartResult } from './utils/chartData';
import { getSourceFileIdFromNodes, getSourceFileNameFromNodes } from './utils/sourceNode';
import { formatSourceImportError } from './utils/sourceImport';
import { appendBlocksToPipeline } from './utils/pipelineConnect';
import type { ParsedBlock } from './utils/pandasToBlock';
import { BRAND, SOURCE_FORMATS_LABEL } from './constants/branding';
import { BrandMark } from './components/BrandMark';
import { FinanceStrip } from './components/FinanceStrip';
import { PanelLayoutToggles } from './components/PanelLayoutToggles';
import { CopilotNavButton } from './components/CopilotNavButton';
import { CopilotSidebar } from './components/CopilotSidebar';
import { RagChatBubble } from './components/RagChatBubble';
import { HelpModal, HelpNavButton } from './components/HelpModal';
import { IntroLandingDrawer, IntroNavButton } from './components/IntroLandingDrawer';
import { shouldShowIntro } from './constants/intro';
import { OnboardingTour } from './components/OnboardingTour';
import type { OnboardingAction } from './constants/guide';
import { ToastStack } from './components/ToastStack';
import { useToasts } from './hooks/useToasts';
import { countTransformBlocks } from './utils/pipelineStats';
import {
  PipelineLibraryModal,
  type PipelineLoadOptions,
} from './components/PipelineLibraryModal';
import { shouldShowEngineWakeHint, markEngineWakeHintShown } from './utils/engineWakeHint';
import { usePipelineRunShortcut } from './hooks/usePipelineRunShortcut';
import { usePanelResize } from './hooks/usePanelResize';
import { PanelResizeHandle } from './components/PanelResizeHandle';
import {
  DEFAULT_LEFT_PANEL_W,
  DEFAULT_RIGHT_PANEL_W,
  LEFT_KEY,
  RIGHT_KEY,
  readPanelWidth,
  writePanelWidth,
} from './utils/panelWidthStorage';

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
  const [sourcePreview, setSourcePreview] = useState<Record<string, unknown>[]>([]);
  const [sourceRowCount, setSourceRowCount] = useState<number | undefined>(undefined);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [runPhase, setRunPhase] = useState<PipelineRunPhase | null>(null);
  const uploadSessionRef = useRef(0);
  const { toasts, showError, showSuccess, showInfo, dismiss: dismissToast } = useToasts();
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [runMeta, setRunMeta] = useState<PipelineRunMeta | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showRagChat, setShowRagChat] = useState(false);
  const [indexedDocs, setIndexedDocs] = useState<{ id: string; label: string }[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [showPipelineLibrary, setShowPipelineLibrary] = useState(false);

  const leftPanel = usePanelResize({
    axis: 'horizontal',
    initial: readPanelWidth(LEFT_KEY, DEFAULT_LEFT_PANEL_W),
    min: 220,
    max: 480,
    direction: 1,
  });

  const rightPanel = usePanelResize({
    axis: 'horizontal',
    initial: readPanelWidth(RIGHT_KEY, DEFAULT_RIGHT_PANEL_W),
    min: 280,
    max: 640,
    direction: -1,
  });

  useEffect(() => {
    writePanelWidth(LEFT_KEY, leftPanel.size);
  }, [leftPanel.size]);

  useEffect(() => {
    writePanelWidth(RIGHT_KEY, rightPanel.size);
  }, [rightPanel.size]);

  const handleIntroEnter = useCallback(({ withGuide }: { withGuide: boolean }) => {
    setShowIntro(false);
    if (withGuide) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingAction = useCallback((action: OnboardingAction) => {
    switch (action) {
      case 'show-all-panels':
        setShowLeftPanel(true);
        setShowRightPanel(true);
        setShowBottomPanel(true);
        break;
      case 'show-palette':
        setShowLeftPanel(true);
        break;
      case 'show-params':
        setShowRightPanel(true);
        break;
      case 'show-run':
        setShowBottomPanel(true);
        break;
      case 'open-copilot':
        setShowCopilot(true);
        setShowRagChat(false);
        break;
      case 'close-copilot':
        setShowCopilot(false);
        break;
      case 'open-rag':
        setShowRagChat(true);
        setShowCopilot(false);
        break;
      case 'close-rag':
        setShowRagChat(false);
        break;
      default:
        break;
    }
  }, []);

  const tourLayoutKey = `${showLeftPanel}-${showRightPanel}-${showBottomPanel}-${showCopilot}-${showRagChat}`;

  const sourceFileId = useMemo(() => getSourceFileIdFromNodes(nodes), [nodes]);
  const sourceFileName = useMemo(() => getSourceFileNameFromNodes(nodes), [nodes]);

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

  const handleSourceImport = async (nodeId: string, file: File) => {
    const session = ++uploadSessionRef.current;
    setUploadLoading(true);
    let wakeTimer: ReturnType<typeof setTimeout> | undefined;

    if (shouldShowEngineWakeHint()) {
      wakeTimer = window.setTimeout(() => {
        if (uploadSessionRef.current !== session) return;
        markEngineWakeHintShown();
        showInfo(
          'Réveil du moteur ETL en cours… Le premier import peut prendre jusqu’à une minute.',
        );
      }, 8000);
    }

    try {
      const res = await uploadDataFile(file);
      setColumns(res.columns ?? []);
      setSourcePreview(res.preview ?? []);
      setSourceRowCount(res.row_count);

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
      const node = nodes.find((n) => n.id === nodeId);
      const blockType = (node?.data as BlockNodeData | undefined)?.blockType ?? 'csv';
      const raw = e instanceof Error ? e.message : 'Erreur import fichier';
      showError(formatSourceImportError(blockType, raw));
    } finally {
      if (wakeTimer) window.clearTimeout(wakeTimer);
      setUploadLoading(false);
    }
  };

  const handleRun = useCallback(async () => {
    setResult(null);

    const validationError = validatePipelineBeforeRun(nodes, edges, columns);
    if (validationError) {
      showError(validationError);
      return;
    }

    const fileId = getSourceFileIdFromNodes(nodes);
    if (!fileId) {
      showError(`Importez un fichier via le bloc source (${SOURCE_FORMATS_LABEL}).`);
      return;
    }

    const vizNode = [...nodes]
      .reverse()
      .find((n) => isVizType((n.data as BlockNodeData).blockType));

    setRunLoading(true);
    setRunMeta(null);
    setRunPhase('pipeline');
    const t0 = performance.now();
    try {
      let pipelineResult = await runPipeline(
        buildPipelineRequest(nodes, edges, vizNode?.id),
      );

      if (vizNode && pipelineResult.result_type === 'pie_chart') {
        const pieParams = getPieParamsFromNode((vizNode.data as BlockNodeData).params ?? {});
        if (pieParams) {
          setRunPhase('chart');
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
      setRunMeta({
        durationMs: performance.now() - t0,
        rowCount: pipelineResult.row_count ?? pipelineResult.data.length,
        transformCount: countTransformBlocks(nodes),
      });
      setResultsOpen(true);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur exécution');
    } finally {
      setRunLoading(false);
      setRunPhase(null);
    }
  }, [nodes, edges, columns, showError]);

  const canRunPipeline = Boolean(sourceFileId) && !runLoading;
  usePipelineRunShortcut(() => void handleRun(), canRunPipeline);

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

  const handleLoadPipeline = useCallback(
    (nextNodes: Node[], nextEdges: Edge[], options?: PipelineLoadOptions) => {
      setNodes(nextNodes);
      setEdges(nextEdges);
      setSelectedNode(null);
      setResult(null);
      setRunMeta(null);
      setResultsOpen(false);
      if (options?.hideLeftPanel) {
        setShowLeftPanel(false);
        setShowRightPanel(true);
      }
      if (!getSourceFileIdFromNodes(nextNodes)) {
        setColumns([]);
        setSourcePreview([]);
        setSourceRowCount(undefined);
      }
    },
    [],
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

  return (
    <div className="app">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <header className="app-header">
        <div className="app-header__top">
          <div className="app-header__brand" data-tour="header-brand">
            <div className="app-header__mark">
              <BrandMark />
            </div>
            <div className="app-header__titles">
              <h1>{BRAND.name}</h1>
              <p className="app-header__tagline">{BRAND.tagline}</p>
              <FinanceStrip />
            </div>
          </div>
          <div className="app-header__tools" data-tour="header-nav">
            <PanelLayoutToggles
              showLeft={showLeftPanel}
              showRight={showRightPanel}
              showBottom={showBottomPanel}
              onToggleLeft={() => setShowLeftPanel((v) => !v)}
              onToggleRight={() => setShowRightPanel((v) => !v)}
              onToggleBottom={() => setShowBottomPanel((v) => !v)}
            />
            <IntroNavButton onClick={() => setShowIntro(true)} />
            <HelpNavButton onClick={() => setShowHelp(true)} />
            <CopilotNavButton
              active={showCopilot}
              onClick={() => setShowCopilot((v) => !v)}
            />
          </div>
        </div>
      </header>

      <PipelineLibraryModal
        open={showPipelineLibrary}
        nodes={nodes}
        edges={edges}
        onClose={() => setShowPipelineLibrary(false)}
        onLoad={handleLoadPipeline}
        onError={showError}
        onSuccess={showSuccess}
      />

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        onStartOnboarding={() => setShowOnboarding(true)}
      />

      <IntroLandingDrawer open={showIntro} onEnter={handleIntroEnter} />

      <OnboardingTour
        open={showOnboarding && !showIntro}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
        onAction={handleOnboardingAction}
        layoutKey={tourLayoutKey}
      />

      <div className="app-workspace">
      <div className="app-layout">
        {showLeftPanel && (
          <>
            <div
              className="app-layout__panel app-layout__panel--left"
              style={{ width: leftPanel.size }}
            >
              <Palette
                onDragStart={handlePaletteDragStart}
                onOpenPipelineLibrary={() => setShowPipelineLibrary(true)}
              />
            </div>
            <PanelResizeHandle edge="right" onPointerDown={leftPanel.onPointerDown} />
          </>
        )}

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
              sourceLinked={Boolean(sourceFileId)}
              sourceFileName={sourceFileName ?? null}
              loading={runLoading}
              runPhase={runPhase}
              result={result}
              runMeta={runMeta}
              resultsOpen={resultsOpen}
              onRun={handleRun}
              onToggleResults={() => setResultsOpen((v) => !v)}
            />
          )}
        </main>

        {showRightPanel && (
          <>
            <PanelResizeHandle edge="left" onPointerDown={rightPanel.onPointerDown} />
            <div
              className="app-layout__panel app-layout__panel--right"
              style={{ width: rightPanel.size }}
            >
              <RightSidebar
                selectedNode={selectedNode}
                columns={paramColumns}
                uploadLoading={uploadLoading}
                onUpdateParams={(id, params) => updateNodeData(id, { params })}
                onUpdateLabel={(id, label) => updateNodeData(id, { label })}
                onSourceImport={handleSourceImport}
                onDeleteNode={deleteNode}
                sourcePreview={sourcePreview}
                sourceRowCount={sourceRowCount}
              />
            </div>
          </>
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
