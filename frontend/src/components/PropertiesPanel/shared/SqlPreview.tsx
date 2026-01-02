import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Code } from 'lucide-react';

export interface SqlPreviewProps {
  /** The code to display */
  code: string;
  /** Title for the section */
  title?: string;
  /** Whether the section is collapsible */
  collapsible?: boolean;
  /** Whether to start collapsed */
  defaultCollapsed?: boolean;
  /** Language for syntax hints */
  language?: 'python' | 'sql';
  /** Additional className */
  className?: string;
  /** Placeholder when code is empty */
  placeholder?: string;
}

/**
 * SqlPreview - Shows generated PySpark/SQL code with syntax highlighting
 *
 * Usage:
 * ```tsx
 * <SqlPreview
 *   code={generateFilterCode(config)}
 *   title="Generated Code"
 *   collapsible
 * />
 * ```
 */
export const SqlPreview = ({
  code,
  title = 'Generated Code',
  collapsible = true,
  defaultCollapsed = false,
  language = 'python',
  className = '',
  placeholder = 'Configure the transform to see generated code'
}: SqlPreviewProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);

  const hasCode = code && code.trim().length > 0;

  const handleCopy = async () => {
    if (!hasCode) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Simple syntax highlighting for Python/PySpark
  const highlightedCode = useMemo(() => {
    if (!hasCode) return null;

    // Keywords to highlight
    const pythonKeywords = ['def', 'return', 'if', 'else', 'elif', 'for', 'in', 'while', 'True', 'False', 'None', 'and', 'or', 'not', 'import', 'from', 'as', 'class', 'lambda'];
    const sparkKeywords = ['spark', 'df', 'col', 'lit', 'when', 'otherwise', 'filter', 'select', 'groupBy', 'agg', 'join', 'orderBy', 'sort', 'withColumn', 'drop', 'alias', 'cast', 'F'];
    const functions = ['sum', 'avg', 'count', 'min', 'max', 'first', 'last', 'collect_list', 'collect_set', 'row_number', 'rank', 'dense_rank', 'lag', 'lead', 'over', 'partitionBy', 'Window'];

    let result = code;

    // Escape HTML
    result = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight strings (both single and double quotes)
    result = result.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-400">$&</span>');

    // Highlight comments
    result = result.replace(/(#.*)$/gm, '<span class="text-gray-500 italic">$1</span>');

    // Highlight numbers
    result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-purple-400">$1</span>');

    // Highlight Python keywords
    pythonKeywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      result = result.replace(regex, '<span class="text-pink-400">$1</span>');
    });

    // Highlight Spark keywords
    sparkKeywords.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      result = result.replace(regex, '<span class="text-blue-400">$1</span>');
    });

    // Highlight functions
    functions.forEach(fn => {
      const regex = new RegExp(`\\b(${fn})\\b`, 'g');
      result = result.replace(regex, '<span class="text-yellow-400">$1</span>');
    });

    // Highlight F. prefix functions
    result = result.replace(/\bF\.(\w+)/g, '<span class="text-blue-400">F</span>.<span class="text-yellow-400">$1</span>');

    return result;
  }, [code, hasCode]);

  return (
    <div className={`border border-gray-700 rounded overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 bg-gray-800/50
          ${collapsible ? 'cursor-pointer hover:bg-gray-800/70' : ''}
        `}
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          {collapsible && (
            isCollapsed
              ? <ChevronRight className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
          <Code className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-gray-300">{title}</span>
          {language && (
            <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-gray-700 rounded">
              {language}
            </span>
          )}
        </div>

        {hasCode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 hover:text-white
                       bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code area */}
      {(!collapsible || !isCollapsed) && (
        <div className="p-3 bg-gray-900/50 overflow-x-auto">
          {hasCode ? (
            <pre
              className="text-xs font-mono leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedCode || '' }}
            />
          ) : (
            <p className="text-xs text-gray-500 italic">{placeholder}</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * InlineSqlPreview - Compact single-line preview
 */
export interface InlineSqlPreviewProps {
  code: string;
  className?: string;
}

export const InlineSqlPreview = ({ code, className = '' }: InlineSqlPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!code) return null;

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 bg-gray-800/50 rounded border border-gray-700 ${className}`}>
      <code className="flex-1 text-xs font-mono text-gray-300 truncate">{code}</code>
      <button
        onClick={handleCopy}
        className="text-gray-500 hover:text-white"
        title="Copy"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
};
