import { useState, useEffect } from 'react';
import {
  X,
  GitMerge,
  Clock,
  Copy,
  RefreshCw,
  CheckCircle,
  Radio,
  FileText,
  Layers,
  Workflow,
  Brain,
  Shield,
  Server,
  Zap,
  Database,
  Cloud,
} from 'lucide-react';
import { useTemplateStore, type PipelineTemplate, type DagTemplate } from '../../stores/templateStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { isDagPage } from '../../types';
import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, DagTaskNodeData } from '../../types';

// ETL Template category info
const etlCategoryInfo = {
  etl: { label: 'ETL Patterns', icon: Layers, color: 'text-blue-400' },
  streaming: { label: 'Streaming', icon: Radio, color: 'text-purple-400' },
  'data-quality': { label: 'Data Quality', icon: CheckCircle, color: 'text-green-400' },
  optimization: { label: 'Optimization', icon: RefreshCw, color: 'text-orange-400' },
};

// DAG Template category info
const dagCategoryInfo = {
  'data-pipeline': { label: 'Data Pipeline', icon: Workflow, color: 'text-blue-400' },
  'ml-pipeline': { label: 'ML Pipeline', icon: Brain, color: 'text-purple-400' },
  'data-quality': { label: 'Data Quality', icon: Shield, color: 'text-green-400' },
  infrastructure: { label: 'Infrastructure', icon: Server, color: 'text-orange-400' },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  gitMerge: GitMerge,
  clock: Clock,
  copy: Copy,
  refreshCw: RefreshCw,
  checkCircle: CheckCircle,
  radio: Radio,
  fileText: FileText,
  layers: Layers,
  workflow: Workflow,
  brain: Brain,
  shield: Shield,
  server: Server,
  zap: Zap,
  database: Database,
  cloud: Cloud,
  code: FileText,
  fileCheck: CheckCircle,
  snowflake: Cloud,
};

// ============================================
// ETL Template Components
// ============================================

interface ETLTemplateCardProps {
  template: PipelineTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

const ETLTemplateCard = ({ template, isSelected, onSelect }: ETLTemplateCardProps) => {
  const Icon = iconMap[template.icon] || FileText;
  const catInfo = etlCategoryInfo[template.category];

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-4 rounded-lg border text-left transition-all
        ${isSelected
          ? 'border-accent bg-accent/10'
          : 'border-gray-700 bg-panel-light hover:border-gray-600'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent/20' : 'bg-canvas'}`}>
          <Icon className={`w-5 h-5 ${isSelected ? 'text-accent' : catInfo.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white">{template.name}</h4>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded ${catInfo.color} bg-gray-800`}>
              {catInfo.label}
            </span>
            <span className="text-xs text-gray-500">
              {template.nodes.length} nodes
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const ETLTemplatePreview = ({ template }: { template: PipelineTemplate }) => {
  const catInfo = etlCategoryInfo[template.category];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
      <p className="text-sm text-gray-400 mb-4">{template.description}</p>

      {/* Pipeline Flow */}
      <div className="flex-1 bg-canvas rounded-lg p-4 overflow-auto">
        <div className="flex items-center gap-2 flex-wrap">
          {template.nodes.map((node, idx) => {
            const data = node.data;
            const bgColor = data.category === 'source'
              ? 'bg-green-500/20 border-green-500/50'
              : data.category === 'sink'
                ? 'bg-orange-500/20 border-orange-500/50'
                : 'bg-blue-500/20 border-blue-500/50';

            return (
              <div key={node.id} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded border ${bgColor}`}>
                  <span className="text-xs text-white">{data.label}</span>
                </div>
                {idx < template.nodes.length - 1 && (
                  <span className="text-gray-500">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Category</span>
          <span className={catInfo.color}>{catInfo.label}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Nodes</span>
          <span className="text-white">{template.nodes.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Connections</span>
          <span className="text-white">{template.edges.length}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DAG Template Components
// ============================================

interface DAGTemplateCardProps {
  template: DagTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

const DAGTemplateCard = ({ template, isSelected, onSelect }: DAGTemplateCardProps) => {
  const Icon = iconMap[template.icon] || Workflow;
  const catInfo = dagCategoryInfo[template.category];

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-4 rounded-lg border text-left transition-all
        ${isSelected
          ? 'border-accent bg-accent/10'
          : 'border-gray-700 bg-panel-light hover:border-gray-600'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent/20' : 'bg-canvas'}`}>
          <Icon className={`w-5 h-5 ${isSelected ? 'text-accent' : catInfo.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white">{template.name}</h4>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded ${catInfo.color} bg-gray-800`}>
              {catInfo.label}
            </span>
            <span className="text-xs text-gray-500">
              {template.nodes.length} tasks
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const DAGTemplatePreview = ({ template }: { template: DagTemplate }) => {
  const catInfo = dagCategoryInfo[template.category];

  // Category colors for DAG nodes
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sensor': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'etl': return 'bg-blue-500/20 border-blue-500/50';
      case 'action': return 'bg-green-500/20 border-green-500/50';
      case 'control': return 'bg-purple-500/20 border-purple-500/50';
      case 'notify': return 'bg-pink-500/20 border-pink-500/50';
      case 'quality': return 'bg-emerald-500/20 border-emerald-500/50';
      case 'integration': return 'bg-violet-500/20 border-violet-500/50';
      case 'aws': return 'bg-orange-500/20 border-orange-500/50';
      case 'gcp': return 'bg-sky-500/20 border-sky-500/50';
      case 'azure': return 'bg-cyan-500/20 border-cyan-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
      <p className="text-sm text-gray-400 mb-4">{template.description}</p>

      {/* DAG Flow */}
      <div className="flex-1 bg-canvas rounded-lg p-4 overflow-auto">
        <div className="flex items-center gap-2 flex-wrap">
          {template.nodes.map((node, idx) => {
            const data = node.data;
            const bgColor = getCategoryColor(data.category);

            return (
              <div key={node.id} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded border ${bgColor}`}>
                  <span className="text-xs text-white">{data.label}</span>
                  <span className="text-[10px] text-gray-400 block">{data.type}</span>
                </div>
                {idx < template.nodes.length - 1 && (
                  <span className="text-gray-500">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Category</span>
          <span className={catInfo.color}>{catInfo.label}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Tasks</span>
          <span className="text-white">{template.nodes.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Dependencies</span>
          <span className="text-white">{template.edges.length}</span>
        </div>
        {template.suggestedConfig?.schedule && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Schedule</span>
            <span className="text-white font-mono text-xs">
              {template.suggestedConfig.schedule.type === 'cron'
                ? template.suggestedConfig.schedule.cron
                : template.suggestedConfig.schedule.type}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// Main Template Modal Component
// ============================================

export const TemplateModal = () => {
  const {
    isModalOpen,
    closeModal,
    templateMode,
    setTemplateMode,
    templates,
    dagTemplates,
    selectedTemplate,
    selectedDagTemplate,
    setSelectedTemplate,
    setSelectedDagTemplate,
  } = useTemplateStore();

  const {
    getActivePage,
    getActiveNodes,
    getActiveEdges,
    setNodes,
    setEdges,
    setDagTasks,
    setDagEdges,
  } = useWorkspaceStore();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Detect page type and set template mode accordingly
  useEffect(() => {
    if (isModalOpen) {
      const activePage = getActivePage();
      if (activePage && isDagPage(activePage)) {
        setTemplateMode('dag');
      } else {
        setTemplateMode('etl');
      }
      setActiveCategory(null);
    }
  }, [isModalOpen, getActivePage, setTemplateMode]);

  if (!isModalOpen) return null;

  const isDagMode = templateMode === 'dag';
  const categoryInfo = isDagMode ? dagCategoryInfo : etlCategoryInfo;

  // Filter templates based on mode and category
  const filteredTemplates = isDagMode
    ? (activeCategory
        ? dagTemplates.filter(t => t.category === activeCategory)
        : dagTemplates)
    : (activeCategory
        ? templates.filter(t => t.category === activeCategory)
        : templates);

  const handleApplyTemplate = () => {
    if (isDagMode && selectedDagTemplate) {
      // Apply DAG template
      const activePage = getActivePage();
      if (!activePage || !isDagPage(activePage)) return;

      const currentTasks = activePage.tasks || [];
      const currentEdges = activePage.edges || [];

      // Calculate offset for new nodes
      let maxX = 0;
      currentTasks.forEach(node => {
        if (node.position.x > maxX) maxX = node.position.x;
      });
      const offsetX = currentTasks.length > 0 ? maxX + 300 : 0;

      // Generate unique IDs
      const timestamp = Date.now();
      const idMap = new Map<string, string>();

      const newTasks: Node<DagTaskNodeData>[] = selectedDagTemplate.nodes.map((node, idx) => {
        const newId = `task_${timestamp}_${idx}`;
        idMap.set(node.id, newId);
        // Cast template node data to DagTaskNodeData (templates have flexible types)
        const taskData = node.data as unknown as DagTaskNodeData;
        return {
          ...node,
          id: newId,
          data: taskData,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y,
          },
        };
      });

      const newEdges: Edge[] = selectedDagTemplate.edges.map((edge, idx) => ({
        ...edge,
        id: `edge_${timestamp}_${idx}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
      }));

      setDagTasks([...currentTasks, ...newTasks]);
      setDagEdges([...currentEdges, ...newEdges]);
    } else if (!isDagMode && selectedTemplate) {
      // Apply ETL template (existing logic)
      const currentNodes = getActiveNodes();
      const currentEdges = getActiveEdges();

      let maxX = 0;
      currentNodes.forEach(node => {
        if (node.position.x > maxX) maxX = node.position.x;
      });
      const offsetX = currentNodes.length > 0 ? maxX + 300 : 0;

      const timestamp = Date.now();
      const idMap = new Map<string, string>();

      const newNodes: Node<ETLNodeData>[] = selectedTemplate.nodes.map((node, idx) => {
        const newId = `node_${timestamp}_${idx}`;
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y,
          },
        };
      });

      const newEdges: Edge[] = selectedTemplate.edges.map((edge, idx) => ({
        ...edge,
        id: `edge_${timestamp}_${idx}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
      }));

      setNodes([...currentNodes, ...newNodes]);
      setEdges([...currentEdges, ...newEdges]);
    }

    closeModal();
  };

  const handleReplaceWorkflow = () => {
    if (isDagMode && selectedDagTemplate) {
      // Replace DAG
      const timestamp = Date.now();
      const idMap = new Map<string, string>();

      const newTasks: Node<DagTaskNodeData>[] = selectedDagTemplate.nodes.map((node, idx) => {
        const newId = `task_${timestamp}_${idx}`;
        idMap.set(node.id, newId);
        const taskData = node.data as unknown as DagTaskNodeData;
        return { ...node, id: newId, data: taskData };
      });

      const newEdges: Edge[] = selectedDagTemplate.edges.map((edge, idx) => ({
        ...edge,
        id: `edge_${timestamp}_${idx}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
      }));

      setDagTasks(newTasks);
      setDagEdges(newEdges);
    } else if (!isDagMode && selectedTemplate) {
      // Replace ETL workflow
      const timestamp = Date.now();
      const idMap = new Map<string, string>();

      const newNodes: Node<ETLNodeData>[] = selectedTemplate.nodes.map((node, idx) => {
        const newId = `node_${timestamp}_${idx}`;
        idMap.set(node.id, newId);
        return { ...node, id: newId };
      });

      const newEdges: Edge[] = selectedTemplate.edges.map((edge, idx) => ({
        ...edge,
        id: `edge_${timestamp}_${idx}`,
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    }

    closeModal();
  };

  const hasSelection = isDagMode ? !!selectedDagTemplate : !!selectedTemplate;
  const actionLabel = isDagMode ? 'DAG' : 'Workflow';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-panel border border-gray-700 rounded-xl shadow-2xl w-[900px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isDagMode ? 'Airflow DAG Templates' : 'Pipeline Templates'}
            </h2>
            <p className="text-sm text-gray-400">
              {isDagMode
                ? 'Choose a pre-built DAG pattern to orchestrate your workflows'
                : 'Choose a pre-built pipeline pattern to get started quickly'}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-panel-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 p-4 border-b border-gray-700">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              activeCategory === null
                ? 'bg-accent text-white'
                : 'bg-panel-light text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {Object.entries(categoryInfo).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeCategory === key
                    ? 'bg-accent text-white'
                    : 'bg-panel-light text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Template List */}
          <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-700 space-y-3">
            {isDagMode
              ? (filteredTemplates as DagTemplate[]).map(template => (
                  <DAGTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedDagTemplate?.id === template.id}
                    onSelect={() => setSelectedDagTemplate(template)}
                  />
                ))
              : (filteredTemplates as PipelineTemplate[]).map(template => (
                  <ETLTemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={() => setSelectedTemplate(template)}
                  />
                ))}
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-4 overflow-y-auto">
            {isDagMode ? (
              selectedDagTemplate ? (
                <DAGTemplatePreview template={selectedDagTemplate} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Select a template to preview</p>
                </div>
              )
            ) : (
              selectedTemplate ? (
                <ETLTemplatePreview template={selectedTemplate} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Select a template to preview</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            {hasSelection
              ? `Template will be added to your current ${actionLabel.toLowerCase()}`
              : 'Select a template to continue'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-panel-light text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            {hasSelection && (
              <>
                <button
                  onClick={handleReplaceWorkflow}
                  className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                >
                  Replace {actionLabel}
                </button>
                <button
                  onClick={handleApplyTemplate}
                  className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
                >
                  Add to {actionLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
