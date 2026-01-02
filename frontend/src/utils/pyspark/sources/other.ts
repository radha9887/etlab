// Generate code for other sources (s3, custom, redis, neo4j)
export const generateOtherSourceCode = (
  sourceType: string,
  varName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (sourceType) {
    case 's3': {
      const fileFormat = config.fileFormat || 'parquet';
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("${fileFormat}") \\`);
      if (config.pathGlobFilter) {
        lines.push(`    .option("pathGlobFilter", "${config.pathGlobFilter}") \\`);
      }
      if (config.recursiveFileLookup) {
        lines.push(`    .option("recursiveFileLookup", True) \\`);
      }
      lines.push(`    .load("${config.path || 's3://bucket/path/'}")`);
      return true;
    }

    case 'custom': {
      const formatName = config.format || 'custom_format';
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("${formatName}") \\`);

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

      if (config.ddlSchema) {
        lines.push(`    .schema("${config.ddlSchema}") \\`);
      }
      lines.push(`    .load("${config.path || 'path/to/data'}")`);
      return true;
    }

    case 'redis': {
      lines.push(`# Redis Source`);
      lines.push(`# Note: Requires spark-redis package`);
      const redisHost = config.host || 'localhost';
      const redisPort = config.port || 6379;
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("org.apache.spark.sql.redis") \\`);
      lines.push(`    .option("host", "${redisHost}") \\`);
      lines.push(`    .option("port", ${redisPort}) \\`);
      if (config.dbIndex) {
        lines.push(`    .option("dbNum", ${config.dbIndex}) \\`);
      }
      if (config.keyPattern) {
        lines.push(`    .option("keys.pattern", "${config.keyPattern}") \\`);
      }
      if (config.dataType) {
        lines.push(`    .option("table", "${config.dataType}") \\`);
      }
      if (config.password) {
        lines.push(`    .option("auth", "${config.password}") \\`);
      }
      if (config.useSsl) {
        lines.push(`    .option("ssl", True) \\`);
      }
      if (config.scanCount) {
        lines.push(`    .option("scan.count", ${config.scanCount}) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    case 'neo4j': {
      lines.push(`# Neo4j Graph Database Source`);
      lines.push(`# Note: Requires neo4j-spark-connector package`);
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("org.neo4j.spark.DataSource") \\`);
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
      if (config.queryType === 'labels' && config.labels) {
        lines.push(`    .option("labels", "${config.labels}") \\`);
      } else if (config.queryType === 'relationship' && config.relationshipType) {
        lines.push(`    .option("relationship", "${config.relationshipType}") \\`);
      } else if (config.query) {
        lines.push(`    .option("query", """${config.query}""") \\`);
      }
      if (config.partitionSize) {
        lines.push(`    .option("partitions", ${config.partitionSize}) \\`);
      }
      if (config.encrypted === false) {
        lines.push(`    .option("encryption.enabled", False) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    default:
      return false;
  }
};
