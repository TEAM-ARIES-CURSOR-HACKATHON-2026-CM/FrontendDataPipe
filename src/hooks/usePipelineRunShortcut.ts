import { useEffect } from 'react';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable;
}

/** Ctrl+Entrée (ou ⌘+Entrée) pour valider le pipeline. */
export function usePipelineRunShortcut(onRun: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || (!e.ctrlKey && !e.metaKey)) return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      onRun();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onRun, enabled]);
}
