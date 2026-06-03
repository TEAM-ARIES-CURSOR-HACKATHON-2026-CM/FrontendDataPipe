import type { BlockParams } from '../types';

export type AddColumnOp =
  | 'multiply'
  | 'divide'
  | 'add_number'
  | 'subtract_number'
  | 'add_column'
  | 'subtract_column'
  | 'copy';

export interface AddColumnOpOption {
  id: AddColumnOp;
  label: string;
  operandLabel: string;
  operandType: 'number' | 'column' | 'none';
}

export const ADD_COLUMN_OPERATIONS: AddColumnOpOption[] = [
  { id: 'multiply', label: 'Multiplier par', operandLabel: 'Nombre', operandType: 'number' },
  { id: 'divide', label: 'Diviser par', operandLabel: 'Nombre', operandType: 'number' },
  { id: 'add_number', label: 'Ajouter', operandLabel: 'Nombre', operandType: 'number' },
  { id: 'subtract_number', label: 'Soustraire', operandLabel: 'Nombre', operandType: 'number' },
  { id: 'add_column', label: 'Ajouter la colonne', operandLabel: 'Autre colonne', operandType: 'column' },
  { id: 'subtract_column', label: 'Soustraire la colonne', operandLabel: 'Autre colonne', operandType: 'column' },
  { id: 'copy', label: 'Copier la colonne', operandLabel: '', operandType: 'none' },
];

export interface AddColumnUiState {
  op: AddColumnOp;
  sourceCol: string;
  operand: string;
}

export function defaultAddColumnUi(columns: string[]): AddColumnUiState {
  const sourceCol = columns[0] ?? '';
  return { op: 'divide', sourceCol, operand: '1.2' };
}

function parseNumberOperand(raw: string): string {
  const n = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) ? String(n) : '';
}

export function buildFormulaFromUi(state: AddColumnUiState): string {
  const col = state.sourceCol.trim();
  if (!col) return '';

  switch (state.op) {
    case 'copy':
      return col;
    case 'multiply': {
      const n = parseNumberOperand(state.operand);
      return n ? `${col} * ${n}` : '';
    }
    case 'divide': {
      const n = parseNumberOperand(state.operand);
      return n ? `${col} / ${n}` : '';
    }
    case 'add_number': {
      const n = parseNumberOperand(state.operand);
      return n ? `${col} + ${n}` : '';
    }
    case 'subtract_number': {
      const n = parseNumberOperand(state.operand);
      return n ? `${col} - ${n}` : '';
    }
    case 'add_column': {
      const other = state.operand.trim();
      return other && other !== col ? `${col} + ${other}` : '';
    }
    case 'subtract_column': {
      const other = state.operand.trim();
      return other && other !== col ? `${col} - ${other}` : '';
    }
    default:
      return '';
  }
}

const IDENT = '([A-Za-z_][\\w]*)';

export function parseFormulaToUi(
  formula: string,
  columns: string[],
): AddColumnUiState | null {
  const f = formula.trim().replace(/\s+/g, ' ');
  if (!f) return null;

  const colSet = new Set(columns);

  let m = f.match(new RegExp(`^${IDENT}\\s*\\*\\s*([\\d.]+)$`));
  if (m && colSet.has(m[1])) {
    return { op: 'multiply', sourceCol: m[1], operand: m[2] };
  }

  m = f.match(new RegExp(`^${IDENT}\\s*/\\s*([\\d.]+)$`));
  if (m && colSet.has(m[1])) {
    return { op: 'divide', sourceCol: m[1], operand: m[2] };
  }

  m = f.match(new RegExp(`^${IDENT}\\s*\\+\\s*([\\d.]+)$`));
  if (m && colSet.has(m[1])) {
    return { op: 'add_number', sourceCol: m[1], operand: m[2] };
  }

  m = f.match(new RegExp(`^${IDENT}\\s*-\\s*([\\d.]+)$`));
  if (m && colSet.has(m[1])) {
    return { op: 'subtract_number', sourceCol: m[1], operand: m[2] };
  }

  m = f.match(new RegExp(`^${IDENT}\\s*\\+\\s*${IDENT}$`));
  if (m && colSet.has(m[1]) && colSet.has(m[2])) {
    return { op: 'add_column', sourceCol: m[1], operand: m[2] };
  }

  m = f.match(new RegExp(`^${IDENT}\\s*-\\s*${IDENT}$`));
  if (m && colSet.has(m[1]) && colSet.has(m[2])) {
    return { op: 'subtract_column', sourceCol: m[1], operand: m[2] };
  }

  m = f.match(new RegExp(`^${IDENT}$`));
  if (m && colSet.has(m[1])) {
    return { op: 'copy', sourceCol: m[1], operand: '' };
  }

  return null;
}

export function describeAddColumnHuman(params: BlockParams, columns: string[]): string {
  const ui = parseFormulaToUi(params.formule ?? '', columns);
  if (!ui) return params.formule?.trim() || '—';
  const op = ADD_COLUMN_OPERATIONS.find((o) => o.id === ui.op);
  if (ui.op === 'copy') return `${ui.sourceCol} → copie`;
  if (op?.operandType === 'number') {
    return `${ui.sourceCol} ${op.label.toLowerCase()} ${ui.operand}`;
  }
  if (op?.operandType === 'column') {
    return `${ui.sourceCol} ${op.label.toLowerCase()} ${ui.operand}`;
  }
  return params.formule ?? '—';
}
