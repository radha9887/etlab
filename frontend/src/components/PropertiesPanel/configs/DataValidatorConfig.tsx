import { useState } from 'react';
import { Save, CheckCircle2, Plus, X, Info, AlertCircle } from 'lucide-react';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData, ValidationRuleType } from '../../../types';

interface DataValidatorConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

interface ValidationRule {
  id: string;
  column: string;
  ruleType: ValidationRuleType;
  params?: {
    min?: number;
    max?: number;
    pattern?: string;
    values?: string[];
    expression?: string;
  };
  errorMessage?: string;
}

const RULE_TYPES: { value: ValidationRuleType; label: string; desc: string; icon: string }[] = [
  { value: 'notNull', label: 'Not Null', desc: 'Value must not be null', icon: '!' },
  { value: 'unique', label: 'Unique', desc: 'Values must be unique', icon: '#' },
  { value: 'range', label: 'Range', desc: 'Value within numeric range', icon: '↔' },
  { value: 'pattern', label: 'Pattern', desc: 'Match regex pattern', icon: '*' },
  { value: 'inList', label: 'In List', desc: 'Value in allowed list', icon: '∈' },
  { value: 'custom', label: 'Custom', desc: 'Custom SQL expression', icon: 'λ' },
];

const FAIL_ACTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'flag', label: 'Flag Invalid', desc: 'Add flag column for invalid rows' },
  { value: 'reject', label: 'Reject Rows', desc: 'Remove rows that fail validation' },
  { value: 'log', label: 'Log Only', desc: 'Log failures but keep all rows' },
];

let ruleIdCounter = 0;
const generateRuleId = () => `rule_${++ruleIdCounter}`;

export const DataValidatorConfig = ({ data, onUpdate, availableColumns }: DataValidatorConfigProps) => {
  const config = data.config || {};

  const [rules, setRules] = useState<ValidationRule[]>(
    (config.rules as ValidationRule[]) || []
  );
  const [failAction, setFailAction] = useState<'reject' | 'flag' | 'log'>(
    (config.failAction as 'reject' | 'flag' | 'log') || 'flag'
  );
  const [flagColumn, setFlagColumn] = useState<string>(
    (config.flagColumn as string) || 'validation_errors'
  );
  const [stopOnFirstError, setStopOnFirstError] = useState<boolean>(
    config.stopOnFirstError === true
  );

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: generateRuleId(),
        column: '',
        ruleType: 'notNull',
        params: {},
        errorMessage: '',
      }
    ]);
  };

  const updateRule = (index: number, field: keyof ValidationRule, value: unknown) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };

    // Reset params when rule type changes
    if (field === 'ruleType') {
      newRules[index].params = {};
    }

    setRules(newRules);
  };

  const updateRuleParams = (index: number, paramField: string, value: unknown) => {
    const newRules = [...rules];
    newRules[index] = {
      ...newRules[index],
      params: { ...newRules[index].params, [paramField]: value }
    };
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate({
      rules: rules.filter(r => r.column && r.ruleType),
      failAction,
      flagColumn: failAction === 'flag' ? flagColumn : undefined,
      stopOnFirstError,
    });
  };

  const getRuleParamsUI = (rule: ValidationRule, index: number) => {
    switch (rule.ruleType) {
      case 'range':
        return (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Min Value</label>
              <input
                type="number"
                value={rule.params?.min ?? ''}
                onChange={(e) => updateRuleParams(index, 'min', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="No min"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Max Value</label>
              <input
                type="number"
                value={rule.params?.max ?? ''}
                onChange={(e) => updateRuleParams(index, 'max', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="No max"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        );

      case 'pattern':
        return (
          <div className="mt-2">
            <label className="block text-[10px] text-gray-500 mb-1">Regex Pattern</label>
            <input
              type="text"
              value={rule.params?.pattern || ''}
              onChange={(e) => updateRuleParams(index, 'pattern', e.target.value)}
              placeholder="e.g., ^[A-Z]{2}\\d{4}$"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono placeholder-gray-500 focus:border-accent focus:outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Common: <code>^\d+$</code> (digits), <code>^[a-zA-Z]+$</code> (letters), <code>^\S+@\S+$</code> (email)
            </p>
          </div>
        );

      case 'inList':
        return (
          <div className="mt-2">
            <label className="block text-[10px] text-gray-500 mb-1">Allowed Values (comma-separated)</label>
            <input
              type="text"
              value={rule.params?.values?.join(', ') || ''}
              onChange={(e) => updateRuleParams(index, 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
              placeholder="value1, value2, value3"
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
            />
          </div>
        );

      case 'custom':
        return (
          <div className="mt-2">
            <label className="block text-[10px] text-gray-500 mb-1">SQL Expression (must return boolean)</label>
            <textarea
              value={rule.params?.expression || ''}
              onChange={(e) => updateRuleParams(index, 'expression', e.target.value)}
              placeholder="e.g., col('amount') > 0 AND col('amount') < 10000"
              rows={2}
              className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white font-mono placeholder-gray-500 focus:border-accent focus:outline-none"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/30">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-xs text-emerald-300 font-medium">Data Validator</p>
            <p className="text-xs text-gray-400 mt-1">
              Define validation rules to ensure data quality. Invalid rows can be flagged, rejected, or logged.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Validation Rules</label>
          <button
            onClick={addRule}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="p-4 bg-canvas rounded border border-gray-700 text-center">
            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No validation rules configured</p>
            <button
              onClick={addRule}
              className="mt-2 text-xs text-accent hover:text-accent-hover"
            >
              + Add your first rule
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule, index) => {
              const ruleInfo = RULE_TYPES.find(r => r.value === rule.ruleType);
              return (
                <div key={rule.id} className="p-3 bg-canvas rounded border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded text-xs font-mono">
                        {ruleInfo?.icon}
                      </span>
                      <span className="text-[10px] text-gray-500">Rule {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeRule(index)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Column and Rule Type Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={rule.column}
                        onChange={(e) => updateRule(index, 'column', e.target.value)}
                        className="px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                      >
                        <option value="">Select column</option>
                        {availableColumns.map(col => (
                          <option key={col.name} value={col.name}>
                            {col.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={rule.ruleType}
                        onChange={(e) => updateRule(index, 'ruleType', e.target.value as ValidationRuleType)}
                        className="px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                      >
                        {RULE_TYPES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rule-specific params */}
                    {getRuleParamsUI(rule, index)}

                    {/* Error Message */}
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Error Message (optional)</label>
                      <input
                        type="text"
                        value={rule.errorMessage || ''}
                        onChange={(e) => updateRule(index, 'errorMessage', e.target.value)}
                        placeholder={`${rule.column || 'Column'} failed ${rule.ruleType} validation`}
                        className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fail Action */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">On Validation Failure</label>
        <div className="grid grid-cols-3 gap-1">
          {FAIL_ACTIONS.map(a => (
            <button
              key={a.value}
              onClick={() => setFailAction(a.value as 'reject' | 'flag' | 'log')}
              className={`px-2 py-2 text-xs rounded transition-colors ${
                failAction === a.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-panel text-gray-400 hover:bg-panel-light'
              }`}
              title={a.desc}
            >
              {a.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {FAIL_ACTIONS.find(a => a.value === failAction)?.desc}
        </p>
      </div>

      {/* Flag Column Name */}
      {failAction === 'flag' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Flag Column Name</label>
          <input
            type="text"
            value={flagColumn}
            onChange={(e) => setFlagColumn(e.target.value)}
            placeholder="validation_errors"
            className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Column will contain array of failed rule descriptions
          </p>
        </div>
      )}

      {/* Options */}
      <label className="flex items-center gap-2 px-3 py-2 bg-canvas rounded cursor-pointer hover:bg-panel-light">
        <input
          type="checkbox"
          checked={stopOnFirstError}
          onChange={(e) => setStopOnFirstError(e.target.checked)}
          className="rounded"
        />
        <div>
          <span className="text-xs text-white">Stop on first error</span>
          <p className="text-[10px] text-gray-500">Only report first validation failure per row</p>
        </div>
      </label>

      {/* Rule Reference */}
      <div className="p-3 bg-canvas rounded border border-gray-700">
        <div className="flex items-center gap-1 mb-2">
          <Info className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Validation Rules</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {RULE_TYPES.map(r => (
            <div key={r.value} className="text-gray-500">
              <span className="text-emerald-400">{r.label}:</span> {r.desc}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={rules.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
