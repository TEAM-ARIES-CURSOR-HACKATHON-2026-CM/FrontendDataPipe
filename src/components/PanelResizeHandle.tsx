interface PanelResizeHandleProps {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  /** Côté du panneau que la poignée borde (pour l’accessibilité). */
  edge: 'left' | 'right';
  label?: string;
}

export function PanelResizeHandle({
  onPointerDown,
  edge,
  label = 'Glisser pour élargir',
}: PanelResizeHandleProps) {
  return (
    <div
      className={`panel-resize-handle panel-resize-handle--${edge}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title="Glisser pour élargir"
      onPointerDown={onPointerDown}
    />
  );
}
