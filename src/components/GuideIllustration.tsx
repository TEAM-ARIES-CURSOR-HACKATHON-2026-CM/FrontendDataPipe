import { useId } from 'react';
import type { GuideSectionId } from '../constants/guide';

interface GuideIllustrationProps {
  variant: GuideSectionId;
  className?: string;
}

export function GuideIllustration({ variant, className = '' }: GuideIllustrationProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <div className={`guide-illus ${className}`} aria-hidden>
      {variant === 'start' && <IllusStart uid={uid} />}
      {variant === 'canvas' && <IllusCanvas />}
      {variant === 'palette' && <IllusPalette />}
      {variant === 'params' && <IllusParams />}
      {variant === 'run' && <IllusRun />}
      {variant === 'copilot' && <IllusCopilot />}
      {variant === 'rag' && <IllusRag />}
    </div>
  );
}

function IllusStart({ uid }: { uid: string }) {
  const marker = `url(#arrow-${uid})`;
  return (
    <svg viewBox="0 0 280 120" className="guide-illus__svg">
      <defs>
        <marker id={`arrow-${uid}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" className="guide-illus__arrow" />
        </marker>
      </defs>
      <rect x="8" y="44" width="52" height="32" rx="6" className="guide-illus__node guide-illus__node--source" />
      <text x="34" y="64" className="guide-illus__label guide-illus__label--light">CSV</text>
      <path d="M60 60 H88" className="guide-illus__edge" markerEnd={marker} />
      <rect x="88" y="44" width="52" height="32" rx="6" className="guide-illus__node" />
      <text x="114" y="64" className="guide-illus__label">Filtre</text>
      <path d="M140 60 H168" className="guide-illus__edge" markerEnd={marker} />
      <rect x="168" y="44" width="52" height="32" rx="6" className="guide-illus__node" />
      <text x="194" y="64" className="guide-illus__label">Grouper</text>
      <path d="M220 60 H248" className="guide-illus__edge" markerEnd={marker} />
      <rect x="248" y="44" width="24" height="32" rx="6" className="guide-illus__node guide-illus__node--viz" />
      <text x="140" y="100" className="guide-illus__caption">Pipeline type · 4 gestes</text>
    </svg>
  );
}

function IllusCanvas() {
  return (
    <svg viewBox="0 0 280 120" className="guide-illus__svg">
      <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.6" className="guide-illus__dot" />
      </pattern>
      <rect width="280" height="120" fill="url(#grid)" opacity="0.5" />
      <rect x="40" y="36" width="64" height="40" rx="8" className="guide-illus__node guide-illus__node--active" />
      <circle cx="104" cy="56" r="5" className="guide-illus__port" />
      <path d="M109 56 H155" className="guide-illus__edge guide-illus__edge--drag" strokeDasharray="4 3" />
      <rect x="155" y="36" width="64" height="40" rx="8" className="guide-illus__node" />
      <circle cx="155" cy="56" r="5" className="guide-illus__port" />
      <text x="140" y="100" className="guide-illus__caption">● → ● · Glisser pour relier</text>
    </svg>
  );
}

function IllusPalette() {
  return (
    <svg viewBox="0 0 280 120" className="guide-illus__svg">
      <rect x="12" y="12" width="72" height="96" rx="8" className="guide-illus__panel" />
      <rect x="20" y="24" width="56" height="14" rx="4" className="guide-illus__tab guide-illus__tab--on" />
      <rect x="20" y="42" width="56" height="14" rx="4" className="guide-illus__tab" />
      <rect x="20" y="60" width="56" height="14" rx="4" className="guide-illus__tab" />
      <rect x="20" y="82" width="56" height="18" rx="4" className="guide-illus__chip" />
      <path d="M92 52 Q130 20 168 52" className="guide-illus__edge guide-illus__edge--drag" fill="none" strokeDasharray="5 4" />
      <rect x="168" y="40" width="100" height="36" rx="8" className="guide-illus__node guide-illus__node--ghost" />
      <text x="140" y="108" className="guide-illus__caption">Glisser un bloc → canevas</text>
    </svg>
  );
}

function IllusParams() {
  return (
    <svg viewBox="0 0 280 120" className="guide-illus__svg">
      <rect x="12" y="20" width="100" height="80" rx="8" className="guide-illus__node guide-illus__node--active" />
      <rect x="128" y="12" width="140" height="96" rx="8" className="guide-illus__panel" />
      <rect x="140" y="28" width="116" height="10" rx="3" className="guide-illus__field" />
      <rect x="140" y="46" width="80" height="10" rx="3" className="guide-illus__field" />
      <rect x="140" y="64" width="116" height="10" rx="3" className="guide-illus__field" />
      <rect x="140" y="82" width="64" height="16" rx="4" className="guide-illus__btn" />
      <text x="140" y="108" className="guide-illus__caption">Nœud sélectionné → réglages</text>
    </svg>
  );
}

function IllusRun() {
  return (
    <svg viewBox="0 0 280 120" className="guide-illus__svg">
      <rect x="12" y="8" width="256" height="56" rx="6" className="guide-illus__canvas-bg" />
      <rect x="12" y="72" width="256" height="40" rx="8" className="guide-illus__panel guide-illus__panel--run" />
      <rect x="24" y="84" width="88" height="16" rx="4" className="guide-illus__btn guide-illus__btn--gold" />
      <rect x="180" y="80" width="76" height="24" rx="4" className="guide-illus__chart" />
      <text x="140" y="108" className="guide-illus__caption">Valider → résultats en bas</text>
    </svg>
  );
}

function IllusCopilot() {
  return (
    <svg viewBox="0 0 280 120" className="guide-illus__svg">
      <rect x="168" y="8" width="104" height="104" rx="8" className="guide-illus__panel" />
      <rect x="180" y="24" width="80" height="36" rx="4" className="guide-illus__field" />
      <rect x="180" y="68" width="80" height="16" rx="4" className="guide-illus__btn guide-illus__btn--gold" />
      <rect x="12" y="40" width="48" height="28" rx="6" className="guide-illus__node" />
      <path d="M60 54 H100" className="guide-illus__edge" />
      <rect x="100" y="40" width="48" height="28" rx="6" className="guide-illus__node guide-illus__node--new" />
      <text x="124" y="58" className="guide-illus__spark">✦</text>
      <text x="140" y="108" className="guide-illus__caption">Français → blocs auto</text>
    </svg>
  );
}

function IllusRag() {
  return (
    <svg viewBox="0 0 280 120" className="guide-illus__svg">
      <rect x="48" y="12" width="184" height="72" rx="10" className="guide-illus__panel" />
      <rect x="60" y="28" width="120" height="8" rx="2" className="guide-illus__bubble guide-illus__bubble--user" />
      <rect x="72" y="44" width="148" height="24" rx="4" className="guide-illus__bubble guide-illus__bubble--ai" />
      <circle cx="64" cy="88" r="11" className="guide-illus__attach" />
      <text x="64" y="92" className="guide-illus__attach-icon" textAnchor="middle">
        📎
      </text>
      <rect x="200" y="76" width="56" height="36" rx="18" className="guide-illus__fab" />
      <text x="140" y="108" className="guide-illus__caption">Épingle · Q&R + sources</text>
    </svg>
  );
}
