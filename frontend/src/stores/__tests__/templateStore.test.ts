/**
 * Tests for Template Store
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useTemplateStore } from '../templateStore'

// Reset store state
const resetStore = () => {
  useTemplateStore.setState({
    selectedTemplate: null,
    selectedDagTemplate: null,
    isModalOpen: false,
    templateMode: 'etl',
  })
}

describe('templateStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTemplateStore.getState()
      expect(state.selectedTemplate).toBeNull()
      expect(state.selectedDagTemplate).toBeNull()
      expect(state.isModalOpen).toBe(false)
      expect(state.templateMode).toBe('etl')
    })

    it('should have templates loaded', () => {
      const state = useTemplateStore.getState()
      expect(state.templates.length).toBeGreaterThan(0)
      expect(state.dagTemplates.length).toBeGreaterThan(0)
    })
  })

  describe('setSelectedTemplate', () => {
    it('should set selected ETL template', () => {
      const templates = useTemplateStore.getState().templates
      const template = templates[0]

      act(() => {
        useTemplateStore.getState().setSelectedTemplate(template)
      })

      expect(useTemplateStore.getState().selectedTemplate).toEqual(template)
    })

    it('should clear selected DAG template when setting ETL template', () => {
      const dagTemplates = useTemplateStore.getState().dagTemplates

      act(() => {
        useTemplateStore.getState().setSelectedDagTemplate(dagTemplates[0])
      })

      expect(useTemplateStore.getState().selectedDagTemplate).toBeDefined()

      const templates = useTemplateStore.getState().templates
      act(() => {
        useTemplateStore.getState().setSelectedTemplate(templates[0])
      })

      expect(useTemplateStore.getState().selectedDagTemplate).toBeNull()
    })

    it('should clear template with null', () => {
      const templates = useTemplateStore.getState().templates

      act(() => {
        useTemplateStore.getState().setSelectedTemplate(templates[0])
      })

      act(() => {
        useTemplateStore.getState().setSelectedTemplate(null)
      })

      expect(useTemplateStore.getState().selectedTemplate).toBeNull()
    })
  })

  describe('setSelectedDagTemplate', () => {
    it('should set selected DAG template', () => {
      const dagTemplates = useTemplateStore.getState().dagTemplates
      const template = dagTemplates[0]

      act(() => {
        useTemplateStore.getState().setSelectedDagTemplate(template)
      })

      expect(useTemplateStore.getState().selectedDagTemplate).toEqual(template)
    })

    it('should clear selected ETL template when setting DAG template', () => {
      const templates = useTemplateStore.getState().templates

      act(() => {
        useTemplateStore.getState().setSelectedTemplate(templates[0])
      })

      const dagTemplates = useTemplateStore.getState().dagTemplates
      act(() => {
        useTemplateStore.getState().setSelectedDagTemplate(dagTemplates[0])
      })

      expect(useTemplateStore.getState().selectedTemplate).toBeNull()
    })
  })

  describe('getTemplatesByCategory', () => {
    it('should filter templates by category', () => {
      const templates = useTemplateStore.getState().templates
      const categories = [...new Set(templates.map(t => t.category))]

      categories.forEach(category => {
        const filtered = useTemplateStore.getState().getTemplatesByCategory(category)
        expect(filtered.every(t => t.category === category)).toBe(true)
      })
    })

    it('should return empty array for non-existent category', () => {
      const filtered = useTemplateStore.getState().getTemplatesByCategory('non-existent')
      expect(filtered).toEqual([])
    })
  })

  describe('getTemplateById', () => {
    it('should find template by id', () => {
      const templates = useTemplateStore.getState().templates
      const firstTemplate = templates[0]

      const found = useTemplateStore.getState().getTemplateById(firstTemplate.id)
      expect(found).toEqual(firstTemplate)
    })

    it('should return undefined for non-existent id', () => {
      const found = useTemplateStore.getState().getTemplateById('non-existent')
      expect(found).toBeUndefined()
    })
  })

  describe('getDagTemplatesByCategory', () => {
    it('should filter DAG templates by category', () => {
      const dagTemplates = useTemplateStore.getState().dagTemplates
      const categories = [...new Set(dagTemplates.map(t => t.category))]

      categories.forEach(category => {
        const filtered = useTemplateStore.getState().getDagTemplatesByCategory(category)
        expect(filtered.every(t => t.category === category)).toBe(true)
      })
    })
  })

  describe('getDagTemplateById', () => {
    it('should find DAG template by id', () => {
      const dagTemplates = useTemplateStore.getState().dagTemplates
      const firstTemplate = dagTemplates[0]

      const found = useTemplateStore.getState().getDagTemplateById(firstTemplate.id)
      expect(found).toEqual(firstTemplate)
    })

    it('should return undefined for non-existent id', () => {
      const found = useTemplateStore.getState().getDagTemplateById('non-existent')
      expect(found).toBeUndefined()
    })
  })

  describe('openModal', () => {
    it('should open modal', () => {
      act(() => {
        useTemplateStore.getState().openModal()
      })

      expect(useTemplateStore.getState().isModalOpen).toBe(true)
    })

    it('should open modal with specified mode', () => {
      act(() => {
        useTemplateStore.getState().openModal('dag')
      })

      expect(useTemplateStore.getState().isModalOpen).toBe(true)
      expect(useTemplateStore.getState().templateMode).toBe('dag')
    })

    it('should keep current mode when opening without specifying', () => {
      act(() => {
        useTemplateStore.getState().setTemplateMode('dag')
      })

      act(() => {
        useTemplateStore.getState().openModal()
      })

      expect(useTemplateStore.getState().templateMode).toBe('dag')
    })
  })

  describe('closeModal', () => {
    it('should close modal', () => {
      act(() => {
        useTemplateStore.getState().openModal()
      })

      act(() => {
        useTemplateStore.getState().closeModal()
      })

      expect(useTemplateStore.getState().isModalOpen).toBe(false)
    })

    it('should clear selected templates when closing', () => {
      const templates = useTemplateStore.getState().templates
      const dagTemplates = useTemplateStore.getState().dagTemplates

      act(() => {
        useTemplateStore.getState().setSelectedTemplate(templates[0])
        useTemplateStore.getState().openModal()
      })

      act(() => {
        useTemplateStore.getState().closeModal()
      })

      expect(useTemplateStore.getState().selectedTemplate).toBeNull()
      expect(useTemplateStore.getState().selectedDagTemplate).toBeNull()
    })
  })

  describe('setTemplateMode', () => {
    it('should change template mode', () => {
      act(() => {
        useTemplateStore.getState().setTemplateMode('dag')
      })

      expect(useTemplateStore.getState().templateMode).toBe('dag')

      act(() => {
        useTemplateStore.getState().setTemplateMode('etl')
      })

      expect(useTemplateStore.getState().templateMode).toBe('etl')
    })

    it('should clear selections when changing mode', () => {
      const templates = useTemplateStore.getState().templates

      act(() => {
        useTemplateStore.getState().setSelectedTemplate(templates[0])
      })

      act(() => {
        useTemplateStore.getState().setTemplateMode('dag')
      })

      expect(useTemplateStore.getState().selectedTemplate).toBeNull()
      expect(useTemplateStore.getState().selectedDagTemplate).toBeNull()
    })
  })

  describe('template structure', () => {
    it('ETL templates should have required fields', () => {
      const templates = useTemplateStore.getState().templates

      templates.forEach(template => {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.nodes).toBeDefined()
        expect(template.edges).toBeDefined()
        expect(Array.isArray(template.nodes)).toBe(true)
        expect(Array.isArray(template.edges)).toBe(true)
      })
    })

    it('DAG templates should have required fields', () => {
      const dagTemplates = useTemplateStore.getState().dagTemplates

      dagTemplates.forEach(template => {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.nodes).toBeDefined()
        expect(template.edges).toBeDefined()
        expect(Array.isArray(template.nodes)).toBe(true)
        expect(Array.isArray(template.edges)).toBe(true)
      })
    })
  })

  describe('template categories', () => {
    it('should have ETL templates in expected categories', () => {
      const templates = useTemplateStore.getState().templates
      const categories = [...new Set(templates.map(t => t.category))]

      // Common ETL categories
      expect(categories.length).toBeGreaterThan(0)
    })

    it('should have DAG templates in expected categories', () => {
      const dagTemplates = useTemplateStore.getState().dagTemplates
      const categories = [...new Set(dagTemplates.map(t => t.category))]

      // Common DAG categories
      expect(categories.length).toBeGreaterThan(0)
    })
  })
})
