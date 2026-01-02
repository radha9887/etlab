import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, AlertCircle, CheckCircle, Loader2, LogIn } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface ShareLinkInfo {
  workspace_name: string;
  workspace_id: string;
  role: string;
  is_valid: boolean;
  message?: string;
}

export const JoinWorkspacePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, tokens } = useAuthStore();

  const [linkInfo, setLinkInfo] = useState<ShareLinkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch share link info
  useEffect(() => {
    const fetchLinkInfo = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/share/${token}`);
        const data = await response.json();
        setLinkInfo(data);
      } catch (err) {
        setError('Failed to load share link information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkInfo();
  }, [token]);

  const handleJoin = async () => {
    if (!token || !tokens?.access_token) return;

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/share/${token}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to join workspace');
      }

      setSuccess(true);
      // Redirect to workspace after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join workspace');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading share link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Join Workspace</h1>
        </div>

        {/* Content Card */}
        <div className="bg-panel rounded-xl p-6 border border-gray-700">
          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Successfully Joined!</h2>
              <p className="text-gray-400">
                You've joined <span className="text-white">{linkInfo?.workspace_name}</span> as {linkInfo?.role}
              </p>
              <p className="text-gray-500 text-sm mt-4">Redirecting to workspace...</p>
            </div>
          )}

          {/* Error State */}
          {!success && error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Invalid Link */}
          {!success && linkInfo && !linkInfo.is_valid && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Invalid Share Link</h2>
              <p className="text-gray-400">{linkInfo.message}</p>
              <Link
                to="/"
                className="inline-block mt-6 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
              >
                Go to Home
              </Link>
            </div>
          )}

          {/* Valid Link - Not Authenticated */}
          {!success && linkInfo?.is_valid && !isAuthenticated && (
            <div className="text-center py-4">
              <Users className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                You're invited to join
              </h2>
              <p className="text-2xl font-bold text-accent mb-2">{linkInfo.workspace_name}</p>
              <p className="text-gray-400 mb-6">
                You'll be added as <span className="text-white font-medium">{linkInfo.role}</span>
              </p>

              <p className="text-gray-400 mb-4">Please sign in to accept this invitation</p>

              <div className="flex flex-col gap-3">
                <Link
                  to={`/login?redirect=/share/${token}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Sign in to join
                </Link>
                <Link
                  to={`/register?redirect=/share/${token}`}
                  className="px-4 py-2.5 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg transition-colors"
                >
                  Create an account
                </Link>
              </div>
            </div>
          )}

          {/* Valid Link - Authenticated */}
          {!success && linkInfo?.is_valid && isAuthenticated && (
            <div className="text-center py-4">
              <Users className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                You're invited to join
              </h2>
              <p className="text-2xl font-bold text-accent mb-2">{linkInfo.workspace_name}</p>
              <p className="text-gray-400 mb-6">
                You'll be added as <span className="text-white font-medium">{linkInfo.role}</span>
              </p>

              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Join Workspace
                  </>
                )}
              </button>

              <Link
                to="/"
                className="block mt-4 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
