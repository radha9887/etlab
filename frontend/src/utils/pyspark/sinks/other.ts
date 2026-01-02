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

// Generate code for other sinks (custom, redis, neo4j, console)
export const generateOtherSinkCode = (
  sinkType: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  const mode = config.mode || 'overwrite';
  const path = config.path || 'path/to/output';

  switch (sinkType) {
    case 'custom': {
      const formatName = config.format || 'custom_format';
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("${formatName}") \\`);
      lines.push(`    .mode("${mode}") \\`);

      // Parse custom options JSON
      if (config.customOptions) {
        try {
          const opts = JSON.parse(config.customOptions as string);
          Object.entries(opts).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
              lines.push(`    .option("${key}", ${value ? 'True' : 'False'}) \\`);
            } else if (typeof value === 'number') {
              lines.push(`    .option("${key}", ${value}) \\`);
            } else {
              lines.push(`    .option("${key}", "${value}") \\`);
            }
          });
        } catch (e) {
          lines.push(`    # Error parsing custom options JSON`);
        }
      }
      addPartitionAndBucket(config, lines);
      lines.push(`    .save("${path}")`);
      return true;
    }

    case 'redis': {
      lines.push(`# Redis Sink`);
      lines.push(`# Note: Requires spark-redis package`);
      const redisHost = config.host || 'localhost';
      const redisPort = config.port || 6379;
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("org.apache.spark.sql.redis") \\`);
      lines.push(`    .mode("${mode}") \\`);
      lines.push(`    .option("host", "${redisHost}") \\`);
      lines.push(`    .option("port", ${redisPort}) \\`);
      if (config.dbIndex) {
        lines.push(`    .option("dbNum", ${config.dbIndex}) \\`);
      }
      if (config.keyColumn) {
        lines.push(`    .option("key.column", "${config.keyColumn}") \\`);
      }
      if (config.keyPrefix) {
        lines.push(`    .option("table", "${config.keyPrefix}") \\`);
      }
      if (config.dataType) {
        lines.push(`    .option("model", "${config.dataType}") \\`);
      }
      if (config.password) {
        lines.push(`    .option("auth", "${config.password}") \\`);
      }
      if (config.useSsl) {
        lines.push(`    .option("ssl", True) \\`);
      }
      if (config.ttl) {
        lines.push(`    .option("ttl", ${config.ttl}) \\`);
      }
      lines.push(`    .save()`);
      return true;
    }

    case 'neo4j': {
      lines.push(`# Neo4j Graph Database Sink`);
      lines.push(`# Note: Requires neo4j-spark-connector package`);
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("org.neo4j.spark.DataSource") \\`);
      lines.push(`    .mode("${config.saveMode || mode}") \\`);
      lines.push(`    .option("url", "${config.uri || 'bolt://localhost:7687'}") \\`);
      if (config.database) {
        lines.push(`    .option("database", "${config.database}") \\`);
      }
      if (config.username) {
        lines.push(`    .option("authentication.basic.username", "${config.username}") \\`);
      }
      if (config.password) {
        lines.push(`    .option("authentication.basic.password", "${config.password}") \\`);
      }
      if (config.writeRelationship) {
        lines.push(`    .option("relationship", "${config.relationshipType || 'RELATES_TO'}") \\`);
        if (config.sourceNodeLabel) {
          lines.push(`    .option("relationship.source.labels", ":${config.sourceNodeLabel}") \\`);
        }
        if (config.targetNodeLabel) {
          lines.push(`    .option("relationship.target.labels", ":${config.targetNodeLabel}") \\`);
        }
      } else {
        if (config.labels) {
          lines.push(`    .option("labels", ":${(config.labels as string).replace(/,\s*/g, ':')}") \\`);
        }
        if (config.nodeKeys) {
          lines.push(`    .option("node.keys", "${config.nodeKeys}") \\`);
        }
      }
      if (config.batchSize) {
        lines.push(`    .option("batch.size", ${config.batchSize}) \\`);
      }
      if (config.encrypted === false) {
        lines.push(`    .option("encryption.enabled", False) \\`);
      }
      lines.push(`    .save()`);
      return true;
    }

    case 'console': {
      const numRows = config.numRows || 20;
      const truncate = config.truncate !== false;
      lines.push(`${inputVarName}.show(${numRows}, ${truncate ? 'True' : 'False'})`);
      return true;
    }

    default:
      return false;
  }
};
