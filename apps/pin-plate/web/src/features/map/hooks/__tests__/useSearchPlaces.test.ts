import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { Provider } from 'jotai';
import { useAtomValue } from 'jotai';
import { useSearchPlaces } from '../useSearchPlaces';
import { searchPlacesAtom, selectedSearchPlaceAtom } from '../../atoms';
import { KakaoPlace } from '@/features/post/types/search';

const createWrapper = () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, null, children);
  return Wrapper;
};

describe('useSearchPlaces', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  it('키워드로 검색하면 fetch를 호출한다', async () => {
    const mockDocuments: Partial<KakaoPlace>[] = [
      { id: '1', place_name: '스시 오마카세', x: '127.0', y: '37.5' },
    ];
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ documents: mockDocuments }),
    });

    const { result } = renderHook(() => useSearchPlaces(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.searchPlaces('스시');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/search?query=%EC%8A%A4%EC%8B%9C',
    );
  });

  it('빈 키워드는 fetch를 호출하지 않는다', async () => {
    const { result } = renderHook(() => useSearchPlaces(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.searchPlaces('');
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('공백만 있는 키워드도 fetch를 호출하지 않는다', async () => {
    const { result } = renderHook(() => useSearchPlaces(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.searchPlaces('   ');
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetch 실패 시 searchPlaces atom을 빈 배열로 설정한다', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () => {
        const hook = useSearchPlaces();
        const places = useAtomValue(searchPlacesAtom);
        return { ...hook, places };
      },
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.searchPlaces('맛집');
    });

    expect(result.current.places).toEqual([]);
  });

  it('clearSearchPlaces 호출 시 atom을 초기화한다', async () => {
    const mockDocuments: Partial<KakaoPlace>[] = [
      { id: '1', place_name: '맛집', x: '127.0', y: '37.5' },
    ];
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ documents: mockDocuments }),
    });

    const { result } = renderHook(
      () => {
        const hook = useSearchPlaces();
        const places = useAtomValue(searchPlacesAtom);
        const selectedPlace = useAtomValue(selectedSearchPlaceAtom);
        return { ...hook, places, selectedPlace };
      },
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.searchPlaces('맛집');
    });

    expect(result.current.places).toHaveLength(1);

    act(() => {
      result.current.clearSearchPlaces();
    });

    expect(result.current.places).toEqual([]);
    expect(result.current.selectedPlace).toBeNull();
  });
});
