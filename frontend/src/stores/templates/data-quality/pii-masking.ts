import type { PipelineTemplate } from '../types';

export const piiMaskingTemplate: PipelineTemplate = {
  id: 'pii-masking',
  name: 'PII Masking Pipeline',
  description: 'Detect and mask sensitive personal data for GDPR/CCPA compliance',
  category: 'data-quality',
  icon: 'eyeOff',
  nodes: [
    {
      id: 'template_source_1',
      type: 'etlNode',
      position: { x: 100, y: 150 },
      data: {
        label: 'Customer Data',
        category: 'source',
        sourceType: 'delta',
        configured: false,
        config: {
          path: '/delta/raw/customers',
        },
      },
    },
    {
      id: 'template_transform_1',
      type: 'etlNode',
      position: { x: 350, y: 150 },
      data: {
        label: 'Mask Email',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'email_masked', expression: "concat(substring(email, 1, 2), '***@', split(email, '@')[1])", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_2',
      type: 'etlNode',
      position: { x: 600, y: 150 },
      data: {
        label: 'Mask Phone & SSN',
        category: 'transform',
        transformType: 'addColumn',
        configured: false,
        config: {
          newColumns: [
            { name: 'phone_masked', expression: "concat('***-***-', substring(phone, -4))", expressionType: 'sql' },
            { name: 'ssn_masked', expression: "concat('***-**-', substring(ssn, -4))", expressionType: 'sql' },
          ],
        },
      },
    },
    {
      id: 'template_transform_3',
      type: 'etlNode',
      position: { x: 850, y: 150 },
      data: {
        label: 'Drop Original PII',
        category: 'transform',
        transformType: 'dropColumn',
        configured: false,
        config: {
          columns: 'email,phone,ssn',
        },
      },
    },
    {
      id: 'template_transform_4',
      type: 'etlNode',
      position: { x: 1100, y: 150 },
      data: {
        label: 'Rename Columns',
        category: 'transform',
        transformType: 'rename',
        configured: false,
        config: {
          columns: [
            { oldName: 'email_masked', newName: 'email' },
            { oldName: 'phone_masked', newName: 'phone' },
            { oldName: 'ssn_masked', newName: 'ssn' },
          ],
        },
      },
    },
    {
      id: 'template_sink_1',
      type: 'etlNode',
      position: { x: 1350, y: 150 },
      data: {
        label: 'Compliant Data',
        category: 'sink',
        sinkType: 'delta',
        configured: false,
        config: {
          path: '/delta/compliant/customers',
          mode: 'overwrite',
        },
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'template_source_1', target: 'template_transform_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e2-3', source: 'template_transform_1', target: 'template_transform_2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e3-4', source: 'template_transform_2', target: 'template_transform_3', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e4-5', source: 'template_transform_3', target: 'template_transform_4', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
    { id: 'e5-6', source: 'template_transform_4', target: 'template_sink_1', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
  ],
};
