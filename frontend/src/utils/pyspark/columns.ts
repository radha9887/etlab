import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, SourceNodeData, TransformNodeData } from '../../types';

interface ColumnInfo {
  name: string;
  dataType: string;
  source: string;
}

// Helper to compute output columns for a node based on its configuration
export const computeOutputColumns = (
  node: Node<ETLNodeData>,
  inputColumns: ColumnInfo[],
  secondInputColumns: ColumnInfo[] | null
): ColumnInfo[] => {
  const nodeLabel = node.data.label;

  if (node.data.category === 'source') {
    const sourceData = node.data as SourceNodeData;
    if (sourceData.schema) {
      return sourceData.schema.map(col => ({
        name: col.name,
        dataType: col.dataType,
        source: nodeLabel
      }));
    }
    return [];
  }

  if (node.data.category === 'transform') {
    const transformData = node.data as TransformNodeData;
    const config = transformData.config || {};

    switch (transformData.transformType) {
      case 'select': {
        // Select filters/transforms columns
        const result: ColumnInfo[] = [];

        const colsStr = config.columns as string;
        if (colsStr && colsStr !== '*') {
          const selectedCols = colsStr.split(',').map(c => c.trim());
          result.push(...inputColumns.filter(col => selectedCols.includes(col.name)));
        } else if (!colsStr || colsStr === '*') {
          result.push(...inputColumns);
        }

        // Add derived columns
        interface DerivedCol {
          expression: string;
          alias: string;
          expressionType?: 'sql' | 'literal' | 'column';
        }
        const derivedCols = config.derivedColumns as DerivedCol[] | undefined;
        if (derivedCols && derivedCols.length > 0) {
          derivedCols.forEach(d => {
            if (d.alias) {
              result.push({ name: d.alias, dataType: 'unknown', source: nodeLabel });
            }
          });
        }

        // Legacy expressions format
        const expressions = config.expressions as Array<{ expr: string; alias: string }> | undefined;
        if (!derivedCols && expressions && expressions.length > 0) {
          expressions.forEach(e => {
            if (e.alias) {
              result.push({ name: e.alias, dataType: 'unknown', source: nodeLabel });
            }
          });
        }

        return result;
      }

      case 'dropColumn': {
        const dropCols = config.columns as string;
        if (!dropCols) return inputColumns;
        const colsToDrop = dropCols.split(',').map(c => c.trim());
        return inputColumns.filter(col => !colsToDrop.includes(col.name));
      }

      case 'rename': {
        const oldName = config.columns as string;
        const newName = config.value as string;
        if (!oldName || !newName) return inputColumns;
        return inputColumns.map(col =>
          col.name === oldName ? { ...col, name: newName } : col
        );
      }

      case 'addColumn': {
        const newColName = config.columns as string;
        if (!newColName) return inputColumns;
        return [...inputColumns, { name: newColName, dataType: 'unknown', source: nodeLabel }];
      }

      case 'join': {
        if (!secondInputColumns) return inputColumns;

        const joinType = config.joinType as string || 'inner';
        const handleDuplicates = config.handleDuplicates as string || 'suffix';
        const leftSuffix = config.leftSuffix as string || '_left';
        const rightSuffix = config.rightSuffix as string || '_right';

        // For left_semi and left_anti, only left columns are returned
        if (joinType === 'left_semi' || joinType === 'left_anti') {
          return inputColumns.map(col => ({ ...col, source: nodeLabel }));
        }

        // Get join keys to handle them specially
        let joinKeys: string[] = [];
        if (config.conditionMode === 'sameColumn' && config.sameColumns) {
          joinKeys = (config.sameColumns as string).split(',').map(c => c.trim());
        }

        // Find duplicate column names (excluding join keys for sameColumn mode)
        const leftColNames = new Set(inputColumns.map(c => c.name));
        const rightColNames = new Set(secondInputColumns.map(c => c.name));
        const duplicateNames = new Set([...leftColNames].filter(n => rightColNames.has(n) && !joinKeys.includes(n)));

        let outputColumns: ColumnInfo[] = [];

        if (handleDuplicates === 'suffix') {
          // Add suffix to duplicate columns
          inputColumns.forEach(col => {
            if (duplicateNames.has(col.name)) {
              outputColumns.push({ ...col, name: col.name + leftSuffix, source: nodeLabel });
            } else {
              outputColumns.push({ ...col, source: nodeLabel });
            }
          });
          secondInputColumns.forEach(col => {
            // Skip join keys if using sameColumn mode (they appear only once)
            if (config.conditionMode === 'sameColumn' && joinKeys.includes(col.name)) {
              return;
            }
            if (duplicateNames.has(col.name)) {
              outputColumns.push({ ...col, name: col.name + rightSuffix, source: nodeLabel });
            } else {
              outputColumns.push({ ...col, source: nodeLabel });
            }
          });
        } else if (handleDuplicates === 'drop_right') {
          // Keep all from left, drop duplicates from right
          outputColumns = inputColumns.map(col => ({ ...col, source: nodeLabel }));
          secondInputColumns.forEach(col => {
            if (!duplicateNames.has(col.name) && !joinKeys.includes(col.name)) {
              outputColumns.push({ ...col, source: nodeLabel });
            }
          });
        } else if (handleDuplicates === 'drop_left') {
          // Keep non-duplicates from left, all from right
          inputColumns.forEach(col => {
            if (!duplicateNames.has(col.name)) {
              outputColumns.push({ ...col, source: nodeLabel });
            }
          });
          secondInputColumns.forEach(col => {
            if (!joinKeys.includes(col.name) || config.conditionMode !== 'sameColumn') {
              outputColumns.push({ ...col, source: nodeLabel });
            }
          });
        } else if (handleDuplicates === 'select' && config.selectColumns) {
          // Use selected columns
          const selectCols = (config.selectColumns as string).split(',').map(c => c.trim());
          const allCols = [...inputColumns, ...secondInputColumns];
          selectCols.forEach(sel => {
            const [prefix, colName] = sel.includes('.') ? sel.split('.') : ['', sel];
            if (colName === '*') {
              if (prefix === 'left') {
                inputColumns.forEach(col => outputColumns.push({ ...col, source: nodeLabel }));
              } else if (prefix === 'right') {
                secondInputColumns.forEach(col => outputColumns.push({ ...col, source: nodeLabel }));
              }
            } else {
              const found = allCols.find(c => c.name === colName);
              if (found) {
                outputColumns.push({ ...found, source: nodeLabel });
              }
            }
          });
        } else {
          // Keep all (may have duplicates)
          outputColumns = [
            ...inputColumns.map(col => ({ ...col, source: nodeLabel })),
            ...secondInputColumns.filter(col =>
              config.conditionMode !== 'sameColumn' || !joinKeys.includes(col.name)
            ).map(col => ({ ...col, source: nodeLabel }))
          ];
        }

        return outputColumns;
      }

      case 'window': {
        // Window adds a new column
        const outputCol = config.outputColumn as string || 'window_result';
        return [...inputColumns, { name: outputCol, dataType: 'unknown', source: nodeLabel }];
      }

      case 'groupBy': {
        // GroupBy changes schema completely
        const groupCols = config.groupByColumns as string;
        const aggs = config.aggregations as Array<{ column: string; function: string; alias: string }> || [];

        const outputCols: ColumnInfo[] = [];

        // Group columns
        if (groupCols) {
          groupCols.split(',').forEach(c => {
            const colName = c.trim();
            const sourceCol = inputColumns.find(col => col.name === colName);
            outputCols.push({
              name: colName,
              dataType: sourceCol?.dataType || 'unknown',
              source: nodeLabel
            });
          });
        }

        // Aggregated columns
        aggs.forEach(agg => {
          const alias = agg.alias || `${agg.function}_${agg.column || 'all'}`;
          outputCols.push({
            name: alias,
            dataType: agg.function.includes('count') ? 'long' : 'double',
            source: nodeLabel
          });
        });

        return outputCols;
      }

      case 'union':
      case 'intersect':
      case 'subtract':
      case 'intersectAll':
      case 'exceptAll':
        // These return left schema (union by position)
        return inputColumns.map(col => ({ ...col, source: nodeLabel }));

      case 'explode': {
        // Explode adds a new column and potentially removes the original array column
        const explodeColName = config.column as string;
        const mode = config.mode as string || 'explode';
        const result = inputColumns.filter(col => col.name !== explodeColName);
        if (mode === 'posexplode' || mode === 'posexplode_outer') {
          result.push({ name: 'pos', dataType: 'integer', source: nodeLabel });
        }
        result.push({ name: `${explodeColName}_exploded`, dataType: 'unknown', source: nodeLabel });
        return result;
      }

      case 'unpivot': {
        // Unpivot changes schema to id columns + variable + value columns
        const idCols = (config.idColumns as string)?.split(',').map(c => c.trim()) || [];
        const varColName = config.variableColName as string || 'variable';
        const valColName = config.valueColName as string || 'value';
        const result = inputColumns.filter(col => idCols.includes(col.name));
        result.push({ name: varColName, dataType: 'string', source: nodeLabel });
        result.push({ name: valColName, dataType: 'unknown', source: nodeLabel });
        return result;
      }

      case 'pivot': {
        // Pivot changes schema to groupBy columns + pivot value columns
        const groupByCols = (config.groupByColumns as string)?.split(',').map(c => c.trim()) || [];
        const pivotVals = config.pivotValues as string;
        const result = inputColumns.filter(col => groupByCols.includes(col.name));
        // Add pivot value columns (if specified, otherwise show placeholder)
        if (pivotVals) {
          pivotVals.split(',').forEach(val => {
            result.push({ name: val.trim().replace(/['"]/g, ''), dataType: 'number', source: nodeLabel });
          });
        } else {
          result.push({ name: '<pivot_values>', dataType: 'number', source: nodeLabel });
        }
        return result;
      }

      case 'repartition':
      case 'cache':
      case 'replace':
        // These don't change schema
        return inputColumns.map(col => ({ ...col, source: nodeLabel }));

      case 'flatten': {
        // Flatten removes the struct column and adds its nested fields
        const flattenCol = config.column as string;
        const prefix = config.prefix as string || flattenCol;
        const separator = config.separator as string || '_';
        // We can't know the nested fields at design time, so just show what we know
        const result = inputColumns.filter(col => col.name !== flattenCol);
        result.push({ name: `${prefix}${separator}*`, dataType: 'unknown', source: nodeLabel });
        return result;
      }

      case 'cube':
      case 'rollup': {
        // Similar to groupBy - cube/rollup columns + aggregation results
        const cubeColsStr = (config.cubeColumns || config.rollupColumns) as string | Array<{ column: string }>;
        const cubeAggs = config.aggregations as Array<{ column: string; function: string; alias: string }> || [];
        const outputCols: ColumnInfo[] = [];

        // Handle cube/rollup columns
        if (typeof cubeColsStr === 'string' && cubeColsStr) {
          cubeColsStr.split(',').forEach(c => {
            const colName = c.trim();
            const sourceCol = inputColumns.find(col => col.name === colName);
            outputCols.push({
              name: colName,
              dataType: sourceCol?.dataType || 'unknown',
              source: nodeLabel
            });
          });
        } else if (Array.isArray(cubeColsStr)) {
          cubeColsStr.forEach(rc => {
            const sourceCol = inputColumns.find(col => col.name === rc.column);
            outputCols.push({
              name: rc.column,
              dataType: sourceCol?.dataType || 'unknown',
              source: nodeLabel
            });
          });
        }

        // Aggregated columns
        cubeAggs.forEach(agg => {
          const alias = agg.alias || `${agg.function}_${agg.column || 'all'}`;
          outputCols.push({
            name: alias,
            dataType: agg.function.includes('count') ? 'long' : 'double',
            source: nodeLabel
          });
        });

        return outputCols;
      }

      case 'crosstab': {
        // Crosstab creates: col1_col2, and columns for each distinct value in col2
        const col1 = config.column1 as string;
        const col2 = config.column2 as string;
        return [
          { name: `${col1}_${col2}`, dataType: 'string', source: nodeLabel },
          { name: '(crosstab columns)', dataType: 'long', source: nodeLabel }
        ];
      }

      case 'freqItems': {
        // FreqItems creates columns named {column}_freqItems
        const freqCols = config.columns as string;
        if (freqCols) {
          return freqCols.split(',').map(c => ({
            name: `${c.trim()}_freqItems`,
            dataType: 'array<string>',
            source: nodeLabel
          }));
        }
        return [];
      }

      case 'describe': {
        // Describe creates: summary column + columns for each described column
        const describeCols = config.columns as string;
        const result: ColumnInfo[] = [
          { name: 'summary', dataType: 'string', source: nodeLabel }
        ];
        if (describeCols) {
          describeCols.split(',').forEach(c => {
            result.push({ name: c.trim(), dataType: 'string', source: nodeLabel });
          });
        } else {
          // All numeric columns
          inputColumns.forEach(col => {
            result.push({ name: col.name, dataType: 'string', source: nodeLabel });
          });
        }
        return result;
      }

      default:
        // Pass through for other transforms
        return inputColumns.map(col => ({ ...col, source: nodeLabel }));
    }
  }

  return inputColumns;
};

// Get output columns for a specific node
export const getOutputColumnsForNode = (
  nodeId: string,
  nodes: Node<ETLNodeData>[],
  edges: Edge[]
): ColumnInfo[] => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  // For source nodes, return schema directly
  if (node.data.category === 'source') {
    const sourceData = node.data as SourceNodeData;
    if (sourceData.schema) {
      return sourceData.schema.map(col => ({
        name: col.name,
        dataType: col.dataType,
        source: node.data.label
      }));
    }
    return [];
  }

  // For transform nodes, compute based on input and config
  const inputEdges = edges.filter(e => e.target === nodeId);
  if (inputEdges.length === 0) return [];

  const firstInputCols = getOutputColumnsForNode(inputEdges[0].source, nodes, edges);
  let secondInputCols: ColumnInfo[] | null = null;

  if (inputEdges.length > 1) {
    secondInputCols = getOutputColumnsForNode(inputEdges[1].source, nodes, edges);
  }

  return computeOutputColumns(node, firstInputCols, secondInputCols);
};

// Helper to get columns available for a node (from its input nodes)
export const getAvailableColumns = (
  nodeId: string,
  nodes: Node<ETLNodeData>[],
  edges: Edge[]
): ColumnInfo[] => {
  // Get input edges
  const inputEdges = edges.filter(e => e.target === nodeId);
  if (inputEdges.length === 0) return [];

  // Collect columns from all input nodes
  const allInputColumns: ColumnInfo[][] = [];

  inputEdges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (!sourceNode) return;

    // Recursively get the output columns from the source node
    const sourceInputEdges = edges.filter(e => e.target === sourceNode.id);
    let sourceInputCols: ColumnInfo[] = [];
    let secondSourceInputCols: ColumnInfo[] | null = null;

    if (sourceInputEdges.length > 0) {
      // Get columns from first input
      const firstInputNode = nodes.find(n => n.id === sourceInputEdges[0].source);
      if (firstInputNode) {
        sourceInputCols = getAvailableColumns(sourceNode.id, nodes, edges.filter(e => e.target !== sourceNode.id));
        // Actually we need the output of the first input node
        const firstInputCols = getOutputColumnsForNode(sourceInputEdges[0].source, nodes, edges);
        sourceInputCols = firstInputCols;
      }

      // Get columns from second input (for joins)
      if (sourceInputEdges.length > 1) {
        const secondInputCols = getOutputColumnsForNode(sourceInputEdges[1].source, nodes, edges);
        secondSourceInputCols = secondInputCols;
      }
    }

    // Compute output columns for the source node
    const outputCols = computeOutputColumns(sourceNode, sourceInputCols, secondSourceInputCols);
    allInputColumns.push(outputCols);
  });

  // Flatten all input columns
  const columns: ColumnInfo[] = [];
  allInputColumns.forEach(cols => columns.push(...cols));

  return columns;
};
