import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { airflowApi, type AirflowSettings, type AirflowStatus } from '../services/api';

interface AirflowStore {
  // State
  settings: AirflowSettings;
  status: AirflowStatus;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  showSettingsModal: boolean;
  showSetupModal: boolean;

  // Actions
  setShowSettingsModal: (show: boolean) => void;
  setShowSetupModal: (show: boolean) => void;
  fetchStatus: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AirflowSettings>) => Promise<void>;
  startAirflow: () => Promise<{ success: boolean; message: string }>;
  stopAirflow: () => Promise<{ success: boolean; message: string }>;
  syncDag: (dagId: string, code: string) => Promise<{ success: boolean; message: string }>;
  openInAirflow: (dagId: string) => void;
  testConnection: (url: string, username?: string, password?: string) => Promise<{ success: boolean; message: string }>;
}

const defaultSettings: AirflowSettings = {
  mode: 'docker',
  docker_port: 8080,
  external_url: undefined,
  external_username: undefined,
  external_password: undefined,
  auto_save: true,
  auto_start: false,
};

const defaultStatus: AirflowStatus = {
  status: 'unknown',
  mode: 'docker',
  url: undefined,
  message: undefined,
};

export const useAirflowStore = create<AirflowStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      status: defaultStatus,
      isLoading: false,
      error: null,
      lastSyncTime: null,
      showSettingsModal: false,
      showSetupModal: false,

      // Actions
      setShowSettingsModal: (show) => set({ showSettingsModal: show }),
      setShowSetupModal: (show) => set({ showSetupModal: show }),

      fetchStatus: async () => {
        try {
          const status = await airflowApi.getStatus();
          set({ status, error: null });
        } catch (err) {
          // API not available - set to unknown status
          set({
            status: { ...defaultStatus, status: 'unknown', message: 'Backend not available' },
            error: null,
          });
        }
      },

      fetchSettings: async () => {
        try {
          const settings = await airflowApi.getSettings();
          set({ settings, error: null });
        } catch {
          // Use local settings if API not available
        }
      },

      updateSettings: async (newSettings) => {
        const currentSettings = get().settings;
        const mergedSettings = { ...currentSettings, ...newSettings };
        set({ settings: mergedSettings });

        try {
          await airflowApi.updateSettings(mergedSettings);
        } catch {
          // Settings saved locally even if API fails
        }
      },

      startAirflow: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await airflowApi.start();
          // Start polling for status
          const pollStatus = async () => {
            for (let i = 0; i < 20; i++) { // Poll for up to 2 minutes
              await new Promise(resolve => setTimeout(resolve, 6000));
              await get().fetchStatus();
              if (get().status.status === 'running') {
                break;
              }
            }
          };
          pollStatus();
          set({ isLoading: false });
          return { success: true, message: result.message };
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          return { success: false, message: err.message };
        }
      },

      stopAirflow: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await airflowApi.stop();
          await get().fetchStatus();
          set({ isLoading: false });
          return { success: result.success, message: result.message };
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          return { success: false, message: err.message };
        }
      },

      syncDag: async (dagId, code) => {
        try {
          const result = await airflowApi.syncDag(dagId, code);
          if (result.success) {
            set({ lastSyncTime: new Date().toISOString() });
          }
          return { success: result.success, message: result.message };
        } catch (err: any) {
          return { success: false, message: err.message || 'Failed to sync DAG' };
        }
      },

      openInAirflow: (dagId) => {
        const { settings } = get();
        // Always use localhost for browser access (host.docker.internal only works inside Docker)
        let baseUrl = `http://localhost:${settings.docker_port}`;

        // If external URL is set and doesn't use docker internal, use it
        if (settings.mode === 'external' && settings.external_url) {
          const extUrl = settings.external_url;
          if (!extUrl.includes('host.docker.internal') && !extUrl.includes('172.') && !extUrl.includes('192.168.')) {
            baseUrl = extUrl;
          }
        }

        const safeDagId = dagId.toLowerCase().replace(/[^\w\-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        const url = `${baseUrl}/dags/${safeDagId}/graph`;
        window.open(url, '_blank');
      },

      testConnection: async (url, username, password) => {
        try {
          const result = await airflowApi.testConnection(url, username, password);
          return result;
        } catch (err: any) {
          return { success: false, message: err.message || 'Connection test failed' };
        }
      },
    }),
    {
      name: 'etlab-airflow',
      version: 1,
      partialize: (state) => ({
        settings: state.settings,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);
