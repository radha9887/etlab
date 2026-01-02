// Generate code for database sinks (jdbc, snowflake, bigquery, redshift)
export const generateDatabaseSinkCode = (
  sinkType: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  const mode = config.mode || 'overwrite';
  const path = config.path || 'path/to/output';

  switch (sinkType) {
    case 'jdbc': {
      lines.push(`# JDBC connection properties`);
      lines.push(`jdbc_props = {`);
      lines.push(`    "user": "${config.user || 'user'}",`);
      lines.push(`    "password": "${config.password || '****'}",`);
      if (config.batchsize) {
        lines.push(`    "batchsize": "${config.batchsize}",`);
      }
      if (config.isolationLevel && config.isolationLevel !== 'READ_UNCOMMITTED') {
        lines.push(`    "isolationLevel": "${config.isolationLevel}",`);
      }
      if (config.truncate) {
        lines.push(`    "truncate": "true",`);
      }
      if (config.createTableOptions) {
        lines.push(`    "createTableOptions": "${config.createTableOptions}",`);
      }
      lines.push(`}`);
      lines.push(``);
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .mode("${mode}") \\`);
      lines.push(`    .jdbc(`);
      lines.push(`        url="${config.url || 'jdbc:postgresql://host:5432/db'}",`);
      lines.push(`        table="${config.dbtable || 'table_name'}",`);
      lines.push(`        properties=jdbc_props`);
      lines.push(`    )`);
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
      if (config.preActions) {
        lines.push(`# Pre-write SQL actions`);
        lines.push(`# ${config.preActions}`);
      }
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("snowflake") \\`);
      lines.push(`    .mode("${mode}") \\`);
      lines.push(`    .options(**sf_options) \\`);
      lines.push(`    .save()`);
      if (config.postActions) {
        lines.push(`# Post-write SQL actions`);
        lines.push(`# ${config.postActions}`);
      }
      return true;
    }

    case 'bigquery': {
      const tableRef = config.table
        ? `${config.project || 'project'}.${config.dataset || 'dataset'}.${config.table}`
        : path || 'project.dataset.table';
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("bigquery") \\`);
      lines.push(`    .mode("${mode}") \\`);
      lines.push(`    .option("table", "${tableRef}") \\`);
      if (config.temporaryGcsBucket) {
        lines.push(`    .option("temporaryGcsBucket", "${config.temporaryGcsBucket}") \\`);
      }
      if (config.credentialsFile) {
        lines.push(`    .option("credentialsFile", "${config.credentialsFile}") \\`);
      }
      if (config.writeDisposition) {
        lines.push(`    .option("writeDisposition", "${config.writeDisposition}") \\`);
      }
      if (config.createDisposition) {
        lines.push(`    .option("createDisposition", "${config.createDisposition}") \\`);
      }
      if (config.partitionField) {
        lines.push(`    .option("partitionField", "${config.partitionField}") \\`);
        if (config.partitionType) {
          lines.push(`    .option("partitionType", "${config.partitionType}") \\`);
        }
      }
      if (config.clusteringFields) {
        lines.push(`    .option("clusteredFields", "${config.clusteringFields}") \\`);
      }
      if (config.allowFieldAddition) {
        lines.push(`    .option("allowFieldAddition", True) \\`);
      }
      if (config.allowFieldRelaxation) {
        lines.push(`    .option("allowFieldRelaxation", True) \\`);
      }
      lines.push(`    .save()`);
      return true;
    }

    case 'redshift': {
      lines.push(`# Redshift connection (uses spark-redshift connector)`);
      lines.push(`${inputVarName}.write \\`);
      lines.push(`    .format("io.github.spark_redshift_community.spark.redshift") \\`);
      lines.push(`    .mode("${mode}") \\`);
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
      if (config.preActionsSql) {
        lines.push(`    .option("preactions", "${(config.preActionsSql as string).replace(/"/g, '\\"')}") \\`);
      }
      if (config.postActionsSql) {
        lines.push(`    .option("postactions", "${(config.postActionsSql as string).replace(/"/g, '\\"')}") \\`);
      }
      lines.push(`    .save()`);
      return true;
    }

    default:
      return false;
  }
};
