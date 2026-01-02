import type { Node, Edge } from '@xyflow/react';
import type { DagTaskNodeData } from '../../types';
import { toTaskId } from './helpers';

// Generate task dependencies from edges
export const generateDependencies = (
  tasks: Node<DagTaskNodeData>[],
  edges: Edge[]
): string[] => {
  const lines: string[] = [];

  if (edges.length === 0) {
    return lines;
  }

  lines.push('    # Task dependencies');

  // Create a map of task IDs
  const taskIdMap = new Map<string, string>();
  tasks.forEach(task => {
    const config = task.data.config as any;
    const taskId = toTaskId(config.taskId || task.data.label);
    taskIdMap.set(task.id, taskId);
  });

  // Group edges by source for cleaner output
  const edgesBySource = new Map<string, string[]>();
  edges.forEach(edge => {
    const sourceTaskId = taskIdMap.get(edge.source);
    const targetTaskId = taskIdMap.get(edge.target);

    if (sourceTaskId && targetTaskId) {
      if (!edgesBySource.has(sourceTaskId)) {
        edgesBySource.set(sourceTaskId, []);
      }
      edgesBySource.get(sourceTaskId)!.push(targetTaskId);
    }
  });

  // Generate dependency lines
  edgesBySource.forEach((targets, source) => {
    if (targets.length === 1) {
      lines.push(`    ${source} >> ${targets[0]}`);
    } else if (targets.length > 1) {
      lines.push(`    ${source} >> [${targets.join(', ')}]`);
    }
  });

  return lines;
};
