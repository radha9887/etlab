import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Download, Code, Play, GripHorizontal, History, Settings, ChevronDown, Loader2, FileEdit, ExternalLink, Save, Zap } from 'lucide-react';
import { TabBar } from './TabBar';
import { PipelineAnalyzer } from '../Analysis/PipelineAnalyzer';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useAirflowStore } from '../../stores/airflowStore';
import { generatePySparkCode } from '../../utils/codeGenerator';
import { generateAirflowCode } from '../../utils/airflow';
import { exportNotebook } from '../../utils/notebookExporter';
import { sparkApi, executionApi } from '../../services/api';
import type { SparkConnection } from '../../services/api';
import { isWorkflowPage, isDagPage } from '../../types';

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 320;

interface PageCodePanelProps {
  onOpenSparkSettings?: () => void;
  onOpenHistory?: () => void;
}

type PanelTab = 'code' | 'analysis';

export const PageCodePanel = ({ onOpenSparkSettings, onOpenHistory }: PageCodePanelProps) => {
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const connectionDropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>('code');
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Spark connections state
  const [connections, setConnections] = useState<SparkConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [showConnectionDropdown, setShowConnectionDropdown] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
      if (connectionDropdownRef.current && !connectionDropdownRef.current.contains(event.target as Node)) {
        setShowConnectionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Airflow store
  const airflowStatus = useAirflowStore((state) => state.status);
  const syncDag = useAirflowStore((state) => state.syncDag);
  const openInAirflow = useAirflowStore((state) => state.openInAirflow);
  const startAirflow = useAirflowStore((state) => state.startAirflow);
  const setShowSettingsModal = useAirflowStore((state) => state.setShowSettingsModal);

  // Subscribe to specific state slices for reactivity
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const createCodePageFromWorkflow = useWorkspaceStore((state) => state.createCodePageFromWorkflow);

  // Derive active workspace and page from subscribed state
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activePage = activeWorkspace?.pages.find(p => p.id === activeWorkspace.activePageId);

  // Check if active page is a workflow page or DAG page
  const isWorkflow = activePage && isWorkflowPage(activePage);
  const isDag = activePage && isDagPage(activePage);

  // Get nodes/tasks and edges based on page type
  const nodes = isWorkflow ? activePage.nodes || [] : [];
  const edges = isWorkflow ? activePage.edges || [] : isDag ? activePage.edges || [] : [];
  const dagTasks = isDag ? activePage.tasks || [] : [];

  // Generate PySpark code for workflow pages
  const { code: pysparkCode, cells: pysparkCells } = useMemo(() => {
    if (!isWorkflow) return { code: '', cells: [] };
    return generatePySparkCode(nodes, edges);
  }, [isWorkflow, nodes, edges]);

  // Generate Airflow code for DAG pages
  const { code: airflowCode, errors: airflowErrors } = useMemo(() => {
    if (!isDag || !activePage) return { code: '', errors: [] };
    return generateAirflowCode(dagTasks, edges, activePage.dagConfig);
  }, [isDag, activePage, dagTasks, edges]);

  // Select the appropriate code based on page type
  const generatedCode = isDag ? airflowCode : pysparkCode;

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await sparkApi.list();
      setConnections(data);
      // Set default connection
      const defaultConn = data.find(c => c.is_default);
      if (defaultConn) {
        setSelectedConnectionId(defaultConn.id);
      } else if (data.length > 0) {
        setSelectedConnectionId(data[0].id);
      }
    } catch {
      // API not available - this is expected when running without backend
      setConnections([]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const downloadCode = () => {
    const pageName = activePage?.name || 'etl_job';
    const filename = pageName.replace(/\s+/g, '_').toLowerCase();
    const blob = new Blob([generatedCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadNotebook = () => {
    if (!isWorkflow || pysparkCells.length === 0) return;
    const pageName = activePage?.name || 'etl_job';
    exportNotebook(pysparkCells, pageName);
  };

  const handleDuplicateAndEdit = () => {
    if (!activePage) return;
    // Create a new code page from the current page's generated code (works for both workflow and DAG)
    createCodePageFromWorkflow(activePage.id, generatedCode);
  };

  // Get DAG ID from active page
  const dagId = isDag && activePage ? activePage.dagConfig?.dagId || activePage.name : '';

  const handleSyncDag = async () => {
    if (!isDag || !airflowCode || !dagId) return;

    setIsSyncing(true);
    setSyncMessage(null);

    const result = await syncDag(dagId, airflowCode);
    setSyncMessage(result.message);
    setIsSyncing(false);

    // Clear message after 3 seconds
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleVisualizeInAirflow = async () => {
    if (!isDag || !dagId) return;

    // First sync the DAG
    await handleSyncDag();

    // Check if Airflow is running
    if (airflowStatus.status !== 'running') {
      // Prompt to start Airflow
      const shouldStart = confirm(
        'Airflow is not running. Would you like to start it?\n\n' +
        'This may take 30-60 seconds to initialize.'
      );

      if (shouldStart) {
        const result = await startAirflow();
        if (!result.success) {
          alert(`Failed to start Airflow: ${result.message}`);
          return;
        }

        // Wait a bit then open
        alert('Airflow is starting. Click OK to open Airflow UI.\n\nDefault credentials: admin / admin');
      } else {
        // Open settings modal instead
        setShowSettingsModal(true);
        return;
      }
    }

    // Open in Airflow
    openInAirflow(dagId);
  };

  const handleExecute = async () => {
    if (!generatedCode || generatedCode.includes('# No source nodes')) {
      setExecuteError('No valid code to execute. Add source nodes first.');
      setTimeout(() => setExecuteError(null), 3000);
      return;
    }

    setIsExecuting(true);
    setExecuteError(null);

    try {
      await executionApi.execute({
        code: generatedCode,
        page_id: activePage?.id,
        spark_connection_id: selectedConnectionId || undefined,
      });

      // Open history view to see the execution
      if (onOpenHistory) {
        onOpenHistory();
      }
    } catch (err: any) {
      setExecuteError(err.message || 'Execution failed');
      setTimeout(() => setExecuteError(null), 5000);
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedConnection = connections.find(c => c.id === selectedConnectionId);

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = panelHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + deltaY));
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelHeight]);

  return (
    <div
      ref={panelRef}
      className="bg-panel border-t border-gray-700 flex flex-col"
      style={{ height: panelHeight }}
    >
      {/* Resize Handle */}
      <div
        className={`h-2 flex items-center justify-center cursor-ns-resize
                    hover:bg-accent/20 transition-colors ${isResizing ? 'bg-accent/30' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal className="w-6 h-4 text-gray-500" />
      </div>

      {/* Tab Bar */}
      <TabBar />

      {/* Code Header with Tabs */}
      <div className="flex items-center pl-2 pr-2 py-1.5 border-b border-gray-700 gap-3">
        <div className="flex items-center gap-1">
          {/* Tab Switcher */}
          <div className="flex items-center bg-canvas rounded p-0.5">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded transition-colors ${
                activeTab === 'code'
                  ? 'bg-panel-light text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              Code
            </button>
            {isWorkflow && (
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" />
                Analysis
              </button>
            )}
          </div>

          {/* DAG Warnings */}
          {isDag && airflowErrors.length > 0 && (
            <span className="text-[10px] text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded">
              {airflowErrors.length} warn
            </span>
          )}
        </div>

        {/* Action Buttons - only show for code tab */}
        {activeTab === 'code' && (
          <div className="flex items-center gap-2">
            {/* Connection Selector - only for workflow pages */}
            {!isDag && (
              <div className="relative" ref={connectionDropdownRef}>
                <button
                  onClick={() => setShowConnectionDropdown(!showConnectionDropdown)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-panel-light hover:bg-accent/20
                             text-gray-300 rounded-md transition-colors border border-gray-600"
                >
                  <span className="max-w-[100px] truncate">
                    {selectedConnection?.name || 'Connection'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showConnectionDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-panel border border-gray-600 rounded-md shadow-lg z-50">
                    {connections.map((conn) => (
                      <button
                        key={conn.id}
                        onClick={() => {
                          setSelectedConnectionId(conn.id);
                          setShowConnectionDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 ${
                          selectedConnectionId === conn.id ? 'bg-white/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{conn.name}</span>
                          {conn.is_default && (
                            <span className="text-blue-400 text-[10px]">default</span>
                          )}
                        </div>
                        <div className="text-gray-500 text-[10px]">{conn.connection_type}</div>
                      </button>
                    ))}
                    <div className="border-t border-gray-600">
                      <button
                        onClick={() => {
                          setShowConnectionDropdown(false);
                          onOpenSparkSettings?.();
                        }}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 flex items-center gap-2 text-gray-400"
                      >
                        <Settings className="w-3 h-3" />
                        Manage Connections
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-panel-light hover:bg-accent/20
                         text-gray-300 rounded-md transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-panel-light hover:bg-accent/20
                           text-gray-300 rounded-md transition-colors"
                title="Export code"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-panel border border-gray-600 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      downloadCode();
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 flex items-center gap-2"
                  >
                    <Code className="w-3.5 h-3.5 text-accent" />
                    Python (.py)
                  </button>
                  {isWorkflow && (
                    <button
                      onClick={() => {
                        downloadNotebook();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 flex items-center gap-2"
                    >
                      <Code className="w-3.5 h-3.5 text-orange-400" />
                      Jupyter (.ipynb)
                    </button>
                  )}
                </div>
              )}
            </div>
          {isWorkflow && (
            <button
              onClick={handleDuplicateAndEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600/20 hover:bg-purple-600/30
                         text-purple-300 rounded-md transition-colors border border-purple-500/30"
              title="Create an editable code page from this workflow"
            >
              <FileEdit className="w-4 h-4" />
              Edit
            </button>
          )}
          {isDag && (
            <>
              <button
                onClick={handleDuplicateAndEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600/20 hover:bg-purple-600/30
                           text-purple-300 rounded-md transition-colors border border-purple-500/30"
                title="Create an editable code page from this DAG"
              >
                <FileEdit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleSyncDag}
                disabled={isSyncing || !airflowCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600/20 hover:bg-orange-600/30
                           text-orange-300 rounded-md transition-colors border border-orange-500/30
                           disabled:opacity-50"
                title="Save DAG to Airflow folder"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
              <button
                onClick={handleVisualizeInAirflow}
                disabled={!airflowCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-700
                           text-white rounded-md transition-colors disabled:opacity-50"
                title="Open DAG in Airflow UI"
              >
                <ExternalLink className="w-4 h-4" />
                Airflow
              </button>
            </>
          )}
          {!isDag && (
            <>
              <button
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-panel-light hover:bg-accent/20
                           text-gray-300 rounded-md transition-colors"
                title="View execution history"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700
                           text-white rounded-md transition-colors disabled:opacity-50"
                title="Execute code"
              >
                {isExecuting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
            </>
          )}
          </div>
        )}
      </div>

      {/* Execute Error */}
      {executeError && activeTab === 'code' && (
        <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/30 text-red-400 text-xs">
          {executeError}
        </div>
      )}

      {/* Sync Message */}
      {syncMessage && activeTab === 'code' && (
        <div className="px-4 py-2 bg-orange-500/20 border-b border-orange-500/30 text-orange-300 text-xs">
          {syncMessage}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'code' ? (
          <div className="p-4">
            <pre className="text-xs text-gray-300 font-mono whitespace-pre">
              {generatedCode}
            </pre>
          </div>
        ) : (
          <PipelineAnalyzer />
        )}
      </div>
    </div>
  );
};
