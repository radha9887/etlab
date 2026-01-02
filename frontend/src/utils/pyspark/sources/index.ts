import type { Node } from '@xyflow/react';
import type { ETLNodeData, SourceNodeData } from '../../../types';
import { generateFileSourceCode } from './files';
import { generateDatabaseSourceCode } from './databases';
import { generateLakehouseSourceCode } from './lakehouse';
import { generateStreamingSourceCode } from './streaming';
import { generateOtherSourceCode } from './other';

// Generate code for source node
export const generateSourceCode = (node: Node<ETLNodeData>, varName: string): string[] => {
  const data = node.data as SourceNodeData;
  const config = data.config || {};
  const lines: string[] = [];

  lines.push(`# Source: ${data.label}`);

  // Try each category of source generators
  let handled = generateFileSourceCode(data.sourceType, varName, config, data.schema, lines);

  if (!handled) {
    handled = generateDatabaseSourceCode(data.sourceType, varName, config, lines);
  }

  if (!handled) {
    handled = generateLakehouseSourceCode(data.sourceType, varName, config, lines);
  }

  if (!handled) {
    handled = generateStreamingSourceCode(data.sourceType, varName, config, lines);
  }

  if (!handled) {
    handled = generateOtherSourceCode(data.sourceType, varName, config, lines);
  }

  // Default fallback
  if (!handled) {
    lines.push(`${varName} = spark.read.format("${data.sourceType}").load("${config.path || 'path/to/data'}")`);
  }

  // Add schema columns if available
  if (data.schema && data.schema.length > 0) {
    lines.push(`# Columns: ${data.schema.map(c => c.name).join(', ')}`);
  }

  return lines;
};

export { generateFileSourceCode } from './files';
export { generateDatabaseSourceCode } from './databases';
export { generateLakehouseSourceCode } from './lakehouse';
export { generateStreamingSourceCode } from './streaming';
export { generateOtherSourceCode } from './other';
