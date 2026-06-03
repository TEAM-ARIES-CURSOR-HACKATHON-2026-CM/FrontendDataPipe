import { AiAssistant } from './AiAssistant';

interface CopilotSidebarProps {
  loading: boolean;
  lastCode: string | null;
  onGenerate: (description: string) => void;
  onClose: () => void;
}

export function CopilotSidebar({ loading, lastCode, onGenerate, onClose }: CopilotSidebarProps) {
  return (
    <>
      <button
        type="button"
        className="copilot-drawer__backdrop"
        aria-label="Fermer le copilote"
        onClick={onClose}
      />
      <aside className="copilot-drawer" aria-label="Copilote IA">
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
            loading={loading}
            onGenerate={onGenerate}
            lastCode={lastCode}
            embedded
          />
        </div>
      </aside>
    </>
  );
}
