import type { Node, Edge } from '@xyflow/react';
import type { ETLNodeData, DagNodeCategory, DagNodeType } from '../../types';

// ETL Pipeline Template (PySpark)
export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: 'etl' | 'streaming' | 'data-quality' | 'optimization';
  icon: string;
  nodes: Node<ETLNodeData>[];
  edges: Edge[];
}

// DAG Template Categories
export type DagTemplateCategory = 'data-pipeline' | 'ml-pipeline' | 'data-quality' | 'infrastructure';

// Flexible DAG node data for templates (less strict than DagTaskNodeData)
export interface DagTemplateNodeData {
  label: string;
  type: DagNodeType | string;
  category: DagNodeCategory | string;
  configured: boolean;
  config: Record<string, unknown>;
  [key: string]: unknown; // Index signature for Node<T> compatibility
}

// Flexible DAG config for templates
export interface DagTemplateSuggestedConfig {
  schedule?: {
    type: string;
    cron?: string;
    interval?: string;
  };
  catchup?: boolean;
  tags?: string[];
  defaultArgs?: {
    retries?: number;
    retryDelayMinutes?: number;
    owner?: string;
    executionTimeoutMinutes?: number;
    emailOnFailure?: boolean;
    emailOnRetry?: boolean;
  };
}

// Airflow DAG Template
export interface DagTemplate {
  id: string;
  name: string;
  description: string;
  category: DagTemplateCategory;
  icon: string;
  nodes: Node<DagTemplateNodeData>[];
  edges: Edge[];
  suggestedConfig?: DagTemplateSuggestedConfig;
}
