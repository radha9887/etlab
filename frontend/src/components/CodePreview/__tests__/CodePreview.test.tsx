/**
 * Tests for CodePreview Component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CodePreview } from '../CodePreview'
import { useWorkflowStore } from '../../../stores/workflowStore'

// Reset workflow store
const resetWorkflowStore = () => {
  useWorkflowStore.setState({
    nodes: [],
    edges: [],
    selectedNode: null,
  })
}

describe('CodePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetWorkflowStore()
  })

  describe('rendering', () => {
    it('should render code preview component', () => {
      render(<CodePreview />)

      expect(screen.getByText('Generated PySpark Code')).toBeInTheDocument()
    })

    it('should show node and connection count', () => {
      useWorkflowStore.setState({
        nodes: [
          { id: '1', type: 'source', position: { x: 0, y: 0 }, data: { label: 'Source', nodeType: 'csv' } },
          { id: '2', type: 'sink', position: { x: 100, y: 0 }, data: { label: 'Sink', nodeType: 'parquet' } },
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
        ],
      })

      render(<CodePreview />)

      expect(screen.getByText('(2 nodes, 1 connections)')).toBeInTheDocument()
    })

    it('should show zero counts when no nodes', () => {
      render(<CodePreview />)

      expect(screen.getByText('(0 nodes, 0 connections)')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<CodePreview />)

      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Download')).toBeInTheDocument()
      expect(screen.getByText('Generate')).toBeInTheDocument()
    })
  })

  describe('code generation', () => {
    it('should update code when nodes change', () => {
      const { rerender } = render(<CodePreview />)

      // Add a source node
      useWorkflowStore.setState({
        nodes: [
          {
            id: 'source-1',
            type: 'source',
            position: { x: 0, y: 0 },
            data: {
              label: 'CSV Source',
              nodeType: 'csv',
              config: { path: '/data/input.csv' },
            },
          },
        ],
        edges: [],
      })

      rerender(<CodePreview />)

      expect(screen.getByText('(1 nodes, 0 connections)')).toBeInTheDocument()
    })

    it('should update count with multiple nodes and edges', () => {
      useWorkflowStore.setState({
        nodes: [
          { id: '1', type: 'source', position: { x: 0, y: 0 }, data: { label: 'Source', nodeType: 'csv' } },
          { id: '2', type: 'transform', position: { x: 100, y: 0 }, data: { label: 'Filter', nodeType: 'filter' } },
          { id: '3', type: 'sink', position: { x: 200, y: 0 }, data: { label: 'Output', nodeType: 'parquet' } },
        ],
        edges: [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' },
        ],
      })

      render(<CodePreview />)

      expect(screen.getByText('(3 nodes, 2 connections)')).toBeInTheDocument()
    })
  })

  describe('code display', () => {
    it('should render code in pre element', () => {
      render(<CodePreview />)

      const preElement = document.querySelector('pre')
      expect(preElement).toBeInTheDocument()
    })

    it('should apply monospace font styling', () => {
      render(<CodePreview />)

      const preElement = document.querySelector('pre')
      expect(preElement).toHaveClass('font-mono')
    })
  })

  describe('button interactions', () => {
    it('should have Copy button clickable', () => {
      render(<CodePreview />)

      const copyButton = screen.getByText('Copy')
      expect(copyButton).not.toBeDisabled()
    })

    it('should have Download button clickable', () => {
      render(<CodePreview />)

      const downloadButton = screen.getByText('Download')
      expect(downloadButton).not.toBeDisabled()
    })

    it('should have Generate button clickable', () => {
      render(<CodePreview />)

      const generateButton = screen.getByText('Generate')
      expect(generateButton).not.toBeDisabled()
    })
  })
})
