/**
 * PySpark Action Code Generator
 *
 * Generates code for DataFrame actions (debugging/inspection operations)
 * Actions are terminal operations that trigger execution and return results
 */

import type { Node } from '@xyflow/react';
import type { ActionNodeData, ShowConfig, TakeConfig, HeadConfig } from '../../types';

export const generateActionCode = (
  node: Node<ActionNodeData>,
  inputVarName: string
): string[] => {
  const lines: string[] = [];
  const { actionType, config, label } = node.data;

  lines.push(`# Action: ${label}`);

  switch (actionType) {
    case 'show': {
      const showConfig = config as ShowConfig | undefined;
      const numRows = showConfig?.numRows ?? 20;
      const truncate = showConfig?.truncate ?? true;
      const vertical = showConfig?.vertical ?? false;

      if (vertical) {
        lines.push(`${inputVarName}.show(n=${numRows}, truncate=${truncate ? 'True' : 'False'}, vertical=True)`);
      } else {
        lines.push(`${inputVarName}.show(n=${numRows}, truncate=${truncate ? 'True' : 'False'})`);
      }
      break;
    }

    case 'printSchema': {
      lines.push(`${inputVarName}.printSchema()`);
      break;
    }

    case 'count': {
      lines.push(`print(f"Row count: {${inputVarName}.count()}")`);
      break;
    }

    case 'take': {
      const takeConfig = config as TakeConfig | undefined;
      const numRows = takeConfig?.numRows ?? 10;
      lines.push(`rows = ${inputVarName}.take(${numRows})`);
      lines.push(`for row in rows:`);
      lines.push(`    print(row)`);
      break;
    }

    case 'first': {
      lines.push(`first_row = ${inputVarName}.first()`);
      lines.push(`print(f"First row: {first_row}")`);
      break;
    }

    case 'head': {
      const headConfig = config as HeadConfig | undefined;
      const numRows = headConfig?.numRows ?? 5;
      lines.push(`rows = ${inputVarName}.head(${numRows})`);
      lines.push(`for row in rows:`);
      lines.push(`    print(row)`);
      break;
    }

    case 'columns': {
      lines.push(`print(f"Columns: {${inputVarName}.columns}")`);
      break;
    }

    case 'dtypes': {
      lines.push(`print(f"Column types:")`);
      lines.push(`for col_name, col_type in ${inputVarName}.dtypes:`);
      lines.push(`    print(f"  {col_name}: {col_type}")`);
      break;
    }

    case 'isEmpty': {
      lines.push(`is_empty = ${inputVarName}.isEmpty()`);
      lines.push(`print(f"DataFrame is empty: {is_empty}")`);
      break;
    }

    default: {
      lines.push(`# Unknown action type: ${actionType}`);
      lines.push(`${inputVarName}.show()`);
    }
  }

  return lines;
};
