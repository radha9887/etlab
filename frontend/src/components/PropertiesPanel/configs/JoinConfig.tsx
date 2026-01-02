import { useState, useMemo } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ColumnSelector, MultiColumnSelector, ToggleGroup, FormField, TipNote } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface JoinConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const JoinConfig = ({ data, onUpdate, availableColumns }: JoinConfigProps) => {
  const [joinType, setJoinType] = useState((data.config?.joinType as string) || 'inner');
  const [conditionMode, setConditionMode] = useState<'sameColumn' | 'differentColumns' | 'expression'>(
    (data.config?.conditionMode as 'sameColumn' | 'differentColumns' | 'expression') || 'sameColumn'
  );
  const [sameColumns, setSameColumns] = useState((data.config?.sameColumns as string) || '');
  const [columnPairs, setColumnPairs] = useState<Array<{ leftColumn: string; rightColumn: string }>>(
    (data.config?.columnPairs as Array<{ leftColumn: string; rightColumn: string }>) ||
    [{ leftColumn: '', rightColumn: '' }]
  );
  const [expression, setExpression] = useState((data.config?.expression as string) || '');
  const [broadcast, setBroadcast] = useState<'none' | 'left' | 'right'>((data.config?.broadcast as 'none' | 'left' | 'right') || 'none');

  // Duplicate column handling
  const [handleDuplicates, setHandleDuplicates] = useState<'keep' | 'suffix' | 'drop_right' | 'drop_left' | 'select'>(
    (data.config?.handleDuplicates as 'keep' | 'suffix' | 'drop_right' | 'drop_left' | 'select') || 'suffix'
  );
  const [leftSuffix, setLeftSuffix] = useState((data.config?.leftSuffix as string) || '_left');
  const [rightSuffix, setRightSuffix] = useState((data.config?.rightSuffix as string) || '_right');
  const [selectColumns, setSelectColumns] = useState((data.config?.selectColumns as string) || '');

  const joinTypes = [
    { value: 'inner', label: 'Inner', desc: 'Only matching rows', icon: '∩' },
    { value: 'left', label: 'Left', desc: 'All left + matching right', icon: '⊃' },
    { value: 'right', label: 'Right', desc: 'All right + matching left', icon: '⊂' },
    { value: 'full', label: 'Full', desc: 'All rows from both', icon: '∪' },
    { value: 'left_semi', label: 'Semi', desc: 'Left rows that match', icon: '⋉' },
    { value: 'left_anti', label: 'Anti', desc: 'Left rows without match', icon: '▷' },
    { value: 'cross', label: 'Cross', desc: 'Cartesian product', icon: '×' },
  ];

  const addColumnPair = () => {
    setColumnPairs([...columnPairs, { leftColumn: '', rightColumn: '' }]);
  };

  const removeColumnPair = (index: number) => {
    if (columnPairs.length > 1) {
      setColumnPairs(columnPairs.filter((_, i) => i !== index));
    }
  };

  const updateColumnPair = (index: number, field: 'leftColumn' | 'rightColumn', value: string) => {
    const updated = [...columnPairs];
    updated[index] = { ...updated[index], [field]: value };
    setColumnPairs(updated);
  };

  const handleSave = () => {
    onUpdate({
      joinType,
      conditionMode,
      sameColumns: conditionMode === 'sameColumn' ? sameColumns : undefined,
      columnPairs: conditionMode === 'differentColumns' ? columnPairs : undefined,
      expression: conditionMode === 'expression' ? expression : undefined,
      broadcast,
      handleDuplicates,
      leftSuffix: handleDuplicates === 'suffix' ? leftSuffix : undefined,
      rightSuffix: handleDuplicates === 'suffix' ? rightSuffix : undefined,
      selectColumns: handleDuplicates === 'select' ? selectColumns : undefined,
    });
  };

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];

    if (joinType !== 'cross') {
      if (conditionMode === 'sameColumn' && !sameColumns.trim()) {
        errors.push('Select at least one join column');
      }
      if (conditionMode === 'differentColumns') {
        const validPairs = columnPairs.filter(p => p.leftColumn && p.rightColumn);
        if (validPairs.length === 0) {
          errors.push('At least one complete column pair is required');
        }
      }
      if (conditionMode === 'expression' && !expression.trim()) {
        errors.push('Join expression is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [joinType, conditionMode, sameColumns, columnPairs, expression]);

  return (
    <div className="space-y-4">
      {/* Join Type Selection */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Join Type</label>
        <div className="grid grid-cols-4 gap-1">
          {joinTypes.map((jt) => (
            <button
              key={jt.value}
              onClick={() => setJoinType(jt.value)}
              className={`p-2 rounded text-center transition-colors ${
                joinType === jt.value ? 'bg-accent text-white' : 'bg-panel text-gray-300 hover:bg-panel-light'
              }`}
              title={jt.desc}
            >
              <div className="text-lg">{jt.icon}</div>
              <div className="text-[10px]">{jt.label}</div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {joinTypes.find(j => j.value === joinType)?.desc}
        </p>
      </div>

      {/* Join Condition Mode */}
      {joinType !== 'cross' && (
        <>
          <ToggleGroup
            label="Join Condition"
            options={[
              { value: 'sameColumn', label: 'Same Column(s)', description: 'Same name in both' },
              { value: 'differentColumns', label: 'Column Pairs', description: 'Map left to right' },
              { value: 'expression', label: 'Expression', description: 'Custom SQL' }
            ]}
            value={conditionMode}
            onChange={(v) => setConditionMode(v as 'sameColumn' | 'differentColumns' | 'expression')}
          />

          {/* Same Column Mode */}
          {conditionMode === 'sameColumn' && (
            <FormField label="Join Column(s)" help="Select columns that exist with same name in both tables.">
              <MultiColumnSelector
                value={sameColumns}
                onChange={setSameColumns}
                columns={availableColumns}
                placeholder="Select columns"
              />
            </FormField>
          )}

          {/* Different Columns Mode */}
          {conditionMode === 'differentColumns' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex-1 text-center">Left Column</span>
                <span className="w-8"></span>
                <span className="flex-1 text-center">Right Column</span>
              </div>
              {columnPairs.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <ColumnSelector
                      value={pair.leftColumn}
                      onChange={(val) => updateColumnPair(idx, 'leftColumn', val)}
                      columns={availableColumns}
                      placeholder="Left column"
                    />
                  </div>
                  <span className="text-gray-500">=</span>
                  <div className="flex-1">
                    <ColumnSelector
                      value={pair.rightColumn}
                      onChange={(val) => updateColumnPair(idx, 'rightColumn', val)}
                      columns={availableColumns}
                      placeholder="Right column"
                    />
                  </div>
                  {columnPairs.length > 1 && (
                    <button onClick={() => removeColumnPair(idx)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addColumnPair} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover">
                <Plus className="w-3 h-3" /> Add Column Pair
              </button>
            </div>
          )}

          {/* Expression Mode */}
          {conditionMode === 'expression' && (
            <FormField label="Join Expression" help="Use 'left.' and 'right.' prefixes for column references.">
              <textarea
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="left.id == right.user_id AND left.date == right.date"
                rows={3}
                className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white font-mono focus:border-accent focus:outline-none"
              />
            </FormField>
          )}
        </>
      )}

      {/* Broadcast Hint */}
      <ToggleGroup
        label="Optimization Hint"
        options={[
          { value: 'none', label: 'Auto', description: 'Let Spark decide' },
          { value: 'right', label: 'Broadcast Right', description: 'Small right table' },
          { value: 'left', label: 'Broadcast Left', description: 'Small left table' }
        ]}
        value={broadcast}
        onChange={(v) => setBroadcast(v as 'none' | 'left' | 'right')}
      />
      <TipNote>Broadcast smaller tables (&lt;100MB) to all nodes for faster joins.</TipNote>

      {/* Duplicate Column Handling */}
      <div className="border-t border-gray-700 pt-4">
        <label className="block text-xs text-gray-400 mb-2">Handle Duplicate Columns</label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setHandleDuplicates('suffix')}
              className={`px-2 py-1.5 text-xs rounded ${handleDuplicates === 'suffix' ? 'bg-purple-600 text-white' : 'bg-panel text-gray-400 hover:bg-panel-light'}`}
              title="Rename duplicates with suffixes"
            >
              Add Suffix
            </button>
            <button
              onClick={() => setHandleDuplicates('drop_right')}
              className={`px-2 py-1.5 text-xs rounded ${handleDuplicates === 'drop_right' ? 'bg-purple-600 text-white' : 'bg-panel text-gray-400 hover:bg-panel-light'}`}
              title="Keep left table's duplicate columns"
            >
              Keep Left
            </button>
            <button
              onClick={() => setHandleDuplicates('drop_left')}
              className={`px-2 py-1.5 text-xs rounded ${handleDuplicates === 'drop_left' ? 'bg-purple-600 text-white' : 'bg-panel text-gray-400 hover:bg-panel-light'}`}
              title="Keep right table's duplicate columns"
            >
              Keep Right
            </button>
            <button
              onClick={() => setHandleDuplicates('select')}
              className={`px-2 py-1.5 text-xs rounded ${handleDuplicates === 'select' ? 'bg-purple-600 text-white' : 'bg-panel text-gray-400 hover:bg-panel-light'}`}
              title="Select specific columns to keep"
            >
              Select Cols
            </button>
            <button
              onClick={() => setHandleDuplicates('keep')}
              className={`col-span-2 px-2 py-1.5 text-xs rounded ${handleDuplicates === 'keep' ? 'bg-purple-600 text-white' : 'bg-panel text-gray-400 hover:bg-panel-light'}`}
              title="Keep all columns (may cause ambiguity)"
            >
              Keep All (Ambiguous)
            </button>
          </div>

          {handleDuplicates === 'suffix' && (
            <div className="flex gap-2 p-2 bg-canvas rounded">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-1">Left Suffix</label>
                <input
                  type="text"
                  value={leftSuffix}
                  onChange={(e) => setLeftSuffix(e.target.value)}
                  placeholder="_left"
                  className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-1">Right Suffix</label>
                <input
                  type="text"
                  value={rightSuffix}
                  onChange={(e) => setRightSuffix(e.target.value)}
                  placeholder="_right"
                  className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
                />
              </div>
            </div>
          )}

          {handleDuplicates === 'select' && (
            <div className="p-2 bg-canvas rounded">
              <label className="block text-[10px] text-gray-500 mb-1">Columns to Keep</label>
              <input
                type="text"
                value={selectColumns}
                onChange={(e) => setSelectColumns(e.target.value)}
                placeholder="left.*, right.col1"
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              />
            </div>
          )}

          <p className="text-[10px] text-gray-500">
            {handleDuplicates === 'suffix' && 'Duplicates renamed: name → name_left, name_right'}
            {handleDuplicates === 'drop_right' && 'Keeps left.name, drops right.name'}
            {handleDuplicates === 'drop_left' && 'Drops left.name, keeps right.name'}
            {handleDuplicates === 'select' && 'Use: left.*, right.col1, right.col2'}
            {handleDuplicates === 'keep' && 'All columns kept (may need df["col"] syntax)'}
          </p>
        </div>
      </div>

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
