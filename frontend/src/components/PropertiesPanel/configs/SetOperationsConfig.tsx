import { Save } from 'lucide-react';
import type { TransformNodeData } from '../../../types';

// Intersect Configuration Component
interface IntersectConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const IntersectConfig = ({ onUpdate }: IntersectConfigProps) => {
  const handleSave = () => {
    onUpdate({ configured: true });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400 mb-2">
          <strong>Intersect</strong> returns only rows that exist in <em>both</em> DataFrames.
        </p>
        <p className="text-[10px] text-gray-500">
          Both inputs must have the same schema (column names and types).
        </p>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-xs text-blue-400">
          Connect a second input to this node using the context menu (right-click → Add Second Input).
        </p>
      </div>

      <div className="text-[10px] text-gray-500 space-y-1">
        <p><strong>Example:</strong></p>
        <p>Input A: [1, 2, 3, 4]</p>
        <p>Input B: [3, 4, 5, 6]</p>
        <p>Result: [3, 4]</p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};

// Subtract Configuration Component
interface SubtractConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const SubtractConfig = ({ onUpdate }: SubtractConfigProps) => {
  const handleSave = () => {
    onUpdate({ configured: true });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400 mb-2">
          <strong>Subtract</strong> returns rows from the first DataFrame that are <em>not</em> in the second.
        </p>
        <p className="text-[10px] text-gray-500">
          Also known as "except" or "difference". Both inputs must have the same schema.
        </p>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-xs text-blue-400">
          Connect a second input to this node using the context menu (right-click → Add Second Input).
        </p>
      </div>

      <div className="text-[10px] text-gray-500 space-y-1">
        <p><strong>Example:</strong></p>
        <p>Input A (primary): [1, 2, 3, 4]</p>
        <p>Input B (subtract): [3, 4, 5, 6]</p>
        <p>Result: [1, 2]</p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};

// IntersectAll Configuration Component
interface IntersectAllConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const IntersectAllConfig = ({ onUpdate }: IntersectAllConfigProps) => {
  const handleSave = () => {
    onUpdate({ configured: true });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400 mb-2">
          <strong>Intersect All</strong> returns rows that exist in both DataFrames, <em>preserving duplicates</em>.
        </p>
        <p className="text-[10px] text-gray-500">
          Unlike intersect, this keeps duplicate rows from both sides.
        </p>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-xs text-blue-400">
          Connect a second input to this node using the context menu (right-click → Add Second Input).
        </p>
      </div>

      <div className="text-[10px] text-gray-500 space-y-1">
        <p><strong>Example:</strong></p>
        <p>Input A: [1, 1, 2, 3]</p>
        <p>Input B: [1, 2, 2, 3]</p>
        <p>Result: [1, 2, 3] (keeps one occurrence of each match)</p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};

// ExceptAll Configuration Component
interface ExceptAllConfigProps {
  data: TransformNodeData;
  onUpdate: (config: Record<string, unknown>) => void;
}

export const ExceptAllConfig = ({ onUpdate }: ExceptAllConfigProps) => {
  const handleSave = () => {
    onUpdate({ configured: true });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-panel rounded border border-gray-700">
        <p className="text-xs text-gray-400 mb-2">
          <strong>Except All</strong> returns rows from the first DataFrame not in the second, <em>preserving duplicates</em>.
        </p>
        <p className="text-[10px] text-gray-500">
          Unlike subtract, this preserves duplicate counts.
        </p>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
        <p className="text-xs text-blue-400">
          Connect a second input to this node using the context menu (right-click → Add Second Input).
        </p>
      </div>

      <div className="text-[10px] text-gray-500 space-y-1">
        <p><strong>Example:</strong></p>
        <p>Input A: [1, 1, 2, 2, 3]</p>
        <p>Input B: [1, 2]</p>
        <p>Result: [1, 2, 3] (removes one occurrence of each match)</p>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded text-sm transition-colors"
      >
        <Save className="w-4 h-4" /> Save Configuration
      </button>
    </div>
  );
};
