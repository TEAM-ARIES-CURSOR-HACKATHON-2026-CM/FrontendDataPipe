interface CopilotNavButtonProps {
  active: boolean;
  onClick: () => void;
}

function ChatbotIcon() {
  return (
    <svg className="copilot-nav-btn__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3h6a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-2l-3 3v-3H9a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"
      />
      <circle cx="9.5" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function CopilotNavButton({ active, onClick }: CopilotNavButtonProps) {
  return (
    <button
      type="button"
      className={`copilot-nav-btn ${active ? 'copilot-nav-btn--active' : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Fermer le copilote IA' : 'Ouvrir le copilote IA'}
      title={active ? 'Fermer le copilote IA' : 'Copilote IA'}
      onClick={onClick}
    >
      <ChatbotIcon />
      <span className="copilot-nav-btn__label">Copilote</span>
    </button>
  );
}
