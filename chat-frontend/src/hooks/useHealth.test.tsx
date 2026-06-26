import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHealth } from './useHealth';

const mockGetHealth = vi.fn();

vi.mock('../services/healthService', () => ({
  getHealth: (...args: unknown[]) => mockGetHealth(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useHealth', () => {
  it('starts with CHECKING status', () => {
    const { result } = renderHook(() => useHealth());
    expect(result.current.status).toBe('CHECKING');
  });

  it('sets UP status on health check success', async () => {
    mockGetHealth.mockResolvedValue({ status: 'UP', database: 'UP', diskSpace: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });

    const { result } = renderHook(() => useHealth());

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(result.current.status).toBe('UP');
  });

  it('sets DOWN status on health check failure', async () => {
    mockGetHealth.mockRejectedValue(new Error('Erro'));

    const { result } = renderHook(() => useHealth());

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(result.current.status).toBe('DOWN');
  });

  it('updates lastCheck after check', async () => {
    mockGetHealth.mockResolvedValue({ status: 'UP', database: 'UP', diskSpace: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });

    const { result } = renderHook(() => useHealth());

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(result.current.lastCheck).toBeInstanceOf(Date);
  });

  it('can check health manually', async () => {
    mockGetHealth.mockResolvedValue({ status: 'UP', database: 'UP', diskSpace: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });

    const { result } = renderHook(() => useHealth());

    await act(async () => {
      await result.current.checkHealth();
    });

    expect(mockGetHealth).toHaveBeenCalled();
  });
});
