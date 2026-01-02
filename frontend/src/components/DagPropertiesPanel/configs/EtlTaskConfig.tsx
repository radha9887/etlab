import type { WorkflowPage } from '../../../types';

interface EtlTaskConfigProps {
  config: {
    taskId: string;
    pageId?: string;
    pageName?: string;
  };
  onChange: (updates: Partial<EtlTaskConfigProps['config']>) => void;
  etlPages: WorkflowPage[];
}

export const EtlTaskConfig = ({ config, onChange, etlPages }: EtlTaskConfigProps) => {
  return (
    <div className="space-y-3">
      {/* ETL Page Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">ETL Page</label>
        <select
          value={config.pageId || ''}
          onChange={(e) => {
            const page = etlPages.find(p => p.id === e.target.value);
            onChange({
              pageId: e.target.value,
              pageName: page?.name || '',
            });
          }}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="">Select ETL page...</option>
          {etlPages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
        {etlPages.length === 0 && (
          <p className="text-xs text-orange-400 mt-1">
            No ETL pages available. Create an ETL workflow first.
          </p>
        )}
      </div>

      {/* Selected Page Info */}
      {config.pageId && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
          <p className="text-xs text-blue-400">
            Will execute: <span className="font-mono">{config.pageName}</span>
          </p>
        </div>
      )}

      {/* Spark Config Override */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Driver Memory (optional)</label>
        <input
          type="text"
          placeholder="e.g., 4g"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Executor Memory (optional)</label>
        <input
          type="text"
          placeholder="e.g., 8g"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
};
