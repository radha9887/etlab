import type { PipelineTemplate } from '../types';

export const graphDataTemplate: PipelineTemplate = {
  id: 'graph-data-pipeline',
  name: 'Graph Data Pipeline',
  description: 'Transform relational data to graph format for Neo4j',
  category: 'etl',
  icon: 'share2',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 100 },
      data: {
        label: 'Users Table',
        category: 'source',
        sourceType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://localhost:5432/app',
          dbtable: 'users',
          user: 'user',
          password: '****',
        },
      },
    },
    {
      id: 'template_source_2',
      type: 'etlNode',
      position: { x: 100, y: 250 },
      data: {
        label: 'Friendships Table',
        category: 'source',
        sourceType: 'jdbc',
        configured: false,
        config: {
          url: 'jdbc:postgresql://localhost:5432/app',
          dbtable: 'friendships',
          user: 'user',
          password: '****',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'Create Node Labels',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'node_label', expression: "'User'", expressionType: 'sql' },
            { name: 'node_id', expression: "concat('user_', id)", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 350, y: 250 },
      data: {
        label: 'Create Relationships',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'relationship_type', expression: "'FRIENDS_WITH'", expressionType: 'sql' },
            { name: 'source_node', expression: "concat('user_', user_id)", expressionType: 'sql' },
            { name: 'target_node', expression: "concat('user_', friend_id)", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 600, y: 100 },
      data: {
        label: 'Neo4j Nodes',
        category: 'sink',
        sinkType: 'neo4j',
        configured: false,
        config: { uri: 'bolt://localhost:7687', database: 'neo4j', labels: 'User', nodeKeys: 'node_id' },
      },
    },
    {
      id: 'template_sink_2',
      type: 'etlNode',
      position: { x: 600, y: 250 },
      data: {
        label: 'Neo4j Relationships',
        category: 'sink',
        sinkType: 'neo4j',
        configured: false,
        config: { uri: 'bolt://localhost:7687', database: 'neo4j', saveMode: 'relationship', relationshipType: 'FRIENDS_WITH' },
      },
    },
  ],
  edges: [
    { id: 'e1-3', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-4', source: 'template_source_2', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-5', source: 'template_transform_1', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-6', source: 'template_transform_2', target: 'template_sink_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
