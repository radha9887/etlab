import type { Node, Edge } from '@xyflow/react';
import type { DagTaskNodeData, DagNodeType } from '../types';

// Validation severity levels
export type ValidationSeverity = 'error' | 'warning' | 'info';

// Single validation issue
export interface ValidationIssue {
  id: string;
  nodeId?: string;
  edgeId?: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
  suggestion?: string;
}

// Validation result for a single node
export interface NodeValidation {
  nodeId: string;
  isValid: boolean;
  issues: ValidationIssue[];
}

// Overall DAG validation result
export interface DagValidationResult {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  issues: ValidationIssue[];
  nodeValidations: Map<string, NodeValidation>;
  stats: {
    totalNodes: number;
    totalEdges: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

// Sensor node types for timeout validation
const sensorTypes: Set<DagNodeType> = new Set([
  'file_sensor',
  's3_sensor',
  'sql_sensor',
  'http_sensor',
  'external_sensor',
  'gcs_sensor',
  'azure_blob_sensor',
  'delta_sensor',
]);

/**
 * Detect circular dependencies in the DAG
 * Uses DFS with color marking (white/gray/black)
 */
const detectCircularDependencies = (
  nodes: Node<DagTaskNodeData>[],
  edges: Edge[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  nodes.forEach(node => adjacency.set(node.id, []));
  edges.forEach(edge => {
    const targets = adjacency.get(edge.source);
    if (targets) targets.push(edge.target);
  });

  // Color states: 0=white (unvisited), 1=gray (in progress), 2=black (done)
  const color = new Map<string, number>();
  nodes.forEach(node => color.set(node.id, 0));

  // Parent tracking for cycle path
  const parent = new Map<string, string | null>();

  const dfs = (nodeId: string): string | null => {
    color.set(nodeId, 1); // Gray - visiting

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const neighborColor = color.get(neighbor);

      if (neighborColor === 1) {
        // Found cycle - trace back to find the cycle
        parent.set(neighbor, nodeId);
        return neighbor; // Return cycle start node
      }

      if (neighborColor === 0) {
        parent.set(neighbor, nodeId);
        const cycleStart = dfs(neighbor);
        if (cycleStart !== null) return cycleStart;
      }
    }

    color.set(nodeId, 2); // Black - done
    return null;
  };

  // Run DFS from each unvisited node
  for (const node of nodes) {
    if (color.get(node.id) === 0) {
      parent.set(node.id, null);
      const cycleStart = dfs(node.id);

      if (cycleStart !== null) {
        // Build cycle path for error message
        const cyclePath: string[] = [cycleStart];
        let current = parent.get(cycleStart);
        while (current && current !== cycleStart) {
          cyclePath.unshift(current);
          current = parent.get(current);
        }
        cyclePath.push(cycleStart); // Close the cycle

        const nodeLabels = cyclePath.map(id => {
          const node = nodes.find(n => n.id === id);
          return node?.data.label || id;
        });

        issues.push({
          id: `circular-${cycleStart}`,
          severity: 'error',
          code: 'CIRCULAR_DEPENDENCY',
          message: `Circular dependency detected: ${nodeLabels.join(' → ')}`,
          suggestion: 'Remove one of the edges to break the cycle.',
        });

        // Only report one cycle at a time to keep it manageable
        break;
      }
    }
  }

  return issues;
};

/**
 * Detect unreachable tasks (nodes with no path from any source)
 */
const detectUnreachableTasks = (
  nodes: Node<DagTaskNodeData>[],
  edges: Edge[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) return issues;

  // Find nodes with no incoming edges (potential start nodes)
  const inDegree = new Map<string, number>();
  nodes.forEach(node => inDegree.set(node.id, 0));
  edges.forEach(edge => {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  const startNodes = nodes.filter(node => inDegree.get(node.id) === 0);

  if (startNodes.length === 0 && nodes.length > 0) {
    // All nodes have incoming edges = likely all in cycles
    issues.push({
      id: 'no-start-nodes',
      severity: 'warning',
      code: 'NO_START_NODES',
      message: 'No starting tasks found. All tasks have dependencies.',
      suggestion: 'Add at least one task without upstream dependencies to start the DAG.',
    });
    return issues;
  }

  // BFS from all start nodes to find reachable nodes
  const reachable = new Set<string>();
  const queue = startNodes.map(n => n.id);

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  nodes.forEach(node => adjacency.set(node.id, []));
  edges.forEach(edge => {
    const targets = adjacency.get(edge.source);
    if (targets) targets.push(edge.target);
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (reachable.has(nodeId)) continue;
    reachable.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      if (!reachable.has(neighbor)) {
        queue.push(neighbor);
      }
    });
  }

  // Find unreachable nodes
  nodes.forEach(node => {
    if (!reachable.has(node.id)) {
      issues.push({
        id: `unreachable-${node.id}`,
        nodeId: node.id,
        severity: 'warning',
        code: 'UNREACHABLE_TASK',
        message: `Task "${node.data.label}" is not reachable from any starting task.`,
        suggestion: 'Connect this task to the main DAG flow or remove it.',
      });
    }
  });

  return issues;
};

/**
 * Detect tasks with no downstream dependencies (leaf nodes warning for non-sink tasks)
 */
const detectOrphanedTasks = (
  nodes: Node<DagTaskNodeData>[],
  edges: Edge[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Find nodes with no outgoing edges
  const hasOutgoing = new Set<string>();
  edges.forEach(edge => hasOutgoing.add(edge.source));

  // Types that are typically leaf nodes (expected to have no downstream)
  const expectedLeafTypes: Set<DagNodeType> = new Set([
    'email', 'slack', 'ms_teams', 'pagerduty', 'opsgenie', // Notifications
    'dummy', // Dummy/placeholder
  ]);

  nodes.forEach(node => {
    if (!hasOutgoing.has(node.id) && !expectedLeafTypes.has(node.data.type)) {
      // Check if it has upstream (not isolated)
      const hasUpstream = edges.some(e => e.target === node.id);
      if (hasUpstream) {
        issues.push({
          id: `orphan-${node.id}`,
          nodeId: node.id,
          severity: 'info',
          code: 'NO_DOWNSTREAM',
          message: `Task "${node.data.label}" has no downstream tasks.`,
          suggestion: 'This may be intentional if this is a final task.',
        });
      }
    }
  });

  return issues;
};

/**
 * Detect duplicate task IDs
 */
const detectDuplicateTaskIds = (
  nodes: Node<DagTaskNodeData>[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const taskIdCount = new Map<string, Node<DagTaskNodeData>[]>();

  nodes.forEach(node => {
    const taskId = (node.data.config as any)?.taskId || node.data.label;
    const existing = taskIdCount.get(taskId) || [];
    existing.push(node);
    taskIdCount.set(taskId, existing);
  });

  taskIdCount.forEach((nodesWithId, taskId) => {
    if (nodesWithId.length > 1) {
      const nodeLabels = nodesWithId.map(n => n.data.label).join(', ');
      nodesWithId.forEach(node => {
        issues.push({
          id: `duplicate-${node.id}`,
          nodeId: node.id,
          severity: 'error',
          code: 'DUPLICATE_TASK_ID',
          message: `Duplicate task ID "${taskId}" found in: ${nodeLabels}`,
          suggestion: 'Each task must have a unique task ID.',
        });
      });
    }
  });

  return issues;
};

/**
 * Validate sensor configurations
 */
const validateSensorConfigs = (
  nodes: Node<DagTaskNodeData>[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  nodes.forEach(node => {
    if (!sensorTypes.has(node.data.type)) return;

    const config = node.data.config as unknown as Record<string, unknown>;
    const timeout = config.timeoutSeconds as number || config.timeout as number;
    const pokeInterval = config.pokeIntervalSeconds as number || config.pokeInterval as number || 60;
    const mode = config.mode as string || 'poke';

    // Check timeout vs poke interval
    if (timeout && pokeInterval && timeout < pokeInterval) {
      issues.push({
        id: `sensor-timeout-${node.id}`,
        nodeId: node.id,
        severity: 'error',
        code: 'SENSOR_TIMEOUT_INVALID',
        message: `Sensor "${node.data.label}" timeout (${timeout}s) is less than poke interval (${pokeInterval}s).`,
        suggestion: 'Increase timeout or decrease poke interval.',
      });
    }

    // Warn about very short poke intervals in poke mode
    if (mode === 'poke' && pokeInterval < 30) {
      issues.push({
        id: `sensor-poke-short-${node.id}`,
        nodeId: node.id,
        severity: 'warning',
        code: 'SENSOR_POKE_SHORT',
        message: `Sensor "${node.data.label}" has a very short poke interval (${pokeInterval}s).`,
        suggestion: 'Consider using reschedule mode or increasing the interval to reduce load.',
      });
    }

    // Warn about very long timeouts
    if (timeout && timeout > 86400) { // > 24 hours
      issues.push({
        id: `sensor-timeout-long-${node.id}`,
        nodeId: node.id,
        severity: 'warning',
        code: 'SENSOR_TIMEOUT_LONG',
        message: `Sensor "${node.data.label}" has a very long timeout (${Math.round(timeout / 3600)}h).`,
        suggestion: 'Consider using deferrable mode to save worker resources.',
      });
    }

    // Suggest deferrable for sensors in poke mode
    if (mode === 'poke' && !config.deferrable) {
      issues.push({
        id: `sensor-not-deferrable-${node.id}`,
        nodeId: node.id,
        severity: 'info',
        code: 'SENSOR_NOT_DEFERRABLE',
        message: `Sensor "${node.data.label}" could use deferrable mode for better resource usage.`,
        suggestion: 'Enable deferrable mode if your Airflow setup supports async triggers.',
      });
    }
  });

  return issues;
};

/**
 * Validate node configurations
 */
const validateNodeConfigs = (
  nodes: Node<DagTaskNodeData>[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  nodes.forEach(node => {
    const config = node.data.config as unknown as Record<string, unknown>;

    // Check if node is not configured
    if (!node.data.configured) {
      issues.push({
        id: `not-configured-${node.id}`,
        nodeId: node.id,
        severity: 'warning',
        code: 'NOT_CONFIGURED',
        message: `Task "${node.data.label}" is not configured.`,
        suggestion: 'Click on the task to configure its settings.',
      });
    }

    // Check for missing task ID
    const taskId = config.taskId as string;
    if (!taskId || taskId.trim() === '') {
      issues.push({
        id: `missing-taskid-${node.id}`,
        nodeId: node.id,
        severity: 'error',
        code: 'MISSING_TASK_ID',
        message: `Task "${node.data.label}" is missing a task ID.`,
        suggestion: 'Provide a unique task ID for this task.',
      });
    }

    // Validate task ID format (alphanumeric + underscore only)
    if (taskId && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(taskId)) {
      issues.push({
        id: `invalid-taskid-${node.id}`,
        nodeId: node.id,
        severity: 'error',
        code: 'INVALID_TASK_ID',
        message: `Task ID "${taskId}" contains invalid characters.`,
        suggestion: 'Use only letters, numbers, and underscores. Start with a letter or underscore.',
      });
    }

    // Check retry configuration
    const retries = config.retries as number;
    const retryDelay = config.retryDelayMinutes as number || config.retryDelay as number;
    if (retries && retries > 0 && (!retryDelay || retryDelay <= 0)) {
      issues.push({
        id: `missing-retry-delay-${node.id}`,
        nodeId: node.id,
        severity: 'warning',
        code: 'MISSING_RETRY_DELAY',
        message: `Task "${node.data.label}" has retries but no retry delay.`,
        suggestion: 'Set a retry delay to avoid immediate retry failures.',
      });
    }

    // Type-specific validations
    switch (node.data.type) {
      case 'python':
        if (!config.pythonCallable && !config.callable) {
          issues.push({
            id: `missing-callable-${node.id}`,
            nodeId: node.id,
            severity: 'error',
            code: 'MISSING_PYTHON_CALLABLE',
            message: `Python task "${node.data.label}" is missing a callable function.`,
            suggestion: 'Provide a Python callable function.',
          });
        }
        break;

      case 'bash':
        if (!config.bashCommand && !config.command) {
          issues.push({
            id: `missing-command-${node.id}`,
            nodeId: node.id,
            severity: 'error',
            code: 'MISSING_BASH_COMMAND',
            message: `Bash task "${node.data.label}" is missing a command.`,
            suggestion: 'Provide a bash command to execute.',
          });
        }
        break;

      case 'etl_task':
        if (!config.etlPageId && !config.pageName) {
          issues.push({
            id: `missing-etl-page-${node.id}`,
            nodeId: node.id,
            severity: 'error',
            code: 'MISSING_ETL_PAGE',
            message: `ETL task "${node.data.label}" is missing a page reference.`,
            suggestion: 'Select an ETL workflow page to execute.',
          });
        }
        break;

      case 'trigger_dag':
        if (!config.triggerDagId && !config.dagId) {
          issues.push({
            id: `missing-trigger-dag-${node.id}`,
            nodeId: node.id,
            severity: 'error',
            code: 'MISSING_TRIGGER_DAG',
            message: `Trigger DAG task "${node.data.label}" is missing a target DAG ID.`,
            suggestion: 'Specify the DAG ID to trigger.',
          });
        }
        break;

      case 'email':
        if (!config.to && !config.toEmail) {
          issues.push({
            id: `missing-email-to-${node.id}`,
            nodeId: node.id,
            severity: 'error',
            code: 'MISSING_EMAIL_TO',
            message: `Email task "${node.data.label}" is missing recipient address.`,
            suggestion: 'Provide at least one recipient email address.',
          });
        }
        break;
    }
  });

  return issues;
};

/**
 * Main DAG validation function
 */
export const validateDag = (
  nodes: Node<DagTaskNodeData>[],
  edges: Edge[]
): DagValidationResult => {
  const allIssues: ValidationIssue[] = [];

  // Run all validations
  allIssues.push(...detectCircularDependencies(nodes, edges));
  allIssues.push(...detectUnreachableTasks(nodes, edges));
  allIssues.push(...detectOrphanedTasks(nodes, edges));
  allIssues.push(...detectDuplicateTaskIds(nodes));
  allIssues.push(...validateSensorConfigs(nodes));
  allIssues.push(...validateNodeConfigs(nodes));

  // Build node validation map
  const nodeValidations = new Map<string, NodeValidation>();
  nodes.forEach(node => {
    const nodeIssues = allIssues.filter(issue => issue.nodeId === node.id);
    nodeValidations.set(node.id, {
      nodeId: node.id,
      isValid: !nodeIssues.some(i => i.severity === 'error'),
      issues: nodeIssues,
    });
  });

  // Calculate stats
  const errorCount = allIssues.filter(i => i.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  const infoCount = allIssues.filter(i => i.severity === 'info').length;

  return {
    isValid: errorCount === 0,
    hasErrors: errorCount > 0,
    hasWarnings: warningCount > 0,
    issues: allIssues,
    nodeValidations,
    stats: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      errorCount,
      warningCount,
      infoCount,
    },
  };
};

/**
 * Get validation status for a specific node
 */
export const getNodeValidationStatus = (
  nodeId: string,
  validation: DagValidationResult
): { hasErrors: boolean; hasWarnings: boolean; issues: ValidationIssue[] } => {
  const nodeValidation = validation.nodeValidations.get(nodeId);
  if (!nodeValidation) {
    return { hasErrors: false, hasWarnings: false, issues: [] };
  }

  return {
    hasErrors: nodeValidation.issues.some(i => i.severity === 'error'),
    hasWarnings: nodeValidation.issues.some(i => i.severity === 'warning'),
    issues: nodeValidation.issues,
  };
};

/**
 * Get summary message for validation result
 */
export const getValidationSummary = (validation: DagValidationResult): string => {
  const { stats } = validation;

  if (stats.errorCount === 0 && stats.warningCount === 0) {
    return 'DAG is valid';
  }

  const parts: string[] = [];
  if (stats.errorCount > 0) {
    parts.push(`${stats.errorCount} error${stats.errorCount > 1 ? 's' : ''}`);
  }
  if (stats.warningCount > 0) {
    parts.push(`${stats.warningCount} warning${stats.warningCount > 1 ? 's' : ''}`);
  }

  return parts.join(', ');
};
