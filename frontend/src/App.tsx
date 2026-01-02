import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Code,
  Layers,
  Settings,
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PageCodePanel } from './components/CodePreview';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SparkSettingsModal } from './components/SparkSettings';
import { ExecutionHistoryView } from './components/Execution';
import { CodeEditorPage } from './components/CodeEditor';
import { DagSidebar } from './components/DagSidebar';
import { DagCanvas } from './components/DagCanvas';
import { DagPropertiesPanel } from './components/DagPropertiesPanel';
import { AirflowSettingsModal } from './components/AirflowSettings';
import { TemplateModal } from './components/Templates';
import { LoginPage, RegisterPage } from './components/Auth';
import { JoinWorkspacePage } from './components/Sharing';
import { useWorkspaceStore } from './stores/workspaceStore';
import { useAuthStore } from './stores/authStore';
import { useLayoutStore } from './stores/layoutStore';
import { isCodePage, isDagPage } from './types';

type View = 'main' | 'history';

// Main App Content (after authentication)
function MainApp() {
  const [showSparkSettings, setShowSparkSettings] = useState(false);
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedDagNodeId, setSelectedDagNodeId] = useState<string | null>(null);

  // Layout state from store
  const {
    sidebarCollapsed,
    propertiesCollapsed,
    codePanelCollapsed,
    toggleSidebar,
    toggleProperties,
    toggleCodePanel,
  } = useLayoutStore();

  // Get active page to determine view type
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activePage = activeWorkspace?.pages.find(p => p.id === activeWorkspace?.activePageId);

  // Check if we're viewing a code page or DAG page
  const isCodePageActive = activePage && isCodePage(activePage);
  const isDagPageActive = activePage && isDagPage(activePage);

  // Show execution history view
  if (currentView === 'history') {
    return (
      <ExecutionHistoryView
        onBack={() => setCurrentView('main')}
      />
    );
  }

  // Render code editor page (full screen with its own layout)
  if (isCodePageActive) {
    return (
      <div className="w-full h-screen flex flex-col bg-canvas text-white overflow-hidden">
        {/* Header */}
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor takes full center area */}
          <CodeEditorPage
            onOpenHistory={() => setCurrentView('history')}
          />
        </div>

        {/* Spark Settings Modal */}
        <SparkSettingsModal
          isOpen={showSparkSettings}
          onClose={() => setShowSparkSettings(false)}
        />

        {/* Airflow Settings Modal */}
        <AirflowSettingsModal />

        {/* Template Modal */}
        <TemplateModal />
      </div>
    );
  }

  // Render DAG page (Airflow orchestration)
  if (isDagPageActive) {
    return (
      <div className="w-full h-screen flex flex-col bg-canvas text-white overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - DAG specific */}
          <DagSidebar />

          {/* Center - DAG Canvas + Code Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* DAG Canvas Area */}
            <DagCanvas onNodeSelect={setSelectedDagNodeId} />

            {/* Bottom - Code Panel with Airflow code */}
            <PageCodePanel
              onOpenSparkSettings={() => setShowSparkSettings(true)}
              onOpenHistory={() => setCurrentView('history')}
            />
          </div>

          {/* Right - DAG Properties Panel */}
          <DagPropertiesPanel selectedNodeId={selectedDagNodeId} />
        </div>

        {/* Spark Settings Modal */}
        <SparkSettingsModal
          isOpen={showSparkSettings}
          onClose={() => setShowSparkSettings(false)}
        />

        {/* Airflow Settings Modal */}
        <AirflowSettingsModal />

        {/* Template Modal */}
        <TemplateModal />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-canvas text-white overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Collapsible */}
        <div className={`relative transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-0' : 'w-60'} overflow-hidden`}>
          <Sidebar />
        </div>

        {/* Sidebar Toggle Button - Vertical tab on edge */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-1/3 z-20 flex flex-col items-center gap-1 px-1 py-3 bg-panel border border-gray-600 hover:bg-panel-light hover:border-accent transition-all shadow-lg ${
            sidebarCollapsed
              ? 'left-0 rounded-r-lg border-l-0'
              : 'left-[calc(15rem-1px)] rounded-r-lg border-l-0'
          }`}
          title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
        >
          <Layers className="w-4 h-4 text-accent" />
          <span className="text-[10px] text-gray-300 writing-vertical whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            {sidebarCollapsed ? 'Show' : 'Hide'}
          </span>
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>

        {/* Center - Canvas + Page Code Panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden">
            <Canvas />

            {/* Code Panel Toggle Button (when collapsed) */}
            {codePanelCollapsed && (
              <button
                onClick={toggleCodePanel}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-panel border border-gray-600 rounded-lg hover:bg-panel-light hover:border-accent transition-colors flex items-center gap-2 shadow-lg"
                title="Show Code Panel"
              >
                <Code className="w-4 h-4 text-accent" />
                <span className="text-sm text-gray-300">Show Code</span>
                <ChevronUp className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Bottom - Code Panel - Collapsible */}
          {!codePanelCollapsed && (
            <PageCodePanel
              onOpenSparkSettings={() => setShowSparkSettings(true)}
              onOpenHistory={() => setCurrentView('history')}
            />
          )}
        </div>

        {/* Right Side Panel Area */}
        <div className={`transition-all duration-300 ease-in-out ${propertiesCollapsed ? 'w-0' : 'w-72'} overflow-hidden`}>
          <PropertiesPanel />
        </div>

        {/* Properties Toggle Button - Vertical tab on edge */}
        <button
          onClick={toggleProperties}
          className={`absolute top-1/3 z-20 flex flex-col items-center gap-1 px-1 py-3 bg-panel border border-gray-600 hover:bg-panel-light hover:border-accent transition-all shadow-lg ${
            propertiesCollapsed
              ? 'right-0 rounded-l-lg border-r-0'
              : 'right-[calc(18rem-1px)] rounded-l-lg border-r-0'
          }`}
          title={propertiesCollapsed ? 'Show Properties' : 'Hide Properties'}
        >
          {propertiesCollapsed ? (
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          )}
          <span className="text-[10px] text-gray-300 whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            {propertiesCollapsed ? 'Show' : 'Hide'}
          </span>
          <Settings className="w-4 h-4 text-accent" />
        </button>
      </div>

      {/* Spark Settings Modal */}
      <SparkSettingsModal
        isOpen={showSparkSettings}
        onClose={() => setShowSparkSettings(false)}
      />

      {/* Airflow Settings Modal */}
      <AirflowSettingsModal />

      {/* Template Modal */}
      <TemplateModal />
    </div>
  );
}

// Root App Component with Router
function App() {
  const { isAuthenticated, checkAuth, tokens, user, _hasHydrated } = useAuthStore();
  const initialize = useWorkspaceStore((state) => state.initialize);
  const reset = useWorkspaceStore((state) => state.reset);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Initial authentication check - wait for hydration first
  useEffect(() => {
    if (!_hasHydrated) return; // Wait for store to hydrate from localStorage

    const init = async () => {
      // If user has tokens, verify they're still valid
      if (tokens) {
        await checkAuth();
      }
      // Initialize workspace store (sets isApiMode based on auth status)
      await initialize();
      setIsInitialized(true);
    };
    init();
  }, [_hasHydrated]);

  // Re-initialize workspace when auth state changes (after login/logout or user switch)
  useEffect(() => {
    if (!isInitialized) return;

    const currentUserId = user?.id || null;

    // User changed (login, logout, or different user)
    if (currentUserId !== lastUserId) {
      // Reset workspace store first (clears old data)
      reset();

      // If user is now authenticated, reinitialize from API
      if (isAuthenticated) {
        initialize();
      }

      setLastUserId(currentUserId);
    }
  }, [isAuthenticated, user?.id, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <p className="text-gray-400">Loading ETLab...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - redirect to home if already logged in */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* Share link join page - requires auth to join */}
        <Route path="/share/:token" element={<JoinWorkspacePage />} />

        {/* Main app - works with or without auth */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
