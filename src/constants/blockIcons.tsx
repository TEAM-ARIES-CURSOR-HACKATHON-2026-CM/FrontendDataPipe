import type { BlockType } from '../types';

const iconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function BlockIcon({ type }: { type: BlockType }) {
  switch (type) {
    case 'csv':
      return (
        <svg {...iconProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
      );
    case 'json':
      return (
        <svg {...iconProps}>
          <path d="M8 3h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M16 3v4h4M8 12h2l1-2 1 4 1-2h2" />
        </svg>
      );
    case 'sql':
      return (
        <svg {...iconProps}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
          <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
        </svg>
      );
    case 'filter':
      return (
        <svg {...iconProps}>
          <path d="M4 5h16l-6 7v6l-4-2v-4L4 5z" />
        </svg>
      );
    case 'group':
      return (
        <svg {...iconProps}>
          <rect x="3" y="4" width="18" height="5" rx="1" />
          <rect x="3" y="11" width="12" height="5" rx="1" />
          <rect x="3" y="18" width="8" height="2" rx="0.5" />
        </svg>
      );
    case 'sort':
      return (
        <svg {...iconProps}>
          <path d="M8 9l4-4 4 4M12 5v14M16 15l-4 4-4-4" />
        </svg>
      );
    case 'add_column':
      return (
        <svg {...iconProps}>
          <path d="M12 5v14M5 12h14" />
          <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.35" strokeDasharray="3 2" />
        </svg>
      );
    case 'table':
      return (
        <svg {...iconProps}>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3 10h18M9 10v9M15 10v9" />
        </svg>
      );
    case 'bar_chart':
      return (
        <svg {...iconProps}>
          <path d="M6 20V12M12 20V6M18 20v-8" />
        </svg>
      );
    case 'pie_chart':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v9l6 4" />
        </svg>
      );
    default:
      return null;
  }
}
