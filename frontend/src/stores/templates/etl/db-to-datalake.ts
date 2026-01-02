import type { PipelineTemplate } from '../types';

export const dbToDataLakeTemplate: PipelineTemplate = {
  id: 'db-to-datalake',
  name: 'Database to Data Lake',
  description: 'Extract data from JDBC source and load to Delta Lake',
  category: 'etl',
  icon: 'database',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Database Source',
        category: 'source',
        sourceType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://localhost:5432/mydb',
          dbtable: 'source_table',
          user: 'username',
          password: '****',
          fetchsize: 10000,
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Select Columns',
        category: 'transform',
        transformType: 'select',
        configured: false,
        config: {
          columns: ['id', 'name', 'email', 'created_at', 'updated_at'],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Add Metadata',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'ingestion_timestamp', expression: 'current_timestamp()', expressionType: 'sql' },
            { name: 'source_system', expression: "'postgresql'", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Delta Lake',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/raw_data',
          mode: 'overwrite',
          mergeSchema: true,
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
