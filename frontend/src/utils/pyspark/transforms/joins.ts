// Generate code for join/union transforms (join, union, intersect, subtract, intersectAll, exceptAll)
export const generateJoinTransformCode = (
  transformType: string,
  varName: string,
  inputVarName: string,
  inputVarName2: string | null,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (transformType) {
    case 'join': {
      const joinType = config.joinType || 'inner';
      const leftVar = inputVarName;
      const rightVar = inputVarName2 || 'df_right  # Connect second input';

      // Handle duplicate columns - add suffix before join if needed
      const handleDuplicates = config.handleDuplicates || 'suffix';
      const leftSuffix = config.leftSuffix || '_left';
      const rightSuffix = config.rightSuffix || '_right';

      let actualLeftVar = leftVar;
      let actualRightVar = rightVar;

      // Define join_cols for all modes that need to identify duplicates
      if (handleDuplicates !== 'keep') {
        if (config.conditionMode === 'sameColumn' && config.sameColumns) {
          const joinCols = (config.sameColumns as string).split(',').map(c => `"${c.trim()}"`);
          lines.push(`join_cols = [${joinCols.join(', ')}]`);
        } else {
          lines.push(`join_cols = []`);
        }
      }

      if (handleDuplicates === 'suffix') {
        // Rename duplicate columns before join
        lines.push(`# Rename columns to avoid duplicates`);
        lines.push(`${leftVar}_renamed = ${leftVar}`);
        lines.push(`${rightVar}_renamed = ${rightVar}`);

        lines.push(`common_cols = set(${leftVar}.columns) & set(${rightVar}.columns) - set(join_cols)`);

        lines.push(`for col_name in common_cols:`);
        lines.push(`    ${leftVar}_renamed = ${leftVar}_renamed.withColumnRenamed(col_name, col_name + "${leftSuffix}")`);
        lines.push(`    ${rightVar}_renamed = ${rightVar}_renamed.withColumnRenamed(col_name, col_name + "${rightSuffix}")`);

        actualLeftVar = `${leftVar}_renamed`;
        actualRightVar = `${rightVar}_renamed`;
      }

      if (config.conditionMode === 'sameColumn' && config.sameColumns) {
        const cols = (config.sameColumns as string).split(',').map(c => `"${c.trim()}"`);
        if (cols.length === 1) {
          lines.push(`${varName} = ${actualLeftVar}.join(${actualRightVar}, ${cols[0]}, "${joinType}")`);
        } else {
          lines.push(`${varName} = ${actualLeftVar}.join(${actualRightVar}, [${cols.join(', ')}], "${joinType}")`);
        }
      } else if (config.conditionMode === 'differentColumns' && config.columnPairs) {
        const pairs = config.columnPairs as Array<{ leftColumn: string; rightColumn: string }>;
        const conditions = pairs.map(p => `(${actualLeftVar}["${p.leftColumn}"] == ${actualRightVar}["${p.rightColumn}"])`).join(' & ');
        lines.push(`${varName} = ${actualLeftVar}.join(${actualRightVar}, ${conditions}, "${joinType}")`);
      } else if (config.conditionMode === 'expression' && config.expression) {
        lines.push(`${varName} = ${actualLeftVar}.join(${actualRightVar}, ${config.expression}, "${joinType}")`);
      } else {
        lines.push(`${varName} = ${actualLeftVar}.join(${actualRightVar}, "id", "${joinType}")  # Configure join condition`);
      }

      if (config.broadcast === 'right') {
        lines[lines.length - 1] = lines[lines.length - 1].replace(actualRightVar, `broadcast(${actualRightVar})`);
      } else if (config.broadcast === 'left') {
        lines[lines.length - 1] = lines[lines.length - 1].replace(actualLeftVar, `broadcast(${actualLeftVar})`);
      }

      // Handle drop_right - drop duplicate columns from right after join
      if (handleDuplicates === 'drop_right') {
        lines.push(`# Drop duplicate columns from right table`);
        lines.push(`right_cols_to_drop = [c for c in ${rightVar}.columns if c in ${leftVar}.columns and c not in join_cols]`);
        lines.push(`for col_name in right_cols_to_drop:`);
        lines.push(`    ${varName} = ${varName}.drop(${rightVar}[col_name])`);
      }

      // Handle drop_left - drop duplicate columns from left after join
      if (handleDuplicates === 'drop_left') {
        lines.push(`# Drop duplicate columns from left table`);
        lines.push(`left_cols_to_drop = [c for c in ${leftVar}.columns if c in ${rightVar}.columns and c not in join_cols]`);
        lines.push(`for col_name in left_cols_to_drop:`);
        lines.push(`    ${varName} = ${varName}.drop(${leftVar}[col_name])`);
      }

      // Handle select - select specific columns after join
      if (handleDuplicates === 'select' && config.selectColumns) {
        const selectCols = (config.selectColumns as string).split(',').map(c => {
          const col = c.trim();
          if (col.includes('.')) {
            const [table, colName] = col.split('.');
            if (colName === '*') {
              return `${table}["*"]`;
            }
            return `${table}["${colName}"]`;
          }
          return `"${col}"`;
        }).join(', ');
        lines.push(`${varName} = ${varName}.select(${selectCols})`);
      }
      return true;
    }

    case 'union':
      if (inputVarName2) {
        if (config.byName) {
          lines.push(`${varName} = ${inputVarName}.unionByName(${inputVarName2}${config.allowMissingColumns ? ', allowMissingColumns=True' : ''})`);
        } else {
          lines.push(`${varName} = ${inputVarName}.union(${inputVarName2})`);
        }
      } else {
        lines.push(`${varName} = ${inputVarName}  # Connect second input for union`);
      }
      return true;

    case 'intersect':
      if (inputVarName2) {
        lines.push(`${varName} = ${inputVarName}.intersect(${inputVarName2})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Connect second input for intersect`);
      }
      return true;

    case 'subtract':
      if (inputVarName2) {
        lines.push(`${varName} = ${inputVarName}.subtract(${inputVarName2})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Connect second input for subtract`);
      }
      return true;

    case 'intersectAll':
      if (inputVarName2) {
        lines.push(`${varName} = ${inputVarName}.intersectAll(${inputVarName2})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Connect second input for intersectAll`);
      }
      return true;

    case 'exceptAll':
      if (inputVarName2) {
        lines.push(`${varName} = ${inputVarName}.exceptAll(${inputVarName2})`);
      } else {
        lines.push(`${varName} = ${inputVarName}  # Connect second input for exceptAll`);
      }
      return true;

    default:
      return false;
  }
};
