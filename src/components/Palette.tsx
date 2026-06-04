import type { BlockType } from '../types';
import { BLOCK_DEFINITIONS, type BlockDefinition } from '../constants/blocks';
import { PALETTE_CATEGORIES } from '../constants/branding';
import { BlockIcon } from '../constants/blockIcons';
import { getBlockParamTags } from '../utils/blockParamTags';
import { SideTabs } from './SideTabs';

interface PaletteProps {
  onDragStart: (event: React.DragEvent, blockType: BlockType) => void;
  onOpenPipelineLibrary?: () => void;
}

const CATEGORY_KEYS = ['source', 'transform', 'viz'] as const;

type CategoryKey = (typeof CATEGORY_KEYS)[number];

const TAB_LABELS: Record<CategoryKey, { label: string; short: string }> = {
  source: { label: 'Sources', short: 'Src' },
  transform: { label: 'Transform.', short: 'Transf.' },
  viz: { label: 'Viz', short: 'Viz' },
};

function PaletteBlockCard({
  block,
  onDragStart,
}: {
  block: BlockDefinition;
  onDragStart: (e: React.DragEvent, type: BlockType) => void;
}) {
  const tags = getBlockParamTags(block.type);

  return (
    <li className="palette-panel__item">
      <button
        type="button"
        className="palette-card"
        draggable
        onDragStart={(e) => onDragStart(e, block.type)}
        title={`Glisser « ${block.label} » sur le canevas`}
      >
        <span className="palette-card__icon" aria-hidden>
          <BlockIcon type={block.type} />
        </span>
        <span className="palette-card__content">
          <span className="palette-card__row">
            <span className="palette-card__name">{block.label}</span>
            <span className="palette-card__desc">{block.description}</span>
          </span>
          <span className="palette-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="palette-card__tag">
                {tag}
              </span>
            ))}
          </span>
        </span>
        <span className="palette-card__grip" aria-hidden>
          ⋮⋮
        </span>
      </button>
    </li>
  );
}

function CategoryPanel({
  category,
  onDragStart,
}: {
  category: CategoryKey;
  onDragStart: (e: React.DragEvent, type: BlockType) => void;
}) {
  const cat = PALETTE_CATEGORIES[category];
  const blocks = BLOCK_DEFINITIONS.filter((b) => b.category === category);

  return (
    <div className="palette-panel">
      <p className="palette-panel__hint">{cat.hint}</p>
      <ul className="palette-panel__list">
        {blocks.map((block) => (
          <PaletteBlockCard key={block.type} block={block} onDragStart={onDragStart} />
        ))}
      </ul>
    </div>
  );
}

export function Palette({ onDragStart, onOpenPipelineLibrary }: PaletteProps) {
  const tabs = CATEGORY_KEYS.map((key) => ({
    id: key,
    label: TAB_LABELS[key].label,
    shortLabel: TAB_LABELS[key].short,
    panel: <CategoryPanel category={key} onDragStart={onDragStart} />,
  }));

  return (
    <aside className="side-panel side-panel--left" data-tour="palette">
      <header className="side-panel__head">
        <h2 className="side-panel__title">Blocs</h2>
        <span className="side-panel__drag">Glisser → canevas</span>
      </header>
      <SideTabs
        tabs={tabs}
        defaultTabId="source"
        ariaLabel="Catégories de blocs"
        className="side-tabs--blocks"
      />
      {onOpenPipelineLibrary && (
        <footer className="palette-panel__footer">
          <button
            type="button"
            className="btn btn--secondary btn--sm palette-panel__library-btn"
            onClick={onOpenPipelineLibrary}
          >
            Sauvegardes & modèles
          </button>
        </footer>
      )}
    </aside>
  );
}
