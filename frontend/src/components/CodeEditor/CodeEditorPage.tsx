import { useState, useRef, useCallback, useEffect } from 'react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type { editor, IPosition } from 'monaco-editor';
import { Copy, Download, Save, Info, Code, Play, Loader2, ExternalLink } from 'lucide-react';
import { WorkspaceBar } from '../CodePreview/WorkspaceBar';
import { TabBar } from '../CodePreview/TabBar';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useAirflowStore } from '../../stores/airflowStore';
import { isCodePage } from '../../types';
import { executionApi } from '../../services/api';

interface CodeEditorPageProps {
  onOpenHistory?: () => void;
}

export const CodeEditorPage = ({ onOpenHistory }: CodeEditorPageProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [localCode, setLocalCode] = useState<string>('');
  const [editorMounted, setEditorMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Get store methods and state
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const updateCodePageContent = useWorkspaceStore((state) => state.updateCodePageContent);

  // Airflow store
  const airflowStatus = useAirflowStore((state) => state.status);
  const syncDag = useAirflowStore((state) => state.syncDag);
  const openInAirflow = useAirflowStore((state) => state.openInAirflow);
  const startAirflow = useAirflowStore((state) => state.startAirflow);
  const setShowSettingsModal = useAirflowStore((state) => state.setShowSettingsModal);

  // Get active page
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activePage = activeWorkspace?.pages.find(p => p.id === activeWorkspace?.activePageId);

  // Check if this code page is from a DAG source
  const isDagSourced = activePage && isCodePage(activePage) && activePage.sourceType === 'dag';

  // Initialize local code when page changes
  useEffect(() => {
    if (activePage && isCodePage(activePage)) {
      setLocalCode(activePage.code);
      setIsSaved(true);
    }
  }, [activePage?.id]);

  // Handle editor mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setEditorMounted(true);

    // Configure Python language features
    monaco.languages.setLanguageConfiguration('python', {
      comments: {
        lineComment: '#',
        blockComment: ["'''", "'''"],
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"', notIn: ['string'] },
        { open: "'", close: "'", notIn: ['string'] },
        { open: '"""', close: '"""' },
        { open: "'''", close: "'''" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      indentationRules: {
        increaseIndentPattern: /^.*:\s*$/,
        decreaseIndentPattern: /^\s*(elif|else|except|finally)\b.*$/,
      },
    });

    // Add PySpark specific completions
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: editor.ITextModel, position: IPosition) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: editor.IStandaloneCodeEditor[] = [
          // DataFrame operations
          { label: 'select', kind: monaco.languages.CompletionItemKind.Method, insertText: 'select(${1:columns})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Select columns from DataFrame', range },
          { label: 'filter', kind: monaco.languages.CompletionItemKind.Method, insertText: 'filter(${1:condition})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Filter rows based on condition', range },
          { label: 'where', kind: monaco.languages.CompletionItemKind.Method, insertText: 'where(${1:condition})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Filter rows (alias for filter)', range },
          { label: 'groupBy', kind: monaco.languages.CompletionItemKind.Method, insertText: 'groupBy(${1:columns})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Group DataFrame by columns', range },
          { label: 'agg', kind: monaco.languages.CompletionItemKind.Method, insertText: 'agg(${1:expressions})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Aggregate grouped data', range },
          { label: 'join', kind: monaco.languages.CompletionItemKind.Method, insertText: 'join(${1:other}, ${2:on}, ${3:how})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Join with another DataFrame', range },
          { label: 'orderBy', kind: monaco.languages.CompletionItemKind.Method, insertText: 'orderBy(${1:columns})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Sort DataFrame by columns', range },
          { label: 'withColumn', kind: monaco.languages.CompletionItemKind.Method, insertText: 'withColumn("${1:name}", ${2:expr})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Add or replace a column', range },
          { label: 'drop', kind: monaco.languages.CompletionItemKind.Method, insertText: 'drop(${1:columns})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Drop columns', range },
          { label: 'distinct', kind: monaco.languages.CompletionItemKind.Method, insertText: 'distinct()', documentation: 'Return distinct rows', range },
          { label: 'limit', kind: monaco.languages.CompletionItemKind.Method, insertText: 'limit(${1:n})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Limit number of rows', range },
          { label: 'cache', kind: monaco.languages.CompletionItemKind.Method, insertText: 'cache()', documentation: 'Cache DataFrame in memory', range },
          { label: 'persist', kind: monaco.languages.CompletionItemKind.Method, insertText: 'persist()', documentation: 'Persist DataFrame', range },
          { label: 'show', kind: monaco.languages.CompletionItemKind.Method, insertText: 'show(${1:n})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Show first n rows', range },
          { label: 'printSchema', kind: monaco.languages.CompletionItemKind.Method, insertText: 'printSchema()', documentation: 'Print DataFrame schema', range },
          { label: 'count', kind: monaco.languages.CompletionItemKind.Method, insertText: 'count()', documentation: 'Count number of rows', range },
          // Read/Write
          { label: 'spark.read.csv', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'spark.read.csv("${1:path}", header=True, inferSchema=True)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Read CSV file', range },
          { label: 'spark.read.parquet', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'spark.read.parquet("${1:path}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Read Parquet file', range },
          { label: 'spark.read.json', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'spark.read.json("${1:path}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Read JSON file', range },
          { label: '.write.parquet', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '.write.mode("${1:overwrite}").parquet("${2:path}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Write to Parquet', range },
          { label: '.write.csv', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '.write.mode("${1:overwrite}").csv("${2:path}", header=True)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Write to CSV', range },
          // Functions
          { label: 'col', kind: monaco.languages.CompletionItemKind.Function, insertText: 'col("${1:column}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Reference a column', range },
          { label: 'lit', kind: monaco.languages.CompletionItemKind.Function, insertText: 'lit(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Create literal column', range },
          { label: 'when', kind: monaco.languages.CompletionItemKind.Function, insertText: 'when(${1:condition}, ${2:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Conditional expression', range },
          { label: 'otherwise', kind: monaco.languages.CompletionItemKind.Method, insertText: 'otherwise(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Else clause for when', range },
          { label: 'sum', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sum("${1:column}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Sum aggregation', range },
          { label: 'avg', kind: monaco.languages.CompletionItemKind.Function, insertText: 'avg("${1:column}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Average aggregation', range },
          { label: 'count', kind: monaco.languages.CompletionItemKind.Function, insertText: 'count("${1:column}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Count aggregation', range },
          { label: 'max', kind: monaco.languages.CompletionItemKind.Function, insertText: 'max("${1:column}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Max aggregation', range },
          { label: 'min', kind: monaco.languages.CompletionItemKind.Function, insertText: 'min("${1:column}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Min aggregation', range },
        ] as any;

        return { suggestions };
      },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Focus editor
    editor.focus();
  };

  // Handle code change
  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setLocalCode(newCode);
    setIsSaved(false);
  }, []);

  // Save code
  const handleSave = useCallback(() => {
    if (activePage && isCodePage(activePage)) {
      updateCodePageContent(activePage.id, localCode);
      setIsSaved(true);
    }
  }, [activePage, localCode, updateCodePageContent]);

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(localCode);
  };

  // Download code
  const downloadCode = () => {
    if (!activePage) return;
    const filename = activePage.name.replace(/\s+/g, '_').toLowerCase();
    const blob = new Blob([localCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Execute code
  const handleExecute = async () => {
    if (!localCode.trim()) {
      setExecuteError('No code to execute');
      setTimeout(() => setExecuteError(null), 3000);
      return;
    }

    if (!activePage) return;

    setIsExecuting(true);
    setExecuteError(null);

    try {
      await executionApi.execute({
        code: localCode,
        page_id: activePage.id,
      });

      // Open history view to see the execution
      if (onOpenHistory) {
        onOpenHistory();
      }
    } catch (err: any) {
      setExecuteError(err.message || 'Execution failed');
      setTimeout(() => setExecuteError(null), 5000);
    } finally {
      setIsExecuting(false);
    }
  };

  // Get DAG ID from source workflow name (for DAG-sourced code pages)
  const dagId = activePage && isCodePage(activePage) && activePage.sourceWorkflowName
    ? activePage.sourceWorkflowName.toLowerCase().replace(/\s+/g, '_')
    : '';

  // Sync DAG to Airflow
  const handleSyncDag = async () => {
    if (!isDagSourced || !localCode || !dagId) return;

    setIsSyncing(true);
    setSyncMessage(null);

    const result = await syncDag(dagId, localCode);
    setSyncMessage(result.message);
    setIsSyncing(false);

    // Clear message after 3 seconds
    setTimeout(() => setSyncMessage(null), 3000);
  };

  // Open DAG in Airflow UI
  const handleOpenInAirflow = async () => {
    if (!isDagSourced || !dagId) return;

    // First sync the DAG
    await handleSyncDag();

    // Check if Airflow is running
    if (airflowStatus.status !== 'running') {
      const shouldStart = confirm(
        'Airflow is not running. Would you like to start it?\n\n' +
        'This may take 30-60 seconds to initialize.'
      );

      if (shouldStart) {
        const result = await startAirflow();
        if (!result.success) {
          alert(`Failed to start Airflow: ${result.message}`);
          return;
        }
        alert('Airflow is starting. Click OK to open Airflow UI.\n\nDefault credentials: admin / admin');
      } else {
        setShowSettingsModal(true);
        return;
      }
    }

    openInAirflow(dagId);
  };

  // Check if it's a code page
  if (!activePage || !isCodePage(activePage)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-gray-400">No code page selected</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-canvas overflow-hidden">
      {/* Workspace and Tab Navigation */}
      <div className="bg-panel border-b border-gray-700">
        <WorkspaceBar />
        <TabBar />
      </div>

      {/* Header with toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-panel-light border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-purple-400" />
          <h1 className="text-base font-medium text-white">{activePage.name}</h1>
          {!isSaved && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isDagSourced && (
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors
                         ${isSaved
                           ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                           : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'}`}
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-panel
                       hover:bg-gray-700/50 text-gray-300 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-panel
                       hover:bg-gray-700/50 text-gray-300 rounded-md transition-colors"
            title="Download as .py file"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          {isDagSourced ? (
            <>
              <button
                onClick={() => { handleSave(); handleSyncDag(); }}
                disabled={isSyncing || !localCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600/20 hover:bg-orange-600/30
                           text-orange-300 rounded-md transition-colors border border-orange-500/30
                           disabled:opacity-50"
                title="Save DAG to Airflow folder"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
              <button
                onClick={handleOpenInAirflow}
                disabled={!localCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-700
                           text-white rounded-md transition-colors disabled:opacity-50"
                title="Open DAG in Airflow UI"
              >
                <ExternalLink className="w-4 h-4" />
                Airflow
              </button>
            </>
          ) : (
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600
                         hover:bg-green-700 text-white rounded-md transition-colors
                         disabled:opacity-50"
              title="Execute code"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Execute
            </button>
          )}
        </div>
      </div>

      {/* Source info banner */}
      {activePage.sourceWorkflowName && (
        <div className={`flex items-center gap-2 px-4 py-2 border-b ${
          isDagSourced
            ? 'bg-orange-500/10 border-orange-500/20'
            : 'bg-blue-500/10 border-blue-500/20'
        }`}>
          <Info className={`w-4 h-4 ${isDagSourced ? 'text-orange-400' : 'text-blue-400'}`} />
          <span className={`text-sm ${isDagSourced ? 'text-orange-300' : 'text-blue-300'}`}>
            Duplicated from {isDagSourced ? 'DAG' : 'workflow'}: <strong>{activePage.sourceWorkflowName}</strong>
          </span>
          <span className={`text-xs ${isDagSourced ? 'text-orange-400/60' : 'text-blue-400/60'}`}>
            Changes here won't affect the original {isDagSourced ? 'DAG' : 'workflow'}
          </span>
        </div>
      )}

      {/* Sync Message (for DAG code pages) */}
      {syncMessage && (
        <div className="px-4 py-2 bg-orange-500/20 border-b border-orange-500/30 text-orange-300 text-sm">
          {syncMessage}
        </div>
      )}

      {/* Execute Error */}
      {executeError && (
        <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/30 text-red-400 text-sm">
          {executeError}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={localCode}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontLigatures: true,
            minimap: { enabled: true, scale: 0.8 },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 4,
            insertSpaces: true,
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: 'off',
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'mouseover',
            matchBrackets: 'always',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showKeywords: true,
              showWords: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
            },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-panel border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Python
          </span>
          <span>{localCode.split('\n').length} lines</span>
          <span>{localCode.length} characters</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          {editorMounted && <span className="text-green-500">Editor Ready</span>}
        </div>
      </div>
    </div>
  );
};
