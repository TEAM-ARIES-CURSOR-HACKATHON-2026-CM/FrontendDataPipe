import type { Node } from '@xyflow/react';
import type { BlockNodeData, BlockParams, FilterOperator } from '../types';
import { getBlockDef } from '../constants/blocks';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  columns: string[];
  onUpdateParams: (nodeId: string, params: BlockParams) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
}

export function PropertiesPanel({
  selectedNode,
  columns,
  onUpdateParams,
  onUpdateLabel,
}: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <aside className="properties">
        <h2 className="panel-title">Propriétés</h2>
        <p className="panel-hint">Sélectionnez un bloc sur le canevas</p>
      </aside>
    );
  }

  const data = selectedNode.data as BlockNodeData;
  const def = getBlockDef(data.blockType);
  const params = data.params;

  const setParam = <K extends keyof BlockParams>(key: K, value: BlockParams[K]) => {
    onUpdateParams(selectedNode.id, { ...params, [key]: value });
  };

  return (
    <aside className="properties">
      <h2 className="panel-title">Propriétés</h2>
      <div className="properties__header" style={{ borderColor: def.color }}>
        {def.label}
      </div>

      <label className="field">
        Nom du bloc
        <input
          value={data.label}
          onChange={(e) => onUpdateLabel(selectedNode.id, e.target.value)}
        />
      </label>

      {data.blockType === 'csv' && (
        <p className="panel-hint">
          Fichier : {params.file || '— utilisez la zone d\'exécution pour téléverser'}
        </p>
      )}

      {data.blockType === 'filter' && (
        <>
          <ColumnSelect columns={columns} value={params.colonne ?? ''} onChange={(v) => setParam('colonne', v)} />
          <label className="field">
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
          <label className="field">
            Valeur
            <input value={params.valeur ?? ''} onChange={(e) => setParam('valeur', e.target.value)} />
          </label>
        </>
      )}

      {data.blockType === 'group' && (
        <>
          <ColumnSelect columns={columns} value={params.colonnes_group ?? ''} onChange={(v) => setParam('colonnes_group', v)} label="Grouper par" />
          <label className="field">
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
          <ColumnSelect columns={columns} value={params.colonne_agr ?? ''} onChange={(v) => setParam('colonne_agr', v)} label="Colonne agrégée" />
        </>
      )}

      {data.blockType === 'sort' && (
        <>
          <ColumnSelect columns={columns} value={params.colonne ?? ''} onChange={(v) => setParam('colonne', v)} />
          <label className="field">
            Ordre
            <select value={params.ordre ?? 'asc'} onChange={(e) => setParam('ordre', e.target.value as 'asc' | 'desc')}>
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </label>
        </>
      )}

      {data.blockType === 'add_column' && (
        <>
          <label className="field">
            Nom colonne
            <input value={params.nom_colonne ?? ''} onChange={(e) => setParam('nom_colonne', e.target.value)} />
          </label>
          <label className="field">
            Formule
            <input value={params.formule ?? ''} onChange={(e) => setParam('formule', e.target.value)} placeholder="montant / 1.2" />
          </label>
        </>
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
        <p className="panel-hint">Aucun paramètre — affiche le résultat du pipeline.</p>
      )}
    </aside>
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
    <label className="field">
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
