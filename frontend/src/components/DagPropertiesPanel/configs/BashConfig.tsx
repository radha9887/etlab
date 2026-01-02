import { useState } from 'react';

interface BashConfigProps {
  config: {
    taskId: string;
    bashCommand?: string;
    env?: Record<string, string>;
    cwd?: string;
  };
  onChange: (updates: Partial<BashConfigProps['config']>) => void;
  etlPages: any[];
}

export const BashConfig = ({ config, onChange }: BashConfigProps) => {
  const [showEnv, setShowEnv] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  const env = config.env || {};

  const addEnvVar = () => {
    if (newEnvKey.trim()) {
      onChange({
        env: { ...env, [newEnvKey.trim()]: newEnvValue }
      });
      setNewEnvKey('');
      setNewEnvValue('');
    }
  };

  const removeEnvVar = (key: string) => {
    const newEnv = { ...env };
    delete newEnv[key];
    onChange({ env: newEnv });
  };

  return (
    <div className="space-y-3">
      {/* Bash Command */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Bash Command *</label>
        <textarea
          value={config.bashCommand || ''}
          onChange={(e) => onChange({ bashCommand: e.target.value })}
          placeholder={`#!/bin/bash
echo "Starting task..."
# Your bash commands here`}
          rows={8}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
      </div>

      {/* Working Directory */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Working Directory</label>
        <input
          type="text"
          value={config.cwd || ''}
          onChange={(e) => onChange({ cwd: e.target.value })}
          placeholder="/tmp"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Environment Variables */}
      <div className="border-t border-gray-700 pt-3">
        <button
          onClick={() => setShowEnv(!showEnv)}
          className="text-xs text-gray-300 hover:text-white flex items-center gap-1"
        >
          <span className={`transform transition-transform ${showEnv ? 'rotate-90' : ''}`}>
            ▶
          </span>
          Environment Variables ({Object.keys(env).length})
        </button>

        {showEnv && (
          <div className="mt-2 space-y-2">
            {/* Existing env vars */}
            {Object.entries(env).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-green-400 font-mono">{key}</span>
                <span className="text-xs text-gray-500">=</span>
                <span className="text-xs text-gray-300 flex-1 truncate font-mono">{value}</span>
                <button
                  onClick={() => removeEnvVar(key)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  &times;
                </button>
              </div>
            ))}

            {/* Add new env var */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newEnvKey}
                onChange={(e) => setNewEnvKey(e.target.value)}
                placeholder="VAR_NAME"
                className="flex-1 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded
                           border border-gray-600 focus:border-accent focus:outline-none font-mono"
              />
              <input
                type="text"
                value={newEnvValue}
                onChange={(e) => setNewEnvValue(e.target.value)}
                placeholder="value"
                className="flex-1 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded
                           border border-gray-600 focus:border-accent focus:outline-none font-mono"
              />
              <button
                onClick={addEnvVar}
                className="px-2 py-1 bg-accent text-white text-xs rounded hover:bg-accent/80"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-800/50 rounded-md p-2">
        <p className="text-xs text-gray-500">
          Use Jinja templating: {"{{ ds }}"}, {"{{ execution_date }}"}
        </p>
      </div>
    </div>
  );
};
