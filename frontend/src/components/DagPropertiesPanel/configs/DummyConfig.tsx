interface DummyConfigProps {
  config: {
    taskId: string;
  };
  onChange: (updates: Partial<DummyConfigProps['config']>) => void;
  etlPages: any[];
}

export const DummyConfig = ({ config, onChange: _onChange }: DummyConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Info */}
      <div className="bg-gray-700/50 rounded-md p-3">
        <p className="text-xs text-gray-300">
          Dummy operator does nothing. Use it for:
        </p>
        <ul className="text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
          <li>Grouping dependencies</li>
          <li>Synchronization points</li>
          <li>Placeholder for future tasks</li>
          <li>DAG structure clarity</li>
        </ul>
      </div>

      {/* Task ID Display */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-2">
        <p className="text-xs text-gray-400">Task ID</p>
        <p className="text-sm text-purple-300 font-mono">{config.taskId}</p>
      </div>

      {/* Visual Example */}
      <div className="border-t border-gray-700 pt-3">
        <p className="text-xs text-gray-400 mb-2">Common Patterns</p>

        <div className="space-y-2">
          <div className="bg-gray-800/50 rounded p-2">
            <p className="text-xs text-green-400 font-mono mb-1">start_task</p>
            <p className="text-xs text-gray-500">Entry point for DAG</p>
          </div>

          <div className="bg-gray-800/50 rounded p-2">
            <p className="text-xs text-green-400 font-mono mb-1">join_point</p>
            <p className="text-xs text-gray-500">Wait for parallel tasks</p>
          </div>

          <div className="bg-gray-800/50 rounded p-2">
            <p className="text-xs text-green-400 font-mono mb-1">end_task</p>
            <p className="text-xs text-gray-500">Final DAG task</p>
          </div>
        </div>
      </div>
    </div>
  );
};
