import type { Edge, Node } from '@xyflow/react';
import type { BlockNodeData, BlockParams, BlockType } from '../types';
import { isVizType } from '../constants/blocks';

function splitCols(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Colonnes produites en sortie d’un bloc (approximation alignée backend). */
export function getOutputColumns(
  blockType: BlockType,
  params: BlockParams,
  inputColumns: string[],
): string[] {
  switch (blockType) {
    case 'csv':
    case 'filter':
    case 'sort':
    case 'table':
      return [...inputColumns];

    case 'group': {
      const groupCols = splitCols(params.colonnes_group);
      const agg = params.colonne_agr?.trim();
      const out = groupCols.length > 0 ? [...groupCols] : [];
      if (agg) out.push(agg);
      return out.length > 0 ? [...new Set(out)] : [...inputColumns];
    }

    case 'add_column': {
      const name = params.nom_colonne?.trim();
      return name && !inputColumns.includes(name)
        ? [...inputColumns, name]
        : [...inputColumns];
    }

    case 'bar_chart':
    case 'pie_chart':
      return [...inputColumns];

    default:
      return [...inputColumns];
  }
}

/** Colonnes lues par les paramètres d’un bloc. */
export function getReferencedColumns(blockType: BlockType, params: BlockParams): string[] {
  switch (blockType) {
    case 'filter':
      return params.colonne?.trim() ? [params.colonne.trim()] : [];
    case 'group': {
      const refs = [...splitCols(params.colonnes_group)];
      if (params.colonne_agr?.trim()) refs.push(params.colonne_agr.trim());
      return refs;
    }
    case 'sort':
      return params.colonne?.trim() ? [params.colonne.trim()] : [];
    case 'add_column':
      return params.nom_colonne?.trim() ? [params.nom_colonne.trim()] : [];
    case 'bar_chart': {
      const refs: string[] = [];
      if (params.axeX?.trim()) refs.push(params.axeX.trim());
      if (params.axeY?.trim()) refs.push(params.axeY.trim());
      return refs;
    }
    case 'pie_chart': {
      const refs: string[] = [];
      if (params.axe_categorie?.trim()) refs.push(params.axe_categorie.trim());
      if (params.axe_valeur?.trim()) refs.push(params.axe_valeur.trim());
      return refs;
    }
    default:
      return [];
  }
}

/** Chaîne csv → … → nodeId (un parent par nœud). */
function buildUpstreamChain(
  nodeId: string,
  csvId: string,
  edges: Edge[],
): string[] | null {
  const parentOf = new Map<string, string>();
  for (const e of edges) parentOf.set(e.target, e.source);

  const chain: string[] = [];
  let cur: string | undefined = nodeId;
  while (cur) {
    chain.unshift(cur);
    if (cur === csvId) return chain;
    cur = parentOf.get(cur);
  }
  return null;
}

/** Colonnes disponibles à l’entrée d’un nœud (après exécution du parent). */
export function getColumnsAtNode(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  uploadColumns: string[],
): string[] | null {
  const csvNode = nodes.find((n) => (n.data as BlockNodeData).blockType === 'csv');
  if (!csvNode || uploadColumns.length === 0) return null;

  const chain = buildUpstreamChain(nodeId, csvNode.id, edges);
  if (!chain) return null;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  let cols = [...uploadColumns];

  for (const id of chain) {
    const node = nodeMap.get(id);
    if (!node) return null;
    const d = node.data as BlockNodeData;
    cols = getOutputColumns(d.blockType, d.params, cols);
  }

  return cols;
}

/** Colonnes disponibles juste avant le nœud (entrée du bloc). */
export function getInputColumnsAtNode(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  uploadColumns: string[],
): string[] | null {
  const parentOf = new Map<string, string>();
  for (const e of edges) parentOf.set(e.target, e.source);
  const parentId = parentOf.get(nodeId);
  if (!parentId) {
    const n = nodes.find((x) => x.id === nodeId);
    if ((n?.data as BlockNodeData | undefined)?.blockType === 'csv') {
      return [...uploadColumns];
    }
    return null;
  }
  return getColumnsAtNode(parentId, nodes, edges, uploadColumns);
}

export function validatePipelineColumns(
  nodes: Node[],
  edges: Edge[],
  uploadColumns: string[],
): string | null {
  if (uploadColumns.length === 0) return null;

  for (const node of nodes) {
    const d = node.data as BlockNodeData;
    const inputCols = getInputColumnsAtNode(node.id, nodes, edges, uploadColumns);
    if (!inputCols) continue;

    const refs = getReferencedColumns(d.blockType, d.params);
    for (const col of refs) {
      if (!inputCols.includes(col)) {
        const label = d.label || d.blockType;
        const available = inputCols.join(', ');
        if (isVizType(d.blockType)) {
          return (
            `Le bloc « ${label} » utilise la colonne « ${col} », qui n’existe plus après les étapes précédentes. ` +
            `Colonnes disponibles : ${available}. ` +
            (d.blockType === 'pie_chart'
              ? `Ex. après un Grouper par client_id : catégorie client_id, valeur montant.`
              : `Ex. après un Grouper par client_id : axe X client_id, axe Y montant.`)
          );
        }
        return (
          `Le bloc « ${label} » référence la colonne « ${col} », absente à cette étape. ` +
          `Colonnes disponibles : ${available}.`
        );
      }
    }
  }

  return null;
}
