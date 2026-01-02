import type { PipelineTemplate } from '../types';

export const fullMedallionTemplate: PipelineTemplate = {
  id: 'full-medallion',
  name: 'Full Medallion Pipeline',
  description: 'Complete Bronze → Silver → Gold lakehouse architecture',
  category: 'etl',
  icon: 'layers',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Raw Data',
        category: 'source',
        sourceType: 'json',
        configured: false,
        config: { path: '/data/landing/*.json', multiLine: true },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 300, y: 150 },
      data: {
        label: 'Bronze: Add Metadata',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: '_ingested_at', expression: 'current_timestamp()', expressionType: 'sql' },
            { name: '_source_file', expression: 'input_file_name()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 500, y: 50 },
      data: {
        label: 'Bronze Table',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/bronze/data', mode: 'append' },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 500, y: 150 },
      data: {
        label: 'Silver: Clean & Dedupe',
        category: 'transform',
        transformType: 'dropDuplicates',
        configured: false,
        config: { columns: ['id'] },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 700, y: 150 },
      data: {
        label: 'Silver: Standardize',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'processed_at', expression: 'current_timestamp()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 900, y: 50 },
      data: {
        label: 'Silver Table',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/silver/data', mode: 'overwrite' },
      },
    },
    {
      id: 'template_transform_4',
      type: 'etlNode',
      position: { x: 900, y: 150 },
      data: {
        label: 'Gold: Aggregate',
        category: 'transform',
        transformType: 'aggregate',
        configured: false,
        config: {
          groupByColumns: ['category', 'region'],
          aggregations: [
            { column: 'amount', function: 'sum', alias: 'total_amount' },
            { column: 'id', function: 'count', alias: 'record_count' },
          ],
        },
      },
    },
    {
      id: 'template_sink_3',
      type: 'etlNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Gold Table',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/gold/aggregates', mode: 'overwrite' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-s1', source: 'template_transform_1', target: 'template_sink_1', animated: true, style: { stroke: '#cd7f32', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-s2', source: 'template_transform_3', target: 'template_sink_2', animated: true, style: { stroke: '#c0c0c0', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_3', target: 'template_transform_4', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-s3', source: 'template_transform_4', target: 'template_sink_3', animated: true, style: { stroke: '#ffd700', strokeWidth: 2 } },
  ],
};
