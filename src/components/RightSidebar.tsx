import type { Node } from '@xyflow/react';
import type { BlockParams } from '../types';
import { PropertiesPanel } from './PropertiesPanel';

interface RightSidebarProps {
  selectedNode: Node | null;
  columns: string[];
  uploadLoading: boolean;
  onUpdateParams: (nodeId: string, params: BlockParams) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onSourceImport: (nodeId: string, file: File) => void;
  onDeleteNode: (nodeId: string) => void;
  sourcePreview?: Record<string, unknown>[];
  sourceRowCount?: number;
}

export function RightSidebar(props: RightSidebarProps) {
  return (
    <aside className="side-panel side-panel--right" data-tour="params">
      <header className="side-panel__head">
        <h2 className="side-panel__title">Paramètres</h2>
      </header>
      <div className="side-panel__body">
        <PropertiesPanel
          selectedNode={props.selectedNode}
          columns={props.columns}
          uploadLoading={props.uploadLoading}
          onUpdateParams={props.onUpdateParams}
          onUpdateLabel={props.onUpdateLabel}
          onSourceImport={props.onSourceImport}
          onDeleteNode={props.onDeleteNode}
          sourcePreview={props.sourcePreview}
          sourceRowCount={props.sourceRowCount}
          embedded
        />
      </div>
    </aside>
  );
}
