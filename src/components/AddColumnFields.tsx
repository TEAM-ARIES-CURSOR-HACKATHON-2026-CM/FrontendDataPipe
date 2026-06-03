import { useEffect, useMemo, useState } from 'react';
import type { BlockParams } from '../types';
import {
  ADD_COLUMN_OPERATIONS,
  buildFormulaFromUi,
  defaultAddColumnUi,
  parseFormulaToUi,
  type AddColumnUiState,
} from '../utils/addColumnFormula';

interface AddColumnFieldsProps {
  columns: string[];
  params: BlockParams;
  onChange: (patch: Partial<BlockParams>) => void;
}

export function AddColumnFields({ columns, params, onChange }: AddColumnFieldsProps) {
  const [advanced, setAdvanced] = useState(false);

  const initialUi = useMemo(() => {
    const parsed = parseFormulaToUi(params.formule ?? '', columns);
    if (parsed) return parsed;
    const base = defaultAddColumnUi(columns);
    if (params.formule?.trim()) return base;
    return base;
  }, [params.formule, columns]);

  const [ui, setUi] = useState<AddColumnUiState>(initialUi);

  useEffect(() => {
    setUi(initialUi);
  }, [initialUi]);

  const currentOp = ADD_COLUMN_OPERATIONS.find((o) => o.id === ui.op)!;

  const pushUi = (next: AddColumnUiState) => {
    setUi(next);
    const formule = buildFormulaFromUi(next);
    onChange({ formule });
  };

  const preview = buildFormulaFromUi(ui);

  return (
    <div className="add-column-fields">
      <label className="field field--compact">
        Nom de la nouvelle colonne
        <input
          value={params.nom_colonne ?? ''}
          onChange={(e) => onChange({ nom_colonne: e.target.value })}
          placeholder="montant_ht"
        />
      </label>

      {!advanced ? (
        <>
          <label className="field field--compact">
            Colonne de départ
            {columns.length > 0 ? (
              <select
                value={ui.sourceCol}
                onChange={(e) => pushUi({ ...ui, sourceCol: e.target.value })}
              >
                <option value="">— Choisir —</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={ui.sourceCol}
                onChange={(e) => pushUi({ ...ui, sourceCol: e.target.value })}
                placeholder="montant"
              />
            )}
          </label>

          <label className="field field--compact">
            Calcul
            <select
              value={ui.op}
              onChange={(e) => {
                const op = e.target.value as AddColumnUiState['op'];
                const meta = ADD_COLUMN_OPERATIONS.find((o) => o.id === op)!;
                let operand = ui.operand;
                if (meta.operandType === 'number' && !operand) operand = '1';
                if (meta.operandType === 'column') {
                  operand = columns.find((c) => c !== ui.sourceCol) ?? '';
                }
                if (meta.operandType === 'none') operand = '';
                pushUi({ ...ui, op, operand });
              }}
            >
              {ADD_COLUMN_OPERATIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {currentOp.operandType === 'number' && (
            <label className="field field--compact">
              {currentOp.operandLabel}
              <input
                type="text"
                inputMode="decimal"
                value={ui.operand}
                onChange={(e) => pushUi({ ...ui, operand: e.target.value })}
                placeholder={ui.op === 'divide' ? '1.2' : '100'}
              />
            </label>
          )}

          {currentOp.operandType === 'column' && (
            <label className="field field--compact">
              {currentOp.operandLabel}
              {columns.length > 0 ? (
                <select
                  value={ui.operand}
                  onChange={(e) => pushUi({ ...ui, operand: e.target.value })}
                >
                  <option value="">—</option>
                  {columns
                    .filter((c) => c !== ui.sourceCol)
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  value={ui.operand}
                  onChange={(e) => pushUi({ ...ui, operand: e.target.value })}
                />
              )}
            </label>
          )}

          {preview && (
            <p className="add-column-fields__preview">
              Aperçu : <code>{preview}</code>
            </p>
          )}
        </>
      ) : (
        <label className="field field--compact">
          Formule (mode avancé)
          <input
            value={params.formule ?? ''}
            onChange={(e) => onChange({ formule: e.target.value })}
            placeholder="montant / 1.2"
          />
        </label>
      )}

      <button
        type="button"
        className="add-column-fields__toggle"
        onClick={() => setAdvanced((v) => !v)}
      >
        {advanced ? 'Utiliser l’assistant simple' : 'Mode formule avancé'}
      </button>

      {columns.length === 0 && (
        <p className="panel-hint panel-hint--compact">
          Importez un CSV pour voir la liste des colonnes disponibles.
        </p>
      )}
    </div>
  );
}
