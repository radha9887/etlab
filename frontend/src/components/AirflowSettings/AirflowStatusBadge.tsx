import { useEffect } from 'react';
import { GitBranch, CheckCircle, Loader2, AlertCircle, Circle, Settings } from 'lucide-react';
import { useAirflowStore } from '../../stores/airflowStore';

interface AirflowStatusBadgeProps {
  showLabel?: boolean;
}

export const AirflowStatusBadge = ({ showLabel = true }: AirflowStatusBadgeProps) => {
  const { status, fetchStatus, setShowSettingsModal } = useAirflowStore();

  // Fetch status on mount and periodically
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getStatusColor = () => {
    switch (status.status) {
      case 'running':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'starting':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'stopped':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'running':
        return <CheckCircle className="w-3 h-3" />;
      case 'starting':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  return (
    <button
      onClick={() => setShowSettingsModal(true)}
      className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs
                  transition-colors hover:opacity-80 ${getStatusColor()}`}
      title={`Airflow: ${status.status}${status.message ? ` - ${status.message}` : ''}`}
    >
      <GitBranch className="w-3 h-3 text-orange-400" />
      {showLabel && (
        <>
          <span>Airflow</span>
          {getStatusIcon()}
        </>
      )}
      <Settings className="w-3 h-3 opacity-60" />
    </button>
  );
};
