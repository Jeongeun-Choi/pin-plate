import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePostForm } from '../usePostForm';
import { createWrapper } from '@/test-utils';
import { KakaoPlace } from '../../types/search';

// Mock dependencies
vi.mock('../useCreatePost', () => ({
  useCreatePost: () => ({
    mutateAsync: mockCreatePost,
  }),
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

vi.mock('@/hooks/useCurrentLocation', () => ({
  useCurrentLocation: () => ({
    location: null,
    fetchLocation: vi.fn(),
  }),
}));

const mockCreatePost = vi.fn();
const mockGetUser = vi.fn();
const mockFetch = vi.fn();
const mockAlert = vi.fn();

const createMockPlace = (overrides?: Partial<KakaoPlace>): KakaoPlace => ({
  id: '123',
  place_name: '테스트 맛집',
  address_name: '서울시 강남구',
  road_address_name: '서울시 강남구 테헤란로 1',
  x: '127.0',
  y: '37.5',
  category_name: '음식점',
  category_group_code: 'FD6',
  category_group_name: '음식점',
  phone: '02-1234-5678',
  place_url: 'https://place.map.kakao.com/123',
  distance: '100',
  ...overrides,
});

describe('usePostForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('alert', mockAlert);
    mockCreatePost.mockReset();
    mockGetUser.mockReset();
    mockFetch.mockReset();
    mockAlert.mockReset();
  });

  it('초기 상태가 올바르다', () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.formState.content).toBe('');
    expect(result.current.formState.rating).toBe(0);
    expect(result.current.formState.photos).toEqual([]);
    expect(result.current.formState.selectedPlace).toBeNull();
  });

  it('initialPlace가 있으면 selectedPlace가 설정된다', () => {
    const place = createMockPlace();
    const { result } = renderHook(() => usePostForm(undefined, place), {
      wrapper: createWrapper(),
    });

    expect(result.current.formState.selectedPlace).toEqual(place);
  });

  it('handlePlaceSelect로 장소를 선택할 수 있다', () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    const place = createMockPlace();
    act(() => {
      result.current.handlers.handlePlaceSelect(place);
    });

    expect(result.current.formState.selectedPlace).toEqual(place);
  });

  it('setContent로 내용을 변경할 수 있다', () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.setContent('맛있었어요');
    });

    expect(result.current.formState.content).toBe('맛있었어요');
  });

  it('setRating으로 별점을 변경할 수 있다', () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.setRating(4);
    });

    expect(result.current.formState.rating).toBe(4);
  });

  it('resetForm으로 모든 상태를 초기화한다', () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.setContent('테스트');
      result.current.handlers.setRating(5);
      result.current.handlers.handlePlaceSelect(createMockPlace());
    });

    act(() => {
      result.current.handlers.resetForm();
    });

    expect(result.current.formState.content).toBe('');
    expect(result.current.formState.rating).toBe(0);
    expect(result.current.formState.photos).toEqual([]);
    expect(result.current.formState.selectedPlace).toBeNull();
  });

  it('handleRemovePhoto로 특정 사진을 제거할 수 있다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          urls: [
            'https://s3.example.com/a.jpg?token=x',
            'https://s3.example.com/b.jpg?token=x',
          ],
        }),
    });

    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ];

    await act(async () => {
      await result.current.handlers.handleUploadAndSetImages(files);
    });

    expect(result.current.formState.photos).toHaveLength(2);

    act(() => {
      result.current.handlers.handleRemovePhoto(0);
    });

    expect(result.current.formState.photos).toHaveLength(1);
    expect(result.current.formState.photos[0]).toContain('b.jpg');
  });

  it('사진이 5장일 때 추가 업로드를 시도하면 alert를 표시한다', async () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    // Simulate 5 photos already uploaded
    for (let i = 0; i < 5; i++) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            urls: [`https://s3.example.com/${i}.jpg?token=x`],
          }),
      });

      await act(async () => {
        await result.current.handlers.handleUploadAndSetImages([
          new File([`${i}`], `${i}.jpg`, { type: 'image/jpeg' }),
        ]);
      });
    }

    expect(result.current.formState.photos).toHaveLength(5);

    await act(async () => {
      await result.current.handlers.handleUploadAndSetImages([
        new File(['extra'], 'extra.jpg', { type: 'image/jpeg' }),
      ]);
    });

    expect(mockAlert).toHaveBeenCalledWith(
      '최대 0장까지만 더 추가할 수 있습니다.',
    );
  });

  it('장소를 선택하지 않고 submit하면 alert를 표시한다', async () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockAlert).toHaveBeenCalledWith('방문한 장소를 선택해주세요.');
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('별점 없이 submit하면 alert를 표시한다', async () => {
    const { result } = renderHook(() => usePostForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.handlePlaceSelect(createMockPlace());
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockAlert).toHaveBeenCalledWith('별점을 입력해주세요.');
    expect(mockCreatePost).not.toHaveBeenCalled();
  });

  it('유효한 데이터로 submit하면 createPost를 호출하고 폼을 초기화한다', async () => {
    const mockOnSuccess = vi.fn();
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    });
    mockCreatePost.mockResolvedValueOnce({});

    const { result } = renderHook(() => usePostForm(mockOnSuccess), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handlers.handlePlaceSelect(createMockPlace());
      result.current.handlers.setRating(4);
      result.current.handlers.setContent('맛있어요');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '맛있어요',
        rating: 4,
        place_name: '테스트 맛집',
        user_id: 'user-123',
        lat: 37.5,
        lng: 127.0,
      }),
    );
    expect(mockAlert).toHaveBeenCalledWith('게시글이 등록되었습니다!');
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(result.current.formState.content).toBe('');
    expect(result.current.formState.rating).toBe(0);
  });
});
