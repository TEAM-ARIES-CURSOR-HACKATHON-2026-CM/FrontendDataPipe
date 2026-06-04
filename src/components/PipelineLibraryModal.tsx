import { useEffect, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { BRAND } from '../constants/branding';
import {
  PIPELINE_TEMPLATES,
  PIPELINE_TEMPLATE_CATEGORIES,
  type PipelineTemplate,
  type PipelineTemplateCategory,
} from '../constants/pipelineLibrary';
import {
  deleteSavedPipeline,
  downloadPipelineJson,
  listSavedPipelines,
  parsePipelineFileText,
  saveNamedPipeline,
  deserializePipeline,
  type SavedPipelineRecord,
} from '../utils/pipelinePersistence';
import { instantiatePipelineTemplate } from '../utils/instantiatePipelineTemplate';
import { getSourceFileIdFromNodes } from '../utils/sourceNode';

type TabId = 'saved' | 'library';

export interface PipelineLoadOptions {
  /** Masque la palette pour maximiser canevas + aperçu (chargement d’un modèle). */
  hideLeftPanel?: boolean;
}

interface PipelineLibraryModalProps {
  open: boolean;
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onLoad: (nodes: Node[], edges: Edge[], options?: PipelineLoadOptions) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function PipelineLibraryModal({
  open,
  nodes,
  edges,
  onClose,
  onLoad,
  onError,
  onSuccess,
}: PipelineLibraryModalProps) {
  const [tab, setTab] = useState<TabId>('library');
  const [saveName, setSaveName] = useState('');
  const [savedList, setSavedList] = useState<SavedPipelineRecord[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<PipelineTemplateCategory | 'all'>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshSaved = () => setSavedList(listSavedPipelines());

  useEffect(() => {
    if (open) {
      refreshSaved();
      setSaveName('');
      setLibraryFilter('all');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const applyLoad = (
    nextNodes: Node[],
    nextEdges: Edge[],
    label: string,
    options?: PipelineLoadOptions,
  ) => {
    onLoad(nextNodes, nextEdges, options);
    const hasFile = Boolean(getSourceFileIdFromNodes(nextNodes));
    onSuccess(
      hasFile
        ? `« ${label} » chargé.`
        : `« ${label} » chargé — importez un fichier sur le bloc source.`,
    );
    onClose();
  };

  const handleSave = () => {
    if (nodes.length === 0) {
      onError('Le canevas est vide : rien à sauvegarder.');
      return;
    }
    const record = saveNamedPipeline(saveName, nodes, edges);
    refreshSaved();
    setSaveName('');
    setTab('saved');
    onSuccess(`Pipeline « ${record.name} » enregistré.`);
  };

  const handleLoadSaved = (record: SavedPipelineRecord) => {
    const restored = deserializePipeline(record.snapshot);
    if (typeof restored === 'string') {
      onError(restored);
      return;
    }
    applyLoad(restored.nodes, restored.edges, record.name);
  };

  const handleDelete = (id: string, name: string) => {
    if (!deleteSavedPipeline(id)) return;
    refreshSaved();
    onSuccess(`« ${name} » supprimé.`);
  };

  const handleUseTemplate = (template: PipelineTemplate) => {
    const { nodes: tplNodes, edges: tplEdges } = instantiatePipelineTemplate(template);
    applyLoad(tplNodes, tplEdges, template.name, { hideLeftPanel: true });
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parsePipelineFileText(text);
      if (typeof parsed === 'string') {
        onError(parsed);
        return;
      }
      const restored = deserializePipeline(parsed);
      if (typeof restored === 'string') {
        onError(restored);
        return;
      }
      applyLoad(restored.nodes, restored.edges, file.name);
    } catch {
      onError('Import impossible.');
    }
  };

  const filteredTemplates =
    libraryFilter === 'all'
      ? PIPELINE_TEMPLATES
      : PIPELINE_TEMPLATES.filter((t) => t.category === libraryFilter);

  return (
    <div
      className="help-modal pipeline-lib"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pipeline-lib-title"
    >
      <button
        type="button"
        className="help-modal__backdrop"
        aria-label="Fermer"
        onClick={onClose}
      />

      <div className="help-modal__panel help-modal__panel--wide pipeline-lib__panel">
        <header className="help-modal__head">
          <div className="help-modal__head-main">
            <p className="help-modal__eyebrow">{BRAND.name}</p>
            <h2 id="pipeline-lib-title" className="help-modal__title">
              Pipelines
            </h2>
            <p className="help-modal__subtitle">
              Sauvegardez vos flux ou partez d’un modèle métier prêt à l’emploi.
            </p>
          </div>
          <button type="button" className="help-modal__close" aria-label="Fermer" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="pipeline-lib__save-bar">
          <input
            type="text"
            className="pipeline-lib__name-input"
            placeholder="Nom du pipeline (ex. Reporting mensuel)"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
          <button type="button" className="btn btn--primary btn--sm" onClick={handleSave}>
            Sauvegarder le canevas
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={nodes.length === 0}
            onClick={() => downloadPipelineJson(nodes, edges)}
          >
            Exporter JSON
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => fileRef.current?.click()}
          >
            Importer JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
              e.target.value = '';
            }}
          />
        </div>

        <div className="help-modal__mode-tabs">
          <button
            type="button"
            className={`help-modal__mode-tab ${tab === 'library' ? 'help-modal__mode-tab--active' : ''}`}
            onClick={() => setTab('library')}
          >
            Bibliothèque ({PIPELINE_TEMPLATES.length})
          </button>
          <button
            type="button"
            className={`help-modal__mode-tab ${tab === 'saved' ? 'help-modal__mode-tab--active' : ''}`}
            onClick={() => setTab('saved')}
          >
            Mes sauvegardes ({savedList.length})
          </button>
        </div>

        <div className="pipeline-lib__body">
          {tab === 'library' && (
            <>
              <div className="pipeline-lib__filters">
                <button
                  type="button"
                  className={`pipeline-lib__chip ${libraryFilter === 'all' ? 'pipeline-lib__chip--active' : ''}`}
                  onClick={() => setLibraryFilter('all')}
                >
                  Tous
                </button>
                {(Object.keys(PIPELINE_TEMPLATE_CATEGORIES) as PipelineTemplateCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`pipeline-lib__chip ${libraryFilter === cat ? 'pipeline-lib__chip--active' : ''}`}
                      onClick={() => setLibraryFilter(cat)}
                      title={PIPELINE_TEMPLATE_CATEGORIES[cat].hint}
                    >
                      {PIPELINE_TEMPLATE_CATEGORIES[cat].label}
                    </button>
                  ),
                )}
              </div>
              <ul className="pipeline-lib__grid">
                {filteredTemplates.map((tpl) => (
                  <li key={tpl.id} className="pipeline-lib__card">
                    <span className="pipeline-lib__card-cat">
                      {PIPELINE_TEMPLATE_CATEGORIES[tpl.category].label}
                    </span>
                    <h3 className="pipeline-lib__card-title">{tpl.name}</h3>
                    <p className="pipeline-lib__card-desc">{tpl.description}</p>
                    <p className="pipeline-lib__card-meta">
                      {tpl.steps.length} blocs · {tpl.steps.map((s) => s.type).join(' → ')}
                    </p>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm pipeline-lib__card-btn"
                      onClick={() => handleUseTemplate(tpl)}
                    >
                      Utiliser ce modèle
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === 'saved' && (
            <div className="pipeline-lib__saved">
              {savedList.length === 0 ? (
                <p className="panel-hint pipeline-lib__empty">
                  Aucune sauvegarde. Saisissez un nom ci-dessus puis « Sauvegarder le canevas ».
                </p>
              ) : (
                <ul className="pipeline-lib__saved-list">
                  {savedList.map((record) => (
                    <li key={record.id} className="pipeline-lib__saved-item">
                      <div className="pipeline-lib__saved-info">
                        <strong>{record.name}</strong>
                        <span className="pipeline-lib__saved-date">
                          {formatDate(record.savedAt)} · {record.snapshot.nodes.length} blocs
                        </span>
                      </div>
                      <div className="pipeline-lib__saved-actions">
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => handleLoadSaved(record)}
                        >
                          Ouvrir
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() =>
                            downloadPipelineJson(
                              record.snapshot.nodes.map((n) => ({
                                id: n.id,
                                type: 'block',
                                position: n.position,
                                data: n.data,
                              })),
                              record.snapshot.edges.map((e) => ({
                                id: e.id,
                                source: e.source,
                                target: e.target,
                                type: 'pipeline',
                              })),
                              `${record.name.replace(/\s+/g, '-')}.json`,
                            )
                          }
                        >
                          JSON
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm btn--danger-text"
                          onClick={() => handleDelete(record.id, record.name)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
