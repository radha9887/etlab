import { ConnectionPicker } from '../shared';

interface BigQueryOperatorConfigProps {
  config: {
    taskId: string;
    gcpConnId?: string;
    projectId?: string;
    operationType?: 'query' | 'insert' | 'create_table' | 'delete_table';
    sql?: string;
    destinationDataset?: string;
    destinationTable?: string;
    writeDisposition?: 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY';
    createDisposition?: 'CREATE_IF_NEEDED' | 'CREATE_NEVER';
    useLegacySql?: boolean;
    location?: string;
    labels?: string;
    priority?: 'INTERACTIVE' | 'BATCH';
    timePartitioningField?: string;
    clusteringFields?: string;
  };
  onChange: (updates: Partial<BigQueryOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const BigQueryOperatorConfig = ({ config, onChange }: BigQueryOperatorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* GCP Connection */}
      <ConnectionPicker
        value={config.gcpConnId || 'google_cloud_default'}
        onChange={(value) => onChange({ gcpConnId: value })}
        connectionType="gcp"
        label="GCP Connection ID"
        helpText="Connection with GCP credentials. Create in Airflow Admin > Connections."
      />

      {/* Project ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Project ID</label>
        <input
          type="text"
          value={config.projectId || ''}
          onChange={(e) => onChange({ projectId: e.target.value })}
          placeholder="my-gcp-project"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Operation Type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'query'}
          onChange={(e) => onChange({ operationType: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="query">Run Query</option>
          <option value="insert">Insert Query Results</option>
          <option value="create_table">Create Table</option>
          <option value="delete_table">Delete Table</option>
        </select>
      </div>

      {/* SQL Query */}
      {(config.operationType === 'query' || config.operationType === 'insert' || !config.operationType) && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">SQL Query *</label>
          <textarea
            value={config.sql || ''}
            onChange={(e) => onChange({ sql: e.target.value })}
            placeholder="SELECT * FROM `project.dataset.table` WHERE date = '{{ ds }}'"
            rows={5}
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
          />
        </div>
      )}

      {/* Destination Table */}
      {(config.operationType === 'insert' || config.operationType === 'create_table' || config.operationType === 'delete_table') && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Destination Dataset</label>
            <input
              type="text"
              value={config.destinationDataset || ''}
              onChange={(e) => onChange({ destinationDataset: e.target.value })}
              placeholder="my_dataset"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Destination Table</label>
            <input
              type="text"
              value={config.destinationTable || ''}
              onChange={(e) => onChange({ destinationTable: e.target.value })}
              placeholder="my_table"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none font-mono"
            />
          </div>
        </div>
      )}

      {/* Write Options */}
      {config.operationType === 'insert' && (
        <div className="border-t border-gray-700 pt-3">
          <h4 className="text-xs font-medium text-gray-300 mb-2">Write Options</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Write Disposition</label>
              <select
                value={config.writeDisposition || 'WRITE_TRUNCATE'}
                onChange={(e) => onChange({ writeDisposition: e.target.value as any })}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              >
                <option value="WRITE_TRUNCATE">Truncate</option>
                <option value="WRITE_APPEND">Append</option>
                <option value="WRITE_EMPTY">Empty Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Create Disposition</label>
              <select
                value={config.createDisposition || 'CREATE_IF_NEEDED'}
                onChange={(e) => onChange({ createDisposition: e.target.value as any })}
                className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                           border border-gray-600 focus:border-accent focus:outline-none"
              >
                <option value="CREATE_IF_NEEDED">Create If Needed</option>
                <option value="CREATE_NEVER">Never Create</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Partitioning & Clustering */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Partitioning & Clustering</h4>
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Time Partition Field</label>
          <input
            type="text"
            value={config.timePartitioningField || ''}
            onChange={(e) => onChange({ timePartitioningField: e.target.value })}
            placeholder="created_date"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Clustering Fields (comma-separated)</label>
          <input
            type="text"
            value={config.clusteringFields || ''}
            onChange={(e) => onChange({ clusteringFields: e.target.value })}
            placeholder="country, region, city"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Query Settings */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Query Settings</h4>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Priority</label>
            <select
              value={config.priority || 'INTERACTIVE'}
              onChange={(e) => onChange({ priority: e.target.value as any })}
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            >
              <option value="INTERACTIVE">Interactive</option>
              <option value="BATCH">Batch</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Location</label>
            <input
              type="text"
              value={config.location || ''}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="US"
              className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                         border border-gray-600 focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Use Legacy SQL</span>
          <button
            onClick={() => onChange({ useLegacySql: !config.useLegacySql })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.useLegacySql ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.useLegacySql ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      {config.sql && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2">
          <p className="text-xs text-blue-400">
            {config.operationType === 'insert' && config.destinationTable
              ? `Inserts query results into ${config.destinationDataset}.${config.destinationTable}`
              : 'Runs BigQuery query'}
          </p>
        </div>
      )}
    </div>
  );
};
