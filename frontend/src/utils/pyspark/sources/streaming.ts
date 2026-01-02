// Generate code for streaming sources (kafka, kinesis, eventHubs, pubsub, pulsar)
export const generateStreamingSourceCode = (
  sourceType: string,
  varName: string,
  config: Record<string, unknown>,
  lines: string[]
): boolean => {
  switch (sourceType) {
    case 'kafka': {
      lines.push(`${varName} = spark.read \\`);
      lines.push(`    .format("kafka") \\`);
      lines.push(`    .option("kafka.bootstrap.servers", "${config.bootstrapServers || 'localhost:9092'}") \\`);
      if (config.subscribeMode === 'pattern') {
        lines.push(`    .option("subscribePattern", "${config.subscribe || 'topic-*'}") \\`);
      } else {
        lines.push(`    .option("subscribe", "${config.subscribe || 'topic'}") \\`);
      }
      lines.push(`    .option("startingOffsets", "${config.startingOffsets || 'latest'}") \\`);
      if (config.endingOffsets && config.endingOffsets !== 'latest') {
        lines.push(`    .option("endingOffsets", "${config.endingOffsets}") \\`);
      }
      if (config.maxOffsetsPerTrigger) {
        lines.push(`    .option("maxOffsetsPerTrigger", ${config.maxOffsetsPerTrigger}) \\`);
      }
      if (config.failOnDataLoss === false) {
        lines.push(`    .option("failOnDataLoss", False) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    case 'kinesis': {
      const streamName = config.streamName as string || 'my-kinesis-stream';
      const region = config.region as string || 'us-east-1';
      const startingPosition = config.startingPosition as string || 'latest';

      lines.push(`# AWS Kinesis Streaming Source`);
      lines.push(`# Note: Requires spark-sql-kinesis package`);
      lines.push(`${varName} = spark.readStream \\`);
      lines.push(`    .format("kinesis") \\`);
      lines.push(`    .option("streamName", "${streamName}") \\`);
      lines.push(`    .option("region", "${region}") \\`);
      lines.push(`    .option("initialPosition", "${startingPosition}") \\`);
      if (config.endpointUrl) {
        lines.push(`    .option("endpointUrl", "${config.endpointUrl}") \\`);
      }
      if (config.awsAccessKeyId) {
        lines.push(`    .option("awsAccessKey", "${config.awsAccessKeyId}") \\`);
        lines.push(`    .option("awsSecretKey", "${config.awsSecretAccessKey || '***'}") \\`);
      }
      if (startingPosition === 'at_timestamp' && config.startingTimestamp) {
        lines.push(`    .option("startingTimestamp", "${config.startingTimestamp}") \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    case 'eventHubs': {
      const connectionString = config.connectionString as string || 'Endpoint=sb://...';
      const consumerGroup = config.consumerGroup as string || '$Default';
      const startingPosition = config.startingPosition as string || 'latest';

      lines.push(`# Azure Event Hubs Streaming Source`);
      lines.push(`# Note: Requires azure-eventhubs-spark package`);
      lines.push(`import json`);
      lines.push(``);
      lines.push(`# Event Hubs configuration`);
      lines.push(`eh_conf = {`);
      lines.push(`    "eventhubs.connectionString": sc._jvm.org.apache.spark.eventhubs.EventHubsUtils.encrypt("${connectionString}"),`);
      lines.push(`    "eventhubs.consumerGroup": "${consumerGroup}",`);

      if (startingPosition === 'earliest') {
        lines.push(`    "eventhubs.startingPosition": json.dumps({"offset": "-1", "isInclusive": True}),`);
      } else if (startingPosition === 'enqueued_time' && config.enqueuedTime) {
        lines.push(`    "eventhubs.startingPosition": json.dumps({"enqueuedTime": "${config.enqueuedTime}"}),`);
      } else {
        lines.push(`    "eventhubs.startingPosition": json.dumps({"offset": "@latest"}),`);
      }
      if (config.maxEventsPerTrigger) {
        lines.push(`    "eventhubs.maxEventsPerTrigger": ${config.maxEventsPerTrigger},`);
      }
      lines.push(`}`);
      lines.push(``);
      lines.push(`${varName} = spark.readStream \\`);
      lines.push(`    .format("eventhubs") \\`);
      lines.push(`    .options(**eh_conf) \\`);
      lines.push(`    .load()`);
      return true;
    }

    case 'pubsub': {
      const projectId = config.projectId as string || 'my-gcp-project';
      const subscription = config.subscription as string || 'projects/my-project/subscriptions/my-subscription';

      lines.push(`# Google Cloud Pub/Sub Streaming Source`);
      lines.push(`# Note: Requires spark-streaming-pubsub package`);
      lines.push(`${varName} = spark.readStream \\`);
      lines.push(`    .format("pubsub") \\`);
      lines.push(`    .option("project", "${projectId}") \\`);
      lines.push(`    .option("subscription", "${subscription}") \\`);
      if (config.credentialsFile) {
        lines.push(`    .option("credentialsFile", "${config.credentialsFile}") \\`);
      }
      if (config.messagesPerSecond) {
        lines.push(`    .option("messagesPerSecond", ${config.messagesPerSecond}) \\`);
      }
      if (config.includeAttributes) {
        lines.push(`    .option("includeAttributes", True) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    case 'pulsar': {
      lines.push(`# Apache Pulsar Streaming Source`);
      lines.push(`# Note: Requires pulsar-spark package`);
      lines.push(`${varName} = spark.readStream \\`);
      lines.push(`    .format("pulsar") \\`);
      lines.push(`    .option("service.url", "${config.serviceUrl || 'pulsar://localhost:6650'}") \\`);
      if (config.adminUrl) {
        lines.push(`    .option("admin.url", "${config.adminUrl}") \\`);
      }
      lines.push(`    .option("topics", "${config.topics || 'persistent://tenant/namespace/topic'}") \\`);
      if (config.subscriptionName) {
        lines.push(`    .option("subscriptionName", "${config.subscriptionName}") \\`);
      }
      if (config.startingPosition) {
        lines.push(`    .option("startingOffsets", "${config.startingPosition}") \\`);
      }
      if (config.subscriptionType) {
        lines.push(`    .option("subscriptionType", "${config.subscriptionType}") \\`);
      }
      if (config.allowDifferentTopicSchemas) {
        lines.push(`    .option("allowDifferentTopicSchemas", True) \\`);
      }
      lines.push(`    .load()`);
      return true;
    }

    default:
      return false;
  }
};
