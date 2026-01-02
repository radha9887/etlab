// Helper for partitionBy and bucketBy
const addPartitionAndBucket = (config: Record<string, unknown>, lines: string[]): void => {
  if (config.partitionBy) {
    const partCols = (config.partitionBy as string).split(',').map(c => `"${c.trim()}"`).join(', ');
    lines.push(`    .partitionBy(${partCols}) \\`);
  }
  if (config.bucketBy && config.numBuckets) {
    const bucketCols = (config.bucketBy as string).split(',').map(c => `"${c.trim()}"`).join(', ');
    lines.push(`    .bucketBy(${config.numBuckets}, ${bucketCols}) \\`);
    if (config.sortBy) {
      const sortCols = (config.sortBy as string).split(',').map(c => `"${c.trim()}"`).join(', ');
      lines.push(`    .sortBy(${sortCols}) \\`);
    }
  }
};

// Generate code for lakehouse sinks (delta, iceberg, hudi)
export const generateLakehouseSinkCode = (
  sinkType: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  const mode = config.mode || 'overwrite';
  const path = config.path || 'path/to/output';

  switch (sinkType) {
    case 'delta': {
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("delta") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.mergeSchema) {
        lines.push(`    .option("mergeSchema", True) \\`);
      }
      if (config.overwriteSchema) {
        lines.push(`    .option("overwriteSchema", True) \\`);
      }
      if (config.replaceWhere) {
        lines.push(`    .option("replaceWhere", "${config.replaceWhere}") \\`);
      }
      if (config.userMetadata) {
        lines.push(`    .option("userMetadata", '${config.userMetadata}') \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);

      // Z-Order optimization (runs after write)
      if (config.enableZOrder && config.zOrderColumns) {
        lines.push('');
        lines.push(`# Z-Order optimization for faster queries`);
        const zOrderCols = (config.zOrderColumns as string).split(',').map(c => c.trim()).join(', ');
        if (config.optimizeWhere) {
          lines.push(`spark.sql("""`);
          lines.push(`    OPTIMIZE delta.\`${path}\``);
          lines.push(`    WHERE ${config.optimizeWhere}`);
          lines.push(`    ZORDER BY (${zOrderCols})`);
          lines.push(`""")`);
        } else {
          lines.push(`spark.sql("OPTIMIZE delta.\`${path}\` ZORDER BY (${zOrderCols})")`);
        }
      }
      return true;
    }

    case 'iceberg': {
      lines.push(`# Requires: iceberg-spark-runtime package`);
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("iceberg") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.mergeSchema) {
        lines.push(`    .option("merge-schema", True) \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path || 'catalog.db.table'}")`);
      return true;
    }

    case 'hudi': {
      lines.push(`# Requires: hudi-spark-bundle package`);
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("hudi") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.tableName) {
        lines.push(`    .option("hoodie.table.name", "${config.tableName}") \\`);
      }
      if (config.recordKeyField) {
        lines.push(`    .option("hoodie.datasource.write.recordkey.field", "${config.recordKeyField}") \\`);
      }
      if (config.precombineField) {
        lines.push(`    .option("hoodie.datasource.write.precombine.field", "${config.precombineField}") \\`);
      }
      if (config.operation) {
        lines.push(`    .option("hoodie.datasource.write.operation", "${config.operation}") \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path || 'path/to/hudi_table'}")`);
      return true;
    }

    default:
      return false;
  }
};
