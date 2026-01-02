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

// Generate code for file-based sinks (csv, parquet, json, orc, avro, text, xml)
export const generateFileSinkCode = (
  sinkType: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  const mode = config.mode || 'overwrite';
  const path = config.path || 'path/to/output';

  switch (sinkType) {
    case 'csv': {
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("csv") \\`);
      lines.push(`    .mode("${mode}") \\`);
      lines.push(`    .option("header", ${config.header !== false ? 'True' : 'False'}) \\`);
      if (config.delimiter && config.delimiter !== ',') {
        lines.push(`    .option("sep", "${config.delimiter}") \\`);
      }
      if (config.quote && config.quote !== '"') {
        lines.push(`    .option("quote", "${config.quote}") \\`);
      }
      if (config.escape) {
        lines.push(`    .option("escape", "${config.escape}") \\`);
      }
      if (config.nullValue) {
        lines.push(`    .option("nullValue", "${config.nullValue}") \\`);
      }
      if (config.dateFormat) {
        lines.push(`    .option("dateFormat", "${config.dateFormat}") \\`);
      }
      if (config.timestampFormat) {
        lines.push(`    .option("timestampFormat", "${config.timestampFormat}") \\`);
      }
      if (config.compression && config.compression !== 'none') {
        lines.push(`    .option("compression", "${config.compression}") \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    case 'parquet': {
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("parquet") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.compression && config.compression !== 'snappy') {
        lines.push(`    .option("compression", "${config.compression}") \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    case 'json': {
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("json") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.dateFormat) {
        lines.push(`    .option("dateFormat", "${config.dateFormat}") \\`);
      }
      if (config.timestampFormat) {
        lines.push(`    .option("timestampFormat", "${config.timestampFormat}") \\`);
      }
      if (config.compression && config.compression !== 'none') {
        lines.push(`    .option("compression", "${config.compression}") \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    case 'orc': {
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("orc") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.compression && config.compression !== 'snappy') {
        lines.push(`    .option("compression", "${config.compression}") \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    case 'avro': {
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("avro") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.compression && config.compression !== 'snappy') {
        lines.push(`    .option("compression", "${config.compression}") \\`);
      }
      if (config.avroSchema) {
        lines.push(`    .option("avroSchema", '''${config.avroSchema}''') \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    case 'text': {
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("text") \\`);
      lines.push(`    .mode("${mode}") \\`);
      if (config.lineSep && config.lineSep !== '\\n') {
        lines.push(`    .option("lineSep", "${config.lineSep}") \\`);
      }
      if (config.compression && config.compression !== 'none') {
        lines.push(`    .option("compression", "${config.compression}") \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    case 'xml': {
      lines.push(`# Requires: spark-xml package`);
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("xml") \\`);
      lines.push(`    .mode("${mode}") \\`);
      lines.push(`    .option("rowTag", "${config.rowTag || 'row'}") \\`);
      if (config.rootTag) {
        lines.push(`    .option("rootTag", "${config.rootTag}") \\`);
      }
      if (config.nullValue) {
        lines.push(`    .option("nullValue", "${config.nullValue}") \\`);
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    default:
      return false;
  }
};
