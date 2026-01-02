// Generate code for performance transforms (repartition, cache, checkpoint, unpersist, explain, broadcast, coalesce, salt, aqe, sparkConfig, bucketing)
export const generatePerformanceTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'repartition': {
      const numPartitions = config.numPartitions as number || 10;
      const partitionMode = config.mode as string || 'repartition';
      const partitionCols = config.partitionBy as string;

      if (partitionMode === 'coalesce') {
        lines.push(`${varName} = ${inputVarName}.coalesce(${numPartitions})`);
      } else {
        if (partitionCols) {
          const cols = partitionCols.split(',').map(c => `"${c.trim()}"`).join(', ');
          lines.push(`${varName} = ${inputVarName}.repartition(${numPartitions}, ${cols})`);
        } else {
          lines.push(`${varName} = ${inputVarName}.repartition(${numPartitions})`);
        }
      }
      return true;
    }

    case 'cache': {
      const storageLevel = config.storageLevel as string || 'MEMORY_AND_DISK';
      if (storageLevel === 'MEMORY_AND_DISK') {
        lines.push(`${varName} = ${inputVarName}.cache()`);
      } else {
        lines.push(`from pyspark import StorageLevel`);
        lines.push(`${varName} = ${inputVarName}.persist(StorageLevel.${storageLevel})`);
      }
      return true;
    }

    case 'checkpoint': {
      const checkpointType = config.checkpointType as string || 'reliable';
      const eager = config.eager !== false;

      if (checkpointType === 'local') {
        lines.push(`# Local checkpoint (faster, not fault-tolerant)`);
        lines.push(`${varName} = ${inputVarName}.localCheckpoint(eager=${eager ? 'True' : 'False'})`);
      } else {
        lines.push(`# Reliable checkpoint (requires checkpoint directory configured)`);
        lines.push(`# spark.sparkContext.setCheckpointDir("path/to/checkpoint")`);
        lines.push(`${varName} = ${inputVarName}.checkpoint(eager=${eager ? 'True' : 'False'})`);
      }
      return true;
    }

    case 'unpersist': {
      const blocking = config.blocking !== false;
      lines.push(`# Remove DataFrame from cache/storage`);
      lines.push(`${inputVarName}.unpersist(blocking=${blocking ? 'True' : 'False'})`);
      lines.push(`${varName} = ${inputVarName}`);
      return true;
    }

    case 'explain': {
      const explainMode = config.mode as string || 'formatted';
      lines.push(`# Show execution plan for debugging`);
      if (explainMode === 'simple') {
        lines.push(`${inputVarName}.explain()`);
      } else {
        lines.push(`${inputVarName}.explain(mode="${explainMode}")`);
      }
      lines.push(`${varName} = ${inputVarName}`);
      return true;
    }

    case 'broadcast': {
      const enabled = config.enabled !== false;
      if (enabled) {
        lines.push(`# Mark DataFrame for broadcast in joins`);
        lines.push(`${varName} = broadcast(${inputVarName})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Broadcast hint disabled`);
      }
      return true;
    }

    case 'coalesce': {
      const numPartitions = config.numPartitions as number || 1;
      lines.push(`# Reduce partitions without shuffle`);
      lines.push(`${varName} = ${inputVarName}.coalesce(${numPartitions})`);
      return true;
    }

    case 'salt': {
      const column = config.column as string || 'key';
      const saltBuckets = config.saltBuckets as number || 10;
      const saltColumnName = config.saltColumnName as string || 'salted_key';
      const includeOriginal = config.includeOriginal !== false;

      lines.push(`# Salt column for skew handling`);
      lines.push(`SALT_BUCKETS = ${saltBuckets}`);
      if (includeOriginal) {
        lines.push(`${varName} = ${inputVarName}.withColumn(`);
        lines.push(`    "${saltColumnName}",`);
        lines.push(`    F.concat(`);
        lines.push(`        F.col("${column}"),`);
        lines.push(`        F.lit("_"),`);
        lines.push(`        (F.rand() * SALT_BUCKETS).cast("int").cast("string")`);
        lines.push(`    )`);
        lines.push(`)`);
      } else {
        lines.push(`${varName} = ${inputVarName}.withColumn(`);
        lines.push(`    "${saltColumnName}",`);
        lines.push(`    F.concat(`);
        lines.push(`        F.col("${column}"),`);
        lines.push(`        F.lit("_"),`);
        lines.push(`        (F.rand() * SALT_BUCKETS).cast("int").cast("string")`);
        lines.push(`    )`);
        lines.push(`).drop("${column}")`);
      }
      return true;
    }

    case 'aqe': {
      const enabled = config.enabled !== false;
      const coalescePartitions = config.coalescePartitions !== false;
      const skewJoin = config.skewJoin !== false;
      const skewedPartitionFactor = config.skewedPartitionFactor as number || 5;
      const skewedPartitionThreshold = config.skewedPartitionThreshold as string || '256m';
      const broadcastThreshold = config.broadcastThreshold as number || 10;
      const localShuffleReader = config.localShuffleReader !== false;

      lines.push(`# Adaptive Query Execution (AQE) Configuration`);
      lines.push(`spark.conf.set("spark.sql.adaptive.enabled", "${enabled}")`);
      if (enabled) {
        lines.push(`spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "${coalescePartitions}")`);
        lines.push(`spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "${skewJoin}")`);
        if (skewJoin) {
          lines.push(`spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "${skewedPartitionFactor}")`);
          lines.push(`spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "${skewedPartitionThreshold}")`);
        }
        lines.push(`spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "${broadcastThreshold * 1024 * 1024}")`);
        lines.push(`spark.conf.set("spark.sql.adaptive.localShuffleReader.enabled", "${localShuffleReader}")`);
      }
      lines.push(`${varName} = ${inputVarName}  # AQE config applied to SparkSession`);
      return true;
    }

    case 'sparkConfig': {
      const executorMemory = config.executorMemory as string || '4g';
      const driverMemory = config.driverMemory as string || '2g';
      const executorCores = config.executorCores as number || 4;
      const numExecutors = config.numExecutors as number || 2;
      const shufflePartitions = config.shufflePartitions as number || 200;
      const broadcastThreshold = config.broadcastThreshold as number || 10;
      const dynamicAllocation = config.dynamicAllocation as boolean ?? false;
      const minExecutors = config.minExecutors as number || 1;
      const maxExecutors = config.maxExecutors as number || 10;
      const initialExecutors = config.initialExecutors as number || 2;
      const compression = config.compression as string || 'snappy';
      const serializer = config.serializer as string || 'org.apache.spark.serializer.KryoSerializer';
      const kryoRegistrationRequired = config.kryoRegistrationRequired as boolean ?? false;
      const adaptiveEnabled = config.adaptiveEnabled as boolean ?? true;
      const arrowEnabled = config.arrowEnabled as boolean ?? true;
      const customConfigs = config.customConfigs as Array<{key: string; value: string}> || [];

      lines.push(`# Spark Session Configuration`);
      lines.push(`# Note: These should be set when creating SparkSession or via spark-submit`);
      lines.push(``);
      lines.push(`# Memory Configuration`);
      lines.push(`spark.conf.set("spark.executor.memory", "${executorMemory}")`);
      lines.push(`spark.conf.set("spark.driver.memory", "${driverMemory}")`);
      lines.push(`spark.conf.set("spark.executor.cores", "${executorCores}")`);
      if (!dynamicAllocation) {
        lines.push(`spark.conf.set("spark.executor.instances", "${numExecutors}")`);
      }
      lines.push(``);
      lines.push(`# Shuffle Configuration`);
      lines.push(`spark.conf.set("spark.sql.shuffle.partitions", "${shufflePartitions}")`);
      lines.push(`spark.conf.set("spark.sql.autoBroadcastJoinThreshold", "${broadcastThreshold * 1024 * 1024}")`);
      lines.push(``);

      if (dynamicAllocation) {
        lines.push(`# Dynamic Allocation`);
        lines.push(`spark.conf.set("spark.dynamicAllocation.enabled", "true")`);
        lines.push(`spark.conf.set("spark.dynamicAllocation.minExecutors", "${minExecutors}")`);
        lines.push(`spark.conf.set("spark.dynamicAllocation.maxExecutors", "${maxExecutors}")`);
        lines.push(`spark.conf.set("spark.dynamicAllocation.initialExecutors", "${initialExecutors}")`);
        lines.push(`spark.conf.set("spark.shuffle.service.enabled", "true")`);
        lines.push(``);
      }

      lines.push(`# Compression`);
      lines.push(`spark.conf.set("spark.sql.parquet.compression.codec", "${compression}")`);
      lines.push(`spark.conf.set("spark.io.compression.codec", "${compression}")`);
      lines.push(``);

      lines.push(`# Serialization`);
      lines.push(`spark.conf.set("spark.serializer", "${serializer}")`);
      if (serializer.includes('Kryo')) {
        lines.push(`spark.conf.set("spark.kryo.registrationRequired", "${kryoRegistrationRequired}")`);
      }
      lines.push(``);

      lines.push(`# Additional Settings`);
      lines.push(`spark.conf.set("spark.sql.adaptive.enabled", "${adaptiveEnabled}")`);
      lines.push(`spark.conf.set("spark.sql.execution.arrow.pyspark.enabled", "${arrowEnabled}")`);

      if (customConfigs.length > 0) {
        lines.push(``);
        lines.push(`# Custom Configurations`);
        customConfigs.forEach(cfg => {
          if (cfg.key && cfg.value) {
            lines.push(`spark.conf.set("${cfg.key}", "${cfg.value}")`);
          }
        });
      }

      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # Spark config applied`);
      return true;
    }

    case 'bucketing': {
      const numBuckets = config.numBuckets as number || 32;
      const bucketColumns = config.bucketColumns as string[] || [];
      const sortColumns = config.sortColumns as string[] || [];
      const enableSort = config.enableSort as boolean ?? false;
      const tableName = config.tableName as string || 'bucketed_table';
      const outputFormat = config.outputFormat as string || 'parquet';
      const mode = config.mode as string || 'overwrite';

      lines.push(`# Bucketing - Write data with pre-shuffle optimization`);
      lines.push(`# Note: Bucketing requires saveAsTable (not save to path)`);
      lines.push(``);

      if (bucketColumns.length === 0) {
        lines.push(`# WARNING: No bucket columns specified`);
        lines.push(`${varName} = ${inputVarName}`);
      } else {
        const bucketCols = bucketColumns.map(c => `"${c}"`).join(', ');

        lines.push(`${inputVarName}.write \\`);
        lines.push(`    .format("${outputFormat}") \\`);
        lines.push(`    .mode("${mode}") \\`);
        lines.push(`    .bucketBy(${numBuckets}, ${bucketCols}) \\`);

        if (enableSort && sortColumns.length > 0) {
          const sortCols = sortColumns.map(c => `"${c}"`).join(', ');
          lines.push(`    .sortBy(${sortCols}) \\`);
        }

        lines.push(`    .saveAsTable("${tableName}")`);
        lines.push(``);
        lines.push(`# Read back the bucketed table`);
        lines.push(`${varName} = spark.table("${tableName}")`);
        lines.push(``);
        lines.push(`# Tip: Joins on bucket columns will avoid shuffle`);
        lines.push(`# e.g., df1.join(df2, [${bucketCols}]) - no shuffle if both are bucketed`);
      }
      return true;
    }

    default:
      return false;
  }
};
