import { useState, useRef, useEffect } from 'react';
import { Code, Terminal, Copy, Check, ChevronDown } from 'lucide-react';

interface LogViewerProps {
  code: string;
  logs: string;
  isRunning?: boolean;
}

type Tab = 'logs' | 'code';

export function LogViewer({ code, logs, isRunning }: LogViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('logs');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLogs = (logs: string) => {
    if (!logs) return [];
    return logs.split('\n').map((line, index) => {
      // Color code different types of log lines
      let className = 'text-gray-300';

      if (line.includes('ERROR') || line.includes('Error') || line.includes('Exception')) {
        className = 'text-red-400';
      } else if (line.includes('WARN') || line.includes('Warning')) {
        className = 'text-yellow-400';
      } else if (line.includes('INFO')) {
        className = 'text-blue-400';
      } else if (line.startsWith('[') && line.includes(']')) {
        // Timestamp lines
        className = 'text-gray-400';
      } else if (line.includes('SUCCESS') || line.includes('completed successfully')) {
        className = 'text-green-400';
      }

      return { line, className, index };
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-700 bg-panel">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-gray-300 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Logs
          {isRunning && (
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-gray-300 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          Code
        </button>

        <div className="flex-1" />

        {/* Actions */}
        {activeTab === 'logs' && (
          <label className="flex items-center gap-2 text-sm text-gray-300 mr-4">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3 accent-blue-500"
            />
            <ChevronDown className="w-3 h-3" />
            Auto-scroll
          </label>
        )}

        <button
          onClick={() => handleCopy(activeTab === 'logs' ? logs : code)}
          className="p-2 hover:bg-white/10 rounded text-gray-300 hover:text-white mr-2"
          title="Copy"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-panel-light">
        {activeTab === 'logs' ? (
          <div className="p-4 font-mono text-sm">
            {logs ? (
              <>
                {formatLogs(logs).map(({ line, className, index }) => (
                  <div key={index} className={`${className} whitespace-pre-wrap`}>
                    {line || '\u00A0'}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            ) : (
              <div className="text-gray-400">
                {isRunning ? 'Waiting for logs...' : 'No logs available'}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <pre className="font-mono text-sm text-gray-200 whitespace-pre-wrap">
              {code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
