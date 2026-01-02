import type { Node } from '@xyflow/react';
import type { ETLNodeData, SinkNodeData } from '../../../types';
import { generateFileSinkCode } from './files';
import { generateDatabaseSinkCode } from './databases';
import { generateLakehouseSinkCode } from './lakehouse';
import { generateStreamingSinkCode } from './streaming';
import { generateOtherSinkCode } from './other';

// Generate code for sink node
export const generateSinkCode = (node: Node<ETLNodeData>, inputVarName: string): string[] => {
  const data = node.data as SinkNodeData;
  const config = data.config || {};
  const lines: string[] = [];
  const mode = config.mode || 'overwrite';
  const path = config.path || 'path/to/output';

  lines.push(`# Sink: ${data.label} (${data.sinkType})`);

  // Try each category of sink generators
  let handled = generateFileSinkCode(data.sinkType, inputVarName, config, lines);

  if (!handled) {
    handled = generateDatabaseSinkCode(data.sinkType, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateLakehouseSinkCode(data.sinkType, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateStreamingSinkCode(data.sinkType, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateOtherSinkCode(data.sinkType, inputVarName, config, lines);
  }

  // Default fallback
  if (!handled) {
    lines.push(`${inputVarName}.write.format("${data.sinkType}").mode("${mode}").save("${path}")`);
  }

  return lines;
};

export { generateFileSinkCode } from './files';
export { generateDatabaseSinkCode } from './databases';
export { generateLakehouseSinkCode } from './lakehouse';
export { generateStreamingSinkCode } from './streaming';
export { generateOtherSinkCode } from './other';
