import type { PipelineTemplate } from '../types';

export const bronzeLayerTemplate: PipelineTemplate = {
  id: 'bronze-layer',
  name: 'Bronze Layer Ingestion',
  description: 'Raw data landing zone with metadata tracking for medallion architecture',
  category: 'etl',
  icon: 'layers',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Raw Data Source',
        category: 'source',
        sourceType: 'json',
        configured: false,
        config: {
          path: '/data/landing/*.json',
          multiLine: true,
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Add Bronze Metadata',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: '_ingested_at', expression: 'current_timestamp()', expressionType: 'sql' },
            { name: '_source_file', expression: 'input_file_name()', expressionType: 'sql' },
            { name: '_row_id', expression: 'uuid()', expressionType: 'sql' },
            { name: '_batch_id', expression: "'${batch_id}'", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Bronze Delta Table',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/bronze/raw_data',
          mode: 'append',
          mergeSchema: true,
          partitionBy: ['_ingested_at'],
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
