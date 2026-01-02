// Generate code for data manipulation transforms (explode, unpivot, pivot, flatten)
export const generateDataTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'explode': {
      const explodeCol = config.column as string;
      const explodeMode = config.mode as string || 'explode';
      if (explodeCol) {
        if (explodeMode === 'posexplode') {
          lines.push(`${varName} = ${inputVarName}.select("*", F.posexplode("${explodeCol}").alias("pos", "${explodeCol}_exploded")).drop("${explodeCol}")`);
        } else if (explodeMode === 'posexplode_outer') {
          lines.push(`${varName} = ${inputVarName}.select("*", F.posexplode_outer("${explodeCol}").alias("pos", "${explodeCol}_exploded")).drop("${explodeCol}")`);
        } else if (explodeMode === 'explode_outer') {
          lines.push(`${varName} = ${inputVarName}.select("*", F.explode_outer("${explodeCol}").alias("${explodeCol}_exploded")).drop("${explodeCol}")`);
        } else {
          lines.push(`${varName} = ${inputVarName}.select("*", F.explode("${explodeCol}").alias("${explodeCol}_exploded")).drop("${explodeCol}")`);
        }
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure column to explode`);
      }
      return true;
    }

    case 'unpivot': {
      const idCols = config.idColumns as string;
      const valueCols = config.valueColumns as string;
      const varColName = config.variableColName as string || 'variable';
      const valColName = config.valueColName as string || 'value';

      if (idCols && valueCols) {
        const idColsList = idCols.split(',').map(c => `"${c.trim()}"`).join(', ');
        const valueColsList = valueCols.split(',').map(c => `"${c.trim()}"`).join(', ');
        lines.push(`${varName} = ${inputVarName}.unpivot(`);
        lines.push(`    [${idColsList}],`);
        lines.push(`    [${valueColsList}],`);
        lines.push(`    "${varColName}",`);
        lines.push(`    "${valColName}"`);
        lines.push(`)`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure unpivot columns`);
      }
      return true;
    }

    case 'pivot': {
      const groupByCols = config.groupByColumns as string;
      const pivotCol = config.pivotColumn as string;
      const valueCol = config.valueColumn as string;
      const aggFunc = config.aggFunction as string || 'sum';
      const pivotVals = config.pivotValues as string;

      if (pivotCol && valueCol) {
        // Build group by columns
        const groupByList = groupByCols
          ? groupByCols.split(',').map(c => `"${c.trim()}"`).join(', ')
          : '';

        // Build pivot values if specified
        const pivotValList = pivotVals
          ? pivotVals.split(',').map(v => v.trim()).join(', ')
          : '';

        lines.push(`${varName} = ${inputVarName}.groupBy(${groupByList})`);
        if (pivotValList) {
          lines.push(`    .pivot("${pivotCol}", [${pivotValList}])`);
        } else {
          lines.push(`    .pivot("${pivotCol}")`);
        }
        lines.push(`    .agg(F.${aggFunc}("${valueCol}"))`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure pivot columns`);
      }
      return true;
    }

    case 'flatten': {
      const flattenCol = config.column as string;
      const flattenPrefix = config.prefix as string || flattenCol;
      const flattenSep = config.separator as string || '_';

      if (flattenCol) {
        lines.push(`# Flatten nested struct column: ${flattenCol}`);
        lines.push(`${varName} = ${inputVarName}`);
        lines.push(`for field in ${inputVarName}.select("${flattenCol}.*").columns:`);
        lines.push(`    ${varName} = ${varName}.withColumn(`);
        lines.push(`        f"${flattenPrefix}${flattenSep}{field}",`);
        lines.push(`        col("${flattenCol}.{field}")`.replace('{field}', '" + field + "'));
        lines.push(`    )`);
        lines.push(`${varName} = ${varName}.drop("${flattenCol}")`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure struct column to flatten`);
      }
      return true;
    }

    default:
      return false;
  }
};
