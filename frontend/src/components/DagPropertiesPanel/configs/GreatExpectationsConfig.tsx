interface GreatExpectationsConfigProps {
  config: {
    taskId: string;
    dataContextRoot?: string;
    checkpointName?: string;
    expectationSuiteName?: string;
    batchRequest?: string;
    validatorName?: string;
    runName?: string;
    failTaskOnValidationFailure?: boolean;
    returnJsonDict?: boolean;
    datasourceName?: string;
    dataAssetName?: string;
    runNameTemplate?: string;
  };
  onChange: (updates: Partial<GreatExpectationsConfigProps['config']>) => void;
  etlPages: any[];
}

export const GreatExpectationsConfig = ({ config, onChange }: GreatExpectationsConfigProps) => {
  return (
    <div className="space-y-3">
      {/* Data Context Root */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Context Root *</label>
        <input
          type="text"
          value={config.dataContextRoot || ''}
          onChange={(e) => onChange({ dataContextRoot: e.target.value })}
          placeholder="/opt/airflow/great_expectations"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to great_expectations directory containing great_expectations.yml
        </p>
      </div>

      {/* Checkpoint Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Checkpoint Name *</label>
        <input
          type="text"
          value={config.checkpointName || ''}
          onChange={(e) => onChange({ checkpointName: e.target.value })}
          placeholder="my_checkpoint"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Name of the checkpoint to run (defined in checkpoints/)
        </p>
      </div>

      {/* Expectation Suite Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Expectation Suite Name</label>
        <input
          type="text"
          value={config.expectationSuiteName || ''}
          onChange={(e) => onChange({ expectationSuiteName: e.target.value })}
          placeholder="my_suite"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Override the expectation suite (optional)
        </p>
      </div>

      {/* Datasource Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Datasource Name</label>
        <input
          type="text"
          value={config.datasourceName || ''}
          onChange={(e) => onChange({ datasourceName: e.target.value })}
          placeholder="my_datasource"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Data Asset Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Data Asset Name</label>
        <input
          type="text"
          value={config.dataAssetName || ''}
          onChange={(e) => onChange({ dataAssetName: e.target.value })}
          placeholder="my_table"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Batch Request */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Batch Request (JSON)</label>
        <textarea
          value={config.batchRequest || ''}
          onChange={(e) => onChange({ batchRequest: e.target.value })}
          placeholder='{"datasource_name": "my_ds", "data_asset_name": "my_asset"}'
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
      </div>

      {/* Run Name Template */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Run Name Template</label>
        <input
          type="text"
          value={config.runNameTemplate || ''}
          onChange={(e) => onChange({ runNameTemplate: e.target.value })}
          placeholder="%Y%m%d_%H%M%S-airflow-run"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
      </div>

      {/* Options */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Fail Task on Validation Failure</span>
          <button
            onClick={() => onChange({ failTaskOnValidationFailure: config.failTaskOnValidationFailure === false ? true : !config.failTaskOnValidationFailure })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.failTaskOnValidationFailure !== false ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.failTaskOnValidationFailure !== false ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Return JSON Dict (XCom)</span>
          <button
            onClick={() => onChange({ returnJsonDict: !config.returnJsonDict })}
            className={`w-10 h-5 rounded-full transition-colors
                      ${config.returnJsonDict ? 'bg-accent' : 'bg-gray-600'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transform transition-transform
                        ${config.returnJsonDict ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-md p-2">
        <p className="text-xs text-green-400">
          {config.checkpointName ? (
            <>Runs checkpoint <strong>{config.checkpointName}</strong> for data quality validation</>
          ) : (
            <>Configure Great Expectations checkpoint</>
          )}
        </p>
      </div>
    </div>
  );
};
