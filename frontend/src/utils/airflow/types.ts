import type { Node, Edge } from '@xyflow/react';
import type { DagTaskNodeData, DagConfig } from '../../types';

export interface AirflowCodeResult {
  code: string;
  errors: string[];
}

// Re-export types for convenience
export type { Node, Edge, DagTaskNodeData, DagConfig };
