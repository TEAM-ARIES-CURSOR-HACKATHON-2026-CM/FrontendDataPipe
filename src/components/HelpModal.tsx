import { useEffect, useState } from 'react';
import { BRAND } from '../constants/branding';
import { GUIDE_SECTIONS, type GuideSectionId } from '../constants/guide';
import { GuideIllustration } from './GuideIllustration';

type HelpMode = 'guide' | 'overview';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  onStartOnboarding: () => void;
}

const SECTION_ICONS: Record<GuideSectionId, string> = {
  start: '◆',
  canvas: '◇',
  palette: '▤',
  params: '⚙',
  run: '▶',
  copilot: '✦',
  rag: '◉',
};

export function HelpModal({ open, onClose, onStartOnboarding }: HelpModalProps) {
  const [activeId, setActiveId] = useState<GuideSectionId>('start');
  const [mode, setMode] = useState<HelpMode>('overview');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setActiveId('start');
      setMode('overview');
    }
  }, [open]);

  if (!open) return null;

  const section = GUIDE_SECTIONS.find((s) => s.id === activeId) ?? GUIDE_SECTIONS[0];

  const handleStartTour = () => {
    onClose();
    onStartOnboarding();
  };

  return (
    <div className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <button
        type="button"
        className="help-modal__backdrop"
        aria-label="Fermer l'aide"
        onClick={onClose}
      />

      <div className="help-modal__panel help-modal__panel--wide">
        <header className="help-modal__head">
          <div className="help-modal__head-main">
            <p className="help-modal__eyebrow">{BRAND.sector}</p>
            <h2 id="help-modal-title" className="help-modal__title">
              Guide {BRAND.name}
            </h2>
            <p className="help-modal__subtitle">{BRAND.tagline}</p>
          </div>
          <button type="button" className="help-modal__close" aria-label="Fermer" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="help-modal__hero">
          <button
            type="button"
            className="help-modal__tour-cta"
            onClick={handleStartTour}
          >
            <span className="help-modal__tour-cta-icon" aria-hidden>
              ▶
            </span>
            <span className="help-modal__tour-cta-text">
              <strong>Visite guidée de l&apos;interface</strong>
              <span>11 étapes · surligne chaque zone et explique son rôle</span>
            </span>
          </button>
          <div className="help-modal__mode-tabs" role="tablist" aria-label="Mode d'affichage">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'overview'}
              className={`help-modal__mode-tab ${mode === 'overview' ? 'help-modal__mode-tab--active' : ''}`}
              onClick={() => setMode('overview')}
            >
              Vue d&apos;ensemble
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'guide'}
              className={`help-modal__mode-tab ${mode === 'guide' ? 'help-modal__mode-tab--active' : ''}`}
              onClick={() => setMode('guide')}
            >
              Détail par zone
            </button>
          </div>
        </div>

        <div className="help-modal__body">
          {mode === 'overview' ? (
            <div className="help-modal__grid">
              {GUIDE_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`help-card ${activeId === s.id ? 'help-card--active' : ''}`}
                  onClick={() => {
                    setActiveId(s.id);
                    setMode('guide');
                  }}
                >
                  <span className="help-card__icon" aria-hidden>
                    {SECTION_ICONS[s.id]}
                  </span>
                  <span className="help-card__title">{s.title}</span>
                  <span className="help-card__sub">{s.subtitle}</span>
                  <span className="help-card__count">{s.tips.length} astuces</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="help-modal__split">
              <nav className="help-modal__nav" aria-label="Sections du guide">
                {GUIDE_SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`help-modal__nav-item ${activeId === s.id ? 'help-modal__nav-item--active' : ''}`}
                    onClick={() => setActiveId(s.id)}
                  >
                    <span className="help-modal__nav-icon" aria-hidden>
                      {SECTION_ICONS[s.id]}
                    </span>
                    <span className="help-modal__nav-label">{s.title}</span>
                  </button>
                ))}
              </nav>

              <article className="help-modal__detail" key={section.id}>
                <div className="help-modal__detail-illus">
                  <GuideIllustration variant={section.icon} />
                </div>
                <div className="help-modal__detail-text">
                  <h3 className="help-modal__detail-title">{section.title}</h3>
                  <p className="help-modal__detail-sub">{section.subtitle}</p>
                  <ul className="help-tip-list">
                    {section.tips.map((tip) => (
                      <li key={tip.title} className="help-tip">
                        <div className="help-tip__head">
                          <span className="help-tip__title">{tip.title}</span>
                          {tip.shortcut && (
                            <kbd className="help-tip__kbd">{tip.shortcut}</kbd>
                          )}
                        </div>
                        <p className="help-tip__detail">{tip.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          )}
        </div>

        <footer className="help-modal__foot">
          <p className="help-modal__foot-hint">
            Raccourci clavier dans le parcours : <kbd>←</kbd> <kbd>→</kbd> · <kbd>Échap</kbd> pour fermer
          </p>
        </footer>
      </div>
    </div>
  );
}

export function HelpNavButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="help-nav-btn"
      data-tour="help-nav"
      aria-label="Ouvrir le guide et le parcours guidé"
      title="Guide & parcours guidé"
      onClick={onClick}
    >
      <span className="help-nav-btn__icon" aria-hidden>
        ?
      </span>
      <span className="help-nav-btn__label">Aide</span>
    </button>
  );
}
