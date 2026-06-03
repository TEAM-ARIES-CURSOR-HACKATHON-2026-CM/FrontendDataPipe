import { useCallback, useRef, useState } from 'react';

type Axis = 'horizontal' | 'vertical';

interface UsePanelResizeOptions {
  axis: Axis;
  initial: number;
  min: number;
  max: number;
  /** +1 : tirer vers la droite / le bas agrandit. -1 : panneau droit ou bas. */
  direction?: 1 | -1;
}

export function usePanelResize({
  axis,
  initial,
  min,
  max,
  direction = 1,
}: UsePanelResizeOptions) {
  const [size, setSize] = useState(initial);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId);

      const startPos = axis === 'horizontal' ? e.clientX : e.clientY;
      const startSize = sizeRef.current;

      const onMove = (ev: PointerEvent) => {
        const pos = axis === 'horizontal' ? ev.clientX : ev.clientY;
        const delta = (pos - startPos) * direction;
        const next = Math.round(Math.min(max, Math.max(min, startSize + delta)));
        setSize(next);
      };

      const onUp = (ev: PointerEvent) => {
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        document.body.classList.remove(
          'is-resizing',
          axis === 'horizontal' ? 'is-resizing-x' : 'is-resizing-y',
        );
      };

      document.body.classList.add(
        'is-resizing',
        axis === 'horizontal' ? 'is-resizing-x' : 'is-resizing-y',
      );
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
    },
    [axis, direction, max, min],
  );

  return { size, setSize, onPointerDown };
}
