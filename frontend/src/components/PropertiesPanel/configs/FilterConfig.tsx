import { useState, useCallback, useMemo } from 'react';
import { Save, Plus, Trash2, ChevronDown, ChevronRight, FolderPlus, Sparkles, Copy } from 'lucide-react';
import { ColumnSelector, ToggleGroup, FormField, TipNote } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, FilterCondition, ConditionGroup } from '../../../types';

interface FilterConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface OperatorConfig {
  value: string;
  label: string;
  category: 'comparison' | 'null' | 'string' | 'list' | 'array' | 'map' | 'access';
  needsValue: boolean;
  needsValue2?: boolean;
  valuePlaceholder?: string;
  value2Placeholder?: string;
  description?: string;
}

// Condition templates for quick filter setup
const conditionTemplates = [
  {
    name: 'Not Null',
    description: 'Filter rows where column is not null',
    conditions: [{ operator: 'isNotNull', value: '' }]
  },
  {
    name: 'Non-Empty String',
    description: 'Filter non-null and non-empty strings',
    conditions: [
      { operator: 'isNotNull', value: '' },
      { operator: '!=', value: '' }
    ],
    logicalOperator: 'AND'
  },
  {
    name: 'Positive Numbers',
    description: 'Filter values greater than 0',
    conditions: [{ operator: '>', value: '0' }]
  },
  {
    name: 'Date Range (Today)',
    description: 'Filter by current date',
    conditions: [{ operator: '==', value: 'current_date()' }],
    hint: 'Modify value for your date column'
  },
  {
    name: 'Non-Empty Array',
    description: 'Filter rows with non-empty arrays',
    conditions: [{ operator: 'array_size_gt', value: '0' }]
  },
  {
    name: 'Contains Value in Array',
    description: 'Check if array contains a specific value',
    conditions: [{ operator: 'array_contains', value: '' }]
  },
  {
    name: 'Active Status',
    description: 'Filter by active/enabled status',
    conditions: [{ operator: 'in', value: 'active, enabled, true, 1' }]
  },
  {
    name: 'Exclude Nulls & Defaults',
    description: 'Filter out nulls and common default values',
    conditions: [
      { operator: 'isNotNull', value: '' },
      { operator: 'notIn', value: 'N/A, null, undefined, -1, 0' }
    ],
    logicalOperator: 'AND'
  }
];

const operators: OperatorConfig[] = [
  // Comparison
  { value: '==', label: '= (equals)', category: 'comparison', needsValue: true },
  { value: '!=', label: '≠ (not equals)', category: 'comparison', needsValue: true },
  { value: '>', label: '> (greater than)', category: 'comparison', needsValue: true },
  { value: '>=', label: '≥ (greater or equal)', category: 'comparison', needsValue: true },
  { value: '<', label: '< (less than)', category: 'comparison', needsValue: true },
  { value: '<=', label: '≤ (less or equal)', category: 'comparison', needsValue: true },
  { value: 'between', label: 'BETWEEN', category: 'comparison', needsValue: true, needsValue2: true, valuePlaceholder: 'min', value2Placeholder: 'max' },

  // Null checks
  { value: 'isNull', label: 'IS NULL', category: 'null', needsValue: false },
  { value: 'isNotNull', label: 'IS NOT NULL', category: 'null', needsValue: false },

  // String operations
  { value: 'like', label: 'LIKE (pattern)', category: 'string', needsValue: true, valuePlaceholder: '%pattern%', description: 'Use % for wildcard' },
  { value: 'rlike', label: 'RLIKE (regex)', category: 'string', needsValue: true, valuePlaceholder: '^pattern.*$', description: 'Regular expression' },
  { value: 'startsWith', label: 'Starts with', category: 'string', needsValue: true },
  { value: 'endsWith', label: 'Ends with', category: 'string', needsValue: true },
  { value: 'contains', label: 'Contains', category: 'string', needsValue: true },

  // List operations
  { value: 'in', label: 'IN (list)', category: 'list', needsValue: true, valuePlaceholder: 'val1, val2, val3' },
  { value: 'notIn', label: 'NOT IN', category: 'list', needsValue: true, valuePlaceholder: 'val1, val2, val3' },

  // Array operations
  { value: 'array_contains', label: 'Array Contains', category: 'array', needsValue: true, description: 'Check if array contains value' },
  { value: 'array_size_eq', label: 'Array Size =', category: 'array', needsValue: true, valuePlaceholder: 'size', description: 'Array length equals' },
  { value: 'array_size_gt', label: 'Array Size >', category: 'array', needsValue: true, valuePlaceholder: 'size', description: 'Array length greater than' },
  { value: 'array_size_lt', label: 'Array Size <', category: 'array', needsValue: true, valuePlaceholder: 'size', description: 'Array length less than' },

  // Map operations
  { value: 'map_contains_key', label: 'Map Has Key', category: 'map', needsValue: true, description: 'Check if map contains key' },
  { value: 'map_size_eq', label: 'Map Size =', category: 'map', needsValue: true, valuePlaceholder: 'size', description: 'Map size equals' },
  { value: 'map_size_gt', label: 'Map Size >', category: 'map', needsValue: true, valuePlaceholder: 'size', description: 'Map size greater than' },
  { value: 'map_size_lt', label: 'Map Size <', category: 'map', needsValue: true, valuePlaceholder: 'size', description: 'Map size less than' },

  // Element access
  { value: 'getItem', label: 'Element At [idx]', category: 'access', needsValue: true, needsValue2: true, valuePlaceholder: 'index/key', value2Placeholder: 'expected value', description: 'Access array[idx] or map[key]' },
  { value: 'getField', label: 'Struct Field', category: 'access', needsValue: true, needsValue2: true, valuePlaceholder: 'field name', value2Placeholder: 'expected value', description: 'Access struct.field' },
];

const operatorCategories = [
  { key: 'comparison', label: 'Comparison' },
  { key: 'null', label: 'Null Checks' },
  { key: 'string', label: 'String' },
  { key: 'list', label: 'List' },
  { key: 'array', label: 'Array' },
  { key: 'map', label: 'Map' },
  { key: 'access', label: 'Element Access' },
];

// Simple condition interface for local state
interface SimpleCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
  value2?: string;
}

// Helper to check if item is a group
const isConditionGroup = (item: FilterCondition | ConditionGroup): item is ConditionGroup => {
  return 'type' in item && item.type === 'group';
};

// Generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const FilterConfig = ({ data, onUpdate, availableColumns }: FilterConfigProps) => {
  // Mode: 'simple' (flat conditions), 'advanced' (nested groups), 'sql'
  const [mode, setMode] = useState<'simple' | 'advanced' | 'sql'>((data.config?.mode as 'simple' | 'advanced' | 'sql') || 'simple');

  // Simple mode state
  const [conditions, setConditions] = useState<SimpleCondition[]>(
    (data.config?.conditions as SimpleCondition[]) || [{ id: generateId(), column: '', operator: '==', value: '' }]
  );
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>((data.config?.logicalOperator as 'AND' | 'OR') || 'AND');

  // Advanced mode state - nested condition groups
  const [rootGroup, setRootGroup] = useState<ConditionGroup>(
    (data.config?.conditionGroups as ConditionGroup) || {
      id: generateId(),
      type: 'group',
      logicalOperator: 'AND',
      items: [{ id: generateId(), column: '', operator: '==', value: '', dataType: '' } as FilterCondition]
    }
  );

  // SQL mode state
  const [sqlExpression, setSqlExpression] = useState((data.config?.sqlExpression as string) || '');

  // UI state
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['comparison']));

  const getOperatorConfig = (opValue: string) => operators.find(o => o.value === opValue);

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];

    if (mode === 'sql') {
      if (!sqlExpression.trim()) {
        errors.push('SQL expression is required');
      }
    } else if (mode === 'simple') {
      const validConditions = conditions.filter(c => c.column);
      if (validConditions.length === 0) {
        errors.push('At least one condition with a column is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [mode, sqlExpression, conditions]);

  // Simple mode handlers
  const addCondition = () => {
    setConditions([...conditions, { id: generateId(), column: '', operator: '==', value: '' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  // Advanced mode handlers
  const updateGroup = useCallback((groupId: string, updater: (group: ConditionGroup) => ConditionGroup) => {
    const updateGroupRecursive = (group: ConditionGroup): ConditionGroup => {
      if (group.id === groupId) {
        return updater(group);
      }
      return {
        ...group,
        items: group.items.map(item =>
          isConditionGroup(item) ? updateGroupRecursive(item) : item
        )
      };
    };
    setRootGroup(updateGroupRecursive(rootGroup));
  }, [rootGroup]);

  const addConditionToGroup = useCallback((groupId: string) => {
    updateGroup(groupId, (group) => ({
      ...group,
      items: [...group.items, { id: generateId(), column: '', operator: '==', value: '', dataType: '' } as FilterCondition]
    }));
  }, [updateGroup]);

  const addSubGroup = useCallback((groupId: string) => {
    updateGroup(groupId, (group) => ({
      ...group,
      items: [...group.items, {
        id: generateId(),
        type: 'group',
        logicalOperator: 'AND',
        items: [{ id: generateId(), column: '', operator: '==', value: '', dataType: '' } as FilterCondition]
      } as ConditionGroup]
    }));
  }, [updateGroup]);

  const removeItemFromGroup = useCallback((groupId: string, itemId: string) => {
    updateGroup(groupId, (group) => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    }));
  }, [updateGroup]);

  const updateConditionInGroup = useCallback((groupId: string, conditionId: string, field: string, value: string) => {
    updateGroup(groupId, (group) => ({
      ...group,
      items: group.items.map(item =>
        !isConditionGroup(item) && item.id === conditionId
          ? { ...item, [field]: value }
          : item
      )
    }));
  }, [updateGroup]);

  const toggleGroupOperator = useCallback((groupId: string) => {
    updateGroup(groupId, (group) => ({
      ...group,
      logicalOperator: group.logicalOperator === 'AND' ? 'OR' : 'AND'
    }));
  }, [updateGroup]);

  // Apply template
  const applyTemplate = (template: typeof conditionTemplates[0]) => {
    if (mode === 'simple') {
      const newConditions = template.conditions.map((c) => ({
        id: generateId(),
        column: conditions[0]?.column || '',
        operator: c.operator,
        value: c.value
      }));
      setConditions(newConditions);
      if (template.logicalOperator) {
        setLogicalOperator(template.logicalOperator as 'AND' | 'OR');
      }
    }
    setShowTemplates(false);
  };

  // Save configuration
  const handleSave = () => {
    if (mode === 'sql') {
      onUpdate({
        mode: 'sql',
        sqlExpression
      });
    } else if (mode === 'advanced') {
      onUpdate({
        mode: 'advanced',
        conditionGroups: rootGroup
      });
    } else {
      onUpdate({
        mode: 'simple',
        conditions,
        logicalOperator
      });
    }
  };

  // Render operator selector with categories
  const renderOperatorSelect = (value: string, onChange: (val: string) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white min-w-[140px]"
    >
      {operatorCategories.map(cat => {
        const catOps = operators.filter(o => o.category === cat.key);
        if (catOps.length === 0) return null;
        return (
          <optgroup key={cat.key} label={cat.label}>
            {catOps.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );

  // Render a single condition row
  const renderConditionRow = (
    cond: SimpleCondition | FilterCondition,
    index: number,
    groupId?: string,
    showLogical?: boolean,
    logicalOp?: string
  ) => {
    const opConfig = getOperatorConfig(cond.operator);
    const isAdvanced = groupId !== undefined;

    const handleUpdate = (field: string, value: string) => {
      if (isAdvanced && groupId) {
        updateConditionInGroup(groupId, cond.id, field, value);
      } else {
        updateCondition(index, field, value);
      }
    };

    const handleRemove = () => {
      if (isAdvanced && groupId) {
        removeItemFromGroup(groupId, cond.id);
      } else {
        removeCondition(index);
      }
    };

    return (
      <div key={cond.id} className="p-2 bg-panel rounded border border-gray-700 space-y-2">
        {showLogical && index > 0 && (
          <div className="text-xs text-blue-400 font-medium">{logicalOp}</div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ColumnSelector
              value={cond.column}
              onChange={(val) => handleUpdate('column', val)}
              columns={availableColumns}
              placeholder="Select column"
            />
          </div>
          {renderOperatorSelect(cond.operator, (val) => handleUpdate('operator', val))}
        </div>

        {opConfig?.needsValue && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={cond.value as string}
              onChange={(e) => handleUpdate('value', e.target.value)}
              placeholder={opConfig.valuePlaceholder || 'value'}
              className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
            />
            {opConfig.needsValue2 && (
              <>
                <span className="text-xs text-gray-500">
                  {cond.operator === 'between' ? 'and' : '→'}
                </span>
                <input
                  type="text"
                  value={cond.value2 || ''}
                  onChange={(e) => handleUpdate('value2', e.target.value)}
                  placeholder={opConfig.value2Placeholder || 'value'}
                  className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                />
              </>
            )}
          </div>
        )}

        {opConfig?.description && (
          <p className="text-[10px] text-gray-500">{opConfig.description}</p>
        )}

        <button
          onClick={handleRemove}
          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Remove
        </button>
      </div>
    );
  };

  // Render condition group (recursive)
  const renderConditionGroup = (group: ConditionGroup, depth: number = 0) => {
    const isRoot = depth === 0;

    return (
      <div
        key={group.id}
        className={`${!isRoot ? 'ml-4 pl-3 border-l-2 border-blue-500/30' : ''} space-y-2`}
      >
        {/* Group header */}
        <div className="flex items-center gap-2 p-2 bg-panel-light rounded">
          <button
            onClick={() => toggleGroupOperator(group.id)}
            className={`px-2 py-1 text-xs rounded font-medium ${
              group.logicalOperator === 'AND'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}
          >
            {group.logicalOperator}
          </button>
          <span className="text-xs text-gray-400">
            {group.items.length} condition{group.items.length !== 1 ? 's' : ''}
          </span>
          <div className="flex-1" />
          <button
            onClick={() => addConditionToGroup(group.id)}
            className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Condition
          </button>
          <button
            onClick={() => addSubGroup(group.id)}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <FolderPlus className="w-3 h-3" /> Group
          </button>
          {!isRoot && (
            <button
              onClick={() => {
                // Find parent and remove this group
                const findAndRemove = (g: ConditionGroup): ConditionGroup => ({
                  ...g,
                  items: g.items.filter(item => item.id !== group.id).map(item =>
                    isConditionGroup(item) ? findAndRemove(item) : item
                  )
                });
                setRootGroup(findAndRemove(rootGroup));
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Group items */}
        <div className="space-y-2">
          {group.items.map((item, idx) => {
            if (isConditionGroup(item)) {
              return (
                <div key={item.id}>
                  {idx > 0 && (
                    <div className="text-xs text-center py-1 text-blue-400 font-medium">
                      {group.logicalOperator}
                    </div>
                  )}
                  {renderConditionGroup(item, depth + 1)}
                </div>
              );
            }
            return renderConditionRow(item, idx, group.id, true, group.logicalOperator);
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <ToggleGroup
        label="Filter Mode"
        options={[
          { value: 'simple', label: 'Simple', description: 'Basic conditions' },
          { value: 'advanced', label: 'Advanced', description: 'Nested groups' },
          { value: 'sql', label: 'SQL', description: 'Raw expression' }
        ]}
        value={mode}
        onChange={(v) => setMode(v as 'simple' | 'advanced' | 'sql')}
        showDescriptions
      />

      {/* Templates Button */}
      {mode !== 'sql' && (
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
          >
            <Sparkles className="w-3 h-3" />
            Quick Templates
            {showTemplates ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {showTemplates && (
            <div className="absolute top-6 left-0 right-0 z-10 bg-panel-light border border-gray-600 rounded shadow-lg max-h-64 overflow-y-auto">
              {conditionTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left px-3 py-2 hover:bg-panel border-b border-gray-700 last:border-b-0"
                >
                  <div className="text-xs text-white font-medium">{template.name}</div>
                  <div className="text-[10px] text-gray-400">{template.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simple Mode */}
      {mode === 'simple' && (
        <div className="space-y-3">
          {/* Logical Operator Toggle */}
          {conditions.length > 1 && (
            <div className="flex items-center gap-2 p-2 bg-panel rounded">
              <span className="text-xs text-gray-400">Combine with:</span>
              <button
                onClick={() => setLogicalOperator('AND')}
                className={`px-2 py-1 text-xs rounded ${
                  logicalOperator === 'AND' ? 'bg-blue-500 text-white' : 'bg-panel-light text-gray-400'
                }`}
              >
                AND
              </button>
              <button
                onClick={() => setLogicalOperator('OR')}
                className={`px-2 py-1 text-xs rounded ${
                  logicalOperator === 'OR' ? 'bg-orange-500 text-white' : 'bg-panel-light text-gray-400'
                }`}
              >
                OR
              </button>
            </div>
          )}

          {/* Conditions */}
          {conditions.map((cond, idx) => renderConditionRow(cond, idx, undefined, true, logicalOperator))}

          <button
            onClick={addCondition}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
          >
            <Plus className="w-3 h-3" /> Add Condition
          </button>
        </div>
      )}

      {/* Advanced Mode - Nested Groups */}
      {mode === 'advanced' && (
        <div className="space-y-3">
          <TipNote>
            Build complex filters with nested AND/OR groups. Click on AND/OR to toggle.
          </TipNote>
          {renderConditionGroup(rootGroup)}
        </div>
      )}

      {/* SQL Mode */}
      {mode === 'sql' && (
        <div className="space-y-2">
          <FormField
            label="SQL WHERE Expression"
            help="Supported: AND, OR, NOT, IN, LIKE, BETWEEN, IS NULL, array_contains(col, val), size(col)"
          >
            <textarea
              value={sqlExpression}
              onChange={(e) => setSqlExpression(e.target.value)}
              placeholder="age > 18 AND status = 'active' OR region IN ('US', 'EU')"
              rows={4}
              className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white focus:border-accent focus:outline-none font-mono"
            />
          </FormField>

          {/* Available columns reference */}
          {availableColumns.length > 0 && (
            <div className="p-2 bg-panel rounded">
              <div className="text-[10px] text-gray-400 mb-1">Click to insert column:</div>
              <div className="flex flex-wrap gap-1">
                {availableColumns.slice(0, 10).map(col => (
                  <button
                    key={col.name}
                    onClick={() => setSqlExpression(prev => prev + col.name)}
                    className="px-1.5 py-0.5 bg-canvas rounded text-[10px] text-gray-300 hover:bg-panel-light flex items-center gap-1"
                  >
                    {col.name}
                    <Copy className="w-2 h-2" />
                  </button>
                ))}
                {availableColumns.length > 10 && (
                  <span className="text-[10px] text-gray-500">+{availableColumns.length - 10} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operator Reference (collapsible) */}
      {mode !== 'sql' && (
        <div className="border border-gray-700 rounded">
          <button
            onClick={() => setExpandedCategories(prev =>
              prev.size === operatorCategories.length ? new Set() : new Set(operatorCategories.map(c => c.key))
            )}
            className="w-full flex items-center justify-between p-2 text-xs text-gray-400 hover:bg-panel"
          >
            <span>Operator Reference</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {expandedCategories.size > 0 && (
            <div className="p-2 border-t border-gray-700 space-y-2 max-h-48 overflow-y-auto">
              {operatorCategories.map(cat => {
                const catOps = operators.filter(o => o.category === cat.key);
                const isExpanded = expandedCategories.has(cat.key);
                return (
                  <div key={cat.key}>
                    <button
                      onClick={() => setExpandedCategories(prev => {
                        const next = new Set(prev);
                        if (next.has(cat.key)) next.delete(cat.key);
                        else next.add(cat.key);
                        return next;
                      })}
                      className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-300"
                    >
                      {isExpanded ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
                      {cat.label}
                    </button>
                    {isExpanded && (
                      <div className="ml-3 mt-1 space-y-0.5">
                        {catOps.map(op => (
                          <div key={op.value} className="text-[10px] text-gray-500">
                            <span className="text-gray-300">{op.label}</span>
                            {op.description && <span className="ml-1">- {op.description}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Validation Errors */}
      {!validation.isValid && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
          <ul className="text-xs text-red-400 space-y-1">
            {validation.errors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!validation.isValid}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
          validation.isValid
            ? 'bg-accent hover:bg-accent-hover text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
