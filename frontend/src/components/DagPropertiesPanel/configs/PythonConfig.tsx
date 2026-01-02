import { useState } from 'react';

interface PythonConfigProps {
  config: {
    taskId: string;
    pythonCode?: string;
    pythonCallable?: string;
    opKwargs?: Record<string, any>;
  };
  onChange: (updates: Partial<PythonConfigProps['config']>) => void;
  etlPages: any[];
}

export const PythonConfig = ({ config, onChange }: PythonConfigProps) => {
  const [showKwargs, setShowKwargs] = useState(false);
  const [newKwargKey, setNewKwargKey] = useState('');
  const [newKwargValue, setNewKwargValue] = useState('');

  const opKwargs = config.opKwargs || {};

  const addKwarg = () => {
    if (newKwargKey.trim()) {
      onChange({
        opKwargs: { ...opKwargs, [newKwargKey.trim()]: newKwargValue }
      });
      setNewKwargKey('');
      setNewKwargValue('');
    }
  };

  const removeKwarg = (key: string) => {
    const newKwargs = { ...opKwargs };
    delete newKwargs[key];
    onChange({ opKwargs: newKwargs });
  };

  return (
    <div className="space-y-3">
      {/* Python Code */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Python Code *</label>
        <textarea
          value={config.pythonCode || ''}
          onChange={(e) => onChange({ pythonCode: e.target.value })}
          placeholder={`def execute(**kwargs):
    # Your Python code here
    ti = kwargs['ti']
    return "result"`}
          rows={10}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Define a function that will be called by PythonOperator
        </p>
      </div>

      {/* Callable Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Callable Name</label>
        <input
          type="text"
          value={config.pythonCallable || 'execute'}
          onChange={(e) => onChange({ pythonCallable: e.target.value })}
          placeholder="execute"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Function name to call (default: execute)
        </p>
      </div>

      {/* Op Kwargs */}
      <div className="border-t border-gray-700 pt-3">
        <button
          onClick={() => setShowKwargs(!showKwargs)}
          className="text-xs text-gray-300 hover:text-white flex items-center gap-1"
        >
          <span className={`transform transition-transform ${showKwargs ? 'rotate-90' : ''}`}>
            ▶
          </span>
          op_kwargs ({Object.keys(opKwargs).length})
        </button>

        {showKwargs && (
          <div className="mt-2 space-y-2">
            {/* Existing kwargs */}
            {Object.entries(opKwargs).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">{key}:</span>
                <span className="text-xs text-gray-300 flex-1 truncate">{String(value)}</span>
                <button
                  onClick={() => removeKwarg(key)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  &times;
                </button>
              </div>
            ))}

            {/* Add new kwarg */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newKwargKey}
                onChange={(e) => setNewKwargKey(e.target.value)}
                placeholder="key"
                className="flex-1 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
              <input
                type="text"
                value={newKwargValue}
                onChange={(e) => setNewKwargValue(e.target.value)}
                placeholder="value"
                className="flex-1 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded
                           border border-gray-600 focus:border-accent focus:outline-none"
              />
              <button
                onClick={addKwarg}
                className="px-2 py-1 bg-accent text-white text-xs rounded hover:bg-accent/80"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
