import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, XCircle, Clock, CheckCircle, AlertCircle, Loader2, Ban } from 'lucide-react';
import { executionApi } from '../../services/api';
import type { Execution } from '../../services/api';
import { LogViewer } from './LogViewer';

interface ExecutionHistoryViewProps {
  onBack: () => void;
}

type StatusFilter = 'all' | 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export function ExecutionHistoryView({ onBack }: ExecutionHistoryViewProps) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadExecutions = useCallback(async () => {
    try {
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const data = await executionApi.list({ status: filter, limit: 100 });
      setExecutions(data);

      // Update selected execution if it exists
      if (selectedExecution) {
        const updated = data.find(e => e.id === selectedExecution.id);
        if (updated) {
          // Fetch full details including logs
          const full = await executionApi.get(updated.id);
          setSelectedExecution(full);
        }
      }
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedExecution?.id]);

  useEffect(() => {
    loadExecutions();
  }, [statusFilter]);

  // Auto-refresh every 2 seconds if enabled and there are running jobs
  useEffect(() => {
    if (!autoRefresh) return;

    const hasRunning = executions.some(e => e.status === 'running' || e.status === 'pending');
    if (!hasRunning && !loading) return;

    const interval = setInterval(loadExecutions, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, executions, loading, loadExecutions]);

  const handleCancel = async (id: string) => {
    try {
      await executionApi.cancel(id);
      await loadExecutions();
    } catch (err) {
      console.error('Failed to cancel execution:', err);
    }
  };

  const handleSelectExecution = async (execution: Execution) => {
    try {
      const full = await executionApi.get(execution.id);
      setSelectedExecution(full);
    } catch (err) {
      console.error('Failed to load execution details:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'cancelled':
        return <Ban className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'running':
        return 'text-blue-400 bg-blue-400/10';
      case 'success':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'cancelled':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return '-';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-canvas flex flex-col z-50 text-white">
      {/* Header */}
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4 bg-panel">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded flex items-center gap-2 text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-lg font-semibold text-white">Execution History</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-refresh toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            Auto-refresh
          </label>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-panel-light border border-gray-600 rounded px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={loadExecutions}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded text-gray-300"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Execution List */}
        <div className="w-96 border-r border-gray-700 overflow-y-auto bg-panel">
          {loading && executions.length === 0 ? (
            <div className="p-8 text-center text-gray-300">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : executions.length === 0 ? (
            <div className="p-8 text-center text-gray-300">
              No executions found
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  onClick={() => handleSelectExecution(execution)}
                  className={`p-4 cursor-pointer hover:bg-white/5 ${
                    selectedExecution?.id === execution.id ? 'bg-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>

                    {(execution.status === 'running' || execution.status === 'pending') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(execution.id);
                        }}
                        className="p-1 hover:bg-white/10 rounded text-red-400"
                        title="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-gray-300">
                    <div>ID: {execution.id.slice(0, 8)}...</div>
                    <div>Started: {formatTime(execution.created_at)}</div>
                    <div>Duration: {formatDuration(execution.started_at, execution.completed_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Execution Details */}
        <div className="flex-1 flex flex-col overflow-hidden bg-canvas">
          {selectedExecution ? (
            <>
              {/* Details Header */}
              <div className="p-4 border-b border-gray-700 bg-panel">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(selectedExecution.status)}
                  <span className={`px-2 py-0.5 text-sm rounded ${getStatusColor(selectedExecution.status)}`}>
                    {selectedExecution.status}
                  </span>
                  <span className="text-sm text-gray-300">
                    {formatDuration(selectedExecution.started_at, selectedExecution.completed_at)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span>
                    <span className="ml-2 font-mono text-gray-200">{selectedExecution.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <span className="ml-2 text-gray-200">{formatTime(selectedExecution.created_at)}</span>
                  </div>
                  {selectedExecution.started_at && (
                    <div>
                      <span className="text-gray-400">Started:</span>
                      <span className="ml-2 text-gray-200">{formatTime(selectedExecution.started_at)}</span>
                    </div>
                  )}
                  {selectedExecution.completed_at && (
                    <div>
                      <span className="text-gray-400">Completed:</span>
                      <span className="ml-2 text-gray-200">{formatTime(selectedExecution.completed_at)}</span>
                    </div>
                  )}
                </div>

                {selectedExecution.error_message && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                    <strong>Error:</strong> {selectedExecution.error_message}
                  </div>
                )}
              </div>

              {/* Tabs for Code and Logs */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <LogViewer
                  code={selectedExecution.code}
                  logs={selectedExecution.logs || ''}
                  isRunning={selectedExecution.status === 'running' || selectedExecution.status === 'pending'}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-300">
              Select an execution to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
