import { useState, useEffect } from 'react';
import { X, Plus, Zap, Server, Cloud, TestTube, Trash2, Star, Loader2 } from 'lucide-react';
import { sparkApi } from '../../services/api';
import type { SparkConnection } from '../../services/api';
import { SparkConnectionForm } from './SparkConnectionForm';

interface SparkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SparkSettingsModal({ isOpen, onClose }: SparkSettingsModalProps) {
  const [connections, setConnections] = useState<SparkConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<SparkConnection | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen]);

  const loadConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sparkApi.list();
      setConnections(data);
    } catch (err) {
      setError('Failed to load connections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const result = await sparkApi.test(id);
      setTestResult({ id, success: result.success, message: result.message });
    } catch (err) {
      setTestResult({ id, success: false, message: 'Test failed' });
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this connection?')) return;
    try {
      await sparkApi.delete(id);
      await loadConnections();
    } catch (err) {
      console.error('Failed to delete connection:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await sparkApi.setDefault(id);
      await loadConnections();
    } catch (err) {
      console.error('Failed to set default:', err);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingConnection) {
        await sparkApi.update(editingConnection.id, data);
      } else {
        await sparkApi.create(data);
      }
      setShowForm(false);
      setEditingConnection(null);
      await loadConnections();
    } catch (err) {
      console.error('Failed to save connection:', err);
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'local':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'livy':
        return <Cloud className="w-5 h-5 text-blue-400" />;
      case 'standalone':
        return <Server className="w-5 h-5 text-green-400" />;
      default:
        return <Server className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-panel border border-gray-700 rounded-lg w-[600px] max-h-[80vh] flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Spark Connections</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {showForm || editingConnection ? (
            <SparkConnectionForm
              connection={editingConnection}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingConnection(null);
              }}
            />
          ) : (
            <>
              {/* Add button */}
              <button
                onClick={() => setShowForm(true)}
                className="w-full mb-4 p-3 border border-dashed border-gray-600 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors text-gray-300"
              >
                <Plus className="w-4 h-4" />
                <span>Add Connection</span>
              </button>

              {/* Loading */}
              {loading && (
                <div className="text-center py-8 text-gray-300">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading connections...
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-red-400 text-center py-4">{error}</div>
              )}

              {/* Connection List */}
              {!loading && !error && connections.length === 0 && (
                <div className="text-center py-8 text-gray-300">
                  No connections configured
                </div>
              )}

              <div className="space-y-3">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="bg-panel-light rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getConnectionIcon(conn.connection_type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{conn.name}</span>
                            {conn.is_default && (
                              <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            {conn.connection_type === 'local' && (
                              <span>Local Mode: {conn.master_url || 'local[*]'}</span>
                            )}
                            {conn.connection_type === 'livy' && (
                              <span>Livy: {conn.master_url}</span>
                            )}
                            {conn.connection_type === 'standalone' && (
                              <span>Standalone: {conn.master_url}</span>
                            )}
                          </div>

                          {/* Test Result */}
                          {testResult?.id === conn.id && (
                            <div className={`mt-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                              {testResult.message}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTest(conn.id)}
                          disabled={testingId === conn.id}
                          className="p-2 hover:bg-white/10 rounded text-gray-300 hover:text-white disabled:opacity-50"
                          title="Test Connection"
                        >
                          {testingId === conn.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                        </button>
                        {!conn.is_default && (
                          <button
                            onClick={() => handleSetDefault(conn.id)}
                            className="p-2 hover:bg-white/10 rounded text-gray-300 hover:text-yellow-400"
                            title="Set as Default"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingConnection(conn)}
                          className="p-2 hover:bg-white/10 rounded text-gray-300 hover:text-white"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(conn.id)}
                          className="p-2 hover:bg-white/10 rounded text-gray-300 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
