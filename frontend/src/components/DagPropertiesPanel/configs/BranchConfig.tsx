import { Plus, Trash2 } from 'lucide-react';

interface BranchCondition {
  id: string;
  expression: string;
  targetTaskId: string;
}

interface BranchConfigProps {
  config: {
    taskId: string;
    conditions?: BranchCondition[];
    defaultTaskId?: string;
  };
  onChange: (updates: Partial<BranchConfigProps['config']>) => void;
  etlPages: any[];
}

export const BranchConfig = ({ config, onChange }: BranchConfigProps) => {
  const conditions = config.conditions || [];

  const addCondition = () => {
    const newCondition: BranchCondition = {
      id: `cond-${Date.now()}`,
      expression: '',
      targetTaskId: '',
    };
    onChange({
      conditions: [...conditions, newCondition]
    });
  };

  const updateCondition = (id: string, updates: Partial<BranchCondition>) => {
    onChange({
      conditions: conditions.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    });
  };

  const removeCondition = (id: string) => {
    onChange({
      conditions: conditions.filter(c => c.id !== id)
    });
  };

  return (
    <div className="space-y-3">
      {/* Info */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-2">
        <p className="text-xs text-purple-300">
          Branch operator chooses which downstream task to execute based on conditions.
        </p>
      </div>

      {/* Conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Conditions</label>
          <button
            onClick={addCondition}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          {conditions.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No conditions defined</p>
          ) : (
            conditions.map((condition, index) => (
              <div
                key={condition.id}
                className="bg-gray-800/50 rounded-md p-2 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Condition {index + 1}</span>
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Expression</label>
                  <input
                    type="text"
                    value={condition.expression}
                    onChange={(e) => updateCondition(condition.id, { expression: e.target.value })}
                    placeholder="ti.xcom_pull('task_id') == 'value'"
                    className="w-full bg-gray-800 text-gray-200 text-xs px-2 py-1.5 rounded
                               border border-gray-600 focus:border-accent focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Target Task ID</label>
                  <input
                    type="text"
                    value={condition.targetTaskId}
                    onChange={(e) => updateCondition(condition.id, { targetTaskId: e.target.value })}
                    placeholder="task_id_to_execute"
                    className="w-full bg-gray-800 text-gray-200 text-xs px-2 py-1.5 rounded
                               border border-gray-600 focus:border-accent focus:outline-none font-mono"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Default Task */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-1">Default Task ID</label>
        <input
          type="text"
          value={config.defaultTaskId || ''}
          onChange={(e) => onChange({ defaultTaskId: e.target.value })}
          placeholder="fallback_task_id"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Executed when no conditions match
        </p>
      </div>

      {/* Code Preview */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-1">Generated Code Preview</label>
        <pre className="bg-gray-900 rounded-md p-2 text-xs text-gray-300 overflow-x-auto">
{`def branch_${config.taskId || 'task'}(**kwargs):
    ti = kwargs['ti']
${conditions.map((c, i) => `    if ${c.expression || 'condition'}:
        return '${c.targetTaskId || 'task_' + (i + 1)}'`).join('\n')}
    return '${config.defaultTaskId || 'default_task'}'`}
        </pre>
      </div>
    </div>
  );
};
