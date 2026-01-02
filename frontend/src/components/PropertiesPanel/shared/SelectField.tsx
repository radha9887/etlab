import { useState, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { FormField } from './FormField';

export interface SelectOption {
  /** Unique value */
  value: string;
  /** Display label */
  label: string;
  /** Optional group name for grouping options */
  group?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Optional description */
  description?: string;
}

export interface SelectFieldProps {
  /** Field label */
  label: string;
  /** Available options */
  options: SelectOption[];
  /** Currently selected value */
  value: string;
  /** Called when selection changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Allow entering custom value not in options */
  allowCustom?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Help text shown below */
  help?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Error message */
  error?: string;
  /** Enable search/filter for long lists */
  searchable?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * SelectField - Dropdown select with grouping and search support
 *
 * Usage:
 * ```tsx
 * <SelectField
 *   label="Data Type"
 *   options={[
 *     { value: 'string', label: 'String', group: 'Primitive' },
 *     { value: 'integer', label: 'Integer', group: 'Primitive' },
 *     { value: 'date', label: 'Date', group: 'Date/Time' },
 *   ]}
 *   value={dataType}
 *   onChange={setDataType}
 *   searchable
 * />
 * ```
 */
export const SelectField = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  allowCustom = false,
  required = false,
  help,
  tooltip,
  error,
  searchable = false,
  className = ''
}: SelectFieldProps) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Group options
  const groupedOptions = useMemo(() => {
    const groups = new Map<string, SelectOption[]>();
    const ungrouped: SelectOption[] = [];

    options.forEach(opt => {
      if (opt.group) {
        if (!groups.has(opt.group)) {
          groups.set(opt.group, []);
        }
        groups.get(opt.group)!.push(opt);
      } else {
        ungrouped.push(opt);
      }
    });

    return { groups, ungrouped };
  }, [options]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query) ||
      opt.group?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Get display label for current value
  const displayLabel = useMemo(() => {
    const option = options.find(opt => opt.value === value);
    return option?.label || value || placeholder;
  }, [options, value, placeholder]);

  // Custom input mode
  if (isCustomMode) {
    return (
      <FormField label={label} required={required} help={help} tooltip={tooltip} error={error} className={className}>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter custom value..."
            className="flex-1 px-3 py-2 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsCustomMode(false)}
            className="p-2 text-gray-400 hover:text-white bg-canvas border border-gray-600 rounded"
            title="Show dropdown"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </FormField>
    );
  }

  // Standard select (simple for non-searchable)
  if (!searchable) {
    return (
      <FormField label={label} required={required} help={help} tooltip={tooltip} error={error} className={className}>
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === '__custom__') {
              setIsCustomMode(true);
            } else {
              onChange(e.target.value);
            }
          }}
          className="w-full px-3 py-2 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
        >
          <option value="">{placeholder}</option>

          {/* Ungrouped options first */}
          {groupedOptions.ungrouped.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}

          {/* Grouped options */}
          {Array.from(groupedOptions.groups.entries()).map(([group, opts]) => (
            <optgroup key={group} label={group}>
              {opts.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}

          {/* Custom option */}
          {allowCustom && (
            <option value="__custom__">✎ Enter custom...</option>
          )}
        </select>
      </FormField>
    );
  }

  // Searchable dropdown (custom implementation)
  return (
    <FormField label={label} required={required} help={help} tooltip={tooltip} error={error} className={className}>
      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-canvas border border-gray-600 rounded text-xs text-white hover:border-gray-500"
        >
          <span className={value ? 'text-white' : 'text-gray-500'}>{displayLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-panel border border-gray-600 rounded shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-7 pr-7 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-500 italic">No options found</div>
              ) : (
                <>
                  {filteredOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      disabled={opt.disabled}
                      className={`
                        w-full flex items-start gap-2 px-3 py-2 text-left text-xs transition-colors
                        ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-panel-light cursor-pointer'}
                        ${opt.value === value ? 'bg-accent/10 text-accent' : 'text-white'}
                      `}
                    >
                      <div className="flex-1">
                        <div>{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-gray-500 mt-0.5">{opt.description}</div>
                        )}
                      </div>
                      {opt.group && (
                        <span className="text-[10px] text-gray-500">{opt.group}</span>
                      )}
                    </button>
                  ))}
                </>
              )}

              {/* Custom option */}
              {allowCustom && (
                <button
                  onClick={() => {
                    setIsCustomMode(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-accent hover:bg-panel-light border-t border-gray-700"
                >
                  ✎ Enter custom value...
                </button>
              )}
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
            }}
          />
        )}
      </div>
    </FormField>
  );
};
