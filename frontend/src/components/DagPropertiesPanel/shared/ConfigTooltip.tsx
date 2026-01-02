import { useState, useRef, useEffect } from 'react';
import { HelpCircle, ExternalLink, Copy, Check, Info, AlertTriangle } from 'lucide-react';

interface ConfigTooltipProps {
  title: string;
  description: string;
  example?: string;
  defaultValue?: string;
  docsUrl?: string;
  warning?: string;
  required?: boolean;
  type?: 'info' | 'warning';
}

export const ConfigTooltip = ({
  title,
  description,
  example,
  defaultValue,
  docsUrl,
  warning,
  required,
  type = 'info',
}: ConfigTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyExample = async () => {
    if (example) {
      await navigator.clipboard.writeText(example);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Icon = type === 'warning' ? AlertTriangle : HelpCircle;
  const iconColor = type === 'warning' ? 'text-yellow-500' : 'text-gray-500';

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`p-0.5 rounded hover:bg-gray-700 transition-colors ${iconColor}`}
      >
        <Icon className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 bottom-full mb-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 bg-gray-700/50 border-b border-gray-600">
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium text-white">{title}</span>
              {required && (
                <span className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded">Required</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-2 space-y-2">
            {/* Description */}
            <p className="text-xs text-gray-300">{description}</p>

            {/* Warning */}
            {warning && (
              <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-yellow-400">{warning}</span>
              </div>
            )}

            {/* Default Value */}
            {defaultValue && (
              <div className="text-xs">
                <span className="text-gray-500">Default: </span>
                <code className="px-1 py-0.5 bg-gray-700 text-gray-300 rounded text-[10px]">
                  {defaultValue}
                </code>
              </div>
            )}

            {/* Example */}
            {example && (
              <div className="space-y-1">
                <div className="text-[10px] text-gray-500">Example:</div>
                <div className="flex items-center gap-1">
                  <code className="flex-1 px-2 py-1 bg-canvas text-green-400 rounded text-[10px] font-mono overflow-x-auto">
                    {example}
                  </code>
                  <button
                    onClick={copyExample}
                    className="p-1 text-gray-500 hover:text-white"
                    title="Copy example"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Docs Link */}
          {docsUrl && (
            <div className="px-3 py-2 border-t border-gray-700 bg-canvas/50">
              <a
                href={docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-accent hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                View documentation
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Wrapper for form labels with tooltip
interface LabelWithTooltipProps {
  label: string;
  tooltip: ConfigTooltipProps;
  htmlFor?: string;
}

export const LabelWithTooltip = ({ label, tooltip, htmlFor }: LabelWithTooltipProps) => {
  return (
    <div className="flex items-center gap-1">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-gray-300"
      >
        {label}
        {tooltip.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <ConfigTooltip {...tooltip} />
    </div>
  );
};

// Common field tooltips for reuse across configs
export const commonTooltips = {
  taskId: {
    title: 'Task ID',
    description: 'Unique identifier for this task within the DAG. Must be alphanumeric with underscores only.',
    example: 'extract_sales_data',
    required: true,
    docsUrl: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html',
  },
  retries: {
    title: 'Retries',
    description: 'Number of times to retry the task if it fails. Set to 0 for no retries.',
    example: '3',
    defaultValue: '0',
  },
  retryDelay: {
    title: 'Retry Delay',
    description: 'Time in minutes to wait between retry attempts.',
    example: '5',
    defaultValue: '5',
  },
  executionTimeout: {
    title: 'Execution Timeout',
    description: 'Maximum time in minutes allowed for task execution before it is marked as failed.',
    example: '60',
    warning: 'Tasks exceeding this timeout will be forcefully terminated.',
  },
  triggerRule: {
    title: 'Trigger Rule',
    description: 'Defines the condition for running this task based on upstream task states.',
    example: 'all_success',
    defaultValue: 'all_success',
    docsUrl: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html#trigger-rules',
  },
  pool: {
    title: 'Pool',
    description: 'Resource pool for limiting concurrent task execution. Pools must be created in Airflow Admin.',
    example: 'default_pool',
    defaultValue: 'default_pool',
    docsUrl: 'https://airflow.apache.org/docs/apache-airflow/stable/administration-and-deployment/pools.html',
  },
  poolSlots: {
    title: 'Pool Slots',
    description: 'Number of pool slots this task consumes.',
    example: '1',
    defaultValue: '1',
  },
  priorityWeight: {
    title: 'Priority Weight',
    description: 'Priority for scheduling when multiple tasks are waiting. Higher values = higher priority.',
    example: '10',
    defaultValue: '1',
  },
  queue: {
    title: 'Queue',
    description: 'Celery queue for routing task execution. Only applicable with CeleryExecutor.',
    example: 'high_priority',
    defaultValue: 'default',
  },
  dependsOnPast: {
    title: 'Depends on Past',
    description: 'If true, task will only run if it succeeded in the previous DAG run.',
    example: 'true',
    defaultValue: 'false',
    warning: 'Can cause task dependencies to back up if a task fails.',
  },
  waitForDownstream: {
    title: 'Wait for Downstream',
    description: 'If true, waits for downstream tasks of the previous run to complete.',
    example: 'true',
    defaultValue: 'false',
  },
  // Sensor-specific
  pokeInterval: {
    title: 'Poke Interval',
    description: 'Time in seconds between sensor checks when in poke mode.',
    example: '60',
    defaultValue: '60',
  },
  timeout: {
    title: 'Timeout',
    description: 'Maximum time in seconds before the sensor times out and fails.',
    example: '3600',
    defaultValue: '604800 (7 days)',
    warning: 'Very long timeouts can consume executor resources.',
  },
  mode: {
    title: 'Sensor Mode',
    description: 'How the sensor waits: "poke" holds a worker, "reschedule" releases and re-schedules.',
    example: 'reschedule',
    defaultValue: 'poke',
    docsUrl: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/sensors.html#sensor-modes',
  },
  softFail: {
    title: 'Soft Fail',
    description: 'If true, sensor will be skipped instead of failed when timeout is reached.',
    example: 'true',
    defaultValue: 'false',
  },
  exponentialBackoff: {
    title: 'Exponential Backoff',
    description: 'Increase poke interval exponentially after each check.',
    example: 'true',
    defaultValue: 'false',
  },
  deferrable: {
    title: 'Deferrable Mode',
    description: 'Run sensor asynchronously to save worker resources. Requires async triggerer.',
    example: 'true',
    defaultValue: 'false',
    docsUrl: 'https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/deferring.html',
  },
};

export default ConfigTooltip;
