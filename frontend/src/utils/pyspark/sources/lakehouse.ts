// Generate code for lakehouse sources (delta, iceberg, hudi)
export const generateLakehouseSourceCode = (
  sourceType: string,
  varName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (sourceType) {
    case 'delta': {
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("delta") \\`);
      if (config.timeTravelMode === 'version' && config.versionAsOf !== undefined) {
        lines.push(`    .option("versionAsOf", ${config.versionAsOf}) \\`);
      } else if (config.timeTravelMode === 'timestamp' && config.timestampAsOf) {
        lines.push(`    .option("timestampAsOf", "${config.timestampAsOf}") \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/delta'}")`);
      return true;
    }

    case 'iceberg': {
      lines.push(`# Requires: iceberg-spark-runtime package`);
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("iceberg") \\`);
      if (config.snapshotMode === 'snapshotId' && config.snapshotId) {
        lines.push(`    .option("snapshot-id", ${config.snapshotId}) \\`);
      } else if (config.snapshotMode === 'timestamp' && config.asOfTimestamp) {
        lines.push(`    .option("as-of-timestamp", "${config.asOfTimestamp}") \\`);
      }
      lines.push(`    .load("${config.path || 'catalog.db.table'}")`);
      return true;
    }

    case 'hudi': {
      lines.push(`# Requires: hudi-spark-bundle package`);
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("hudi") \\`);
      if (config.queryType === 'incremental') {
        lines.push(`    .option("hoodie.datasource.query.type", "incremental") \\`);
        if (config.beginInstantTime) {
          lines.push(`    .option("hoodie.datasource.read.begin.instanttime", "${config.beginInstantTime}") \\`);
        }
        if (config.endInstantTime) {
          lines.push(`    .option("hoodie.datasource.read.end.instanttime", "${config.endInstantTime}") \\`);
        }
      } else if (config.queryType === 'read_optimized') {
        lines.push(`    .option("hoodie.datasource.query.type", "read_optimized") \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/hudi_table'}")`);
      return true;
    }

    default:
      return false;
  }
};
