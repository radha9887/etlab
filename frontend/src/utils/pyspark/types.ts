import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, Column } from '../../types';

export interface CodeGeneratorResult {
  code: string;
  errors: string[];
}

export interface ColumnInfo {
  name: string;
  dataType: string;
  source: string;
}

export type ETLNode = Node<ETLNodeData>;
export type ETLEdge = Edge;

// Re-export types used by generators
export type { Column };
