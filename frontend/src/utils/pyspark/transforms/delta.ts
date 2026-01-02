// Generate code for Delta Lake transforms (deltaMerge, deltaDelete, deltaUpdate, deltaOptimize, deltaVacuum, deltaHistory)
export const generateDeltaTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'deltaMerge': {
      const targetPath = config.targetPath as string || 'path/to/delta/table';
      const mergeConditions = config.mergeConditions as Array<{sourceColumn: string; targetColumn: string}> || [];
      const whenClauses = config.whenClauses as Array<{type: string; condition?: string; action: string}> || [];

      lines.push(`# Delta Lake MERGE (Upsert) operation`);
      lines.push(`from delta.tables import DeltaTable`);
      lines.push(``);
      lines.push(`# Load target Delta table`);
      lines.push(`target_table = DeltaTable.forPath(spark, "${targetPath}")`);
      lines.push(``);

      // Build merge condition
      const mergeCondStr = mergeConditions
        .filter(c => c.sourceColumn && c.targetColumn)
        .map(c => `source.${c.sourceColumn} = target.${c.targetColumn}`)
        .join(' AND ') || 'source.id = target.id';

      lines.push(`# Perform MERGE`);
      lines.push(`target_table.alias("target") \\`);
      lines.push(`    .merge(${inputVarName}.alias("source"), "${mergeCondStr}") \\`);

      // Add when clauses
      for (const clause of whenClauses) {
        const conditionStr = clause.condition ? `, "${clause.condition}"` : '';
        if (clause.type === 'matched') {
          if (clause.action === 'update_all') {
            lines.push(`    .whenMatchedUpdateAll(${conditionStr ? `condition=${conditionStr.substring(2)}` : ''}) \\`);
          } else if (clause.action === 'delete') {
            lines.push(`    .whenMatchedDelete(${conditionStr ? `condition=${conditionStr.substring(2)}` : ''}) \\`);
          }
        } else if (clause.type === 'not_matched') {
          if (clause.action === 'insert_all') {
            lines.push(`    .whenNotMatchedInsertAll(${conditionStr ? `condition=${conditionStr.substring(2)}` : ''}) \\`);
          }
        } else if (clause.type === 'not_matched_by_source') {
          if (clause.action === 'delete') {
            lines.push(`    .whenNotMatchedBySourceDelete(${conditionStr ? `condition=${conditionStr.substring(2)}` : ''}) \\`);
          } else if (clause.action === 'update_all') {
            lines.push(`    .whenNotMatchedBySourceUpdateAll(${conditionStr ? `condition=${conditionStr.substring(2)}` : ''}) \\`);
          }
        }
      }
      lines.push(`    .execute()`);
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # MERGE executed on target table`);
      return true;
    }

    case 'deltaDelete': {
      const targetPath = config.targetPath as string || 'path/to/delta/table';
      const deleteCondition = config.deleteCondition as string;

      lines.push(`# Delta Lake DELETE operation`);
      lines.push(`from delta.tables import DeltaTable`);
      lines.push(``);
      lines.push(`# Load target Delta table`);
      lines.push(`delta_table = DeltaTable.forPath(spark, "${targetPath}")`);
      lines.push(``);
      if (deleteCondition) {
        lines.push(`# Delete rows matching condition`);
        lines.push(`delta_table.delete("${deleteCondition}")`);
      } else {
        lines.push(`# WARNING: No condition specified - this would delete ALL rows`);
        lines.push(`# delta_table.delete()  # Uncomment to delete all rows`);
      }
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # DELETE executed on target table`);
      return true;
    }

    case 'deltaUpdate': {
      const targetPath = config.targetPath as string || 'path/to/delta/table';
      const updateCondition = config.updateCondition as string;
      const setClauses = config.setClauses as Array<{column: string; expression: string}> || [];

      lines.push(`# Delta Lake UPDATE operation`);
      lines.push(`from delta.tables import DeltaTable`);
      lines.push(``);
      lines.push(`# Load target Delta table`);
      lines.push(`delta_table = DeltaTable.forPath(spark, "${targetPath}")`);
      lines.push(``);

      // Build SET clause
      const setDict = setClauses
        .filter(c => c.column && c.expression)
        .map(c => `    "${c.column}": ${c.expression.includes("'") || c.expression.includes('(') ? c.expression : `"${c.expression}"`}`)
        .join(',\n');

      lines.push(`# Update rows matching condition`);
      if (updateCondition) {
        lines.push(`delta_table.update(`);
        lines.push(`    condition="${updateCondition}",`);
        lines.push(`    set={`);
        lines.push(setDict);
        lines.push(`    }`);
        lines.push(`)`);
      } else {
        lines.push(`delta_table.update(`);
        lines.push(`    set={`);
        lines.push(setDict);
        lines.push(`    }`);
        lines.push(`)`);
      }
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # UPDATE executed on target table`);
      return true;
    }

    case 'deltaOptimize': {
      const targetPath = config.targetPath as string || 'path/to/delta/table';
      const zOrderColumns = config.zOrderColumns as string;
      const whereClause = config.whereClause as string;

      lines.push(`# Delta Lake OPTIMIZE operation`);
      lines.push(`from delta.tables import DeltaTable`);
      lines.push(``);
      lines.push(`# Load target Delta table`);
      lines.push(`delta_table = DeltaTable.forPath(spark, "${targetPath}")`);
      lines.push(``);

      if (zOrderColumns) {
        const zOrderCols = zOrderColumns.split(',').map(c => `"${c.trim()}"`).join(', ');
        if (whereClause) {
          lines.push(`# Optimize with Z-ORDER (filtered)`);
          lines.push(`delta_table.optimize().where("${whereClause}").executeZOrderBy(${zOrderCols})`);
        } else {
          lines.push(`# Optimize with Z-ORDER`);
          lines.push(`delta_table.optimize().executeZOrderBy(${zOrderCols})`);
        }
      } else {
        if (whereClause) {
          lines.push(`# Optimize (file compaction, filtered)`);
          lines.push(`delta_table.optimize().where("${whereClause}").executeCompaction()`);
        } else {
          lines.push(`# Optimize (file compaction)`);
          lines.push(`delta_table.optimize().executeCompaction()`);
        }
      }
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # OPTIMIZE executed on target table`);
      return true;
    }

    case 'deltaVacuum': {
      const targetPath = config.targetPath as string || 'path/to/delta/table';
      const retentionHours = config.retentionHours as number || 168;
      const dryRun = config.dryRun as boolean ?? true;

      lines.push(`# Delta Lake VACUUM operation`);
      lines.push(`from delta.tables import DeltaTable`);
      lines.push(``);
      lines.push(`# Load target Delta table`);
      lines.push(`delta_table = DeltaTable.forPath(spark, "${targetPath}")`);
      lines.push(``);
      if (retentionHours < 168) {
        lines.push(`# WARNING: Retention < 7 days requires disabling safety check`);
        lines.push(`spark.conf.set("spark.databricks.delta.retentionDurationCheck.enabled", "false")`);
      }
      if (dryRun) {
        lines.push(`# Dry run - list files that would be deleted`);
        lines.push(`vacuum_result = delta_table.vacuum(${retentionHours / 24})  # ${retentionHours} hours`);
        lines.push(`print(f"Files to vacuum: {vacuum_result}")`);
      } else {
        lines.push(`# VACUUM - permanently delete old files`);
        lines.push(`delta_table.vacuum(${retentionHours / 24})  # ${retentionHours} hours`);
      }
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # VACUUM executed on target table`);
      return true;
    }

    case 'deltaHistory': {
      const targetPath = config.targetPath as string || 'path/to/delta/table';
      const queryType = config.queryType as string || 'history';
      const versionNumber = config.versionNumber as string;
      const timestamp = config.timestamp as string;
      const historyLimit = config.historyLimit as number || 10;

      lines.push(`# Delta Lake Time Travel`);
      lines.push(`from delta.tables import DeltaTable`);
      lines.push(``);

      switch (queryType) {
        case 'history':
          lines.push(`# View table history`);
          lines.push(`delta_table = DeltaTable.forPath(spark, "${targetPath}")`);
          lines.push(`${varName} = delta_table.history(${historyLimit})`);
          break;
        case 'version':
          lines.push(`# Read table at specific version`);
          lines.push(`${varName} = spark.read.format("delta") \\`);
          lines.push(`    .option("versionAsOf", ${versionNumber || 0}) \\`);
          lines.push(`    .load("${targetPath}")`);
          break;
        case 'timestamp':
          lines.push(`# Read table at specific timestamp`);
          lines.push(`${varName} = spark.read.format("delta") \\`);
          lines.push(`    .option("timestampAsOf", "${timestamp || '2024-01-01 00:00:00'}") \\`);
          lines.push(`    .load("${targetPath}")`);
          break;
        case 'restore':
          lines.push(`# Restore table to specific version`);
          lines.push(`delta_table = DeltaTable.forPath(spark, "${targetPath}")`);
          lines.push(`delta_table.restoreToVersion(${versionNumber || 0})`);
          lines.push(`${varName} = delta_table.toDF()`);
          break;
      }
      return true;
    }

    default:
      return false;
  }
};
