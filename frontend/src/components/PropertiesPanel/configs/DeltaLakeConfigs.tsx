import { useState } from 'react';
import { Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { TransformNodeData } from '../../../types';
import type { WithAvailableColumns } from '../shared';

interface DeltaConfigProps extends Partial<WithAvailableColumns> {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}


// ============================================
// Delta MERGE (Upsert) Configuration
// ============================================
interface MergeCondition {
  sourceColumn: string;
  targetColumn: string;
}

interface WhenClause {
  type: 'matched' | 'not_matched' | 'not_matched_by_source';
  condition?: string;
  action: 'update' | 'delete' | 'insert' | 'update_all' | 'insert_all';
  setColumns?: { column: string; expression: string }[];
}

export const DeltaMergeConfig = ({ data, onUpdate, availableColumns = [] }: DeltaConfigProps) => {
  const config = data.config || {};
  const [targetPath, setTargetPath] = useState((config.targetPath as string) || '');
  const [mergeConditions, setMergeConditions] = useState<MergeCondition[]>(
    (config.mergeConditions as MergeCondition[]) || [{ sourceColumn: '', targetColumn: '' }]
  );
  const [whenClauses, setWhenClauses] = useState<WhenClause[]>(
    (config.whenClauses as WhenClause[]) || [
      { type: 'matched', action: 'update_all' },
      { type: 'not_matched', action: 'insert_all' }
    ]
  );

  const addMergeCondition = () => {
    setMergeConditions([...mergeConditions, { sourceColumn: '', targetColumn: '' }]);
  };

  const removeMergeCondition = (index: number) => {
    setMergeConditions(mergeConditions.filter((_, i) => i !== index));
  };

  const updateMergeCondition = (index: number, field: keyof MergeCondition, value: string) => {
    const updated = [...mergeConditions];
    updated[index] = { ...updated[index], [field]: value };
    setMergeConditions(updated);
  };

  const addWhenClause = () => {
    setWhenClauses([...whenClauses, { type: 'matched', action: 'update_all' }]);
  };

  const removeWhenClause = (index: number) => {
    setWhenClauses(whenClauses.filter((_, i) => i !== index));
  };

  const updateWhenClause = (index: number, field: keyof WhenClause, value: unknown) => {
    const updated = [...whenClauses];
    updated[index] = { ...updated[index], [field]: value };
    setWhenClauses(updated);
  };

  const handleSave = () => {
    onUpdate({
      targetPath,
      mergeConditions,
      whenClauses,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-[10px] text-blue-400">
          MERGE performs upsert operations on Delta tables. It matches source rows against target rows
          and executes different actions based on match status.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Target Delta Table Path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="s3://bucket/delta/table or /path/to/delta/table"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
      </div>

      {/* Merge Conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Merge Condition (ON clause)</label>
          <button
            onClick={addMergeCondition}
            className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {mergeConditions.map((cond, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={cond.sourceColumn}
                onChange={(e) => updateMergeCondition(index, 'sourceColumn', e.target.value)}
                className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              >
                <option value="">Source column...</option>
                {(availableColumns || []).map((col) => (
                  <option key={col.name} value={col.name}>{col.name}</option>
                ))}
              </select>
              <span className="text-gray-500">=</span>
              <input
                type="text"
                value={cond.targetColumn}
                onChange={(e) => updateMergeCondition(index, 'targetColumn', e.target.value)}
                placeholder="target.column"
                className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              />
              {mergeConditions.length > 1 && (
                <button
                  onClick={() => removeMergeCondition(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* When Clauses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">When Clauses</label>
          <button
            onClick={addWhenClause}
            className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {whenClauses.map((clause, index) => (
            <div key={index} className="p-3 bg-gray-700/30 rounded border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <select
                  value={clause.type}
                  onChange={(e) => updateWhenClause(index, 'type', e.target.value)}
                  className="px-2 py-1 bg-canvas border border-gray-600 rounded text-xs text-white"
                >
                  <option value="matched">WHEN MATCHED</option>
                  <option value="not_matched">WHEN NOT MATCHED</option>
                  <option value="not_matched_by_source">WHEN NOT MATCHED BY SOURCE</option>
                </select>
                {whenClauses.length > 1 && (
                  <button
                    onClick={() => removeWhenClause(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  value={clause.condition || ''}
                  onChange={(e) => updateWhenClause(index, 'condition', e.target.value)}
                  placeholder="Additional condition (optional): e.g., source.updated_at > target.updated_at"
                  className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Action</label>
                <select
                  value={clause.action}
                  onChange={(e) => updateWhenClause(index, 'action', e.target.value)}
                  className="w-full px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
                >
                  {clause.type === 'matched' && (
                    <>
                      <option value="update_all">UPDATE SET * (all columns)</option>
                      <option value="update">UPDATE SET (specific columns)</option>
                      <option value="delete">DELETE</option>
                    </>
                  )}
                  {clause.type === 'not_matched' && (
                    <>
                      <option value="insert_all">INSERT * (all columns)</option>
                      <option value="insert">INSERT (specific columns)</option>
                    </>
                  )}
                  {clause.type === 'not_matched_by_source' && (
                    <>
                      <option value="update_all">UPDATE SET * (all columns)</option>
                      <option value="update">UPDATE SET (specific columns)</option>
                      <option value="delete">DELETE</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// ============================================
// Delta DELETE Configuration
// ============================================
export const DeltaDeleteConfig = ({ data, onUpdate }: DeltaConfigProps) => {
  const config = data.config || {};
  const [targetPath, setTargetPath] = useState((config.targetPath as string) || '');
  const [deleteCondition, setDeleteCondition] = useState((config.deleteCondition as string) || '');

  const handleSave = () => {
    onUpdate({
      targetPath,
      deleteCondition,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-yellow-400">
          DELETE permanently removes rows from the Delta table. This operation cannot be undone
          (except via time travel restore).
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Target Delta Table Path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="s3://bucket/delta/table or /path/to/delta/table"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Delete Condition (WHERE clause)</label>
        <textarea
          value={deleteCondition}
          onChange={(e) => setDeleteCondition(e.target.value)}
          placeholder="e.g., status = 'deleted' AND updated_at < '2024-01-01'"
          rows={3}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white font-mono"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Use SQL syntax. Leave empty to delete ALL rows (be careful!).
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// ============================================
// Delta UPDATE Configuration
// ============================================
interface SetClause {
  column: string;
  expression: string;
}

export const DeltaUpdateConfig = ({ data, onUpdate }: DeltaConfigProps) => {
  const config = data.config || {};
  const [targetPath, setTargetPath] = useState((config.targetPath as string) || '');
  const [updateCondition, setUpdateCondition] = useState((config.updateCondition as string) || '');
  const [setClauses, setSetClauses] = useState<SetClause[]>(
    (config.setClauses as SetClause[]) || [{ column: '', expression: '' }]
  );

  const addSetClause = () => {
    setSetClauses([...setClauses, { column: '', expression: '' }]);
  };

  const removeSetClause = (index: number) => {
    setSetClauses(setClauses.filter((_, i) => i !== index));
  };

  const updateSetClause = (index: number, field: keyof SetClause, value: string) => {
    const updated = [...setClauses];
    updated[index] = { ...updated[index], [field]: value };
    setSetClauses(updated);
  };

  const handleSave = () => {
    onUpdate({
      targetPath,
      updateCondition,
      setClauses,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-[10px] text-blue-400">
          UPDATE modifies existing rows in the Delta table based on a condition.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Target Delta Table Path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="s3://bucket/delta/table or /path/to/delta/table"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Update Condition (WHERE clause)</label>
        <textarea
          value={updateCondition}
          onChange={(e) => setUpdateCondition(e.target.value)}
          placeholder="e.g., status = 'pending' AND created_at < '2024-01-01'"
          rows={2}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white font-mono"
        />
      </div>

      {/* SET Clauses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">SET Clauses</label>
          <button
            onClick={addSetClause}
            className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {setClauses.map((clause, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={clause.column}
                onChange={(e) => updateSetClause(index, 'column', e.target.value)}
                placeholder="column"
                className="w-1/3 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white"
              />
              <span className="text-gray-500">=</span>
              <input
                type="text"
                value={clause.expression}
                onChange={(e) => updateSetClause(index, 'expression', e.target.value)}
                placeholder="expression (e.g., 'processed', current_timestamp())"
                className="flex-1 px-2 py-1.5 bg-canvas border border-gray-600 rounded text-xs text-white font-mono"
              />
              {setClauses.length > 1 && (
                <button
                  onClick={() => removeSetClause(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// ============================================
// Delta OPTIMIZE Configuration
// ============================================
export const DeltaOptimizeConfig = ({ data, onUpdate }: DeltaConfigProps) => {
  const config = data.config || {};
  const [targetPath, setTargetPath] = useState((config.targetPath as string) || '');
  const [zOrderColumns, setZOrderColumns] = useState((config.zOrderColumns as string) || '');
  const [whereClause, setWhereClause] = useState((config.whereClause as string) || '');

  const handleSave = () => {
    onUpdate({
      targetPath,
      zOrderColumns,
      whereClause,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-[10px] text-blue-400">
          OPTIMIZE compacts small files into larger files and optionally co-locates data with Z-ORDER
          for faster query performance.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Target Delta Table Path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="s3://bucket/delta/table or /path/to/delta/table"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Z-ORDER Columns (optional)</label>
        <input
          type="text"
          value={zOrderColumns}
          onChange={(e) => setZOrderColumns(e.target.value)}
          placeholder="date, region, customer_id"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Comma-separated columns. Use columns frequently used in WHERE clauses (max 4 recommended).
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">WHERE Clause (optional)</label>
        <input
          type="text"
          value={whereClause}
          onChange={(e) => setWhereClause(e.target.value)}
          placeholder="date >= '2024-01-01'"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white font-mono"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Only optimize partitions matching this condition.
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// ============================================
// Delta VACUUM Configuration
// ============================================
export const DeltaVacuumConfig = ({ data, onUpdate }: DeltaConfigProps) => {
  const config = data.config || {};
  const [targetPath, setTargetPath] = useState((config.targetPath as string) || '');
  const [retentionHours, setRetentionHours] = useState((config.retentionHours as number) || 168);
  const [dryRun, setDryRun] = useState((config.dryRun as boolean) ?? true);

  const handleSave = () => {
    onUpdate({
      targetPath,
      retentionHours,
      dryRun,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-yellow-400">
          VACUUM permanently deletes old files from the Delta table directory. This can break
          time travel queries for versions older than the retention period.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Target Delta Table Path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="s3://bucket/delta/table or /path/to/delta/table"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Retention Period (hours)</label>
        <input
          type="number"
          value={retentionHours}
          onChange={(e) => setRetentionHours(parseInt(e.target.value))}
          min={0}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          Default: 168 hours (7 days). Files older than this will be deleted.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="dryRun"
          checked={dryRun}
          onChange={(e) => setDryRun(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="dryRun" className="text-xs text-gray-300">
          Dry Run (list files without deleting)
        </label>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};

// ============================================
// Delta HISTORY / TIME TRAVEL Configuration
// ============================================
export const DeltaHistoryConfig = ({ data, onUpdate }: DeltaConfigProps) => {
  const config = data.config || {};
  const [targetPath, setTargetPath] = useState((config.targetPath as string) || '');
  const [queryType, setQueryType] = useState((config.queryType as string) || 'history');
  const [versionNumber, setVersionNumber] = useState((config.versionNumber as string) || '');
  const [timestamp, setTimestamp] = useState((config.timestamp as string) || '');
  const [historyLimit, setHistoryLimit] = useState((config.historyLimit as number) || 10);

  const handleSave = () => {
    onUpdate({
      targetPath,
      queryType,
      versionNumber,
      timestamp,
      historyLimit,
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-[10px] text-blue-400">
          Time Travel allows you to query previous versions of a Delta table or view the
          change history.
        </p>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Delta Table Path</label>
        <input
          type="text"
          value={targetPath}
          onChange={(e) => setTargetPath(e.target.value)}
          placeholder="s3://bucket/delta/table or /path/to/delta/table"
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Query Type</label>
        <select
          value={queryType}
          onChange={(e) => setQueryType(e.target.value)}
          className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
        >
          <option value="history">Show History</option>
          <option value="version">Read by Version</option>
          <option value="timestamp">Read by Timestamp</option>
          <option value="restore">Restore to Version</option>
        </select>
      </div>

      {queryType === 'history' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">History Limit</label>
          <input
            type="number"
            value={historyLimit}
            onChange={(e) => setHistoryLimit(parseInt(e.target.value))}
            min={1}
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
          />
        </div>
      )}

      {(queryType === 'version' || queryType === 'restore') && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Version Number</label>
          <input
            type="text"
            value={versionNumber}
            onChange={(e) => setVersionNumber(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
          />
        </div>
      )}

      {queryType === 'timestamp' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Timestamp</label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="2024-01-01 12:00:00"
            className="w-full px-3 py-2 bg-panel border border-gray-600 rounded text-sm text-white"
          />
          <p className="text-[10px] text-gray-500 mt-1">Format: YYYY-MM-DD HH:MM:SS</p>
        </div>
      )}

      {queryType === 'restore' && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-yellow-400">
            RESTORE will modify the current state of the table to match the specified version.
          </p>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );
};
