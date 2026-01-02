import type { PipelineTemplate } from '../types';

export const iotSensorTemplate: PipelineTemplate = {
  id: 'iot-sensor-processing',
  name: 'IoT Sensor Processing',
  description: 'Time-series sensor data pipeline with late data handling',
  category: 'streaming',
  icon: 'cpu',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'IoT Kafka Stream',
        category: 'source',
        sourceType: 'kafka',
        configured: false,
        config: {
          bootstrapServers: 'localhost:9092',
          subscribe: 'iot-sensors',
          startingOffsets: 'latest',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 300, y: 150 },
      data: {
        label: 'Parse Sensor Data',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'sensor_data', expression: "from_json(cast(value as string), 'device_id STRING, temperature DOUBLE, humidity DOUBLE, timestamp TIMESTAMP')", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 500, y: 150 },
      data: {
        label: 'Watermark',
        category: 'transform',
        transformType: 'watermark',
        configured: false,
        config: {
          eventTimeColumn: 'sensor_data.timestamp',
          delayThreshold: '5 minutes',
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 700, y: 150 },
      data: {
        label: 'Window Aggregation',
        category: 'transform',
        transformType: 'streamingWindow',
        configured: false,
        config: {
          windowType: 'tumbling',
          timeColumn: 'sensor_data.timestamp',
          windowDuration: '1 minute',
          groupByColumns: ['sensor_data.device_id'],
          aggregations: [
            { column: 'sensor_data.temperature', function: 'avg', alias: 'avg_temp' },
            { column: 'sensor_data.temperature', function: 'max', alias: 'max_temp' },
            { column: 'sensor_data.humidity', function: 'avg', alias: 'avg_humidity' },
            { column: '*', function: 'count', alias: 'reading_count' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 900, y: 150 },
      data: {
        label: 'Time Series Store',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/iot/sensor_metrics',
          mode: 'append',
          checkpointLocation: '/checkpoints/iot-sensors',
        },
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
