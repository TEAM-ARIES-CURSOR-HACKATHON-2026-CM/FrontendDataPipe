import { useEffect } from 'react';
import { USAGE_GUIDE } from '../constants/branding';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <button
        type="button"
        className="help-modal__backdrop"
        aria-label="Fermer l'aide"
        onClick={onClose}
      />
      <div className="help-modal__panel">
        <header className="help-modal__head">
          <h2 id="help-modal-title" className="help-modal__title">
            {USAGE_GUIDE.title}
          </h2>
          <button type="button" className="help-modal__close" aria-label="Fermer" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="help-modal__body">
          {USAGE_GUIDE.sections.map((section) => (
            <section key={section.title} className="help-modal__section">
              <h3 className="help-modal__section-title">{section.title}</h3>
              <ul className="help-modal__list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HelpNavButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="help-nav-btn"
      aria-label="Ouvrir l'aide"
      title="Aide — comment utiliser DataPipe"
      onClick={onClick}
    >
      <span className="help-nav-btn__icon" aria-hidden>
        ?
      </span>
      <span className="help-nav-btn__label">Aide</span>
    </button>
  );
}
