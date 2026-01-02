import { useState, useRef, useEffect } from 'react';
import { X, Copy, Code, Workflow, GitBranch } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { isWorkflowPage, isCodePage, isDagPage } from '../../types';

export const TabBar = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to specific state slices for reactivity
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const deletePage = useWorkspaceStore((state) => state.deletePage);
  const renamePage = useWorkspaceStore((state) => state.renamePage);
  const setActivePage = useWorkspaceStore((state) => state.setActivePage);
  const duplicatePage = useWorkspaceStore((state) => state.duplicatePage);

  // Derive active workspace and pages from subscribed state
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const pages = activeWorkspace?.pages || [];
  const activePageId = activeWorkspace?.activePageId;

  // Focus input when editing
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleRename = (pageId: string) => {
    if (editName.trim()) {
      renamePage(pageId, editName.trim());
    }
    setEditingId(null);
  };

  const startEditing = (pageId: string, currentName: string) => {
    setEditingId(pageId);
    setEditName(currentName);
  };

  const handleTabClick = (pageId: string) => {
    if (editingId !== pageId) {
      setActivePage(pageId);
    }
  };

  const handleDeletePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (pages.length > 1) {
      const page = pages.find(p => p.id === pageId);
      const pageName = page?.name || 'this page';
      const pageType = isDagPage(page!) ? 'DAG' : isCodePage(page!) ? 'code' : 'workflow';

      if (confirm(`Delete ${pageType} page "${pageName}"?\n\nThis action cannot be undone.`)) {
        deletePage(pageId);
      }
    }
  };

  const handleDuplicatePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    duplicatePage(pageId);
  };

  return (
    <div className="flex items-center bg-panel-light border-b border-gray-700 overflow-x-auto">
      {/* Tab List with + button inline */}
      <div className="flex items-center flex-1 min-w-0">
        {pages.map((page) => {
          const isActive = page.id === activePageId;
          const isCode = isCodePage(page);
          const isDag = isDagPage(page);
          const hasContent = isWorkflowPage(page)
            ? (page.nodes?.length > 0 || page.edges?.length > 0)
            : isCode ? page.code?.length > 0
            : isDag ? (page.tasks?.length > 0 || page.edges?.length > 0)
            : false;

          // Choose icon based on page type
          const IconComponent = isCode ? Code : isDag ? GitBranch : Workflow;
          const iconColorActive = isCode ? 'text-purple-400' : isDag ? 'text-orange-400' : 'text-accent';
          const iconColorInactive = isCode ? 'text-purple-400/60' : isDag ? 'text-orange-400/60' : 'text-gray-500';
          const borderColor = isCode ? 'border-b-purple-400' : isDag ? 'border-b-orange-400' : 'border-b-accent';
          const dotColor = isCode ? 'bg-purple-400' : isDag ? 'bg-orange-400' : 'bg-accent';

          return (
            <div
              key={page.id}
              onClick={() => handleTabClick(page.id)}
              onDoubleClick={() => startEditing(page.id, page.name)}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer
                          border-r border-gray-700 min-w-[100px] max-w-[180px]
                          ${isActive
                            ? `bg-panel border-b-2 ${borderColor}`
                            : 'hover:bg-gray-700/50'}`}
            >
              <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? iconColorActive : iconColorInactive}`} />

              {editingId === page.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(page.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 min-w-0 bg-gray-800 text-gray-200 text-xs px-1.5 py-0.5
                             rounded border border-gray-600 outline-none focus:border-accent"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={`flex-1 text-xs truncate ${isActive ? 'text-gray-200' : 'text-gray-400'}`}>
                  {page.name}
                </span>
              )}

              {/* Content indicator */}
              {hasContent && !editingId && (
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                  title="Has content"
                />
              )}

              {/* Action buttons - show on hover or when active */}
              <div className={`flex items-center gap-0.5 flex-shrink-0
                              ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                              transition-opacity`}>
                <button
                  onClick={(e) => handleDuplicatePage(e, page.id)}
                  className="p-0.5 hover:bg-gray-600 rounded"
                  title="Duplicate page"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={(e) => handleDeletePage(e, page.id)}
                    className="p-0.5 hover:bg-red-500/20 rounded"
                    title="Close page"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
