/**
 * Tests for AirflowStatusBadge Component
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AirflowStatusBadge } from '../AirflowStatusBadge'
import { useAirflowStore } from '../../../stores/airflowStore'

// Reset airflow store
const resetAirflowStore = () => {
  useAirflowStore.setState({
    status: { status: 'unknown', message: '' },
    showSettingsModal: false,
  })
}

describe('AirflowStatusBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    resetAirflowStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('should render with label by default', () => {
      const mockFetchStatus = vi.fn()
      useAirflowStore.setState({ fetchStatus: mockFetchStatus })

      render(<AirflowStatusBadge />)

      expect(screen.getByText('Airflow')).toBeInTheDocument()
    })

    it('should hide label when showLabel is false', () => {
      const mockFetchStatus = vi.fn()
      useAirflowStore.setState({ fetchStatus: mockFetchStatus })

      render(<AirflowStatusBadge showLabel={false} />)

      expect(screen.queryByText('Airflow')).not.toBeInTheDocument()
    })
  })

  describe('status display', () => {
    it('should show running status correctly', () => {
      useAirflowStore.setState({
        status: { status: 'running', message: 'All healthy' },
        fetchStatus: vi.fn(),
      })

      render(<AirflowStatusBadge />)

      const badge = screen.getByRole('button')
      expect(badge).toHaveAttribute('title', 'Airflow: running - All healthy')
    })

    it('should show starting status correctly', () => {
      useAirflowStore.setState({
        status: { status: 'starting', message: 'Initializing...' },
        fetchStatus: vi.fn(),
      })

      render(<AirflowStatusBadge />)

      const badge = screen.getByRole('button')
      expect(badge).toHaveAttribute('title', 'Airflow: starting - Initializing...')
    })

    it('should show stopped status correctly', () => {
      useAirflowStore.setState({
        status: { status: 'stopped', message: '' },
        fetchStatus: vi.fn(),
      })

      render(<AirflowStatusBadge />)

      const badge = screen.getByRole('button')
      expect(badge).toHaveAttribute('title', 'Airflow: stopped')
    })

    it('should show error status correctly', () => {
      useAirflowStore.setState({
        status: { status: 'error', message: 'Connection failed' },
        fetchStatus: vi.fn(),
      })

      render(<AirflowStatusBadge />)

      const badge = screen.getByRole('button')
      expect(badge).toHaveAttribute('title', 'Airflow: error - Connection failed')
    })
  })

  describe('fetch behavior', () => {
    it('should call fetchStatus on mount', () => {
      const mockFetchStatus = vi.fn()
      useAirflowStore.setState({ fetchStatus: mockFetchStatus })

      render(<AirflowStatusBadge />)

      expect(mockFetchStatus).toHaveBeenCalledTimes(1)
    })

    it('should call fetchStatus periodically', async () => {
      const mockFetchStatus = vi.fn()
      useAirflowStore.setState({ fetchStatus: mockFetchStatus })

      render(<AirflowStatusBadge />)

      expect(mockFetchStatus).toHaveBeenCalledTimes(1)

      // Advance time by 30 seconds
      vi.advanceTimersByTime(30000)
      expect(mockFetchStatus).toHaveBeenCalledTimes(2)

      // Advance time by another 30 seconds
      vi.advanceTimersByTime(30000)
      expect(mockFetchStatus).toHaveBeenCalledTimes(3)
    })

    it('should clean up interval on unmount', () => {
      const mockFetchStatus = vi.fn()
      useAirflowStore.setState({ fetchStatus: mockFetchStatus })

      const { unmount } = render(<AirflowStatusBadge />)

      expect(mockFetchStatus).toHaveBeenCalledTimes(1)

      unmount()

      // Advance time after unmount
      vi.advanceTimersByTime(30000)

      // Should still only have 1 call (the initial one)
      expect(mockFetchStatus).toHaveBeenCalledTimes(1)
    })
  })

  describe('interaction', () => {
    it('should open settings modal on click', () => {
      const mockSetShowSettingsModal = vi.fn()
      useAirflowStore.setState({
        fetchStatus: vi.fn(),
        setShowSettingsModal: mockSetShowSettingsModal,
      })

      render(<AirflowStatusBadge />)

      fireEvent.click(screen.getByRole('button'))

      expect(mockSetShowSettingsModal).toHaveBeenCalledWith(true)
    })
  })
})
