// Generate code for streaming sinks (kafka)
export const generateStreamingSinkCode = (
  sinkType: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (sinkType) {
    case 'kafka': {
      lines.push(`${inputVarName}`);
      if (config.keyColumn) {
        lines.push(`    .withColumn("key", col("${config.keyColumn}").cast("string"))`);
      }
      if (config.valueColumn) {
        lines.push(`    .withColumn("value", col("${config.valueColumn}").cast("string"))`);
      } else {
        lines.push(`    .withColumn("value", to_json(struct(*)))`);
      }
      lines.push(`    .write \\`);
      lines.push(`    .format("kafka") \\`);
      lines.push(`    .option("kafka.bootstrap.servers", "${config.bootstrapServers || 'localhost:9092'}") \\`);
      lines.push(`    .option("topic", "${config.topic || 'topic'}") \\`);
      lines.push(`    .save()`);
      return true;
    }

    default:
      return false;
  }
};
