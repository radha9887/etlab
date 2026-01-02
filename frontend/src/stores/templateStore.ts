import { create } from 'zustand';
import { allTemplates, allDagTemplates, type PipelineTemplate, type DagTemplate, type DagTemplateCategory } from './templates';

// Re-export types for backward compatibility
export type { PipelineTemplate, DagTemplate, DagTemplateCategory };

// ============================================
// Template Store
// ============================================

// Template mode: 'etl' for PySpark pipelines, 'dag' for Airflow DAGs
type TemplateMode = 'etl' | 'dag';

interface TemplateState {
  // ETL Templates (PySpark)
  templates: PipelineTemplate[];
  selectedTemplate: PipelineTemplate | null;

  // DAG Templates (Airflow)
  dagTemplates: DagTemplate[];
  selectedDagTemplate: DagTemplate | null;

  // Common state
  isModalOpen: boolean;
  templateMode: TemplateMode;

  // ETL Template Actions
  setSelectedTemplate: (template: PipelineTemplate | null) => void;
  getTemplatesByCategory: (category: string) => PipelineTemplate[];
  getTemplateById: (id: string) => PipelineTemplate | undefined;

  // DAG Template Actions
  setSelectedDagTemplate: (template: DagTemplate | null) => void;
  getDagTemplatesByCategory: (category: DagTemplateCategory) => DagTemplate[];
  getDagTemplateById: (id: string) => DagTemplate | undefined;

  // Common Actions
  openModal: (mode?: TemplateMode) => void;
  closeModal: () => void;
  setTemplateMode: (mode: TemplateMode) => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  // ETL Templates
  templates: allTemplates,
  selectedTemplate: null,

  // DAG Templates
  dagTemplates: allDagTemplates,
  selectedDagTemplate: null,

  // Common state
  isModalOpen: false,
  templateMode: 'etl',

  // ETL Template Actions
  setSelectedTemplate: (template) => set({ selectedTemplate: template, selectedDagTemplate: null }),

  getTemplatesByCategory: (category) => {
    return get().templates.filter(t => t.category === category);
  },

  getTemplateById: (id) => {
    return get().templates.find(t => t.id === id);
  },

  // DAG Template Actions
  setSelectedDagTemplate: (template) => set({ selectedDagTemplate: template, selectedTemplate: null }),

  getDagTemplatesByCategory: (category) => {
    return get().dagTemplates.filter(t => t.category === category);
  },

  getDagTemplateById: (id) => {
    return get().dagTemplates.find(t => t.id === id);
  },

  // Common Actions
  openModal: (mode) => set({
    isModalOpen: true,
    templateMode: mode || get().templateMode,
  }),

  closeModal: () => set({
    isModalOpen: false,
    selectedTemplate: null,
    selectedDagTemplate: null,
  }),

  setTemplateMode: (mode) => set({
    templateMode: mode,
    selectedTemplate: null,
    selectedDagTemplate: null,
  }),
}));
