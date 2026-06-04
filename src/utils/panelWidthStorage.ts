const LEFT_KEY = 'datapipe_panel_left_w_v1';
const RIGHT_KEY = 'datapipe_panel_right_w_v1';

export const DEFAULT_LEFT_PANEL_W = 280;
export const DEFAULT_RIGHT_PANEL_W = 380;

export function readPanelWidth(key: typeof LEFT_KEY | typeof RIGHT_KEY, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function writePanelWidth(key: typeof LEFT_KEY | typeof RIGHT_KEY, width: number): void {
  try {
    localStorage.setItem(key, String(width));
  } catch {
    /* quota */
  }
}

export { LEFT_KEY, RIGHT_KEY };
