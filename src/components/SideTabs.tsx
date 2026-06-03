import { useState, type ReactNode } from 'react';

export interface SideTabItem {
  id: string;
  label: string;
  shortLabel?: string;
  panel: ReactNode;
}

interface SideTabsProps {
  tabs: SideTabItem[];
  defaultTabId?: string;
  className?: string;
  ariaLabel: string;
}

export function SideTabs({ tabs, defaultTabId, className = '', ariaLabel }: SideTabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id ?? '');
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className={`side-tabs ${className}`.trim()}>
      <div className="side-tabs__bar" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeId}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`side-tabs__tab ${tab.id === activeId ? 'side-tabs__tab--active' : ''}`}
            onClick={() => setActiveId(tab.id)}
          >
            <span className="side-tabs__tab-full">{tab.label}</span>
            {tab.shortLabel && (
              <span className="side-tabs__tab-short">{tab.shortLabel}</span>
            )}
          </button>
        ))}
      </div>
      <div
        className="side-tabs__panel"
        role="tabpanel"
        id={`panel-${active?.id}`}
        aria-labelledby={`tab-${active?.id}`}
      >
        {active?.panel}
      </div>
    </div>
  );
}
