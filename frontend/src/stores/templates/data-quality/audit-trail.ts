import type { PipelineTemplate } from '../types';

export const auditTrailTemplate: PipelineTemplate = {
  id: 'audit-trail',
  name: 'Audit Trail Pipeline',
  description: 'Track all data changes with full history',
  category: 'data-quality',
  icon: 'fileText',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Source Data',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: { path: '/delta/source' },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Add Audit Columns',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'audit_timestamp', expression: 'current_timestamp()', expressionType: 'sql' },
            { name: 'audit_date', expression: 'current_date()', expressionType: 'sql' },
            { name: 'audit_user', expression: "'etl_pipeline'", expressionType: 'sql' },
            { name: 'audit_operation', expression: "'INSERT'", expressionType: 'sql' },
            { name: 'audit_batch_id', expression: 'uuid()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Hash Row',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'row_hash', expression: "sha2(concat_ws('|', id, name, value), 256)", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Audit Table',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/audit_history', mode: 'append', partitionBy: ['audit_date'] },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
