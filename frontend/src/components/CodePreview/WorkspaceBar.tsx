import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FolderOpen, Plus, Pencil, Trash2, Download, Upload } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import type { Workspace } from '../../types';

export const WorkspaceBar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to specific state slices for reactivity
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const renameWorkspace = useWorkspaceStore((state) => state.renameWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  // Derive active workspace from subscribed state
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setEditingId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleExport = () => {
    if (!activeWorkspace) return;

    const exportData = JSON.stringify(activeWorkspace, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeWorkspace.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as Workspace;

        // Validate the imported data has required fields
        if (!importedData.name || !importedData.pages || !Array.isArray(importedData.pages)) {
          alert('Invalid workspace file format');
          return;
        }

        // Generate new IDs to avoid conflicts
        const now = new Date().toISOString();
        const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newWorkspaceId = generateId();
        const pageIdMap = new Map<string, string>();

        // Create new page IDs
        importedData.pages.forEach(page => {
          pageIdMap.set(page.id, generateId());
        });

        // Create the imported workspace with new IDs
        const newPages = importedData.pages.map(page => ({
          ...page,
          id: pageIdMap.get(page.id) || generateId(),
          createdAt: now,
          updatedAt: now,
        }));

        const newActivePageId = pageIdMap.get(importedData.activePageId) || newPages[0]?.id || generateId();

        const newWorkspace: Workspace = {
          ...importedData,
          id: newWorkspaceId,
          name: `${importedData.name} (Imported)`,
          pages: newPages,
          activePageId: newActivePageId,
          createdAt: now,
          updatedAt: now,
        };

        // Add to store
        useWorkspaceStore.setState(state => ({
          workspaces: [...state.workspaces, newWorkspace],
          activeWorkspaceId: newWorkspaceId,
        }));

      } catch (error) {
        alert('Failed to import workspace. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be imported again
    event.target.value = '';
  };

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

  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-panel border-b border-gray-700">
      {/* Left side: Workspace Selector + Add Button */}
      <div className="flex items-center gap-1">
        {/* Workspace Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-panel-light hover:bg-gray-700
                       rounded-md transition-colors text-sm"
          >
            <FolderOpen className="w-4 h-4 text-accent" />
            <span className="text-gray-200 font-medium max-w-[180px] truncate">
              {activeWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-panel-light border border-gray-600
                            rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Workspace List */}
              <div className="max-h-56 overflow-y-auto">
                {workspaces.map((workspace) => (
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
                    <FolderOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />

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
                      <span className="flex-1 text-sm text-gray-200 truncate">
                        {workspace.name}
                      </span>
                    )}

                    <div className="flex items-center gap-1">
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
                      {workspaces.length > 1 && (
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Workspace Button */}
        <button
          onClick={handleAddWorkspace}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-accent
                     hover:bg-gray-700 rounded-md transition-colors"
          title="New workspace"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right side: Import & Export Buttons */}
      <div className="flex items-center gap-2">
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 px-3 py-2 text-xs bg-panel-light
                     hover:bg-accent/20 text-gray-300 rounded-md transition-colors"
          title="Import workspace"
        >
          <Upload className="w-3.5 h-3.5" />
          Import
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 text-xs bg-panel-light
                     hover:bg-accent/20 text-gray-300 rounded-md transition-colors"
          title="Export workspace"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </div>
  );
};
