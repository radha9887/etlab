import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { ColumnSelector, MultiColumnSelector } from '../shared';
import type { WithAvailableColumns } from '../shared';
import type { TransformNodeData } from '../../../types';

interface WindowConfigProps extends WithAvailableColumns {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const WindowConfig = ({ data, onUpdate, availableColumns }: WindowConfigProps) => {
  const [partitionBy, setPartitionBy] = useState((data.config?.partitionBy as string) || '');
  const [orderByColumns, setOrderByColumns] = useState<Array<{ id: string; column: string; direction: 'asc' | 'desc' }>>(
    (data.config?.orderByColumns as Array<{ id: string; column: string; direction: 'asc' | 'desc' }>) ||
    [{ id: '1', column: '', direction: 'asc' }]
  );
  const [windowFunction, setWindowFunction] = useState((data.config?.windowFunction as string) || 'row_number');
  const [functionColumn, setFunctionColumn] = useState((data.config?.functionColumn as string) || '');
  const [functionParams, setFunctionParams] = useState((data.config?.functionParams as string) || '');
  const [outputColumn, setOutputColumn] = useState((data.config?.outputColumn as string) || 'window_result');
  const [enableFrame, setEnableFrame] = useState((data.config?.enableFrame as boolean) || false);
  const [frameType, setFrameType] = useState<'rows' | 'range'>((data.config?.frameType as 'rows' | 'range') || 'rows');
  const [frameStart, setFrameStart] = useState((data.config?.frameStart as string) || 'unboundedPreceding');
  const [frameEnd, setFrameEnd] = useState((data.config?.frameEnd as string) || 'currentRow');

  const windowFunctionGroups = [
    {
      label: 'Ranking',
      functions: [
        { value: 'row_number', label: 'row_number()', desc: 'Sequential row number', needsColumn: false },
        { value: 'rank', label: 'rank()', desc: 'Rank with gaps', needsColumn: false },
        { value: 'dense_rank', label: 'dense_rank()', desc: 'Rank without gaps', needsColumn: false },
        { value: 'percent_rank', label: 'percent_rank()', desc: 'Relative rank (0 to 1)', needsColumn: false },
        { value: 'cume_dist', label: 'cume_dist()', desc: 'Cumulative distribution', needsColumn: false },
        { value: 'ntile', label: 'ntile(n)', desc: 'Divide into n buckets', needsColumn: false, needsParams: true },
      ]
    },
    {
      label: 'Value Access',
      functions: [
        { value: 'lag', label: 'lag()', desc: 'Value from previous row', needsColumn: true, needsParams: true },
        { value: 'lead', label: 'lead()', desc: 'Value from next row', needsColumn: true, needsParams: true },
        { value: 'first', label: 'first()', desc: 'First value in window', needsColumn: true },
        { value: 'last', label: 'last()', desc: 'Last value in window', needsColumn: true },
        { value: 'nth_value', label: 'nth_value()', desc: 'Nth value in window', needsColumn: true, needsParams: true },
      ]
    },
    {
      label: 'Aggregates',
      functions: [
        { value: 'sum', label: 'sum()', desc: 'Running sum', needsColumn: true },
        { value: 'avg', label: 'avg()', desc: 'Running average', needsColumn: true },
        { value: 'count', label: 'count()', desc: 'Running count', needsColumn: false },
        { value: 'min', label: 'min()', desc: 'Running minimum', needsColumn: true },
        { value: 'max', label: 'max()', desc: 'Running maximum', needsColumn: true },
      ]
    },
  ];

  const allFunctions = windowFunctionGroups.flatMap(g => g.functions);
  const currentFnConfig = allFunctions.find(f => f.value === windowFunction);

  const frameBounds = [
    { value: 'unboundedPreceding', label: 'Unbounded Preceding' },
    { value: 'currentRow', label: 'Current Row' },
    { value: 'unboundedFollowing', label: 'Unbounded Following' },
    { value: '1', label: '1 Row' },
    { value: '2', label: '2 Rows' },
    { value: '3', label: '3 Rows' },
    { value: '5', label: '5 Rows' },
    { value: '10', label: '10 Rows' },
  ];

  const addOrderByColumn = () => {
    setOrderByColumns([...orderByColumns, { id: Date.now().toString(), column: '', direction: 'asc' }]);
  };

  const removeOrderByColumn = (index: number) => {
    if (orderByColumns.length > 1) {
      setOrderByColumns(orderByColumns.filter((_, i) => i !== index));
    }
  };

  const updateOrderByColumn = (index: number, field: string, value: string) => {
    const updated = [...orderByColumns];
    updated[index] = { ...updated[index], [field]: value };
    setOrderByColumns(updated);
  };

  const handleSave = () => {
    onUpdate({
      partitionBy,
      orderByColumns,
      windowFunction,
      functionColumn: currentFnConfig?.needsColumn ? functionColumn : undefined,
      functionParams: currentFnConfig?.needsParams ? functionParams : undefined,
      outputColumn,
      enableFrame,
      frameType: enableFrame ? frameType : undefined,
      frameStart: enableFrame ? frameStart : undefined,
      frameEnd: enableFrame ? frameEnd : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Partition By */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Partition By</label>
        <MultiColumnSelector
          value={partitionBy}
          onChange={setPartitionBy}
          columns={availableColumns}
          placeholder="Select partition columns"
        />
        <p className="text-[10px] text-gray-500 mt-1">Rows are grouped by these columns</p>
      </div>

      {/* Order By */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Order By</label>
        <div className="space-y-2">
          {orderByColumns.map((col, idx) => (
            <div key={col.id} className="flex items-center gap-2">
              <div className="flex-1">
                <ColumnSelector
                  value={col.column}
                  onChange={(val) => updateOrderByColumn(idx, 'column', val)}
                  columns={availableColumns}
                  placeholder="Select column"
                />
              </div>
              <div className="flex rounded overflow-hidden border border-gray-600">
                <button
                  onClick={() => updateOrderByColumn(idx, 'direction', 'asc')}
                  className={`px-2 py-1 text-xs ${col.direction === 'asc' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}
                >
                  ASC
                </button>
                <button
                  onClick={() => updateOrderByColumn(idx, 'direction', 'desc')}
                  className={`px-2 py-1 text-xs ${col.direction === 'desc' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}
                >
                  DESC
                </button>
              </div>
              {orderByColumns.length > 1 && (
                <button onClick={() => removeOrderByColumn(idx)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addOrderByColumn} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover mt-2">
          <Plus className="w-3 h-3" /> Add Order Column
        </button>
      </div>

      {/* Window Function */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Window Function</label>
        <select
          value={windowFunction}
          onChange={(e) => setWindowFunction(e.target.value)}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        >
          {windowFunctionGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.functions.map((fn) => (
                <option key={fn.value} value={fn.value}>{fn.label} - {fn.desc}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Function Column (if needed) */}
      {currentFnConfig?.needsColumn && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Source Column</label>
          <ColumnSelector
            value={functionColumn}
            onChange={setFunctionColumn}
            columns={availableColumns}
            placeholder="Select column"
          />
        </div>
      )}

      {/* Function Parameters (if needed) */}
      {currentFnConfig?.needsParams && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            {windowFunction === 'ntile' ? 'Number of Buckets' :
             windowFunction === 'lag' || windowFunction === 'lead' ? 'Offset (default: 1)' :
             windowFunction === 'nth_value' ? 'N (row number)' : 'Parameters'}
          </label>
          <input
            type="text"
            value={functionParams}
            onChange={(e) => setFunctionParams(e.target.value)}
            placeholder={windowFunction === 'ntile' ? '4' : windowFunction === 'lag' || windowFunction === 'lead' ? '1' : '1'}
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
          />
        </div>
      )}

      {/* Output Column */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Output Column Name</label>
        <input
          type="text"
          value={outputColumn}
          onChange={(e) => setOutputColumn(e.target.value)}
          placeholder="window_result"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
      </div>

      {/* Frame Specification */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="enableFrame"
            checked={enableFrame}
            onChange={(e) => setEnableFrame(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="enableFrame" className="text-xs text-gray-300">Custom Frame</label>
        </div>

        {enableFrame && (
          <div className="space-y-2 pl-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFrameType('rows')}
                className={`flex-1 px-2 py-1.5 text-xs rounded ${frameType === 'rows' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}
              >
                ROWS
              </button>
              <button
                onClick={() => setFrameType('range')}
                className={`flex-1 px-2 py-1.5 text-xs rounded ${frameType === 'range' ? 'bg-accent text-white' : 'bg-panel text-gray-400'}`}
              >
                RANGE
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start</label>
              <select
                value={frameStart}
                onChange={(e) => setFrameStart(e.target.value)}
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              >
                {frameBounds.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">End</label>
              <select
                value={frameEnd}
                onChange={(e) => setFrameEnd(e.target.value)}
                className="w-full px-2 py-1.5 bg-panel border border-gray-600 rounded text-xs text-white"
              >
                {frameBounds.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors">
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
