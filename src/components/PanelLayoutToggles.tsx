interface PanelLayoutTogglesProps {
  showLeft: boolean;
  showRight: boolean;
  showBottom: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleBottom: () => void;
}

type PanelSide = 'left' | 'bottom' | 'right';

function PanelLayoutIcon({ side, active }: { side: PanelSide; active: boolean }) {
  return (
    <svg
      className="panel-toggle__svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden
    >
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      {active && side === 'left' && (
        <rect x="2" y="2" width="4" height="12" rx="1" className="panel-toggle__region" />
      )}
      {active && side === 'bottom' && (
        <rect x="2" y="10" width="12" height="4" rx="1" className="panel-toggle__region" />
      )}
      {active && side === 'right' && (
        <rect x="10" y="2" width="4" height="12" rx="1" className="panel-toggle__region" />
      )}
    </svg>
  );
}

const LABELS: Record<PanelSide, { show: string; hide: string }> = {
  left: { show: 'Afficher la palette des blocs', hide: 'Masquer la palette des blocs' },
  right: { show: 'Afficher le panneau paramètres', hide: 'Masquer le panneau paramètres' },
  bottom: { show: 'Afficher la zone résultats', hide: 'Masquer la zone résultats' },
};

export function PanelLayoutToggles({
  showLeft,
  showRight,
  showBottom,
  onToggleLeft,
  onToggleRight,
  onToggleBottom,
}: PanelLayoutTogglesProps) {
  const items: { side: PanelSide; active: boolean; onClick: () => void }[] = [
    { side: 'left', active: showLeft, onClick: onToggleLeft },
    { side: 'bottom', active: showBottom, onClick: onToggleBottom },
    { side: 'right', active: showRight, onClick: onToggleRight },
  ];

  return (
    <div className="panel-toggles" role="group" aria-label="Affichage des panneaux">
      {items.map(({ side, active, onClick }) => (
        <button
          key={side}
          type="button"
          className={`panel-toggle ${active ? 'panel-toggle--on' : ''}`}
          aria-pressed={active}
          aria-label={active ? LABELS[side].hide : LABELS[side].show}
          title={active ? LABELS[side].hide : LABELS[side].show}
          onClick={onClick}
        >
          <PanelLayoutIcon side={side} active={active} />
        </button>
      ))}
    </div>
  );
}
