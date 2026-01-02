import type { DagConfig } from '../../types';

// Generate safe task ID from label
export const toTaskId = (taskId: string): string => {
  return taskId.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
};

// Format Python dict
export const formatDict = (obj: Record<string, any>, indent: number = 4): string => {
  const entries = Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '{}';

  const indentStr = ' '.repeat(indent);
  const lines = entries.map(([k, v]) => {
    const value = typeof v === 'string' ? `"${v}"` :
                  typeof v === 'boolean' ? (v ? 'True' : 'False') :
                  JSON.stringify(v);
    return `${indentStr}"${k}": ${value},`;
  });

  return `{\n${lines.join('\n')}\n${' '.repeat(indent - 4)}}`;
};

// Generate default_args dictionary
export const generateDefaultArgs = (config: DagConfig): string[] => {
  const args = config.defaultArgs;
  const lines: string[] = ['default_args = {'];

  lines.push(`    "owner": "${args.owner}",`);
  lines.push(`    "depends_on_past": False,`);
  lines.push(`    "retries": ${args.retries},`);
  lines.push(`    "retry_delay": timedelta(minutes=${args.retryDelayMinutes}),`);
  lines.push(`    "execution_timeout": timedelta(minutes=${args.executionTimeoutMinutes}),`);

  if (args.email) {
    lines.push(`    "email": ["${args.email}"],`);
    lines.push(`    "email_on_failure": ${args.emailOnFailure ? 'True' : 'False'},`);
    lines.push(`    "email_on_retry": ${args.emailOnRetry ? 'True' : 'False'},`);
  }

  lines.push('}');
  return lines;
};

// Generate schedule string
export const generateSchedule = (config: DagConfig): string => {
  const schedule = config.schedule;

  if (schedule.type === 'manual') {
    return 'None';
  } else if (schedule.type === 'preset') {
    return `"${schedule.preset}"`;
  } else if (schedule.type === 'cron') {
    return `"${schedule.cron}"`;
  }

  return 'None';
};

// Generate advanced task settings (pool, priority, trigger_rule, etc.)
export const generateAdvancedSettings = (config: any): string[] => {
  const lines: string[] = [];

  // Resource pool settings
  if (config.pool) {
    lines.push(`        pool="${config.pool}",`);
  }
  if (config.poolSlots && config.poolSlots !== 1) {
    lines.push(`        pool_slots=${config.poolSlots},`);
  }
  if (config.priorityWeight && config.priorityWeight !== 1) {
    lines.push(`        priority_weight=${config.priorityWeight},`);
  }
  if (config.queue) {
    lines.push(`        queue="${config.queue}",`);
  }

  // Trigger rule
  if (config.triggerRule && config.triggerRule !== 'all_success') {
    lines.push(`        trigger_rule="${config.triggerRule}",`);
  }

  // Dependency settings
  if (config.dependsOnPast) {
    lines.push(`        depends_on_past=True,`);
  }
  if (config.waitForDownstream) {
    lines.push(`        wait_for_downstream=True,`);
  }

  // Task-level retry settings
  if (config.retries !== undefined) {
    lines.push(`        retries=${config.retries},`);
  }
  if (config.retryDelaySeconds) {
    lines.push(`        retry_delay=timedelta(seconds=${config.retryDelaySeconds}),`);
  }
  if (config.retryExponentialBackoff) {
    lines.push(`        retry_exponential_backoff=True,`);
  }
  if (config.maxRetryDelay) {
    lines.push(`        max_retry_delay=timedelta(seconds=${config.maxRetryDelay}),`);
  }

  return lines;
};
