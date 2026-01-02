import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FolderOpen, Plus, Pencil, Trash2, Settings, Workflow, GitBranch, LayoutTemplate, Share2, Download, Upload } from 'lucide-react';
import { useWorkspaceStore, type WorkspaceExport } from '../../stores/workspaceStore';
import { useSchemaStore } from '../../stores/schemaStore';
import { useTemplateStore } from '../../stores/templateStore';
import { useAuthStore } from '../../stores/authStore';
import { AirflowStatusBadge } from '../AirflowSettings';
import { UserMenu } from '../User';
import { ShareWorkspaceModal } from '../Sharing';

export const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddPageMenu, setShowAddPageMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addPageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to specific state slices for reactivity
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const renameWorkspace = useWorkspaceStore((state) => state.renameWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const createPage = useWorkspaceStore((state) => state.createPage);
  const createDagPage = useWorkspaceStore((state) => state.createDagPage);
  const exportWorkspace = useWorkspaceStore((state) => state.exportWorkspace);
  const importWorkspace = useWorkspaceStore((state) => state.importWorkspace);

  // Schema store for including schemas in export
  const schemas = useSchemaStore((state) => state.schemas);

  // Derive active workspace from subscribed state
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Template store
  const openTemplateModal = useTemplateStore((state) => state.openModal);

  // Auth store - for checking if user is logged in
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close workspace dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
        setEditingId(null);
      }

      // Close add page menu
      if (addPageRef.current && !addPageRef.current.contains(target)) {
        setShowAddPageMenu(false);
      }
    };

    // Use click instead of mousedown for more reliable behavior
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Focus input when editing
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameWorkspace(id, editName.trim());
    }
    setEditingId(null);
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleAddWorkspace = () => {
    createWorkspace();
  };

  const handleAddPage = (type: 'workflow' | 'dag') => {
    if (type === 'dag') {
      createDagPage();
    } else {
      createPage();
    }
    setShowAddPageMenu(false);
  };

  // Export workspace to JSON file
  const handleExport = () => {
    const exportData = exportWorkspace();
    if (!exportData) {
      alert('No workspace to export');
      return;
    }

    // Include schemas in export
    exportData.schemas = schemas;

    // Create and download JSON file
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeWorkspace?.name || 'workspace'}-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import workspace from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as WorkspaceExport;

        // Validate the import
        if (!data.workspace || !data.workspace.pages) {
          throw new Error('Invalid workspace export format');
        }

        importWorkspace(data);
        alert(`Successfully imported workspace with ${data.workspace.pages.length} pages`);
      } catch (error) {
        alert('Failed to import workspace. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be imported again
    event.target.value = '';
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-panel border-b border-gray-700">
      {/* Left: Logo/Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <span className="text-gray-200 font-semibold text-lg">ETLab</span>
      </div>

      {/* Center: Workspace Selector */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-panel-light hover:bg-gray-700
                       rounded-lg transition-colors text-sm border border-gray-600"
          >
            <FolderOpen className="w-4 h-4 text-accent" />
            <span className="text-gray-200 font-medium max-w-[200px] truncate">
              {activeWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-panel-light border border-gray-600
                            rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Workspaces</span>
                <button
                  onClick={handleAddWorkspace}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-accent hover:bg-accent/20 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </button>
              </div>

              {/* Workspace List */}
              <div className="max-h-64 overflow-y-auto">
                {workspaces.map((workspace) => {
                  const isOwner = workspace.myRole === 'owner' || !workspace.myRole;
                  const sharedByName = workspace.owner?.name;

                  return (
                    <div
                      key={workspace.id}
                      className={`flex items-center gap-2 px-3 py-2.5 hover:bg-gray-700 cursor-pointer
                                  ${workspace.id === activeWorkspaceId ? 'bg-accent/20 border-l-2 border-accent' : ''}`}
                      onClick={() => {
                        if (editingId !== workspace.id) {
                          setActiveWorkspace(workspace.id);
                          setShowDropdown(false);
                        }
                      }}
                    >
                      <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isOwner ? 'text-gray-400' : 'text-blue-400'}`} />

                      {editingId === workspace.id ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => handleRename(workspace.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(workspace.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="flex-1 bg-gray-800 text-gray-200 text-sm px-2 py-1
                                     rounded border border-gray-600 outline-none focus:border-accent"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-200 truncate block">
                            {workspace.name}
                          </span>
                          {!isOwner && sharedByName && (
                            <span className="text-xs text-blue-400 truncate block">
                              shared by {sharedByName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Role badge */}
                      {!isOwner && workspace.myRole && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          workspace.myRole === 'editor' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {workspace.myRole}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        {/* Only show rename for owner */}
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(workspace.id, workspace.name);
                            }}
                            className="p-1.5 hover:bg-gray-600 rounded"
                            title="Rename"
                          >
                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        )}
                        {/* Only show delete for owner and when there's more than one workspace */}
                        {isOwner && workspaces.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete workspace "${workspace.name}"?`)) {
                                deleteWorkspace(workspace.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-500/20 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Add Page Button */}
        <div className="relative" ref={addPageRef}>
          <button
            onClick={() => setShowAddPageMenu(!showAddPageMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/80
                       rounded-lg transition-colors text-sm text-white"
            title="Add new page"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Add Page Dropdown */}
          {showAddPageMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-panel-light border border-gray-600
                            rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => handleAddPage('workflow')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700
                           transition-colors"
              >
                <Workflow className="w-4 h-4 text-accent" />
                <div>
                  <div className="font-medium">PySpark Pipeline</div>
                  <div className="text-xs text-gray-400">Visual ETL workflow</div>
                </div>
              </button>
              <button
                onClick={() => handleAddPage('dag')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-gray-700
                           transition-colors border-t border-gray-600"
              >
                <GitBranch className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="font-medium">Airflow DAG</div>
                  <div className="text-xs text-gray-400">Orchestration workflow</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Templates, Export/Import, Share, Airflow Status, Settings & User */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => openTemplateModal()}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
          title="Pipeline Templates"
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Templates</span>
        </button>

        {/* Export/Import buttons */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
          title="Export Workspace"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
        <button
          onClick={() => importInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
          title="Import Workspace"
        >
          <Upload className="w-4 h-4" />
          <span>Import</span>
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Share button - only show when logged in and user is owner */}
        {isAuthenticated && activeWorkspace && (activeWorkspace.myRole === 'owner' || !activeWorkspace.myRole) && (
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
            title="Share Workspace"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        )}
        <AirflowStatusBadge />
        <button
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
          title="Settings (coming soon)"
        >
          <Settings className="w-5 h-5" />
        </button>
        <UserMenu />
      </div>

      {/* Share Workspace Modal */}
      {activeWorkspace && (
        <ShareWorkspaceModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
        />
      )}
    </header>
  );
};
