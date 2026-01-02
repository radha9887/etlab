import { useMemo } from 'react';
import { Copy, Download, Code, Play } from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import { generatePySparkCode } from '../../utils/codeGenerator';

export const CodePreview = () => {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  // Generate PySpark code based on nodes and their configurations
  const { code: generatedCode } = useMemo(() => {
    return generatePySparkCode(nodes, edges);
  }, [nodes, edges]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'etl_job.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-64 bg-panel border-t border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-300">
          <Code className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Generated PySpark Code</span>
          <span className="text-xs text-gray-500">
            ({nodes.length} nodes, {edges.length} connections)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-panel-light hover:bg-accent/20
                       text-gray-300 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-panel-light hover:bg-accent/20
                       text-gray-300 rounded-md transition-colors"
            title="Download as .py file"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-accent hover:bg-accent-hover
                       text-white rounded-md transition-colors"
            title="Generate full code"
          >
            <Play className="w-3.5 h-3.5" />
            Generate
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs text-gray-300 font-mono whitespace-pre">
          {generatedCode}
        </pre>
      </div>
    </div>
  );
};
