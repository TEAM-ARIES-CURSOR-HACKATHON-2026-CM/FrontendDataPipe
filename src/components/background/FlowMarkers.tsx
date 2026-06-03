/** Marqueurs SVG globaux pour les connexions du pipeline */
export function FlowMarkers() {
  return (
    <svg aria-hidden className="flow-markers-defs">
      <defs>
        <marker
          id="datapipe-arrow"
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="9"
          markerHeight="9"
          orient="auto-start-reverse"
        >
          <path d="M 2 2 L 10 6 L 2 10 Z" fill="#1a1a1a" />
        </marker>
      </defs>
    </svg>
  );
}
