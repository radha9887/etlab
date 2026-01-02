interface RdsOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const RdsOperatorConfig = ({ config, onChange }: RdsOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'start_export'}
          onChange={(e) => updateConfig('operationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="start_export">Start Export to S3</option>
          <option value="create_snapshot">Create Snapshot</option>
          <option value="start_db">Start DB Instance</option>
          <option value="stop_db">Stop DB Instance</option>
          <option value="reboot_db">Reboot DB Instance</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">DB Instance Identifier *</label>
        <input
          type="text"
          value={config.dbInstanceIdentifier || ''}
          onChange={(e) => updateConfig('dbInstanceIdentifier', e.target.value)}
          placeholder="my-rds-instance"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Export Task Identifier</label>
        <input
          type="text"
          value={config.exportTaskIdentifier || ''}
          onChange={(e) => updateConfig('exportTaskIdentifier', e.target.value)}
          placeholder="my-export-{{ ts_nodash }}"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source ARN (Snapshot/Cluster)</label>
        <input
          type="text"
          value={config.sourceArn || ''}
          onChange={(e) => updateConfig('sourceArn', e.target.value)}
          placeholder="arn:aws:rds:us-east-1:123456789:snapshot:my-snapshot"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">S3 Bucket Name</label>
        <input
          type="text"
          value={config.s3BucketName || ''}
          onChange={(e) => updateConfig('s3BucketName', e.target.value)}
          placeholder="my-export-bucket"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">S3 Prefix</label>
        <input
          type="text"
          value={config.s3Prefix || ''}
          onChange={(e) => updateConfig('s3Prefix', e.target.value)}
          placeholder="rds-exports/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">IAM Role ARN</label>
        <input
          type="text"
          value={config.iamRoleArn || ''}
          onChange={(e) => updateConfig('iamRoleArn', e.target.value)}
          placeholder="arn:aws:iam::123456789:role/rds-s3-export-role"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">KMS Key ID (Optional)</label>
        <input
          type="text"
          value={config.kmsKeyId || ''}
          onChange={(e) => updateConfig('kmsKeyId', e.target.value)}
          placeholder="arn:aws:kms:us-east-1:123456789:key/..."
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none font-mono text-xs"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">AWS Connection ID</label>
        <input
          type="text"
          value={config.awsConnId || ''}
          onChange={(e) => updateConfig('awsConnId', e.target.value)}
          placeholder="aws_default"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Region</label>
        <input
          type="text"
          value={config.regionName || ''}
          onChange={(e) => updateConfig('regionName', e.target.value)}
          placeholder="us-east-1"
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
