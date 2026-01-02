// Generate code for database sources (jdbc, snowflake, bigquery, redshift)
export const generateDatabaseSourceCode = (
  sourceType: string,
  varName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (sourceType) {
    case 'jdbc': {
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("jdbc") \\`);
      lines.push(`    .option("url", "${config.url || 'jdbc:postgresql://host:5432/db'}") \\`);
      lines.push(`    .option("dbtable", "${config.dbtable || 'table_name'}") \\`);
      lines.push(`    .option("user", "${config.user || 'user'}") \\`);
      lines.push(`    .option("password", "${config.password || '****'}") \\`);
      if (config.driver) {
        lines.push(`    .option("driver", "${config.driver}") \\`);
      }
      if (config.partitionColumn) {
        lines.push(`    .option("partitionColumn", "${config.partitionColumn}") \\`);
        if (config.lowerBound !== undefined) {
          lines.push(`    .option("lowerBound", ${config.lowerBound}) \\`);
        }
        if (config.upperBound !== undefined) {
          lines.push(`    .option("upperBound", ${config.upperBound}) \\`);
        }
        if (config.numPartitions) {
          lines.push(`    .option("numPartitions", ${config.numPartitions}) \\`);
        }
      }
      if (config.fetchsize) {
        lines.push(`    .option("fetchsize", ${config.fetchsize}) \\`);
      }
      if (config.queryTimeout) {
        lines.push(`    .option("queryTimeout", ${config.queryTimeout}) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    case 'snowflake': {
      lines.push(`# Snowflake connection options`);
      lines.push(`sf_options = {`);
      lines.push(`    "sfURL": "${config.sfAccount || 'account'}.snowflakecomputing.com",`);
      lines.push(`    "sfUser": "${config.sfUser || 'user'}",`);
      lines.push(`    "sfPassword": "${config.sfPassword || '****'}",`);
      lines.push(`    "sfDatabase": "${config.sfDatabase || 'database'}",`);
      lines.push(`    "sfSchema": "${config.sfSchema || 'PUBLIC'}",`);
      lines.push(`    "sfWarehouse": "${config.sfWarehouse || 'COMPUTE_WH'}",`);
      if (config.sfRole) {
        lines.push(`    "sfRole": "${config.sfRole}",`);
      }
      lines.push(`    "dbtable": "${config.dbtable || 'table_name'}",`);
      lines.push(`}`);
      lines.push(``);
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("snowflake") \\`);
      lines.push(`    .options(**sf_options) \\`);
      lines.push(`    .load()`);
      return true;
    }

    case 'bigquery': {
      const tableRef = config.table
        ? `${config.project || 'project'}.${config.dataset || 'dataset'}.${config.table}`
        : config.path || 'project.dataset.table';
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("bigquery") \\`);
      lines.push(`    .option("table", "${tableRef}") \\`);
      if (config.credentialsFile) {
        lines.push(`    .option("credentialsFile", "${config.credentialsFile}") \\`);
      }
      if (config.filter) {
        lines.push(`    .option("filter", "${config.filter}") \\`);
      }
      if (config.readDataFormat) {
        lines.push(`    .option("readDataFormat", "${config.readDataFormat}") \\`);
      }
      if (config.maxParallelism) {
        lines.push(`    .option("maxParallelism", ${config.maxParallelism}) \\`);
      }
      if (config.viewsEnabledBool) {
        lines.push(`    .option("viewsEnabled", True) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    case 'redshift': {
      lines.push(`# Redshift connection (uses spark-redshift connector)`);
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("io.github.spark_redshift_community.spark.redshift") \\`);
      lines.push(`    .option("url", "${config.url || 'jdbc:redshift://cluster:5439/database'}") \\`);
      lines.push(`    .option("dbtable", "${config.dbtable || 'schema.table'}") \\`);
      lines.push(`    .option("tempdir", "${config.tempdir || 's3://bucket/temp/'}") \\`);
      if (config.user) {
        lines.push(`    .option("user", "${config.user}") \\`);
      }
      if (config.password) {
        lines.push(`    .option("password", "${config.password}") \\`);
      }
      if (config.iamRole) {
        lines.push(`    .option("aws_iam_role", "${config.iamRole}") \\`);
      }
      if (config.forwardSparkS3Credentials === 'true') {
        lines.push(`    .option("forward_spark_s3_credentials", True) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    default:
      return false;
  }
};
