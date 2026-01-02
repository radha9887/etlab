import type { PipelineTemplate } from '../types';

export const jsonFlatteningTemplate: PipelineTemplate = {
  id: 'json-flattening',
  name: 'JSON Flattening',
  description: 'Flatten nested JSON structures to tabular format',
  category: 'etl',
  icon: 'maximize2',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Nested JSON',
        category: 'source',
        sourceType: 'json',
        configured: false,
        config: { path: '/data/nested/*.json', multiLine: true },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Explode Arrays',
        category: 'transform',
        transformType: 'explode',
        configured: false,
        config: { column: 'items', alias: 'item' },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Flatten Struct',
        category: 'transform',
        transformType: 'select',
        configured: false,
        config: {
          columns: ['id', 'name', 'item.product_id as product_id', 'item.quantity as quantity', 'item.price as price'],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Flat Output',
        category: 'sink',
        sinkType: 'parquet',
        configured: false,
        config: { path: '/data/flattened/', mode: 'overwrite' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
