import { useState, useRef, useEffect } from 'react';
import { Variable, Copy, Check, HelpCircle, Code, Database, Clock, Settings } from 'lucide-react';

// Template syntax categories
type SyntaxCategory = 'variables' | 'xcom' | 'macros' | 'params';

interface TemplateSyntax {
  syntax: string;
  description: string;
  example: string;
  category: SyntaxCategory;
}

// Common Jinja template syntax patterns for Airflow
const templateSyntax: TemplateSyntax[] = [
  // Variables
  { syntax: '{{ var.value.variable_name }}', description: 'Get Airflow Variable value', example: '{{ var.value.s3_bucket }}', category: 'variables' },
  { syntax: '{{ var.json.variable_name }}', description: 'Get JSON Variable (parsed)', example: '{{ var.json.config.key }}', category: 'variables' },
  { syntax: '{{ var.value.get("name", "default") }}', description: 'Get with default value', example: '{{ var.value.get("env", "dev") }}', category: 'variables' },
  { syntax: '{{ conn.conn_id.host }}', description: 'Get connection host', example: '{{ conn.postgres_default.host }}', category: 'variables' },
  { syntax: '{{ conn.conn_id.login }}', description: 'Get connection login', example: '{{ conn.postgres_default.login }}', category: 'variables' },
  { syntax: '{{ conn.conn_id.password }}', description: 'Get connection password', example: '{{ conn.postgres_default.password }}', category: 'variables' },
  { syntax: '{{ conn.conn_id.schema }}', description: 'Get connection schema', example: '{{ conn.postgres_default.schema }}', category: 'variables' },
  { syntax: '{{ conn.conn_id.port }}', description: 'Get connection port', example: '{{ conn.postgres_default.port }}', category: 'variables' },

  // XCom
  { syntax: "{{ ti.xcom_pull(task_ids='task_id') }}", description: 'Pull XCom from task', example: "{{ ti.xcom_pull(task_ids='extract_data') }}", category: 'xcom' },
  { syntax: "{{ ti.xcom_pull(task_ids='task_id', key='key') }}", description: 'Pull XCom with key', example: "{{ ti.xcom_pull(task_ids='process', key='count') }}", category: 'xcom' },
  { syntax: "{{ ti.xcom_pull(dag_id='dag', task_ids='task') }}", description: 'Pull XCom from another DAG', example: "{{ ti.xcom_pull(dag_id='upstream_dag', task_ids='final') }}", category: 'xcom' },
  { syntax: '{{ task_instance.xcom_pull(...) }}', description: 'Alternative XCom syntax', example: "{{ task_instance.xcom_pull(task_ids='prev') }}", category: 'xcom' },

  // Date/Time Macros
  { syntax: '{{ ds }}', description: 'Execution date (YYYY-MM-DD)', example: '2024-01-15', category: 'macros' },
  { syntax: '{{ ds_nodash }}', description: 'Execution date (YYYYMMDD)', example: '20240115', category: 'macros' },
  { syntax: '{{ ts }}', description: 'Execution timestamp (ISO)', example: '2024-01-15T10:30:00+00:00', category: 'macros' },
  { syntax: '{{ ts_nodash }}', description: 'Timestamp no dashes', example: '20240115T103000', category: 'macros' },
  { syntax: '{{ execution_date }}', description: 'Execution datetime object', example: 'datetime(2024, 1, 15, 10, 30)', category: 'macros' },
  { syntax: '{{ data_interval_start }}', description: 'Start of data interval', example: 'datetime object', category: 'macros' },
  { syntax: '{{ data_interval_end }}', description: 'End of data interval', example: 'datetime object', category: 'macros' },
  { syntax: '{{ prev_ds }}', description: 'Previous execution date', example: '2024-01-14', category: 'macros' },
  { syntax: '{{ next_ds }}', description: 'Next execution date', example: '2024-01-16', category: 'macros' },
  { syntax: '{{ yesterday_ds }}', description: 'Yesterday date', example: '2024-01-14', category: 'macros' },
  { syntax: '{{ tomorrow_ds }}', description: 'Tomorrow date', example: '2024-01-16', category: 'macros' },
  { syntax: '{{ macros.ds_add(ds, days) }}', description: 'Add days to date', example: "{{ macros.ds_add(ds, 7) }}", category: 'macros' },
  { syntax: '{{ macros.ds_format(ds, input, output) }}', description: 'Format date', example: "{{ macros.ds_format(ds, '%Y-%m-%d', '%d/%m/%Y') }}", category: 'macros' },
  { syntax: '{{ macros.datetime }}', description: 'Python datetime module', example: '{{ macros.datetime.now() }}', category: 'macros' },
  { syntax: '{{ macros.timedelta(days=1) }}', description: 'Timedelta helper', example: '{{ execution_date - macros.timedelta(days=1) }}', category: 'macros' },

  // DAG/Task Parameters
  { syntax: '{{ dag.dag_id }}', description: 'Current DAG ID', example: 'my_etl_pipeline', category: 'params' },
  { syntax: '{{ task.task_id }}', description: 'Current task ID', example: 'extract_data', category: 'params' },
  { syntax: '{{ task_instance.task_id }}', description: 'Task instance ID', example: 'extract_data', category: 'params' },
  { syntax: '{{ run_id }}', description: 'DAG run ID', example: 'manual__2024-01-15T10:30:00', category: 'params' },
  { syntax: '{{ dag_run.conf }}', description: 'DAG run config', example: "{{ dag_run.conf['key'] }}", category: 'params' },
  { syntax: '{{ params.param_name }}', description: 'DAG/task parameter', example: '{{ params.table_name }}', category: 'params' },
  { syntax: '{{ dag_run.conf.get("key", "default") }}', description: 'Config with default', example: '{{ dag_run.conf.get("env", "prod") }}', category: 'params' },
];

const categoryInfo: Record<SyntaxCategory, { label: string; icon: React.ReactNode; color: string }> = {
  variables: { label: 'Variables', icon: <Variable className="w-3 h-3" />, color: 'text-green-400' },
  xcom: { label: 'XCom', icon: <Database className="w-3 h-3" />, color: 'text-blue-400' },
  macros: { label: 'Macros', icon: <Clock className="w-3 h-3" />, color: 'text-purple-400' },
  params: { label: 'Params', icon: <Settings className="w-3 h-3" />, color: 'text-orange-400' },
};

interface VariablePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  helpText?: string;
}

export const VariablePicker = ({
  value,
  onChange,
  label = 'Value',
  placeholder = 'Enter value or insert template...',
  multiline = false,
  rows = 2,
  helpText,
}: VariablePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SyntaxCategory>('variables');
  const [copiedSyntax, setCopiedSyntax] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Filter syntax by category
  const filteredSyntax = templateSyntax.filter(s => s.category === activeCategory);

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

  const insertSyntax = (syntax: string) => {
    // Insert at cursor position or append
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = value.slice(0, start) + syntax + value.slice(end);
      onChange(newValue);
      // Set cursor position after inserted text
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + syntax.length, start + syntax.length);
      }, 0);
    } else {
      onChange(value ? `${value} ${syntax}` : syntax);
    }
  };

  const copySyntax = async (syntax: string) => {
    await navigator.clipboard.writeText(syntax);
    setCopiedSyntax(syntax);
    setTimeout(() => setCopiedSyntax(null), 2000);
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="space-y-1">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
          <Code className="w-3 h-3" />
          {label}
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

      {/* Input with dropdown toggle */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <InputComponent
            ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={multiline ? rows : undefined}
            className={`w-full px-3 py-1.5 pr-8 bg-panel border border-gray-600 rounded text-sm text-white
                       focus:outline-none focus:border-accent font-mono resize-none
                       ${multiline ? 'min-h-[60px]' : ''}`}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute right-2 top-2 p-1 rounded transition-colors
                       ${isOpen ? 'bg-accent text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            title="Insert Jinja template"
          >
            <Code className="w-3 h-3" />
          </button>
        </div>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-panel border border-gray-600 rounded-lg shadow-lg overflow-hidden">
            {/* Category Tabs */}
            <div className="flex border-b border-gray-700">
              {(Object.keys(categoryInfo) as SyntaxCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors
                             ${activeCategory === cat
                               ? 'bg-accent/20 text-accent border-b-2 border-accent'
                               : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  <span className={activeCategory === cat ? 'text-accent' : categoryInfo[cat].color}>
                    {categoryInfo[cat].icon}
                  </span>
                  <span className="hidden sm:inline">{categoryInfo[cat].label}</span>
                </button>
              ))}
            </div>

            {/* Syntax List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredSyntax.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-2 px-3 py-2 hover:bg-accent/10 border-b border-gray-700/50 last:border-0"
                >
                  <button
                    onClick={() => insertSyntax(item.syntax)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-xs font-mono text-accent truncate">{item.syntax}</div>
                    <div className="text-[10px] text-gray-500">{item.description}</div>
                    <div className="text-[10px] text-gray-600 italic">e.g., {item.example}</div>
                  </button>
                  <button
                    onClick={() => copySyntax(item.syntax)}
                    className="p-1.5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy to clipboard"
                  >
                    {copiedSyntax === item.syntax ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-700 bg-canvas/50">
              <div className="text-[10px] text-gray-500">
                Click to insert at cursor, or copy to clipboard
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick insert buttons */}
      <div className="flex flex-wrap gap-1 mt-1">
        <span className="text-[10px] text-gray-500 mr-1">Quick:</span>
        {['{{ ds }}', '{{ var.value.', "{{ ti.xcom_pull(task_ids='", '{{ params.'].map((syntax) => (
          <button
            key={syntax}
            onClick={() => insertSyntax(syntax)}
            className="px-1.5 py-0.5 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-300 rounded font-mono"
          >
            {syntax.slice(0, 15)}{syntax.length > 15 ? '...' : ''}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariablePicker;
