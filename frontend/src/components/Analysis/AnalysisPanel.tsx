import { useState } from 'react';
import { Zap, HardDrive, X, Layers, BarChart3, Settings } from 'lucide-react';
import { PipelineAnalyzer } from './PipelineAnalyzer';
import { CacheAdvisor } from './CacheAdvisor';
import { PartitionAdvisor } from './PartitionAdvisor';
import { SkewDetector } from './SkewDetector';
import { SparkConfigPanel } from './SparkConfigPanel';
import { useWorkflowStore } from '../../stores/workflowStore';

interface AnalysisPanelProps {
  onClose?: () => void;
  onSelectNode?: (nodeId: string) => void;
}

type TabType = 'analyzer' | 'cache' | 'partition' | 'skew' | 'config';

export const AnalysisPanel = ({ onClose, onSelectNode }: AnalysisPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('analyzer');
  const { setSelectedNode, nodes } = useWorkflowStore();

  const handleSelectNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
    }
    onSelectNode?.(nodeId);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'analyzer', label: 'Pipeline', icon: <Zap className="w-4 h-4" /> },
    { id: 'cache', label: 'Cache', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'partition', label: 'Partition', icon: <Layers className="w-4 h-4" /> },
    { id: 'skew', label: 'Skew', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'config', label: 'Config', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="w-80 bg-panel border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-white">Analysis</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-panel-light rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Tabs - Grid layout for 5 tabs */}
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'bg-canvas text-gray-400 hover:bg-panel-light'
              }`}
              title={tab.label}
            >
              {tab.icon}
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'analyzer' && (
          <PipelineAnalyzer onSelectNode={handleSelectNode} />
        )}
        {activeTab === 'cache' && (
          <CacheAdvisor onSelectNode={handleSelectNode} />
        )}
        {activeTab === 'partition' && (
          <PartitionAdvisor onSelectNode={handleSelectNode} />
        )}
        {activeTab === 'skew' && (
          <SkewDetector onSelectNode={handleSelectNode} />
        )}
        {activeTab === 'config' && (
          <SparkConfigPanel />
        )}
      </div>
    </div>
  );
};
