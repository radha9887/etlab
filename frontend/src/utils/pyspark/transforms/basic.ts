// Generate code for basic transforms (filter, select, dropColumn, rename, addColumn, distinct, limit, sort, sample, dropna, fillna, replace)
export const generateBasicTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'filter':
      if (config.mode === 'sql' && config.sqlExpression) {
        lines.push(`${varName} = ${inputVarName}.filter("${config.sqlExpression}")`);
      } else if (config.mode === 'advanced' && config.conditionGroups) {
        // Advanced mode with nested condition groups
        const generateConditionExpr = (c: { column: string; operator: string; value: string; value2?: string }): string => {
          const col = `col("${c.column}")`;
          switch (c.operator) {
            case '==': return `(${col} == "${c.value}")`;
            case '!=': return `(${col} != "${c.value}")`;
            case '>': return `(${col} > ${c.value})`;
            case '>=': return `(${col} >= ${c.value})`;
            case '<': return `(${col} < ${c.value})`;
            case '<=': return `(${col} <= ${c.value})`;
            case 'like': return `(${col}.like("${c.value}"))`;
            case 'rlike': return `(${col}.rlike("${c.value}"))`;
            case 'startsWith': return `(${col}.startswith("${c.value}"))`;
            case 'endsWith': return `(${col}.endswith("${c.value}"))`;
            case 'contains': return `(${col}.contains("${c.value}"))`;
            case 'in': {
              const vals = c.value.split(',').map(v => `"${v.trim()}"`).join(', ');
              return `(${col}.isin(${vals}))`;
            }
            case 'notIn': {
              const vals = c.value.split(',').map(v => `"${v.trim()}"`).join(', ');
              return `(~${col}.isin(${vals}))`;
            }
            case 'between': return `(${col}.between(${c.value}, ${c.value2}))`;
            case 'isNull': return `(${col}.isNull())`;
            case 'isNotNull': return `(${col}.isNotNull())`;
            // Array operators
            case 'array_contains': return `(F.array_contains(${col}, "${c.value}"))`;
            case 'array_size_eq': return `(F.size(${col}) == ${c.value})`;
            case 'array_size_gt': return `(F.size(${col}) > ${c.value})`;
            case 'array_size_lt': return `(F.size(${col}) < ${c.value})`;
            // Map operators
            case 'map_contains_key': return `(${col}.getItem("${c.value}").isNotNull())`;
            case 'map_size_eq': return `(F.size(${col}) == ${c.value})`;
            case 'map_size_gt': return `(F.size(${col}) > ${c.value})`;
            case 'map_size_lt': return `(F.size(${col}) < ${c.value})`;
            // Element access
            case 'getItem': return `(${col}.getItem(${isNaN(Number(c.value)) ? `"${c.value}"` : c.value}) == "${c.value2}")`;
            case 'getField': return `(${col}.getField("${c.value}") == "${c.value2}")`;
            default: return `(${col} == "${c.value}")`;
          }
        };

        type ConditionItem = { column: string; operator: string; value: string; value2?: string; type?: string };
        type ConditionGroupType = { type: 'group'; logicalOperator: 'AND' | 'OR'; items: (ConditionItem | ConditionGroupType)[] };

        const generateGroupExpr = (group: ConditionGroupType): string => {
          const logicalOp = group.logicalOperator === 'OR' ? ' | ' : ' & ';
          const exprs = group.items.map(item => {
            if ('type' in item && item.type === 'group') {
              return `(${generateGroupExpr(item as ConditionGroupType)})`;
            }
            return generateConditionExpr(item as ConditionItem);
          });
          return exprs.join(logicalOp);
        };

        const filterExpr = generateGroupExpr(config.conditionGroups as ConditionGroupType);
        lines.push(`${varName} = ${inputVarName}.filter(${filterExpr})`);
      } else if (config.conditions && Array.isArray(config.conditions)) {
        // Simple mode with flat conditions
        const conditions = config.conditions as Array<{ column: string; operator: string; value: string; value2?: string }>;
        if (conditions.length > 0) {
          const logicalOp = config.logicalOperator === 'OR' ? ' | ' : ' & ';
          const filterExprs = conditions.map(c => {
            const col = `col("${c.column}")`;
            switch (c.operator) {
              case '==': return `(${col} == "${c.value}")`;
              case '!=': return `(${col} != "${c.value}")`;
              case '>': return `(${col} > ${c.value})`;
              case '>=': return `(${col} >= ${c.value})`;
              case '<': return `(${col} < ${c.value})`;
              case '<=': return `(${col} <= ${c.value})`;
              case 'like': return `(${col}.like("${c.value}"))`;
              case 'rlike': return `(${col}.rlike("${c.value}"))`;
              case 'startsWith': return `(${col}.startswith("${c.value}"))`;
              case 'endsWith': return `(${col}.endswith("${c.value}"))`;
              case 'contains': return `(${col}.contains("${c.value}"))`;
              case 'in': {
                const vals = c.value.split(',').map(v => `"${v.trim()}"`).join(', ');
                return `(${col}.isin(${vals}))`;
              }
              case 'notIn': {
                const vals = c.value.split(',').map(v => `"${v.trim()}"`).join(', ');
                return `(~${col}.isin(${vals}))`;
              }
              case 'between': return `(${col}.between(${c.value}, ${c.value2}))`;
              case 'isNull': return `(${col}.isNull())`;
              case 'isNotNull': return `(${col}.isNotNull())`;
              // Array operators
              case 'array_contains': return `(F.array_contains(${col}, "${c.value}"))`;
              case 'array_size_eq': return `(F.size(${col}) == ${c.value})`;
              case 'array_size_gt': return `(F.size(${col}) > ${c.value})`;
              case 'array_size_lt': return `(F.size(${col}) < ${c.value})`;
              // Map operators
              case 'map_contains_key': return `(${col}.getItem("${c.value}").isNotNull())`;
              case 'map_size_eq': return `(F.size(${col}) == ${c.value})`;
              case 'map_size_gt': return `(F.size(${col}) > ${c.value})`;
              case 'map_size_lt': return `(F.size(${col}) < ${c.value})`;
              // Element access
              case 'getItem': return `(${col}.getItem(${isNaN(Number(c.value)) ? `"${c.value}"` : c.value}) == "${c.value2}")`;
              case 'getField': return `(${col}.getField("${c.value}") == "${c.value2}")`;
              default: return `(${col} == "${c.value}")`;
            }
          }).join(logicalOp);
          lines.push(`${varName} = ${inputVarName}.filter(${filterExprs})`);
        } else {
          lines.push(`${varName} = ${inputVarName}  # No filter conditions configured`);
        }
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure filter conditions`);
      }
      return true;

    case 'select': {
      const selectParts: string[] = [];

      // Handle regular column selection
      if (config.columns) {
        const cols = (config.columns as string).split(',').map(c => `"${c.trim()}"`);
        selectParts.push(...cols);
      }

      // Handle derived columns (new format with expressionType)
      interface DerivedCol {
        expression: string;
        alias: string;
        expressionType?: 'sql' | 'literal' | 'column';
      }
      const derivedColumns = config.derivedColumns as DerivedCol[] | undefined;
      if (derivedColumns && derivedColumns.length > 0) {
        derivedColumns.forEach(d => {
          if (d.expression && d.alias) {
            if (d.expressionType === 'literal') {
              // Literal value
              selectParts.push(`F.lit(${d.expression}).alias("${d.alias}")`);
            } else if (d.expressionType === 'column') {
              // Column reference
              selectParts.push(`col("${d.expression}").alias("${d.alias}")`);
            } else {
              // SQL expression (default)
              selectParts.push(`F.expr("${d.expression}").alias("${d.alias}")`);
            }
          }
        });
      }

      // Handle legacy expressions format for backward compatibility
      const expressions = config.expressions as Array<{ expr: string; alias: string }> | undefined;
      if (!derivedColumns && expressions && expressions.length > 0) {
        expressions.forEach(e => {
          if (e.expr && e.alias) {
            selectParts.push(`F.expr("${e.expr}").alias("${e.alias}")`);
          }
        });
      }

      if (selectParts.length > 0) {
        lines.push(`${varName} = ${inputVarName}.select(${selectParts.join(', ')})`);
      } else {
        lines.push(`${varName} = ${inputVarName}.select("*")  # Configure columns to select`);
      }
      return true;
    }

    case 'distinct': {
      const distinctSubset = config.subset || config.columns;
      if (distinctSubset) {
        const cols = (distinctSubset as string).split(',').map(c => `"${c.trim()}"`).join(', ');
        lines.push(`${varName} = ${inputVarName}.dropDuplicates([${cols}])`);
      } else {
        lines.push(`${varName} = ${inputVarName}.distinct()`);
      }
      return true;
    }

    case 'limit': {
      const limit = config.value || config.limit || 100;
      lines.push(`${varName} = ${inputVarName}.limit(${limit})`);
      return true;
    }

    case 'dropColumn': {
      if (config.columns) {
        const cols = (config.columns as string).split(',').map(c => `"${c.trim()}"`).join(', ');
        lines.push(`${varName} = ${inputVarName}.drop(${cols})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure columns to drop`);
      }
      return true;
    }

    case 'rename': {
      const renameMappings = config.renameMappings as Array<{ oldName: string; newName: string }> || [];
      if (renameMappings.length > 0) {
        // Chain multiple withColumnRenamed calls
        let renameExpr = inputVarName;
        renameMappings.forEach((mapping, idx) => {
          if (mapping.oldName && mapping.newName) {
            if (idx === 0) {
              renameExpr = `${inputVarName}.withColumnRenamed("${mapping.oldName}", "${mapping.newName}")`;
            } else {
              renameExpr += ` \\\n    .withColumnRenamed("${mapping.oldName}", "${mapping.newName}")`;
            }
          }
        });
        lines.push(`${varName} = ${renameExpr}`);
      } else if (config.columns && config.value) {
        // Fallback for old single-column format
        lines.push(`${varName} = ${inputVarName}.withColumnRenamed("${config.columns}", "${config.value}")`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure column rename`);
      }
      return true;
    }

    case 'addColumn': {
      const newColumns = config.newColumns as Array<{ name: string; expression: string; expressionType: 'sql' | 'literal' | 'column' }> || [];
      if (newColumns.length > 0) {
        let addColExpr = inputVarName;
        newColumns.forEach((col, idx) => {
          if (col.name && col.expression) {
            let exprValue: string;
            switch (col.expressionType) {
              case 'literal':
                // Check if it's a number or string
                const isNum = !isNaN(Number(col.expression));
                exprValue = isNum ? `F.lit(${col.expression})` : `F.lit("${col.expression}")`;
                break;
              case 'column':
                exprValue = `col("${col.expression}")`;
                break;
              case 'sql':
              default:
                exprValue = `F.expr("${col.expression}")`;
                break;
            }
            if (idx === 0) {
              addColExpr = `${inputVarName}.withColumn("${col.name}", ${exprValue})`;
            } else {
              addColExpr += ` \\\n    .withColumn("${col.name}", ${exprValue})`;
            }
          }
        });
        lines.push(`${varName} = ${addColExpr}`);
      } else if (config.columns && config.value) {
        // Fallback for old single-column format
        lines.push(`${varName} = ${inputVarName}.withColumn("${config.columns}", ${config.value})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure new column`);
      }
      return true;
    }

    case 'sort': {
      const sortCols = config.sortColumns as Array<{ column: string; direction: string; nulls?: string }> || [];
      if (sortCols.length > 0) {
        const sortExprs = sortCols.map(sc => {
          let expr = `col("${sc.column}")`;
          if (sc.direction === 'desc') {
            expr += '.desc()';
          } else {
            expr += '.asc()';
          }
          if (sc.nulls === 'first') {
            expr = expr.replace('.desc()', '.desc_nulls_first()').replace('.asc()', '.asc_nulls_first()');
          } else if (sc.nulls === 'last') {
            expr = expr.replace('.desc()', '.desc_nulls_last()').replace('.asc()', '.asc_nulls_last()');
          }
          return expr;
        }).join(', ');
        lines.push(`${varName} = ${inputVarName}.orderBy(${sortExprs})`);
      } else {
        lines.push(`${varName} = ${inputVarName}.orderBy("column")  # Configure sort columns`);
      }
      return true;
    }

    case 'sample': {
      const fraction = config.fraction || 0.1;
      const withReplacement = config.withReplacement ? 'True' : 'False';
      if (config.seed) {
        lines.push(`${varName} = ${inputVarName}.sample(withReplacement=${withReplacement}, fraction=${fraction}, seed=${config.seed})`);
      } else {
        lines.push(`${varName} = ${inputVarName}.sample(withReplacement=${withReplacement}, fraction=${fraction})`);
      }
      return true;
    }

    case 'dropna': {
      const how = config.how || 'any';
      const thresh = config.thresh;
      const dropSubset = config.subset ? (config.subset as string).split(',').map(c => `"${c.trim()}"`).join(', ') : '';

      if (thresh) {
        if (dropSubset) {
          lines.push(`${varName} = ${inputVarName}.dropna(thresh=${thresh}, subset=[${dropSubset}])`);
        } else {
          lines.push(`${varName} = ${inputVarName}.dropna(thresh=${thresh})`);
        }
      } else {
        if (dropSubset) {
          lines.push(`${varName} = ${inputVarName}.dropna(how="${how}", subset=[${dropSubset}])`);
        } else {
          lines.push(`${varName} = ${inputVarName}.dropna(how="${how}")`);
        }
      }
      return true;
    }

    case 'fillna': {
      if (config.mode === 'perColumn' && config.columnValues) {
        const colVals = config.columnValues as Array<{ column: string; value: string }>;
        const valueMap = colVals.map(cv => `"${cv.column}": ${isNaN(Number(cv.value)) ? `"${cv.value}"` : cv.value}`).join(', ');
        lines.push(`${varName} = ${inputVarName}.fillna({${valueMap}})`);
      } else {
        const fillVal = config.fillValue;
        const fillSubset = config.subset ? (config.subset as string).split(',').map(c => `"${c.trim()}"`).join(', ') : '';
        const valStr = isNaN(Number(fillVal)) ? `"${fillVal}"` : fillVal;
        if (fillSubset) {
          lines.push(`${varName} = ${inputVarName}.fillna(${valStr}, subset=[${fillSubset}])`);
        } else {
          lines.push(`${varName} = ${inputVarName}.fillna(${valStr})`);
        }
      }
      return true;
    }

    case 'replace': {
      const replaceSubset = config.subset as string;
      const replacements = config.replacements as Array<{ oldValue: string; newValue: string }> || [];

      if (replacements.length > 0) {
        // Build replacement dictionary
        const replaceDict: Record<string, string> = {};
        replacements.forEach(r => {
          replaceDict[r.oldValue] = r.newValue;
        });
        const dictStr = Object.entries(replaceDict)
          .map(([k, v]) => `"${k}": ${v === '' ? 'None' : (isNaN(Number(v)) ? `"${v}"` : v)}`)
          .join(', ');

        if (replaceSubset) {
          const cols = replaceSubset.split(',').map(c => `"${c.trim()}"`).join(', ');
          lines.push(`${varName} = ${inputVarName}.replace({${dictStr}}, subset=[${cols}])`);
        } else {
          lines.push(`${varName} = ${inputVarName}.replace({${dictStr}})`);
        }
      } else {
        lines.push(`${varName} = ${inputVarName}  # Configure replacement values`);
      }
      return true;
    }

    default:
      return false;
  }
};
