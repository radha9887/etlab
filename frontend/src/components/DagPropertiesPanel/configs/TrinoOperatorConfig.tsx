interface TrinoOperatorConfigProps {
  config: {
    taskId: string;
    trinoConnId?: string;
    sql?: string;
    catalog?: string;
    schema?: string;
    parameters?: string;
    handler?: 'list' | 'dict' | 'pandas' | 'none';
    outputFormat?: 'json' | 'csv';
  };
  onChange: (updates: Partial<TrinoOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const TrinoOperatorConfig = ({ config, onChange }: TrinoOperatorConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Trino Connection */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Trino Connection ID *</label>
        <input
          type="text"
          value={config.trinoConnId || ''}
          onChange={(e) => onChange({ trinoConnId: e.target.value })}
          placeholder="trino_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Airflow connection to Trino/Presto cluster
        </p>
      </div>

      {/* Catalog and Schema */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Catalog</label>
          <input
            type="text"
            value={config.catalog || ''}
            onChange={(e) => onChange({ catalog: e.target.value })}
            placeholder="hive"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Schema</label>
          <input
            type="text"
            value={config.schema || ''}
            onChange={(e) => onChange({ schema: e.target.value })}
            placeholder="default"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* SQL Query */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">SQL Query *</label>
        <textarea
          value={config.sql || ''}
          onChange={(e) => onChange({ sql: e.target.value })}
          placeholder="SELECT * FROM my_table WHERE date = '{{ ds }}' LIMIT 100"
          rows={6}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          SQL query to execute (Jinja templating supported)
        </p>
      </div>

      {/* Parameters */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Query Parameters (JSON)</label>
        <input
          type="text"
          value={config.parameters || ''}
          onChange={(e) => onChange({ parameters: e.target.value })}
          placeholder='{"date": "{{ ds }}", "limit": 100}'
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Result Handler */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Result Handler</label>
        <select
          value={config.handler || 'list'}
          onChange={(e) => onChange({ handler: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="list">List of tuples</option>
          <option value="dict">List of dicts</option>
          <option value="pandas">Pandas DataFrame</option>
          <option value="none">None (don't fetch)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          How to handle query results (pushed to XCom)
        </p>
      </div>

      {/* Preview */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-2">
        <p className="text-xs text-indigo-400 font-mono truncate">
          {config.sql ? (
            <>{config.sql.split('\n')[0].substring(0, 60)}{config.sql.length > 60 && '...'}</>
          ) : (
            <>Configure Trino/Presto SQL query</>
          )}
        </p>
      </div>
    </div>
  );
};
