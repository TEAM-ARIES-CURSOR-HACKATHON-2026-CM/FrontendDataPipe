import type { Node } from '@xyflow/react';
import type { BlockParams } from '../types';
import { PropertiesPanel } from './PropertiesPanel';

interface RightSidebarProps {
  selectedNode: Node | null;
  columns: string[];
  uploadLoading: boolean;
  onUpdateParams: (nodeId: string, params: BlockParams) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onCsvImport: (nodeId: string, file: File) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function RightSidebar(props: RightSidebarProps) {
  return (
    <aside className="side-panel side-panel--right">
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
          onCsvImport={props.onCsvImport}
          onDeleteNode={props.onDeleteNode}
          embedded
        />
      </div>
    </aside>
  );
}
