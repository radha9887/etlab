import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Copy, Check, Trash2, Users, Loader2, Plus, Search, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface ShareLink {
  id: string;
  token: string;
  role: string;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  is_active: boolean;
  share_url: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  };
}

interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

interface ShareWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

export const ShareWorkspaceModal = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}: ShareWorkspaceModalProps) => {
  const { tokens } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // New link form
  const [newLinkRole, setNewLinkRole] = useState<'editor' | 'viewer'>('viewer');
  const [newLinkExpiry, setNewLinkExpiry] = useState<string>('never');
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // User search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addUserRole, setAddUserRole] = useState<'editor' | 'viewer'>('viewer');

  const authHeaders = {
    'Authorization': `Bearer ${tokens?.access_token}`,
    'Content-Type': 'application/json',
  };

  // Fetch members and share links
  useEffect(() => {
    if (!isOpen || !workspaceId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [membersRes, linksRes] = await Promise.all([
          fetch(`/api/workspaces/${workspaceId}/members`, { headers: authHeaders }),
          fetch(`/api/workspaces/${workspaceId}/share-links`, { headers: authHeaders }),
        ]);

        if (membersRes.ok) {
          setMembers(await membersRes.json());
        }
        if (linksRes.ok) {
          setShareLinks(await linksRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch sharing data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, workspaceId]);

  // Search users when query changes
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/auth/users?q=${encodeURIComponent(searchQuery)}`, {
          headers: authHeaders,
        });
        if (response.ok) {
          const users = await response.json();
          // Filter out users who are already members
          const memberIds = new Set(members.map(m => m.user_id));
          setSearchResults(users.filter((u: UserSearchResult) => !memberIds.has(u.id)));
        }
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, members]);

  const handleAddUser = async (user: UserSearchResult) => {
    try {
      // Create a single-use share link and immediately add the user
      // Or we can directly add member if we have an endpoint for it
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          user_id: user.id,
          role: addUserRole,
        }),
      });

      if (response.ok) {
        // Add to members list
        const newMember: Member = {
          id: crypto.randomUUID(),
          user_id: user.id,
          role: addUserRole,
          joined_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
          },
        };
        setMembers([...members, newMember]);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  const [createError, setCreateError] = useState<string | null>(null);
  const [newlyCreatedLinkId, setNewlyCreatedLinkId] = useState<string | null>(null);

  const handleCreateLink = async () => {
    setIsCreatingLink(true);
    setCreateError(null);
    try {
      const body: Record<string, unknown> = { role: newLinkRole };
      if (newLinkExpiry !== 'never') {
        body.expires_in_days = parseInt(newLinkExpiry);
      }

      const response = await fetch(`/api/workspaces/${workspaceId}/share-links`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const newLink = await response.json();
        setShareLinks([...shareLinks, newLink]);
        setNewlyCreatedLinkId(newLink.id);
        // Auto-copy the new link
        const url = `${window.location.origin}/share/${newLink.token}`;
        await navigator.clipboard.writeText(url);
        setCopiedLinkId(newLink.id);
        setTimeout(() => {
          setCopiedLinkId(null);
          setNewlyCreatedLinkId(null);
        }, 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setCreateError(errorData.detail || 'Failed to create share link');
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
      setCreateError('Failed to create share link. Please try again.');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/share-links/${linkId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (response.ok) {
        setShareLinks(shareLinks.filter(l => l.id !== linkId));
      }
    } catch (err) {
      console.error('Failed to delete share link:', err);
    }
  };

  const handleCopyLink = async (link: ShareLink) => {
    const url = `${window.location.origin}/share/${link.token}`;
    await navigator.clipboard.writeText(url);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (response.ok) {
        setMembers(members.filter(m => m.user_id !== userId));
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setMembers(members.map(m =>
          m.user_id === userId ? { ...m, role: newRole } : m
        ));
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-panel rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Share "{workspaceName}"
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-panel-light rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : (
            <>
              {/* Add User by Search */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add People
                </h3>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-3 py-2 bg-canvas border border-gray-600 rounded-lg text-white text-sm focus:border-accent focus:outline-none placeholder-gray-500"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />
                    )}
                  </div>
                  <select
                    value={addUserRole}
                    onChange={(e) => setAddUserRole(e.target.value as 'editor' | 'viewer')}
                    className="px-3 py-2 bg-canvas border border-gray-600 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="bg-canvas rounded-lg border border-gray-600 max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddUser(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-panel-light transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-accent font-medium text-sm">
                            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name || 'No name'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Plus className="w-4 h-4 text-accent flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                  <p className="text-sm text-gray-500 text-center py-2">No users found</p>
                )}
              </div>

              {/* Create Share Link */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Or Create Share Link
                </h3>
                <div className="flex gap-2">
                  <select
                    value={newLinkRole}
                    onChange={(e) => setNewLinkRole(e.target.value as 'editor' | 'viewer')}
                    className="flex-1 px-3 py-2 bg-canvas border border-gray-600 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="viewer">Viewer (read-only)</option>
                    <option value="editor">Editor (can edit)</option>
                  </select>
                  <select
                    value={newLinkExpiry}
                    onChange={(e) => setNewLinkExpiry(e.target.value)}
                    className="flex-1 px-3 py-2 bg-canvas border border-gray-600 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="never">Never expires</option>
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                  </select>
                  <button
                    onClick={handleCreateLink}
                    disabled={isCreatingLink}
                    className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreatingLink ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span className="text-sm">Create</span>
                  </button>
                </div>
                {createError && (
                  <p className="text-sm text-red-400 mt-2">{createError}</p>
                )}
              </div>

              {/* Active Share Links */}
              {shareLinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Active Links</h3>
                  <div className="space-y-2">
                    {shareLinks.map((link) => (
                      <div
                        key={link.id}
                        className={`p-3 bg-canvas rounded-lg ${
                          newlyCreatedLinkId === link.id ? 'ring-2 ring-green-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            link.role === 'editor'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {link.role}
                          </span>
                          <span className="text-xs text-gray-500">
                            {link.use_count} uses
                          </span>
                          {link.expires_at && (
                            <span className="text-xs text-gray-500">
                              Expires {new Date(link.expires_at).toLocaleDateString()}
                            </span>
                          )}
                          <div className="flex-1" />
                          <button
                            onClick={() => handleCopyLink(link)}
                            className="p-1.5 hover:bg-panel-light rounded transition-colors"
                            title="Copy link"
                          >
                            {copiedLinkId === link.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete link"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>
                        {/* Show the share URL */}
                        <div className="flex items-center gap-2 bg-panel-light rounded px-2 py-1.5">
                          <code className="text-xs text-gray-400 truncate flex-1">
                            {`${window.location.origin}/share/${link.token}`}
                          </code>
                        </div>
                        {newlyCreatedLinkId === link.id && copiedLinkId === link.id && (
                          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Link copied to clipboard!
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Members ({members.length})
                </h3>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-canvas rounded-lg"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-medium text-sm">
                          {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {member.user.name || 'No name'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {member.user.email}
                        </p>
                      </div>

                      {/* Role */}
                      {member.role === 'owner' ? (
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                          Owner
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                          className="px-2 py-1 bg-canvas border border-gray-600 rounded text-xs text-white focus:border-accent focus:outline-none"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}

                      {/* Remove button (not for owner) */}
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
