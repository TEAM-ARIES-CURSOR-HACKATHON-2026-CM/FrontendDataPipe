import type { BlockType } from '../types';
import { BLOCK_DEFINITIONS } from '../constants/blocks';

interface PaletteProps {
  onDragStart: (event: React.DragEvent, blockType: BlockType) => void;
}

export function Palette({ onDragStart }: PaletteProps) {
  const categories = [
    { key: 'source', title: 'Sources' },
    { key: 'transform', title: 'Transformations' },
    { key: 'viz', title: 'Visualisation' },
  ] as const;

  return (
    <aside className="palette">
      <h2 className="panel-title">Blocs</h2>
      <p className="panel-hint">Glissez un bloc sur le canevas</p>
      {categories.map((cat) => (
        <section key={cat.key} className="palette__section">
          <h3>{cat.title}</h3>
          <ul>
            {BLOCK_DEFINITIONS.filter((b) => b.category === cat.key).map((block) => (
              <li
                key={block.type}
                className="palette__item"
                draggable
                onDragStart={(e) => onDragStart(e, block.type)}
                style={{ borderLeftColor: block.color }}
              >
                <strong>{block.label}</strong>
                <span>{block.description}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
