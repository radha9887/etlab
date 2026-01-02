import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  // Panel visibility states
  sidebarCollapsed: boolean
  propertiesCollapsed: boolean
  codePanelCollapsed: boolean
  analysisVisible: boolean

  // Panel widths (for future resize support)
  sidebarWidth: number
  propertiesWidth: number
  codePanelHeight: number

  // Actions
  toggleSidebar: () => void
  toggleProperties: () => void
  toggleCodePanel: () => void
  toggleAnalysis: () => void

  setSidebarCollapsed: (collapsed: boolean) => void
  setPropertiesCollapsed: (collapsed: boolean) => void
  setCodePanelCollapsed: (collapsed: boolean) => void
  setAnalysisVisible: (visible: boolean) => void

  setSidebarWidth: (width: number) => void
  setPropertiesWidth: (width: number) => void
  setCodePanelHeight: (height: number) => void

  // Reset to defaults
  resetLayout: () => void
}

const DEFAULT_SIDEBAR_WIDTH = 280
const DEFAULT_PROPERTIES_WIDTH = 320
const DEFAULT_CODE_PANEL_HEIGHT = 320

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Initial states - all expanded by default
      sidebarCollapsed: false,
      propertiesCollapsed: false,
      codePanelCollapsed: false,
      analysisVisible: false,

      // Default dimensions
      sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      propertiesWidth: DEFAULT_PROPERTIES_WIDTH,
      codePanelHeight: DEFAULT_CODE_PANEL_HEIGHT,

      // Toggle actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleProperties: () => set((state) => ({ propertiesCollapsed: !state.propertiesCollapsed })),
      toggleCodePanel: () => set((state) => ({ codePanelCollapsed: !state.codePanelCollapsed })),
      toggleAnalysis: () => set((state) => ({ analysisVisible: !state.analysisVisible })),

      // Direct setters
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setPropertiesCollapsed: (collapsed) => set({ propertiesCollapsed: collapsed }),
      setCodePanelCollapsed: (collapsed) => set({ codePanelCollapsed: collapsed }),
      setAnalysisVisible: (visible) => set({ analysisVisible: visible }),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setPropertiesWidth: (width) => set({ propertiesWidth: width }),
      setCodePanelHeight: (height) => set({ codePanelHeight: height }),

      // Reset
      resetLayout: () =>
        set({
          sidebarCollapsed: false,
          propertiesCollapsed: false,
          codePanelCollapsed: false,
          analysisVisible: false,
          sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
          propertiesWidth: DEFAULT_PROPERTIES_WIDTH,
          codePanelHeight: DEFAULT_CODE_PANEL_HEIGHT,
        }),
    }),
    {
      name: 'etlab-layout',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        propertiesCollapsed: state.propertiesCollapsed,
        codePanelCollapsed: state.codePanelCollapsed,
        analysisVisible: state.analysisVisible,
        sidebarWidth: state.sidebarWidth,
        propertiesWidth: state.propertiesWidth,
        codePanelHeight: state.codePanelHeight,
      }),
    }
  )
)
