import type { Node } from '@xyflow/react';
import type { DagTaskNodeData } from '../../../types';
import { getCoreImports } from './core';
import { getAwsImports } from './aws';
import { getGcpImports } from './gcp';
import { getAzureImports } from './azure';
import { getOtherImports } from './other';

// Generate imports based on task types used
export const generateImports = (tasks: Node<DagTaskNodeData>[]): string[] => {
  const imports: Set<string> = new Set([
    'from datetime import datetime, timedelta',
    'from airflow import DAG',
  ]);

  const operatorImports: Set<string> = new Set();

  tasks.forEach(task => {
    const data = task.data;

    // Get imports from each provider module
    const allImports = [
      ...getCoreImports(data.type),
      ...getAwsImports(data.type),
      ...getGcpImports(data.type),
      ...getAzureImports(data.type),
      ...getOtherImports(data.type),
    ];

    allImports.forEach(imp => operatorImports.add(imp));
  });

  return [...imports, '', ...Array.from(operatorImports).sort()];
};

// Re-export individual modules for direct access if needed
export { getCoreImports } from './core';
export { getAwsImports } from './aws';
export { getGcpImports } from './gcp';
export { getAzureImports } from './azure';
export { getOtherImports } from './other';
