import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, ActionNodeData } from '../../types';
import { topologicalSort, toVarName, getInputNodes } from './helpers';
import { generateSourceCode } from './sources';
import { generateTransformCode } from './transforms';
import { generateSinkCode } from './sinks';
import { generateActionCode } from './actions';

// Cell types for notebook-style view
export interface CodeCell {
  id: string;
  title: string;
  cellType: 'markdown' | 'code';
  code: string;
  nodeId?: string;  // Reference to the node that generated this cell
  category?: 'imports' | 'source' | 'transform' | 'sink' | 'action' | 'footer';
}

export interface CodeGeneratorResult {
  code: string;
  cells: CodeCell[];
  errors: string[];
}

// Main code generator function
export const generatePySparkCode = (nodes: Node<ETLNodeData>[], edges: Edge[]): CodeGeneratorResult => {
  const errors: string[] = [];
  const lines: string[] = [];
  const cells: CodeCell[] = [];

  if (nodes.length === 0) {
    const emptyCode = `# ETLab - PySpark Code Generator
#
# Drag nodes from the sidebar to the canvas to build your ETL workflow.
# Connect nodes by dragging from output handles to input handles.
#
# Your generated PySpark code will appear here.

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.functions import col, lit, when, broadcast

# Initialize Spark Session
spark = SparkSession.builder \\
    .appName("etl_job") \\
    .getOrCreate()

# Add your data sources, transformations, and sinks...

spark.stop()`;

    return {
      code: emptyCode,
      cells: [{
        id: 'empty',
        title: 'Getting Started',
        cellType: 'code',
        code: emptyCode,
        category: 'imports'
      }],
      errors: []
    };
  }

  // Imports cell
  const importsCode = `from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.functions import col, lit, when, broadcast
from pyspark.sql.window import Window
from pyspark.sql.types import *`;

  cells.push({
    id: 'imports',
    title: 'Imports',
    cellType: 'code',
    code: importsCode,
    category: 'imports'
  });

  // Spark Session cell
  const sparkSessionCode = `# Initialize Spark Session
spark = SparkSession.builder \\
    .appName("etl_job") \\
    .getOrCreate()`;

  cells.push({
    id: 'spark-session',
    title: 'Spark Session',
    cellType: 'code',
    code: sparkSessionCode,
    category: 'imports'
  });

  // Header for full code
  lines.push('# ETLab - Generated PySpark Code');
  lines.push(`# Generated at: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(importsCode);
  lines.push('');
  lines.push(sparkSessionCode);
  lines.push('');

  // Sort nodes topologically
  const sortedNodes = topologicalSort(nodes, edges);

  // Map node IDs to variable names
  const nodeVarMap = new Map<string, string>();
  sortedNodes.forEach(node => {
    nodeVarMap.set(node.id, toVarName(node.id, node.data.label));
  });

  // Generate code for each node
  lines.push('# ===========================================');
  lines.push('# ETL Pipeline');
  lines.push('# ===========================================');
  lines.push('');

  sortedNodes.forEach(node => {
    const varName = nodeVarMap.get(node.id)!;
    const inputs = getInputNodes(node.id, edges);
    const inputVarName = inputs.length > 0 ? nodeVarMap.get(inputs[0].inputNodeId) || 'df_input' : 'df_input';

    // Get second input for joins/unions
    let inputVarName2: string | null = null;
    if (inputs.length > 1) {
      // Find the one connected to input-2
      const input2 = inputs.find(i => i.handle === 'input-2');
      if (input2) {
        inputVarName2 = nodeVarMap.get(input2.inputNodeId) || null;
      } else {
        inputVarName2 = nodeVarMap.get(inputs[1].inputNodeId) || null;
      }
    }

    let nodeLines: string[] = [];
    let cellCategory: CodeCell['category'] = 'transform';

    if (node.data.category === 'source') {
      nodeLines = generateSourceCode(node, varName);
      cellCategory = 'source';
    } else if (node.data.category === 'transform') {
      nodeLines = generateTransformCode(node, varName, inputVarName, inputVarName2);
      cellCategory = 'transform';
    } else if (node.data.category === 'sink') {
      nodeLines = generateSinkCode(node, inputVarName);
      cellCategory = 'sink';
    } else if (node.data.category === 'action') {
      nodeLines = generateActionCode(node as Node<ActionNodeData>, inputVarName);
      cellCategory = 'action';
    }

    // Add cell for this node
    cells.push({
      id: `node-${node.id}`,
      title: node.data.label,
      cellType: 'code',
      code: nodeLines.join('\n'),
      nodeId: node.id,
      category: cellCategory
    });

    lines.push(...nodeLines);
    lines.push('');
  });

  // Footer
  const footerCode = `spark.stop()
print("ETL job completed successfully!")`;

  cells.push({
    id: 'footer',
    title: 'Cleanup',
    cellType: 'code',
    code: footerCode,
    category: 'footer'
  });

  lines.push('# ===========================================');
  lines.push('# End of Pipeline');
  lines.push('# ===========================================');
  lines.push(`# Pipeline complete: ${nodes.length} nodes, ${edges.length} connections`);
  lines.push('# ===========================================');
  lines.push('');
  lines.push(footerCode);

  return { code: lines.join('\n'), cells, errors };
};

// Re-export all modules for direct access
export * from './types';
export * from './helpers';
export * from './sources';
export * from './transforms';
export * from './sinks';
export * from './actions';
export * from './columns';
