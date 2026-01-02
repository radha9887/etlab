import { useState, useRef, useEffect } from 'react';
import { Link2, ChevronDown, ExternalLink, HelpCircle, Search } from 'lucide-react';

// Common Airflow connection ID patterns by service type
const connectionSuggestions: Record<string, { id: string; description: string; docsUrl?: string }[]> = {
  aws: [
    { id: 'aws_default', description: 'Default AWS connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-amazon/stable/connections/aws.html' },
    { id: 'aws_conn_id', description: 'Custom AWS connection' },
    { id: 'aws_s3_conn', description: 'S3 specific connection' },
    { id: 'aws_emr_conn', description: 'EMR specific connection' },
    { id: 'aws_redshift_conn', description: 'Redshift connection' },
  ],
  gcp: [
    { id: 'google_cloud_default', description: 'Default GCP connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-google/stable/connections/gcp.html' },
    { id: 'gcp_conn_id', description: 'Custom GCP connection' },
    { id: 'bigquery_default', description: 'BigQuery default connection' },
    { id: 'gcs_default', description: 'Cloud Storage connection' },
  ],
  azure: [
    { id: 'azure_default', description: 'Default Azure connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-microsoft-azure/stable/connections/azure.html' },
    { id: 'azure_blob_conn', description: 'Azure Blob Storage connection' },
    { id: 'azure_data_lake_conn', description: 'Azure Data Lake connection' },
    { id: 'azure_synapse_conn', description: 'Synapse Analytics connection' },
    { id: 'azure_cosmos_conn', description: 'Cosmos DB connection' },
  ],
  database: [
    { id: 'postgres_default', description: 'Default PostgreSQL connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-postgres/stable/connections/postgres.html' },
    { id: 'mysql_default', description: 'Default MySQL connection' },
    { id: 'mssql_default', description: 'Default MS SQL Server connection' },
    { id: 'oracle_default', description: 'Default Oracle connection' },
    { id: 'jdbc_default', description: 'Generic JDBC connection' },
  ],
  snowflake: [
    { id: 'snowflake_default', description: 'Default Snowflake connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-snowflake/stable/connections/snowflake.html' },
    { id: 'snowflake_conn_id', description: 'Custom Snowflake connection' },
  ],
  databricks: [
    { id: 'databricks_default', description: 'Default Databricks connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-databricks/stable/connections/databricks.html' },
    { id: 'databricks_conn_id', description: 'Custom Databricks connection' },
  ],
  http: [
    { id: 'http_default', description: 'Default HTTP connection' },
    { id: 'http_conn_id', description: 'Custom HTTP connection' },
  ],
  slack: [
    { id: 'slack_default', description: 'Default Slack connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/connections/slack.html' },
    { id: 'slack_conn_id', description: 'Custom Slack connection' },
  ],
  email: [
    { id: 'smtp_default', description: 'Default SMTP connection' },
    { id: 'email_conn_id', description: 'Custom email connection' },
  ],
  ssh: [
    { id: 'ssh_default', description: 'Default SSH connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-ssh/stable/connections/ssh.html' },
    { id: 'sftp_default', description: 'Default SFTP connection' },
  ],
  kafka: [
    { id: 'kafka_default', description: 'Default Kafka connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-apache-kafka/stable/connections/kafka.html' },
    { id: 'kafka_conn_id', description: 'Custom Kafka connection' },
  ],
  kubernetes: [
    { id: 'kubernetes_default', description: 'Default Kubernetes connection', docsUrl: 'https://airflow.apache.org/docs/apache-airflow-providers-cncf-kubernetes/stable/connections/kubernetes.html' },
    { id: 'k8s_conn_id', description: 'Custom Kubernetes connection' },
  ],
  airbyte: [
    { id: 'airbyte_default', description: 'Default Airbyte connection' },
  ],
  fivetran: [
    { id: 'fivetran_default', description: 'Default Fivetran connection' },
  ],
  dbt: [
    { id: 'dbt_cloud_default', description: 'Default dbt Cloud connection' },
  ],
  trino: [
    { id: 'trino_default', description: 'Default Trino/Presto connection' },
  ],
};

interface ConnectionPickerProps {
  value: string;
  onChange: (value: string) => void;
  connectionType?: string; // 'aws' | 'gcp' | 'azure' | 'database' | etc.
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export const ConnectionPicker = ({
  value,
  onChange,
  connectionType = 'aws',
  label = 'Connection ID',
  placeholder = 'Enter or select connection ID',
  required = false,
  helpText,
}: ConnectionPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get suggestions for the connection type
  const suggestions = connectionSuggestions[connectionType] || connectionSuggestions.aws;

  // Filter suggestions based on search
  const filteredSuggestions = search
    ? suggestions.filter(s =>
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      )
    : suggestions;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
          <Link2 className="w-3 h-3" />
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        {helpText && (
          <div className="relative group">
            <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
            <div className="absolute right-0 bottom-full mb-1 w-48 p-2 bg-gray-800 border border-gray-600 rounded text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {helpText}
            </div>
          </div>
        )}
      </div>

      {/* Input with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full px-3 py-1.5 pr-8 bg-panel border border-gray-600 rounded text-sm text-white
                       focus:outline-none focus:border-accent font-mono"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-panel border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search connections..."
                  className="w-full pl-7 pr-3 py-1 bg-canvas border border-gray-600 rounded text-xs text-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Suggestions */}
            <div className="max-h-48 overflow-y-auto">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelect(suggestion.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-accent/20
                               ${value === suggestion.id ? 'bg-accent/10' : ''}`}
                  >
                    <div>
                      <div className="text-xs font-mono text-white">{suggestion.id}</div>
                      <div className="text-[10px] text-gray-500">{suggestion.description}</div>
                    </div>
                    {suggestion.docsUrl && (
                      <a
                        href={suggestion.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-gray-500 hover:text-accent"
                        title="View documentation"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-gray-500">
                  No matching connections found
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-gray-700 bg-canvas/50">
              <div className="text-[10px] text-gray-500">
                Tip: Create connections in Airflow Admin &rarr; Connections
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Type Badge */}
      <div className="flex items-center gap-2 mt-1">
        <span className="px-1.5 py-0.5 text-[10px] bg-gray-700 text-gray-400 rounded">
          {connectionType.toUpperCase()}
        </span>
        <span className="text-[10px] text-gray-500">
          Configure in Airflow UI before running
        </span>
      </div>
    </div>
  );
};

export default ConnectionPicker;
