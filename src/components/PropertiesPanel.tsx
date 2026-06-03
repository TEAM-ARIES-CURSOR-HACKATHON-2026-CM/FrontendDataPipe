import type { Node } from '@xyflow/react';
import type { BlockNodeData, BlockParams, FilterOperator } from '../types';
import type { SourceBlockTypeConst } from '../constants/blocks';
import { getBlockDef, isSourceType } from '../constants/blocks';
import { BlockIcon } from '../constants/blockIcons';
import { PALETTE_CATEGORIES, SOURCE_FORMATS_LABEL } from '../constants/branding';
import { AddColumnFields } from './AddColumnFields';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  columns: string[];
  uploadLoading: boolean;
  onUpdateParams: (nodeId: string, params: BlockParams) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onSourceImport: (nodeId: string, file: File) => void;
  onDeleteNode: (nodeId: string) => void;
  embedded?: boolean;
}

const SOURCE_ACCEPT: Record<SourceBlockTypeConst, string> = {
  csv: '.csv,text/csv',
  json: '.json,application/json',
  sql: '.sql,text/plain,text/sql',
};

export function PropertiesPanel({
  selectedNode,
  columns,
  uploadLoading,
  onUpdateParams,
  onUpdateLabel,
  onSourceImport,
  onDeleteNode,
  embedded = false,
}: PropertiesPanelProps) {
  const Tag = embedded ? 'div' : 'aside';
  const cls = embedded ? 'properties properties--embedded' : 'properties';

  if (!selectedNode) {
    return (
      <Tag className={cls}>
        {!embedded && <h2 className="panel-title">Paramètres métier</h2>}
        <p className="panel-hint panel-hint--compact">
          Cliquez un nœud sur le canevas. Pour une source ({SOURCE_FORMATS_LABEL}), importez le fichier ici.
        </p>
        <ul className="properties__fields-hint">
          <li>montant</li>
          <li>client_id</li>
          <li>type</li>
          <li>agence</li>
          <li>date</li>
        </ul>
      </Tag>
    );
  }

  const data = selectedNode.data as BlockNodeData;
  const def = getBlockDef(data.blockType);
  const params = data.params;

  const setParam = <K extends keyof BlockParams>(key: K, value: BlockParams[K]) => {
    onUpdateParams(selectedNode.id, { ...params, [key]: value });
  };

  const isSourceBlock = isSourceType(data.blockType);

  return (
    <Tag className={cls}>
      {!embedded && <h2 className="panel-title">Paramètres métier</h2>}
      <div
        className="properties__header"
        style={{ '--block-accent': def.color } as React.CSSProperties}
      >
        <span className="properties__header-icon" aria-hidden>
          <BlockIcon type={data.blockType} />
        </span>
        <div className="properties__header-text">
          <span className="properties__header-title">{def.label}</span>
          <span className="properties__header-meta">
            {PALETTE_CATEGORIES[def.category].title}
          </span>
        </div>
      </div>

      <label className="field field--compact">
        Nom
        <input
          value={data.label}
          onChange={(e) => onUpdateLabel(selectedNode.id, e.target.value)}
        />
      </label>

      {isSourceBlock && (
        <div className="csv-import csv-import--compact">
          <label className="btn btn--primary csv-import__btn file-btn">
            {uploadLoading ? 'Import…' : params.file ? 'Remplacer' : `Importer ${def.label}`}
            <input
              type="file"
              accept={SOURCE_ACCEPT[data.blockType as SourceBlockTypeConst]}
              hidden
              disabled={uploadLoading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onSourceImport(selectedNode.id, f);
                e.target.value = '';
              }}
            />
          </label>
          {params.file_id ? (
            <p className="csv-import__status-line csv-import__status-line--ok">
              Lié : <strong>{params.file}</strong>
              {columns.length > 0 && ` · ${columns.length} col.`}
            </p>
          ) : (
            <p className="panel-hint">Aucun fichier lié</p>
          )}
          {data.blockType === 'sql' && (
            <p className="panel-hint panel-hint--compact sql-import__hint">
              Script SQL avec <strong>CREATE TABLE</strong> + <strong>INSERT</strong>, ou une requête{' '}
              <strong>SELECT</strong> autonome. Évitez un SELECT sur une table non créée dans le fichier.
              Démo : <code>data/transactions.sql</code>.
            </p>
          )}
        </div>
      )}

      {data.blockType === 'filter' && (
        <>
          <ColumnSelect columns={columns} value={params.colonne ?? ''} onChange={(v) => setParam('colonne', v)} />
          <label className="field field--compact">
            Opérateur
            <select
              value={params.operateur ?? '>'}
              onChange={(e) => setParam('operateur', e.target.value as FilterOperator)}
            >
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value="=">=</option>
              <option value="!=">≠</option>
              <option value="contains">contient</option>
            </select>
          </label>
          <label className="field field--compact">
            Valeur
            <input value={params.valeur ?? ''} onChange={(e) => setParam('valeur', e.target.value)} />
          </label>
        </>
      )}

      {data.blockType === 'group' && (
        <>
          <ColumnSelect columns={columns} value={params.colonnes_group ?? ''} onChange={(v) => setParam('colonnes_group', v)} label="Grouper par" />
          <label className="field field--compact">
            Agrégation
            <select
              value={params.agregation ?? 'sum'}
              onChange={(e) => setParam('agregation', e.target.value as BlockParams['agregation'])}
            >
              <option value="sum">Somme</option>
              <option value="mean">Moyenne</option>
              <option value="count">Compte</option>
            </select>
          </label>
          <ColumnSelect columns={columns} value={params.colonne_agr ?? ''} onChange={(v) => setParam('colonne_agr', v)} label="Colonne" />
        </>
      )}

      {data.blockType === 'sort' && (
        <>
          <ColumnSelect columns={columns} value={params.colonne ?? ''} onChange={(v) => setParam('colonne', v)} />
          <label className="field field--compact">
            Ordre
            <select value={params.ordre ?? 'asc'} onChange={(e) => setParam('ordre', e.target.value as 'asc' | 'desc')}>
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </label>
        </>
      )}

      {data.blockType === 'add_column' && (
        <AddColumnFields
          columns={columns}
          params={params}
          onChange={(patch) => onUpdateParams(selectedNode.id, { ...params, ...patch })}
        />
      )}

      {data.blockType === 'bar_chart' && (
        <>
          <ColumnSelect columns={columns} value={params.axeX ?? ''} onChange={(v) => setParam('axeX', v)} label="Axe X" />
          <ColumnSelect columns={columns} value={params.axeY ?? ''} onChange={(v) => setParam('axeY', v)} label="Axe Y" />
        </>
      )}

      {data.blockType === 'pie_chart' && (
        <>
          <ColumnSelect columns={columns} value={params.axe_categorie ?? ''} onChange={(v) => setParam('axe_categorie', v)} label="Catégorie" />
          <ColumnSelect columns={columns} value={params.axe_valeur ?? ''} onChange={(v) => setParam('axe_valeur', v)} label="Valeur" />
        </>
      )}

      {data.blockType === 'table' && (
        <p className="panel-hint">Sortie tableau — aucun paramètre.</p>
      )}

      <div className="properties__actions">
        <button
          type="button"
          className="btn btn--danger btn--block"
          onClick={() => onDeleteNode(selectedNode.id)}
        >
          Supprimer ce bloc
        </button>
      </div>
    </Tag>
  );
}

function ColumnSelect({
  columns,
  value,
  onChange,
  label = 'Colonne',
}: {
  columns: string[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <label className="field field--compact">
      {label}
      {columns.length > 0 ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {columns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
