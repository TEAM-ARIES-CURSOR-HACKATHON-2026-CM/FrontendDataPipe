const ENGINE_WAKE_HINT_KEY = 'datapipe_engine_wake_hint_v1';

export function shouldShowEngineWakeHint(): boolean {
  try {
    return !localStorage.getItem(ENGINE_WAKE_HINT_KEY);
  } catch {
    return false;
  }
}

export function markEngineWakeHintShown(): void {
  try {
    localStorage.setItem(ENGINE_WAKE_HINT_KEY, '1');
  } catch {
    /* ignore */
  }
}
