// Generate code for streaming transforms (watermark, streamingWindow, streamingTrigger, foreachBatch)
export const generateStreamingTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'watermark': {
      const eventTimeColumn = config.eventTimeColumn as string || 'event_time';
      const delayThreshold = config.delayThreshold as string || '10 seconds';

      lines.push(`# Streaming Watermark - handle late data`);
      lines.push(`${varName} = ${inputVarName}.withWatermark("${eventTimeColumn}", "${delayThreshold}")`);
      return true;
    }

    case 'streamingWindow': {
      const windowType = config.windowType as string || 'tumbling';
      const timeColumn = config.timeColumn as string || 'event_time';
      const windowDuration = config.windowDuration as string || '10 minutes';
      const slideDuration = config.slideDuration as string || '5 minutes';
      const sessionGap = config.sessionGap as string || '10 minutes';
      const startTime = config.startTime as string;
      const groupByColumns = config.groupByColumns as string[] || [];
      const aggregations = config.aggregations as Array<{column: string; function: string; alias: string}> || [];

      lines.push(`# Streaming Window Aggregation`);
      lines.push(`from pyspark.sql.functions import window, col, count, sum, avg, min, max, first, last`);
      lines.push(``);

      // Build window expression based on type
      let windowExpr = '';
      if (windowType === 'tumbling') {
        if (startTime) {
          windowExpr = `window(col("${timeColumn}"), "${windowDuration}", startTime="${startTime}")`;
        } else {
          windowExpr = `window(col("${timeColumn}"), "${windowDuration}")`;
        }
      } else if (windowType === 'sliding') {
        if (startTime) {
          windowExpr = `window(col("${timeColumn}"), "${windowDuration}", "${slideDuration}", startTime="${startTime}")`;
        } else {
          windowExpr = `window(col("${timeColumn}"), "${windowDuration}", "${slideDuration}")`;
        }
      } else if (windowType === 'session') {
        lines.push(`from pyspark.sql.functions import session_window`);
        windowExpr = `session_window(col("${timeColumn}"), "${sessionGap}")`;
      }

      // Build group by columns
      const groupByCols = groupByColumns.map(c => `col("${c}")`).join(', ');

      // Build aggregation expressions
      const aggExprs = aggregations.map(agg => {
        const col_expr = agg.column === '*' ? '*' : `"${agg.column}"`;
        const alias = agg.alias || `${agg.function}_${agg.column}`;
        if (agg.function === 'count' && agg.column === '*') {
          return `count("*").alias("${alias}")`;
        }
        return `${agg.function}(${col_expr === '*' ? '"*"' : `col(${col_expr})`}).alias("${alias}")`;
      });

      if (groupByColumns.length > 0) {
        lines.push(`${varName} = ${inputVarName} \\`);
        lines.push(`    .groupBy(${windowExpr}, ${groupByCols}) \\`);
      } else {
        lines.push(`${varName} = ${inputVarName} \\`);
        lines.push(`    .groupBy(${windowExpr}) \\`);
      }

      if (aggExprs.length > 0) {
        lines.push(`    .agg(${aggExprs.join(', ')})`);
      } else {
        lines.push(`    .count()`);
      }
      return true;
    }

    case 'streamingTrigger': {
      const triggerType = config.triggerType as string || 'processingTime';
      const processingTime = config.processingTime as string || '10 seconds';
      const continuousInterval = config.continuousInterval as string || '1 second';

      lines.push(`# Streaming Trigger Configuration`);
      lines.push(`# Note: Apply this trigger when starting the streaming query`);
      lines.push(``);

      switch (triggerType) {
        case 'processingTime':
          lines.push(`# Micro-batch processing`);
          lines.push(`trigger_config = {"processingTime": "${processingTime}"}`);
          lines.push(`# Usage: query = df.writeStream.trigger(**trigger_config).start()`);
          break;
        case 'once':
          lines.push(`# Single batch execution`);
          lines.push(`trigger_config = {"once": True}`);
          lines.push(`# Usage: query = df.writeStream.trigger(**trigger_config).start()`);
          break;
        case 'availableNow':
          lines.push(`# Process all available data then stop`);
          lines.push(`trigger_config = {"availableNow": True}`);
          lines.push(`# Usage: query = df.writeStream.trigger(**trigger_config).start()`);
          break;
        case 'continuous':
          lines.push(`# Continuous processing (experimental)`);
          lines.push(`trigger_config = {"continuous": "${continuousInterval}"}`);
          lines.push(`# Usage: query = df.writeStream.trigger(**trigger_config).start()`);
          break;
      }
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # Trigger config defined above`);
      return true;
    }

    case 'foreachBatch': {
      const functionName = config.functionName as string || 'process_batch';
      const customCode = config.customCode as string || `def process_batch(df, batch_id):
    # Process each micro-batch
    df.write.mode("append").parquet("/path/to/output")`;

      lines.push(`# ForeachBatch - Custom micro-batch processing`);
      lines.push(`# Define the batch processing function`);
      lines.push(customCode);
      lines.push(``);
      lines.push(`# Apply foreachBatch to streaming query`);
      lines.push(`# Usage: query = df.writeStream.foreachBatch(${functionName}).start()`);
      lines.push(``);
      lines.push(`${varName} = ${inputVarName}  # foreachBatch function defined above`);
      return true;
    }

    default:
      return false;
  }
};
