interface EmrOperatorConfigProps {
  config: {
    taskId: string;
    jobFlowId?: string;
    awsConnId?: string;
    steps?: string;
    stepName?: string;
    actionOnFailure?: 'TERMINATE_CLUSTER' | 'CANCEL_AND_WAIT' | 'CONTINUE';
    jarPath?: string;
    mainClass?: string;
    args?: string;
    sparkSubmitCommand?: string;
  };
  onChange: (updates: Partial<EmrOperatorConfigProps['config']>) => void;
  etlPages: any[];
}

export const EmrOperatorConfig = ({ config, onChange }: EmrOperatorConfigProps) => {

  return (
    <div className="space-y-3">
      {/* Job Flow ID */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">EMR Cluster ID *</label>
        <input
          type="text"
          value={config.jobFlowId || ''}
          onChange={(e) => onChange({ jobFlowId: e.target.value })}
          placeholder="j-XXXXXXXXXXXXX"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Existing EMR cluster ID or use Jinja template
        </p>
      </div>

      {/* Step Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Step Name *</label>
        <input
          type="text"
          value={config.stepName || ''}
          onChange={(e) => onChange({ stepName: e.target.value })}
          placeholder="My Spark Job"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Spark Submit Command */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Spark Submit Command</label>
        <textarea
          value={config.sparkSubmitCommand || ''}
          onChange={(e) => onChange({ sparkSubmitCommand: e.target.value })}
          placeholder="spark-submit --deploy-mode cluster s3://bucket/script.py"
          rows={3}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Full spark-submit command or use fields below
        </p>
      </div>

      {/* Or use structured input */}
      <div className="border-t border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Or Structured Input</h4>

        {/* JAR Path */}
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">JAR / Script Path</label>
          <input
            type="text"
            value={config.jarPath || ''}
            onChange={(e) => onChange({ jarPath: e.target.value })}
            placeholder="s3://bucket/my-spark-app.jar"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>

        {/* Main Class */}
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Main Class</label>
          <input
            type="text"
            value={config.mainClass || ''}
            onChange={(e) => onChange({ mainClass: e.target.value })}
            placeholder="com.mycompany.MySparkJob"
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>

        {/* Arguments */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Arguments (JSON array)</label>
          <input
            type="text"
            value={config.args || ''}
            onChange={(e) => onChange({ args: e.target.value })}
            placeholder='["--input", "s3://bucket/input", "--output", "s3://bucket/output"]'
            className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                       border border-gray-600 focus:border-accent focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Action on Failure */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Action on Failure</label>
        <select
          value={config.actionOnFailure || 'CONTINUE'}
          onChange={(e) => onChange({ actionOnFailure: e.target.value as any })}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="CONTINUE">Continue</option>
          <option value="CANCEL_AND_WAIT">Cancel and Wait</option>
          <option value="TERMINATE_CLUSTER">Terminate Cluster</option>
        </select>
      </div>

      {/* AWS Connection */}
      <div className="border-t border-gray-700 pt-3">
        <label className="block text-xs text-gray-400 mb-1">AWS Connection ID</label>
        <input
          type="text"
          value={config.awsConnId || ''}
          onChange={(e) => onChange({ awsConnId: e.target.value })}
          placeholder="aws_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      {/* Preview */}
      {config.jobFlowId && config.stepName && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-2">
          <p className="text-xs text-orange-400">
            Submits step <strong>{config.stepName}</strong> to cluster <strong>{config.jobFlowId}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
