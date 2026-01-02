import { ConnectionPicker } from '../shared';
import { LabelWithTooltip } from '../shared/ConfigTooltip';

interface S3OperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const S3OperatorConfig = ({ config, onChange }: S3OperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      {/* AWS Connection - using ConnectionPicker */}
      <ConnectionPicker
        value={config.awsConnId || 'aws_default'}
        onChange={(value) => updateConfig('awsConnId', value)}
        connectionType="aws"
        label="AWS Connection ID"
        helpText="Connection with AWS credentials. Create in Airflow Admin > Connections."
      />

      <div>
        <LabelWithTooltip
          label="Operation Type"
          tooltip={{
            title: 'S3 Operation',
            description: 'The type of S3 operation to perform.',
            example: 'copy',
          }}
        />
        <select
          value={config.operationType || 'copy'}
          onChange={(e) => updateConfig('operationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="copy">Copy Object</option>
          <option value="delete">Delete Objects</option>
          <option value="list">List Objects</option>
          <option value="create_bucket">Create Bucket</option>
          <option value="delete_bucket">Delete Bucket</option>
          <option value="sensor">S3 Key Sensor</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Bucket *</label>
        <input
          type="text"
          value={config.sourceBucket || ''}
          onChange={(e) => updateConfig('sourceBucket', e.target.value)}
          placeholder="my-source-bucket"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Source Key / Prefix</label>
        <input
          type="text"
          value={config.sourceKey || ''}
          onChange={(e) => updateConfig('sourceKey', e.target.value)}
          placeholder="path/to/file.csv"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Destination Bucket</label>
        <input
          type="text"
          value={config.destBucket || ''}
          onChange={(e) => updateConfig('destBucket', e.target.value)}
          placeholder="my-dest-bucket"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Destination Key / Prefix</label>
        <input
          type="text"
          value={config.destKey || ''}
          onChange={(e) => updateConfig('destKey', e.target.value)}
          placeholder="path/to/destination/"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Wildcard Match (Optional)</label>
        <input
          type="text"
          value={config.wildcardMatch || ''}
          onChange={(e) => updateConfig('wildcardMatch', e.target.value)}
          placeholder="*.csv"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.replace !== false}
          onChange={(e) => updateConfig('replace', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Replace Existing</label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.verify || false}
          onChange={(e) => updateConfig('verify', e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label className="text-xs text-gray-400">Verify (Check ETag)</label>
      </div>
    </div>
  );
};
