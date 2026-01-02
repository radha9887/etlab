import { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAirflowStore } from '../../stores/airflowStore';

export const AirflowSettingsModal = () => {
  const {
    settings,
    status,
    isLoading,
    showSettingsModal,
    setShowSettingsModal,
    updateSettings,
    startAirflow,
    stopAirflow,
    fetchStatus,
    testConnection,
  } = useAirflowStore();

  const [localSettings, setLocalSettings] = useState(settings);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Sync local settings when modal opens
  useEffect(() => {
    if (showSettingsModal) {
      setLocalSettings(settings);
      fetchStatus();
    }
  }, [showSettingsModal, settings, fetchStatus]);

  // Poll status while modal is open
  useEffect(() => {
    if (!showSettingsModal) return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [showSettingsModal, fetchStatus]);

  if (!showSettingsModal) return null;

  const handleSave = async () => {
    await updateSettings(localSettings);
    setShowSettingsModal(false);
  };

  const handleStart = async () => {
    await startAirflow();
  };

  const handleStop = async () => {
    await stopAirflow();
  };

  const handleTest = async () => {
    if (!localSettings.external_url) return;
    setIsTesting(true);
    setTestResult(null);
    const result = await testConnection(
      localSettings.external_url,
      localSettings.external_username,
      localSettings.external_password
    );
    setTestResult(result);
    setIsTesting(false);
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'running':
        return 'text-green-400';
      case 'starting':
        return 'text-yellow-400';
      case 'stopped':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'running':
        return <CheckCircle className="w-4 h-4" />;
      case 'starting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-panel w-[500px] max-h-[80vh] rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Airflow Settings</h2>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Airflow Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, mode: 'docker' })}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  localSettings.mode === 'docker'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-medium text-white">Docker (Managed)</div>
                <div className="text-xs text-gray-400 mt-1">
                  Spins up local Airflow container
                </div>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, mode: 'external' })}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  localSettings.mode === 'external'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-medium text-white">External</div>
                <div className="text-xs text-gray-400 mt-1">
                  Connect to existing Airflow
                </div>
              </button>
            </div>
          </div>

          {/* Docker Mode Settings */}
          {localSettings.mode === 'docker' && (
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-panel-light rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-300">Status</span>
                  <div className={`flex items-center gap-2 ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="text-sm capitalize">{status.status}</span>
                  </div>
                </div>

                {status.message && (
                  <p className="text-xs text-gray-400 mb-3">{status.message}</p>
                )}

                <div className="flex items-center gap-2">
                  {status.status === 'stopped' || status.status === 'unknown' ? (
                    <button
                      onClick={handleStart}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700
                                 text-white text-sm rounded disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Start Airflow
                    </button>
                  ) : status.status === 'running' ? (
                    <>
                      <button
                        onClick={handleStop}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700
                                   text-white text-sm rounded disabled:opacity-50"
                      >
                        <Square className="w-4 h-4" />
                        Stop
                      </button>
                      <button
                        onClick={() => window.open(status.url, '_blank')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700
                                   text-white text-sm rounded"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Airflow UI
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={fetchStatus}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700
                                 text-white text-sm rounded"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Status
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Port</label>
                <input
                  type="number"
                  value={localSettings.docker_port}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, docker_port: parseInt(e.target.value) || 8080 })
                  }
                  className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-white text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Airflow will be available at http://localhost:{localSettings.docker_port}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoStart"
                  checked={localSettings.auto_start}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, auto_start: e.target.checked })
                  }
                  className="rounded border-gray-600 bg-canvas text-orange-500"
                />
                <label htmlFor="autoStart" className="text-sm text-gray-300">
                  Auto-start Airflow on app launch
                </label>
              </div>
            </div>
          )}

          {/* External Mode Settings */}
          {localSettings.mode === 'external' && (
            <div className="space-y-4 mb-6">
              {/* Warning about external mode */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-300">
                  <strong>Note:</strong> External Airflow requires manual DAG deployment.
                  Use "Export → Python" to download DAG files, then copy them to your Airflow's dags folder.
                  REST API is used for connection test and viewing DAGs only.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Airflow URL</label>
                <input
                  type="url"
                  placeholder="http://airflow.example.com:8080"
                  value={localSettings.external_url || ''}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, external_url: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-white text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Airflow 2.0+ REST API will be used for connection testing
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Username (optional)</label>
                <input
                  type="text"
                  placeholder="admin"
                  value={localSettings.external_username || ''}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, external_username: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Password (optional)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={localSettings.external_password || ''}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, external_password: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTest}
                  disabled={!localSettings.external_url || isTesting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700
                             text-white text-sm rounded disabled:opacity-50"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Test Connection
                </button>

                {localSettings.external_url && (
                  <button
                    onClick={() => window.open(localSettings.external_url, '_blank')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700
                               text-white text-sm rounded"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open UI
                  </button>
                )}
              </div>

              {testResult && (
                <div className={`p-2 rounded text-sm ${
                  testResult.success
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {testResult.success ? '✓' : '✗'} {testResult.message}
                </div>
              )}
            </div>
          )}

          {/* DAG Sync Settings */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">DAG Sync</h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSave"
                checked={localSettings.auto_save}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, auto_save: e.target.checked })
                }
                className="rounded border-gray-600 bg-canvas text-orange-500"
              />
              <label htmlFor="autoSave" className="text-sm text-gray-300">
                Auto-save DAG files when editing
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-5">
              DAG files are saved to docker/airflow/dags/ and synced with Airflow
            </p>
          </div>

          {/* Credentials Info */}
          {localSettings.mode === 'docker' && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                <strong>Default Credentials:</strong> Username: admin / Password: admin
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-700">
          <button
            onClick={() => setShowSettingsModal(false)}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
