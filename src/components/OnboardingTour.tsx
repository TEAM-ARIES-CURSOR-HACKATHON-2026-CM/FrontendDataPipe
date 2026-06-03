import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ONBOARDING_STORAGE_KEY,
  SPOTLIGHT_TOUR_STEPS,
  TOUR_TARGET_SELECTORS,
  type OnboardingAction,
  type TourPlacement,
  type TourTargetId,
} from '../constants/guide';

const SPOTLIGHT_PAD = 10;

export interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  onAction: (action: OnboardingAction) => void;
  /** Re-mesure après ouverture des panneaux */
  layoutKey?: string;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolveSelector(target: TourTargetId): string {
  return TOUR_TARGET_SELECTORS[target];
}

function findTourElement(target: TourTargetId): Element | null {
  const el = document.querySelector(resolveSelector(target));
  if (el) return el;
  if (target === 'copilot-drawer') {
    return document.querySelector(resolveSelector('copilot'));
  }
  return null;
}

function measureTarget(target: TourTargetId | null): SpotlightRect | null {
  if (!target) return null;
  const el = findTourElement(target);
  if (!el) return null;
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth', inline: 'nearest' });
  const r = el.getBoundingClientRect();
  return {
    top: r.top - SPOTLIGHT_PAD,
    left: r.left - SPOTLIGHT_PAD,
    width: r.width + SPOTLIGHT_PAD * 2,
    height: r.height + SPOTLIGHT_PAD * 2,
  };
}

function computeTooltipPos(
  rect: SpotlightRect | null,
  placement: TourPlacement,
): { top: number; left: number; transform: string } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(360, vw - 24);
  const cardH = 220;

  if (!rect || placement === 'center') {
    return {
      top: vh / 2,
      left: vw / 2,
      transform: 'translate(-50%, -50%)',
    };
  }

  switch (placement) {
    case 'bottom':
      return {
        top: Math.min(rect.top + rect.height + 14, vh - cardH - 12),
        left: Math.min(Math.max(rect.left, 12), vw - cardW - 12),
        transform: 'none',
      };
    case 'top':
      return {
        top: Math.max(rect.top - cardH - 14, 12),
        left: Math.min(Math.max(rect.left, 12), vw - cardW - 12),
        transform: 'none',
      };
    case 'left':
      return {
        top: Math.min(Math.max(rect.top, 12), vh - cardH - 12),
        left: Math.max(rect.left - cardW - 14, 12),
        transform: 'none',
      };
    case 'right':
    default:
      return {
        top: Math.min(Math.max(rect.top, 12), vh - cardH - 12),
        left: Math.min(rect.left + rect.width + 14, vw - cardW - 12),
        transform: 'none',
      };
  }
}

export function OnboardingTour({
  open,
  onClose,
  onComplete,
  onAction,
  layoutKey = '',
}: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, transform: 'translate(-50%, -50%)' });

  const step = SPOTLIGHT_TOUR_STEPS[stepIndex];
  const total = SPOTLIGHT_TOUR_STEPS.length;
  const isLast = stepIndex >= total - 1;
  const progress = ((stepIndex + 1) / total) * 100;

  const remeasure = useCallback(() => {
    if (!open || !step) return;
    const rect = measureTarget(step.target);
    setSpotlight(rect);
    setTooltipPos(computeTooltipPos(rect, step.placement));
  }, [open, step]);

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open || !step) return;
    step.prepare?.forEach((action) => onAction(action));
    const t1 = window.setTimeout(remeasure, 120);
    const t2 = window.setTimeout(remeasure, 400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [open, stepIndex, step, onAction, remeasure, layoutKey]);

  useLayoutEffect(() => {
    if (!open) return;
    remeasure();
    const onResize = () => remeasure();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, remeasure, stepIndex, layoutKey]);

  const finish = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    onComplete();
    onClose();
  }, [onClose, onComplete]);

  const goNext = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, total - 1));
  }, [finish, isLast, total]);

  const goPrev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, goNext, goPrev, finish]);

  if (!open || !step) return null;

  const content = (
    <div className="product-tour" role="dialog" aria-modal="true" aria-labelledby="product-tour-title">
      {spotlight && step.target && (
        <div
          className="product-tour__spotlight"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
          aria-hidden
        />
      )}

      <div
        className={`product-tour__card ${!step.target ? 'product-tour__card--center' : ''}`}
        style={
          step.target
            ? { top: tooltipPos.top, left: tooltipPos.left, transform: tooltipPos.transform }
            : undefined
        }
      >
        <div className="product-tour__progress" aria-hidden>
          <div className="product-tour__progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <header className="product-tour__head">
          <span className="product-tour__step">
            {stepIndex + 1} / {total}
          </span>
          <button type="button" className="product-tour__skip" onClick={finish}>
            Passer
          </button>
        </header>

        <div className="product-tour__body">
          <h2 id="product-tour-title" className="product-tour__title">
            {step.title}
          </h2>
          <p className="product-tour__text">{step.description}</p>
        </div>

        <footer className="product-tour__foot">
          <button type="button" className="btn btn--secondary" disabled={stepIndex === 0} onClick={goPrev}>
            Précédent
          </button>
          <button type="button" className="btn btn--primary" onClick={goNext}>
            {isLast ? 'Terminer' : 'Suivant'}
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export function shouldShowOnboarding(): boolean {
  try {
    return !localStorage.getItem(ONBOARDING_STORAGE_KEY);
  } catch {
    return true;
  }
}
