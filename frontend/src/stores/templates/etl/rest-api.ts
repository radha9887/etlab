import type { PipelineTemplate } from '../types';

export const restApiTemplate: PipelineTemplate = {
  id: 'rest-api-ingestion',
  name: 'REST API Ingestion',
  description: 'Ingest data from HTTP/REST APIs',
  category: 'etl',
  icon: 'download',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'REST API Source',
        category: 'source',
        sourceType: 'http',
        configured: false,
        config: {
          url: 'https://api.example.com/data',
          method: 'GET',
          headers: { 'Authorization': 'Bearer ${API_TOKEN}' },
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Parse Response',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'data', expression: "from_json(response, 'array<struct<id:string,name:string,value:double>>')", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Explode & Flatten',
        category: 'transform',
        transformType: 'explode',
        configured: false,
        config: { column: 'data', alias: 'record' },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Add Ingestion Time',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'ingested_at', expression: 'current_timestamp()', expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'API Data Lake',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: { path: '/delta/api_data', mode: 'append' },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_3', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
