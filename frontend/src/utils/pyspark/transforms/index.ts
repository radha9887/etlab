import type { Node } from '@xyflow/react';
import type { ETLNodeData, TransformNodeData } from '../../../types';
import { generatePreprocessingCode, isPreprocessingTransform } from '../../preprocessingCodeGenerator';
import { generateBasicTransformCode } from './basic';
import { generateJoinTransformCode } from './joins';
import { generateAggregationTransformCode } from './aggregations';
import { generateDataTransformCode } from './data';
import { generatePerformanceTransformCode } from './performance';
import { generateDeltaTransformCode } from './delta';
import { generateStreamingTransformCode } from './streaming';
import { generateUdfTransformCode } from './udf';
import { generateQualityTransformCode } from './quality';

// Generate code for transform node
export const generateTransformCode = (
  node: Node<ETLNodeData>,
  varName: string,
  inputVarName: string,
  inputVarName2: string | null
): string[] => {
  const data = node.data as TransformNodeData;
  const config = data.config || {};
  const lines: string[] = [];

  lines.push(`# Transform: ${data.label} (${data.transformType})`);

  // Delegate to preprocessing code generator for preprocessing transforms
  if (isPreprocessingTransform(data.transformType)) {
    return [
      `# Transform: ${data.label} (${data.transformType})`,
      ...generatePreprocessingCode(node, varName, inputVarName)
    ];
  }

  // Try each category of transform generators
  let handled = generateBasicTransformCode(data.transformType, varName, inputVarName, config, lines);

  if (!handled) {
    handled = generateJoinTransformCode(data.transformType, varName, inputVarName, inputVarName2, config, lines);
  }

  if (!handled) {
    handled = generateAggregationTransformCode(data.transformType, varName, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateDataTransformCode(data.transformType, varName, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generatePerformanceTransformCode(data.transformType, varName, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateDeltaTransformCode(data.transformType, varName, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateStreamingTransformCode(data.transformType, varName, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateUdfTransformCode(data.transformType, varName, inputVarName, config, lines);
  }

  if (!handled) {
    handled = generateQualityTransformCode(data.transformType, varName, inputVarName, config, lines);
  }

  // Default fallback
  if (!handled) {
    lines.push(`${varName} = ${inputVarName}  # Configure ${data.transformType} transformation`);
  }

  return lines;
};

export { generateBasicTransformCode } from './basic';
export { generateJoinTransformCode } from './joins';
export { generateAggregationTransformCode } from './aggregations';
export { generateDataTransformCode } from './data';
export { generatePerformanceTransformCode } from './performance';
export { generateDeltaTransformCode } from './delta';
export { generateStreamingTransformCode } from './streaming';
export { generateUdfTransformCode } from './udf';
export { generateQualityTransformCode } from './quality';
