interface DataformOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DataformOperatorConfig = ({ config, onChange }: DataformOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation</label>
        <select
          value={config.operation || 'create_workflow_invocation'}
          onChange={(e) => updateConfig('operation', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="create_workflow_invocation">Create Workflow Invocation</option>
          <option value="create_compilation_result">Create Compilation Result</option>
          <option value="get_compilation_result">Get Compilation Result</option>
          <option value="cancel_workflow_invocation">Cancel Workflow Invocation</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Project ID</label>
        <input
          type="text"
          value={config.projectId || ''}
          onChange={(e) => updateConfig('projectId', e.target.value)}
          placeholder="my-gcp-project"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region *</label>
        <input
          type="text"
          value={config.region || ''}
          onChange={(e) => updateConfig('region', e.target.value)}
          placeholder="us-central1"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Repository *</label>
        <input
          type="text"
          value={config.repository || ''}
          onChange={(e) => updateConfig('repository', e.target.value)}
          placeholder="my-dataform-repository"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {(config.operation === 'create_compilation_result' || config.operation === 'create_workflow_invocation') && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Git Commitish</label>
            <input
              type="text"
              value={config.gitCommitish || 'main'}
              onChange={(e) => updateConfig('gitCommitish', e.target.value)}
              placeholder="main"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </>
      )}

      {config.operation === 'create_workflow_invocation' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Compilation Result (optional)</label>
            <input
              type="text"
              value={config.compilationResult || ''}
              onChange={(e) => updateConfig('compilationResult', e.target.value)}
              placeholder="projects/.../compilationResults/..."
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Included Targets (one per line)</label>
            <textarea
              value={config.includedTargets || ''}
              onChange={(e) => updateConfig('includedTargets', e.target.value)}
              placeholder="schema.table1&#10;schema.table2"
              rows={3}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Included Tags (comma-separated)</label>
            <input
              type="text"
              value={config.includedTags || ''}
              onChange={(e) => updateConfig('includedTags', e.target.value)}
              placeholder="daily, production"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.transitiveDependenciesIncluded || false}
              onChange={(e) => updateConfig('transitiveDependenciesIncluded', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Include Transitive Dependencies</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.transitiveDependentsIncluded || false}
              onChange={(e) => updateConfig('transitiveDependentsIncluded', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Include Transitive Dependents</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.fullyRefreshIncrementalTablesEnabled || false}
              onChange={(e) => updateConfig('fullyRefreshIncrementalTablesEnabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <label className="text-xs text-gray-400">Fully Refresh Incremental Tables</label>
          </div>
        </>
      )}

      {config.operation === 'create_compilation_result' && (
        <>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Schema Suffix</label>
            <input
              type="text"
              value={config.schemaSuffix || ''}
              onChange={(e) => updateConfig('schemaSuffix', e.target.value)}
              placeholder="_dev"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Table Prefix</label>
            <input
              type="text"
              value={config.tablePrefix || ''}
              onChange={(e) => updateConfig('tablePrefix', e.target.value)}
              placeholder="dev_"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Variables (JSON)</label>
            <textarea
              value={config.variables || ''}
              onChange={(e) => updateConfig('variables', e.target.value)}
              placeholder='{"env": "production"}'
              rows={2}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono text-xs"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1">GCP Connection ID</label>
        <input
          type="text"
          value={config.gcpConnId || ''}
          onChange={(e) => updateConfig('gcpConnId', e.target.value)}
          placeholder="google_cloud_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.waitForCompletion !== false}
          onChange={(e) => updateConfig('waitForCompletion', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Wait for Completion</label>
      </div>
    </div>
  );
};
