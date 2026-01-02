import { useMemo, useState, useEffect } from 'react';
import { Settings, X, Pencil, Check, ChevronDown, ChevronRight, Lightbulb, Eye } from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { getAvailableColumns } from '../../utils/codeGenerator';
import { SchemaPreview } from '../SchemaPreview';
import { ValidationIndicator } from '../ValidationIndicator';
import { TipsPanel } from './TipsPanel';
import type { SourceNodeData, TransformNodeData, SinkNodeData } from '../../types';

// Import all config components from configs folder
import {
  SourceConfig,
  FilterConfig,
  JoinConfig,
  GroupByConfig,
  SelectConfig,
  SortConfig,
  WindowConfig,
  DistinctConfig,
  DropColumnsConfig,
  AddColumnsConfig,
  RenameConfig,
  IntersectConfig,
  SubtractConfig,
  IntersectAllConfig,
  ExceptAllConfig,
  ExplodeConfig,
  UnpivotConfig,
  PivotConfig,
  RepartitionConfig,
  CacheConfig,
  ReplaceConfig,
  FlattenConfig,
  CubeConfig,
  RollupConfig,
  CrosstabConfig,
  FreqItemsConfig,
  DescribeConfig,
  SampleConfig,
  DropNAConfig,
  FillNAConfig,
  UnionConfig,
  GenericTransformConfig,
  SinkConfig,
  // Preprocessing configs (Phase 1)
  ProfilerConfig,
  MissingValueConfig,
  DuplicateHandlerConfig,
  // Preprocessing configs (Phase 2)
  TypeFixerConfig,
  StringCleanerConfig,
  FormatStandardizerConfig,
  // Preprocessing configs (Phase 3)
  OutlierHandlerConfig,
  DataValidatorConfig,
  // Optimization configs
  CheckpointConfig,
  UnpersistConfig,
  ExplainConfig,
  BroadcastHintConfig,
  SaltConfig,
  AQEConfig,
  // Delta Lake operations
  DeltaMergeConfig,
  DeltaDeleteConfig,
  DeltaUpdateConfig,
  DeltaOptimizeConfig,
  DeltaVacuumConfig,
  DeltaHistoryConfig,
  // Streaming operations
  WatermarkConfig,
  StreamingWindowConfig,
  StreamingTriggerConfig,
  ForeachBatchConfig,
  // UDF operations
  PythonUdfConfig,
  PandasUdfConfig,
  PandasGroupedUdfConfig,
  // Data Quality operations
  GreatExpectationsConfig,
  SodaCoreConfig,
  DataAssertionsConfig,
  SchemaValidationConfig,
  // Performance & Configuration operations
  SparkConfigConfig,
  BucketingConfig,
} from './configs';

// Main Properties Panel Component
export const PropertiesPanel = () => {
  const { selectedNode, updateNodeData, setSelectedNode, nodes, edges } = useWorkflowStore();
  const canEdit = useWorkspaceStore((state) => state.canEdit);
  const isReadOnly = !canEdit();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showSchema, setShowSchema] = useState(true);
  const [showValidation, setShowValidation] = useState(true);
  const [showTips, setShowTips] = useState(true);

  // Reset edit state when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setEditedName(selectedNode.data.label);
      setIsEditingName(false);
    }
  }, [selectedNode?.id]);

  // Get available columns for the selected node from its inputs
  const availableColumns = useMemo(() => {
    if (!selectedNode) return [];
    return getAvailableColumns(selectedNode.id, nodes, edges);
  }, [selectedNode, nodes, edges]);

  const handleNameSave = () => {
    if (selectedNode && editedName.trim()) {
      updateNodeData(selectedNode.id, { label: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditedName(selectedNode?.data.label || '');
      setIsEditingName(false);
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-72 bg-panel border-l border-gray-700 flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent" />
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-gray-500 text-center">
            Select a node to configure its properties
          </p>
        </div>
      </div>
    );
  }

  const handleConfigUpdate = (config: Record<string, unknown>) => {
    if (isReadOnly) return; // Block updates for viewers
    updateNodeData(selectedNode.id, { config, configured: true });
  };

  const handleSchemaUpdate = (schema: import('../../types').Column[]) => {
    if (isReadOnly) return; // Block updates for viewers
    updateNodeData(selectedNode.id, { schema });
  };

  const data = selectedNode.data;

  const renderConfig = () => {
    if (data.category === 'source') {
      return <SourceConfig data={data as SourceNodeData} onUpdate={handleConfigUpdate} onSchemaUpdate={handleSchemaUpdate} />;
    }

    if (data.category === 'sink') {
      return <SinkConfig data={data as SinkNodeData} onUpdate={handleConfigUpdate} />;
    }

    if (data.category === 'transform') {
      const transformData = data as TransformNodeData;
      switch (transformData.transformType) {
        case 'filter':
          return <FilterConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'join':
          return <JoinConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'groupBy':
          return <GroupByConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'select':
          return <SelectConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'sort':
          return <SortConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'window':
          return <WindowConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'distinct':
          return <DistinctConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'dropColumn':
          return <DropColumnsConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'addColumn':
          return <AddColumnsConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'sample':
          return <SampleConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'dropna':
          return <DropNAConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'fillna':
          return <FillNAConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'union':
          return <UnionConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'rename':
          return <RenameConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'intersect':
          return <IntersectConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'subtract':
          return <SubtractConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'intersectAll':
          return <IntersectAllConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'exceptAll':
          return <ExceptAllConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'explode':
          return <ExplodeConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'unpivot':
          return <UnpivotConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'pivot':
          return <PivotConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'repartition':
          return <RepartitionConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'cache':
          return <CacheConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'replace':
          return <ReplaceConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'flatten':
          return <FlattenConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'cube':
          return <CubeConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'rollup':
          return <RollupConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'crosstab':
          return <CrosstabConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'freqItems':
          return <FreqItemsConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'describe':
          return <DescribeConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        // Preprocessing transforms
        case 'profiler':
          return <ProfilerConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'missingValue':
          return <MissingValueConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'duplicateHandler':
          return <DuplicateHandlerConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'typeFixer':
          return <TypeFixerConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'stringCleaner':
          return <StringCleanerConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'formatStandardizer':
          return <FormatStandardizerConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'outlierHandler':
          return <OutlierHandlerConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'dataValidator':
          return <DataValidatorConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        // Optimization transforms
        case 'checkpoint':
          return <CheckpointConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'unpersist':
          return <UnpersistConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'explain':
          return <ExplainConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'broadcast':
          return <BroadcastHintConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'salt':
          return <SaltConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'aqe':
          return <AQEConfig data={transformData} onUpdate={handleConfigUpdate} />;
        // Delta Lake operations
        case 'deltaMerge':
          return <DeltaMergeConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'deltaDelete':
          return <DeltaDeleteConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'deltaUpdate':
          return <DeltaUpdateConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'deltaOptimize':
          return <DeltaOptimizeConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'deltaVacuum':
          return <DeltaVacuumConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'deltaHistory':
          return <DeltaHistoryConfig data={transformData} onUpdate={handleConfigUpdate} />;
        // Streaming transforms
        case 'watermark':
          return <WatermarkConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'streamingWindow':
          return <StreamingWindowConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'streamingTrigger':
          return <StreamingTriggerConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'foreachBatch':
          return <ForeachBatchConfig data={transformData} onUpdate={handleConfigUpdate} />;
        // UDF transforms
        case 'pythonUdf':
          return <PythonUdfConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'pandasUdf':
          return <PandasUdfConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'pandasGroupedUdf':
          return <PandasGroupedUdfConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        // Data Quality transforms
        case 'greatExpectations':
          return <GreatExpectationsConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'sodaCore':
          return <SodaCoreConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'dataAssertions':
          return <DataAssertionsConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        case 'schemaValidation':
          return <SchemaValidationConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        // Performance & Configuration transforms
        case 'sparkConfig':
          return <SparkConfigConfig data={transformData} onUpdate={handleConfigUpdate} />;
        case 'bucketing':
          return <BucketingConfig data={transformData} onUpdate={handleConfigUpdate} availableColumns={availableColumns} />;
        default:
          return <GenericTransformConfig data={transformData} onUpdate={handleConfigUpdate} />;
      }
    }

    return null;
  };

  return (
    <div className="w-72 bg-panel border-l border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Read-only banner */}
      {isReadOnly && (
        <div className="px-3 py-2 bg-yellow-500/10 border-b border-yellow-500/30 flex-shrink-0">
          <div className="flex items-center gap-2 text-yellow-400">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium">View Only - Changes disabled</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Settings className="w-4 h-4 text-accent flex-shrink-0" />
            {isEditingName && !isReadOnly ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameSave}
                autoFocus
                className="flex-1 min-w-0 px-2 py-1 bg-canvas border border-accent rounded text-sm text-white focus:outline-none"
              />
            ) : (
              <span className="text-sm font-semibold text-white truncate">{data.label}</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isEditingName && !isReadOnly ? (
              <button
                onClick={handleNameSave}
                className="p-1 hover:bg-panel-light rounded text-green-400"
              >
                <Check className="w-4 h-4" />
              </button>
            ) : !isReadOnly ? (
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 hover:bg-panel-light rounded"
              >
                <Pencil className="w-3.5 h-3.5 text-gray-400" />
              </button>
            ) : null}
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-panel-light rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Node Type Badge */}
      <div className="px-4 py-2 border-b border-gray-700 flex-shrink-0">
        <span className={`
          inline-block px-2 py-1 rounded text-xs font-medium
          ${data.category === 'source' ? 'bg-green-500/20 text-green-400' : ''}
          ${data.category === 'transform' ? 'bg-blue-500/20 text-blue-400' : ''}
          ${data.category === 'sink' ? 'bg-orange-500/20 text-orange-400' : ''}
        `}>
          {data.category === 'transform' && (data as TransformNodeData).transformType}
          {data.category === 'source' && (data as SourceNodeData).sourceType}
          {data.category === 'sink' && (data as SinkNodeData).sinkType}
        </span>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Schema Preview Section */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => setShowSchema(!showSchema)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-panel-light transition-colors"
          >
            {showSchema ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Schema Preview
          </button>
          {showSchema && (
            <div className="px-4 pb-3">
              <SchemaPreview nodeData={data} availableColumns={availableColumns} />
            </div>
          )}
        </div>

        {/* Validation Section */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => setShowValidation(!showValidation)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-panel-light transition-colors"
          >
            <div className="flex items-center gap-2">
              {showValidation ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Validation
            </div>
            <ValidationIndicator nodeData={data} compact />
          </button>
          {showValidation && (
            <div className="px-4 pb-3">
              <ValidationIndicator nodeData={data} />
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="p-4" key={selectedNode.id}>
          {renderConfig()}
        </div>

        {/* Tips & Best Practices Section */}
        <div className="border-t border-gray-700">
          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-panel-light transition-colors"
          >
            {showTips ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Tips & Best Practices
          </button>
          {showTips && (
            <div className="px-4 pb-4">
              <TipsPanel
                category={data.category}
                nodeType={
                  data.category === 'transform'
                    ? (data as TransformNodeData).transformType
                    : data.category === 'source'
                    ? (data as SourceNodeData).sourceType
                    : (data as SinkNodeData).sinkType
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
