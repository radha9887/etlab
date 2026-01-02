import type { Node } from '@xyflow/react';
import type { DagTaskNodeData } from '../../../types';
import { toTaskId, generateAdvancedSettings } from '../helpers';
import { generateCoreOperatorCode } from './core';
import { generateAwsOperatorCode } from './aws';
import { generateGcpOperatorCode } from './gcp';
import { generateAzureOperatorCode } from './azure';
import { generateOtherOperatorCode } from './other';

// Generate task code for each node type
export const generateTaskCode = (
  task: Node<DagTaskNodeData>
): string[] => {
  const data = task.data;
  const config = data.config as any;
  const taskId = toTaskId(config.taskId || data.label);
  const lines: string[] = [];

  // Helper to close task with advanced settings
  const closeTask = () => {
    const advancedLines = generateAdvancedSettings(config);
    lines.push(...advancedLines);
    lines.push(`    )`);
  };

  // Try each operator module in order
  if (generateCoreOperatorCode(data.type, taskId, config, lines, closeTask)) {
    lines.push('');
    return lines;
  }

  if (generateAwsOperatorCode(data.type, taskId, config, lines, closeTask)) {
    lines.push('');
    return lines;
  }

  if (generateGcpOperatorCode(data.type, taskId, config, lines, closeTask)) {
    lines.push('');
    return lines;
  }

  if (generateAzureOperatorCode(data.type, taskId, config, lines, closeTask)) {
    lines.push('');
    return lines;
  }

  if (generateOtherOperatorCode(data.type, taskId, config, lines, closeTask)) {
    lines.push('');
    return lines;
  }

  // Default fallback for unknown types
  lines.push(`    # Unknown task type: ${data.type}`);
  lines.push(`    ${taskId} = EmptyOperator(`);
  lines.push(`        task_id="${taskId}",`);
  closeTask();
  lines.push('');

  return lines;
};

// Re-export individual generators for direct access if needed
export { generateCoreOperatorCode } from './core';
export { generateAwsOperatorCode } from './aws';
export { generateGcpOperatorCode } from './gcp';
export { generateAzureOperatorCode } from './azure';
export { generateOtherOperatorCode } from './other';
