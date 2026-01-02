// Streaming Templates
export { streamingAggTemplate } from './streaming-aggregation';
export { kafkaToDeltaTemplate } from './kafka-to-delta';
export { iotSensorTemplate } from './iot-sensor';
export { clickstreamTemplate } from './clickstream';
export { multiStreamMergeTemplate } from './multi-stream-merge';
export { eventDrivenCdcTemplate } from './event-driven-cdc';
export { eventDeduplicationTemplate } from './event-deduplication';
export { windowedAnalyticsTemplate } from './windowed-analytics';
export { streamStaticJoinTemplate } from './stream-static-join';

import { streamingAggTemplate } from './streaming-aggregation';
import { kafkaToDeltaTemplate } from './kafka-to-delta';
import { iotSensorTemplate } from './iot-sensor';
import { clickstreamTemplate } from './clickstream';
import { multiStreamMergeTemplate } from './multi-stream-merge';
import { eventDrivenCdcTemplate } from './event-driven-cdc';
import { eventDeduplicationTemplate } from './event-deduplication';
import { windowedAnalyticsTemplate } from './windowed-analytics';
import { streamStaticJoinTemplate } from './stream-static-join';
import type { PipelineTemplate } from '../types';

export const streamingTemplates: PipelineTemplate[] = [
  streamingAggTemplate,
  kafkaToDeltaTemplate,
  iotSensorTemplate,
  clickstreamTemplate,
  multiStreamMergeTemplate,
  eventDrivenCdcTemplate,
  eventDeduplicationTemplate,
  windowedAnalyticsTemplate,
  streamStaticJoinTemplate,
];
