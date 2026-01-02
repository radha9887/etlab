import type { PipelineTemplate } from '../types';

export const csvToParquetTemplate: PipelineTemplate = {
  id: 'csv-to-parquet',
  name: 'CSV to Parquet',
  description: 'Simple file format conversion from CSV to Parquet',
  category: 'etl',
  icon: 'fileText',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'CSV Source',
        category: 'source',
        sourceType: 'csv',
        configured: false,
        config: {
          path: '/data/input/*.csv',
          header: true,
          inferSchema: true,
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Cast Types',
        category: 'transform',
        transformType: 'cast',
        configured: false,
        config: {
          columns: [
            { column: 'id', toType: 'integer' },
            { column: 'created_at', toType: 'timestamp' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Parquet Output',
        category: 'sink',
        sinkType: 'parquet',
        configured: false,
        config: {
          path: '/data/output/',
          mode: 'overwrite',
          compression: 'snappy',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
