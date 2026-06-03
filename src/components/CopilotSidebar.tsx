import { useState } from 'react';
import { generatePandasCode } from '../api/aiClient';
import { AiAssistant } from './AiAssistant';
import { aiResponseToBlocks } from '../utils/pandasToBlock';
import type { ParsedBlock } from '../utils/pandasToBlock';

interface CopilotSidebarProps {
  schema: string[];
  onTransformations: (blocks: ParsedBlock[]) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export function CopilotSidebar({
  schema,
  onTransformations,
  onError,
  onClose,
}: CopilotSidebarProps) {
  const [generateLoading, setGenerateLoading] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);

  const handleGenerate = async (description: string) => {
    setGenerateLoading(true);
    setLastCode(null);
    setLastExplanation(null);
    try {
      const res = await generatePandasCode(description, schema);
      setLastCode(res.code);
      setLastExplanation(res.explanation);

      const blocks = aiResponseToBlocks(description, res.code, schema);
      if (blocks.length > 0) {
        onTransformations(blocks);
      } else {
        onError(
          'Code généré affiché ci-dessous, mais aucun bloc reconnu automatiquement. Ajoutez-le manuellement depuis la palette.',
        );
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Erreur génération IA');
    } finally {
      setGenerateLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="copilot-drawer__backdrop"
        aria-label="Fermer le copilote"
        onClick={onClose}
      />
      <aside className="copilot-drawer" aria-label="Copilote IA" data-tour="copilot-drawer">
        <header className="copilot-drawer__head">
          <div className="copilot-drawer__title-wrap">
            <span className="copilot-drawer__badge" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M12 2a2 2 0 0 1 2 2v1.07A8.001 8.001 0 0 1 20.93 11H22a2 2 0 1 1 0 4h-1.07A8.001 8.001 0 0 1 13 20.93V22a2 2 0 1 1-4 0v-1.07A8.001 8.001 0 0 1 3.07 15H2a2 2 0 1 1 0-4h1.07A8.001 8.001 0 0 1 11 5.07V4a2 2 0 0 1 2-2zm0 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"
                />
              </svg>
            </span>
            <h2 className="copilot-drawer__title">Copilote IA</h2>
          </div>
          <button
            type="button"
            className="copilot-drawer__close"
            aria-label="Fermer"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="copilot-drawer__body">
          <AiAssistant
            loading={generateLoading}
            schema={schema}
            onGenerate={(desc) => void handleGenerate(desc)}
            lastCode={lastCode}
            lastExplanation={lastExplanation}
            embedded
          />
        </div>
      </aside>
    </>
  );
}
