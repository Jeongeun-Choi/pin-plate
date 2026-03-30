import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocationSearch } from '../useLocationSearch';

describe('useLocationSearch', () => {
  const mockFetch = vi.fn();
  const mockAlert = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('alert', mockAlert);
    mockFetch.mockReset();
    mockAlert.mockReset();
  });

  it('초기 상태는 빈 결과, 로딩 false, 검색 미수행이다', () => {
    const { result } = renderHook(() =>
      useLocationSearch({ currentLocation: null }),
    );

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasSearched).toBe(false);
  });

  it('키워드로 검색하면 fetch를 호출하고 결과를 설정한다', async () => {
    const mockDocuments = [
      { id: '1', place_name: '맛집', address_name: '서울' },
    ];
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ documents: mockDocuments }),
    });

    const { result } = renderHook(() =>
      useLocationSearch({ currentLocation: null }),
    );

    await act(async () => {
      await result.current.search('맛집');
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/search?query=맛집');
    expect(result.current.searchResults).toEqual(mockDocuments);
    expect(result.current.hasSearched).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('currentLocation이 있으면 좌표를 쿼리에 포함한다', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ documents: [] }),
    });

    const { result } = renderHook(() =>
      useLocationSearch({ currentLocation: { lat: 37.5, lng: 127.0 } }),
    );

    await act(async () => {
      await result.current.search('카페');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/search?query=카페&x=127&y=37.5',
    );
  });

  it('빈 키워드는 fetch를 호출하지 않는다', async () => {
    const { result } = renderHook(() =>
      useLocationSearch({ currentLocation: null }),
    );

    await act(async () => {
      await result.current.search('');
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.hasSearched).toBe(false);
  });

  it('공백만 있는 키워드도 fetch를 호출하지 않는다', async () => {
    const { result } = renderHook(() =>
      useLocationSearch({ currentLocation: null }),
    );

    await act(async () => {
      await result.current.search('   ');
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetch 실패 시 결과를 비우고 alert를 호출한다', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useLocationSearch({ currentLocation: null }),
    );

    await act(async () => {
      await result.current.search('맛집');
    });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(mockAlert).toHaveBeenCalledWith('검색 중 오류가 발생했습니다.');
  });

  it('resetSearch는 상태를 초기화한다', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({ documents: [{ id: '1', place_name: '맛집' }] }),
    });

    const { result } = renderHook(() =>
      useLocationSearch({ currentLocation: null }),
    );

    await act(async () => {
      await result.current.search('맛집');
    });

    expect(result.current.hasSearched).toBe(true);

    act(() => {
      result.current.resetSearch();
    });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.hasSearched).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
