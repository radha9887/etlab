interface DynamoDBOperatorConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const DynamoDBOperatorConfig = ({ config, onChange }: DynamoDBOperatorConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Operation Type</label>
        <select
          value={config.operationType || 'put_item'}
          onChange={(e) => updateConfig('operationType', e.target.value)}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        >
          <option value="put_item">Put Item</option>
          <option value="get_item">Get Item</option>
          <option value="delete_item">Delete Item</option>
          <option value="query">Query</option>
          <option value="scan">Scan</option>
          <option value="batch_write">Batch Write</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Table Name *</label>
        <input
          type="text"
          value={config.tableName || ''}
          onChange={(e) => updateConfig('tableName', e.target.value)}
          placeholder="my-dynamodb-table"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Item / Key (JSON)</label>
        <textarea
          value={config.item || ''}
          onChange={(e) => updateConfig('item', e.target.value)}
          placeholder='{"pk": {"S": "value"}, "sk": {"S": "value"}}'
          rows={4}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">Use DynamoDB JSON format with type descriptors</p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Key Condition Expression (Query)</label>
        <input
          type="text"
          value={config.keyConditionExpression || ''}
          onChange={(e) => updateConfig('keyConditionExpression', e.target.value)}
          placeholder="pk = :pk_value"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Filter Expression</label>
        <input
          type="text"
          value={config.filterExpression || ''}
          onChange={(e) => updateConfig('filterExpression', e.target.value)}
          placeholder="attribute_exists(myField)"
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Expression Attribute Values (JSON)</label>
        <textarea
          value={config.expressionAttributeValues || ''}
          onChange={(e) => updateConfig('expressionAttributeValues', e.target.value)}
          placeholder='{":pk_value": {"S": "my-value"}}'
          rows={2}
          className="w-full bg-gray-800 text-gray-200 text-sm px-3 py-2 rounded-md
                     border border-gray-600 focus:border-accent focus:outline-none resize-none font-mono"
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
    </div>
  );
};
