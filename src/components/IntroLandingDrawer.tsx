import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BRAND,
  FINANCE_BADGES,
  INTRO_FEATURES,
  INTRO_STEPS,
  markIntroSeen,
} from '../constants/intro';

interface IntroLandingDrawerProps {
  open: boolean;
  onEnter: (options: { withGuide: boolean }) => void;
}

export function IntroLandingDrawer({ open, onEnter }: IntroLandingDrawerProps) {
  const handleEnter = (withGuide: boolean) => {
    markIntroSeen();
    onEnter({ withGuide });
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleEnter(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onEnter]);

  if (!open) return null;

  const content = (
    <div className="intro-drawer" role="dialog" aria-modal="true" aria-labelledby="intro-drawer-title">
      <button
        type="button"
        className="intro-drawer__backdrop"
        aria-label="Fermer la présentation"
        onClick={() => handleEnter(false)}
      />

      <aside className="intro-drawer__panel">
        <div className="intro-drawer__hero">
          <img
            src="/logo.svg"
            alt=""
            className="intro-drawer__logo"
            width={128}
            height={128}
            decoding="async"
          />
          <p className="intro-drawer__eyebrow">{BRAND.sector}</p>
          <h1 id="intro-drawer-title" className="intro-drawer__title">
            {BRAND.name}
          </h1>
          <p className="intro-drawer__tagline">{BRAND.tagline}</p>
          <p className="intro-drawer__product">{BRAND.productLine}</p>
        </div>

        <div className="intro-drawer__body">
          <h2 className="intro-drawer__section-title">En 3 étapes</h2>
          <ol className="intro-drawer__steps">
            {INTRO_STEPS.map((s, i) => (
              <li key={s}>
                <span className="intro-drawer__step-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>

          <h2 className="intro-drawer__section-title">Ce que vous pouvez faire</h2>
          <ul className="intro-drawer__features">
            {INTRO_FEATURES.map((f) => (
              <li key={f.id}>
                <span className="intro-drawer__feature-icon" aria-hidden>
                  {f.icon}
                </span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="intro-drawer__badges">
            {FINANCE_BADGES.map((b) => (
              <span key={b} className="intro-drawer__badge">
                {b}
              </span>
            ))}
          </div>
        </div>

        <footer className="intro-drawer__foot">
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => handleEnter(true)}
          >
            Visite guidée de l&apos;interface
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => handleEnter(false)}
          >
            Entrer dans l&apos;atelier
          </button>
          <button type="button" className="intro-drawer__skip" onClick={() => handleEnter(false)}>
            Passer
          </button>
        </footer>
      </aside>
    </div>
  );

  return createPortal(content, document.body);
}

export function IntroNavButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="intro-nav-btn"
      data-tour="intro-nav"
      aria-label="Revoir la présentation"
      title="Présentation de l'application"
      onClick={onClick}
    >
      <span className="intro-nav-btn__icon" aria-hidden>
        ⌂
      </span>
      <span className="intro-nav-btn__label">Accueil</span>
    </button>
  );
}
