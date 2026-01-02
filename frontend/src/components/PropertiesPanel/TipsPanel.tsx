import { Lightbulb, AlertTriangle, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { getTip } from '../../utils/tips';

interface TipsPanelProps {
  category: string;
  nodeType: string;
  shuffleType?: 'narrow' | 'wide';
}

export const TipsPanel = ({ category, nodeType, shuffleType }: TipsPanelProps) => {
  const tip = getTip(category, nodeType);

  if (!tip) {
    return null;
  }

  return (
    <div className="border-t border-gray-700 pt-3 mt-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-gray-200">Tips & Best Practices</span>
      </div>

      {/* Shuffle Type Indicator */}
      {shuffleType && (
        <div className={`mb-3 p-2 rounded-lg ${
          shuffleType === 'narrow'
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-orange-500/10 border border-orange-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              shuffleType === 'narrow' ? 'bg-green-500' : 'bg-orange-500'
            }`}></span>
            <span className={`text-xs font-medium ${
              shuffleType === 'narrow' ? 'text-green-400' : 'text-orange-400'
            }`}>
              {shuffleType === 'narrow' ? 'Narrow Transform' : 'Wide Transform'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-4">
            {shuffleType === 'narrow'
              ? 'No shuffle required - data stays on same partitions'
              : 'Causes data shuffle across network - can be expensive'}
          </p>
        </div>
      )}

      {/* Main Tips */}
      <div className="space-y-2">
        {tip.detailedTips.map((tipText, index) => (
          <div key={index} className="flex items-start gap-2 text-xs text-gray-300">
            <ArrowRight className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
            <span>{tipText}</span>
          </div>
        ))}
      </div>

      {/* Performance Note */}
      {tip.performanceNote && (
        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-blue-400">Performance</span>
              <p className="text-xs text-gray-300 mt-0.5">{tip.performanceNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* Best Practice */}
      {tip.bestPractice && (
        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-green-400">Best Practice</span>
              <p className="text-xs text-gray-300 mt-0.5">{tip.bestPractice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Common Pitfall */}
      {tip.commonPitfall && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs font-medium text-red-400">Common Pitfall</span>
              <p className="text-xs text-gray-300 mt-0.5">{tip.commonPitfall}</p>
            </div>
          </div>
        </div>
      )}

      {/* Related Nodes */}
      {tip.relatedNodes && tip.relatedNodes.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <span className="text-xs text-gray-500">Related transforms: </span>
          <span className="text-xs text-gray-400">
            {tip.relatedNodes.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
};
