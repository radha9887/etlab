// Generate code for aggregation transforms (groupBy, window, cube, rollup, crosstab, freqItems, describe)
export const generateAggregationTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'groupBy': {
      const groupCols = config.groupByColumns ? (config.groupByColumns as string).split(',').map(c => `"${c.trim()}"`).join(', ') : '"column"';
      const aggs = config.aggregations as Array<{ column: string; function: string; alias: string; params?: string }> || [];

      if (config.enablePivot && config.pivotColumn) {
        lines.push(`${varName} = ${inputVarName}.groupBy(${groupCols}) \\`);
        if (config.pivotValues) {
          const pivotVals = (config.pivotValues as string).split(',').map(v => `"${v.trim()}"`).join(', ');
          lines.push(`    .pivot("${config.pivotColumn}", [${pivotVals}]) \\`);
        } else {
          lines.push(`    .pivot("${config.pivotColumn}") \\`);
        }
      } else {
        lines.push(`${varName} = ${inputVarName}.groupBy(${groupCols}) \\`);
      }

      if (aggs.length > 0) {
        const aggExprs = aggs.map(a => {
          const fn = a.function;
          const col = a.column || '*';
          const alias = a.alias || `${fn}_${col}`;
          if (fn === 'count' && !a.column) {
            return `F.count("*").alias("${alias}")`;
          } else if (fn === 'percentile_approx' && a.params) {
            return `F.percentile_approx("${col}", ${a.params}).alias("${alias}")`;
          } else {
            return `F.${fn}("${col}").alias("${alias}")`;
          }
        }).join(',\n        ');
        lines.push(`    .agg(\n        ${aggExprs}\n    )`);
      } else {
        lines.push(`    .count()  # Configure aggregations`);
      }
      return true;
    }

    case 'window': {
      const partitionCols = config.partitionBy ? (config.partitionBy as string).split(',').map(c => `"${c.trim()}"`).join(', ') : '';
      const orderCols = config.orderByColumns as Array<{ column: string; direction: string }> || [];
      const winFn = config.windowFunction || 'row_number';
      const outCol = config.outputColumn || 'window_result';

      // Build window spec
      lines.push(`# Window function: ${winFn}`);
      let windowSpec = 'Window';
      if (partitionCols) {
        windowSpec += `.partitionBy(${partitionCols})`;
      }
      if (orderCols.length > 0) {
        const orderExprs = orderCols.map(oc => {
          const dir = oc.direction === 'desc' ? '.desc()' : '.asc()';
          return `col("${oc.column}")${dir}`;
        }).join(', ');
        windowSpec += `.orderBy(${orderExprs})`;
      }

      // Add frame if specified
      if (config.enableFrame) {
        const frameType = config.frameType === 'range' ? 'rangeBetween' : 'rowsBetween';
        const frameStart = config.frameStart === 'unboundedPreceding' ? 'Window.unboundedPreceding' :
                          config.frameStart === 'currentRow' ? 'Window.currentRow' :
                          config.frameStart === 'unboundedFollowing' ? 'Window.unboundedFollowing' : config.frameStart;
        const frameEnd = config.frameEnd === 'unboundedPreceding' ? 'Window.unboundedPreceding' :
                        config.frameEnd === 'currentRow' ? 'Window.currentRow' :
                        config.frameEnd === 'unboundedFollowing' ? 'Window.unboundedFollowing' : config.frameEnd;
        windowSpec += `.${frameType}(${frameStart}, ${frameEnd})`;
      }

      lines.push(`window_spec = ${windowSpec}`);

      // Build window function call
      let winFnCall = '';
      const fnCol = config.functionColumn || '*';
      const fnParams = config.functionParams || '1';

      switch (winFn) {
        case 'row_number':
          winFnCall = 'F.row_number()';
          break;
        case 'rank':
          winFnCall = 'F.rank()';
          break;
        case 'dense_rank':
          winFnCall = 'F.dense_rank()';
          break;
        case 'percent_rank':
          winFnCall = 'F.percent_rank()';
          break;
        case 'cume_dist':
          winFnCall = 'F.cume_dist()';
          break;
        case 'ntile':
          winFnCall = `F.ntile(${fnParams})`;
          break;
        case 'lag':
          winFnCall = `F.lag("${fnCol}", ${fnParams})`;
          break;
        case 'lead':
          winFnCall = `F.lead("${fnCol}", ${fnParams})`;
          break;
        case 'first':
          winFnCall = `F.first("${fnCol}")`;
          break;
        case 'last':
          winFnCall = `F.last("${fnCol}")`;
          break;
        case 'nth_value':
          winFnCall = `F.nth_value("${fnCol}", ${fnParams})`;
          break;
        case 'sum':
          winFnCall = `F.sum("${fnCol}")`;
          break;
        case 'avg':
          winFnCall = `F.avg("${fnCol}")`;
          break;
        case 'count':
          winFnCall = 'F.count("*")';
          break;
        case 'min':
          winFnCall = `F.min("${fnCol}")`;
          break;
        case 'max':
          winFnCall = `F.max("${fnCol}")`;
          break;
        default:
          winFnCall = 'F.row_number()';
      }

      lines.push(`${varName} = ${inputVarName}.withColumn("${outCol}", ${winFnCall}.over(window_spec))`);
      return true;
    }

    case 'cube': {
      const cubeCols = config.cubeColumns as string;
      const cubeAggs = config.aggregations as Array<{ column: string; function: string; alias: string }> || [];

      if (cubeCols) {
        const colsList = cubeCols.split(',').map(c => `"${c.trim()}"`).join(', ');
        lines.push(`${varName} = ${inputVarName}.cube(${colsList}) \\`);

        if (cubeAggs.length > 0) {
          const aggExprs = cubeAggs.map(a => {
            const fn = a.function;
            const col = a.column || '*';
            const alias = a.alias || `${fn}_${col}`;
            if (fn === 'count' && !a.column) {
              return `F.count("*").alias("${alias}")`;
            } else {
              return `F.${fn}("${col}").alias("${alias}")`;
            }
          }).join(',\n        ');
          lines.push(`    .agg(\n        ${aggExprs}\n    )`);
        } else {
          lines.push(`    .count()`);
        }
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure cube columns`);
      }
      return true;
    }

    case 'rollup': {
      const rollupCols = config.rollupColumns as Array<{ column: string }> || [];
      const rollupAggs = config.aggregations as Array<{ column: string; function: string; alias: string }> || [];

      if (rollupCols.length > 0) {
        const colsList = rollupCols.map(rc => `"${rc.column}"`).join(', ');
        lines.push(`${varName} = ${inputVarName}.rollup(${colsList}) \\`);

        if (rollupAggs.length > 0) {
          const aggExprs = rollupAggs.map(a => {
            const fn = a.function;
            const col = a.column || '*';
            const alias = a.alias || `${fn}_${col}`;
            if (fn === 'count' && !a.column) {
              return `F.count("*").alias("${alias}")`;
            } else {
              return `F.${fn}("${col}").alias("${alias}")`;
            }
          }).join(',\n        ');
          lines.push(`    .agg(\n        ${aggExprs}\n    )`);
        } else {
          lines.push(`    .count()`);
        }
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure rollup columns`);
      }
      return true;
    }

    case 'crosstab': {
      const col1 = config.column1 as string;
      const col2 = config.column2 as string;

      if (col1 && col2) {
        lines.push(`${varName} = ${inputVarName}.crosstab("${col1}", "${col2}")`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure crosstab columns`);
      }
      return true;
    }

    case 'freqItems': {
      const freqCols = config.columns as string;
      const support = config.support as number || 0.01;

      if (freqCols) {
        const colsList = freqCols.split(',').map(c => `"${c.trim()}"`).join(', ');
        lines.push(`${varName} = ${inputVarName}.freqItems([${colsList}], ${support})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure columns for frequent items`);
      }
      return true;
    }

    case 'describe': {
      const describeCols = config.columns as string;

      if (describeCols) {
        const colsList = describeCols.split(',').map(c => `"${c.trim()}"`).join(', ');
        lines.push(`${varName} = ${inputVarName}.describe(${colsList})`);
      } else {
        lines.push(`${varName} = ${inputVarName}.describe()`);
      }
      return true;
    }

    default:
      return false;
  }
};
