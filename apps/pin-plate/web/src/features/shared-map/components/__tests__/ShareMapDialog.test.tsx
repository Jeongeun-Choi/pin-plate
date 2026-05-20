import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareMapDialog } from '../ShareMapDialog';
import { useCreateSharedMap } from '../../hooks/useCreateSharedMap';
import type { PlaceWithStats } from '@/features/place/types/place';
import type { SharedMap } from '../../types/sharedMap';

vi.mock('../../hooks/useCreateSharedMap', () => ({
  useCreateSharedMap: vi.fn(),
}));

const createPlace = (
  id: string,
  name: string,
  tags: string[],
): PlaceWithStats => ({
  id,
  user_id: 'user-1',
  kakao_place_id: `kakao-${id}`,
  place_name: name,
  address: '서울 성동구 성수동',
  lat: 37.5,
  lng: 127.1,
  status: 'recommend',
  tags,
  created_at: '2026-05-13T00:00:00.000Z',
  updated_at: '2026-05-13T00:00:00.000Z',
  posts: [],
  visit_count: 1,
  avg_rating: 4.5,
  last_visited_at: '2026-05-13T00:00:00.000Z',
  first_image: null,
});

const mockUseCreateSharedMap = vi.mocked(useCreateSharedMap);
const mutateAsync = vi.fn();

const createSharedMapResponse = (
  overrides: Partial<SharedMap> = {},
): SharedMap => ({
  id: 'shared-map-1',
  owner_id: 'user-1',
  slug: 'seongsu-map',
  title: '성수 추천 지도',
  description: '',
  criteria_type: 'status',
  criteria_value: 'recommend',
  place_count: 1,
  cover_image_url: null,
  created_at: '2026-05-13T00:00:00.000Z',
  shared_map_places: [],
  ...overrides,
});

const shareMapDialogCssPath = resolve(__dirname, '../ShareMapDialog.css.ts');

describe('ShareMapDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateSharedMap.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateSharedMap>);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows only tags used by saved places as selectable chips', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '작업 카페', ['work']),
          createPlace('2', '카페 투어', ['cafe']),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));

    expect(
      screen.getByRole('button', { name: '작업하기좋음 1개' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '카페 1개' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '혼밥 0개' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('keeps a long tag list compact behind a full tag picker', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '혼밥집', ['solo']),
          createPlace('2', '데이트집', ['date']),
          createPlace('3', '친구모임집', ['friends']),
          createPlace('4', '가족식사집', ['family']),
          createPlace('5', '작업 카페', ['work']),
          createPlace('6', '조용한 카페', ['quiet']),
          createPlace('7', '힙한 식당', ['hip']),
          createPlace('8', '아늑한 식당', ['cozy']),
          createPlace('9', '뷰 좋은 식당', ['view']),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));

    expect(
      screen.getByRole('button', { name: '태그 더 보기' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '뷰좋은 1개' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '태그 더 보기' }));

    expect(
      screen.getByRole('heading', { name: '공유할 태그 선택' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: '태그 검색' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '추천' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '목적' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '뷰좋은 1개' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '선택 완료' }),
    ).toBeInTheDocument();
  });

  it('filters the full tag picker with search and returns after completion', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '혼밥집', ['solo']),
          createPlace('2', '혼밥 카페', ['solo']),
          createPlace('3', '데이트집', ['date']),
          createPlace('4', '친구모임집', ['friends']),
          createPlace('5', '가족식사집', ['family']),
          createPlace('6', '작업 카페', ['work']),
          createPlace('7', '조용한 카페', ['quiet']),
          createPlace('8', '힙한 식당', ['hip']),
          createPlace('9', '아늑한 식당', ['cozy']),
          createPlace('10', '뷰 좋은 식당', ['view']),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));
    fireEvent.click(screen.getByRole('button', { name: '태그 더 보기' }));
    fireEvent.change(screen.getByRole('searchbox', { name: '태그 검색' }), {
      target: { value: '뷰' },
    });

    expect(
      screen.getByRole('heading', { name: '검색 결과' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '목적' }),
    ).not.toBeInTheDocument();

    const viewTagButton = screen.getByRole('button', { name: '뷰좋은 1개' });
    fireEvent.click(viewTagButton);

    expect(viewTagButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '선택 완료' }));

    expect(screen.getByText('뷰좋은 장소 1개 중 1개 선택')).toBeInTheDocument();
  });

  it('updates status criteria through the dropdown option list', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '추천' }));
    fireEvent.click(screen.getByRole('option', { name: '또 갈 곳' }));

    expect(
      screen.getByRole('button', { name: '공유 링크 만들기' }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        '공유할 장소가 없어요. 다른 상태나 직접 선택을 써 보세요.',
      ),
    ).toBeInTheDocument();
  });

  it('disables creation when region criteria is blank', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '지역' }));

    expect(
      screen.getByRole('button', { name: '공유 링크 만들기' }),
    ).toBeDisabled();
    expect(
      screen.getByText('지역명을 입력하면 주소에 포함된 장소를 찾아요.'),
    ).toBeInTheDocument();
  });

  it('wraps tab focus past a disabled create button', async () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '지역' }));

    const disabledCreateButton = screen.getByRole('button', {
      name: '공유 링크 만들기',
    });
    const [headerCloseButton, footerCloseButton] = screen.getAllByRole(
      'button',
      { name: '닫기' },
    );

    await waitFor(() => expect(headerCloseButton).toHaveFocus());
    expect(disabledCreateButton).toBeDisabled();

    footerCloseButton.focus();
    fireEvent.keyDown(window, { key: 'Tab', code: 'Tab', keyCode: 9 });

    await waitFor(() => expect(headerCloseButton).toHaveFocus());
  });

  it('keeps region typing separate from the title field and preserves input focus', async () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '지역' }));

    const titleInput = screen.getByRole('textbox', {
      name: '공유 지도 제목',
    });
    const regionInput = screen.getByRole('textbox', {
      name: '공유할 지역',
    });

    regionInput.focus();
    fireEvent.change(regionInput, { target: { value: '성수동' } });

    expect(regionInput).toHaveValue('성수동');
    expect(titleInput).toHaveValue('');
    expect(titleInput).toHaveAttribute('placeholder', '예: 성수 맛집 지도');
    await waitFor(() => expect(regionInput).toHaveFocus());
  });

  it('disables creation when no saved places have tags', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', [])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));

    expect(
      screen.getByRole('button', { name: '공유 링크 만들기' }),
    ).toBeDisabled();
    expect(
      screen.getByText('태그가 있는 장소가 없어요. 직접 선택을 써 보세요.'),
    ).toBeInTheDocument();
  });

  it('exposes the share URL after a successful create', async () => {
    mutateAsync.mockResolvedValueOnce(createSharedMapResponse());

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    const shareUrlInput = await screen.findByLabelText('공유 링크');
    expect(shareUrlInput).toHaveValue(
      'http://localhost:3000/share/seongsu-map',
    );
  });

  it('uses a smart default title when the user has not typed one', async () => {
    mutateAsync.mockResolvedValueOnce(
      createSharedMapResponse({ title: '추천 장소 지도' }),
    );

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            title: '추천 장소 지도',
          }),
        }),
      ),
    );
  });

  it('shows a recipient preview after creating a share link', async () => {
    mutateAsync.mockResolvedValueOnce(createSharedMapResponse());

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    expect(
      await screen.findByText('상대방에게 이렇게 보여요'),
    ).toBeInTheDocument();
    expect(screen.getByText('성수 추천 지도')).toBeInTheDocument();
    expect(screen.getByText('장소 1개')).toBeInTheDocument();
    expect(screen.getByText('성수 카페')).toBeInTheDocument();
  });

  it('lets users remove places matched by a tag before creating a snapshot', async () => {
    mutateAsync.mockResolvedValueOnce(createSharedMapResponse());

    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '혼밥 카페', ['solo']),
          createPlace('2', '혼밥 밥집', ['solo']),
          createPlace('3', '데이트 식당', ['date']),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));

    expect(
      screen.getByRole('button', { name: '혼밥 2개' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '데이트 1개' }),
    ).toBeInTheDocument();

    expect(screen.getByText('혼밥 장소 2개 중 2개 선택')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '장소 확인하기' }));

    expect(
      screen.getByRole('heading', { name: '공유할 장소 선택' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /혼밥 카페/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /혼밥 밥집/ })).toBeChecked();
    expect(
      screen.queryByRole('checkbox', { name: /데이트 식당/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /혼밥 카페/ }));
    fireEvent.click(screen.getByRole('button', { name: '1개 선택 완료' }));

    expect(screen.getByText('혼밥 장소 2개 중 1개 선택')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            criteriaType: 'tag',
            criteriaValue: 'solo',
            places: [
              expect.objectContaining({
                id: '2',
                place_name: '혼밥 밥집',
              }),
            ],
          }),
        }),
      ),
    );
  });

  it('does not expose place reorder controls in the selection sheet', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '첫 번째 장소', ['solo']),
          createPlace('2', '두 번째 장소', ['solo']),
          createPlace('3', '세 번째 장소', ['solo']),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));
    fireEvent.click(screen.getByRole('button', { name: '장소 확인하기' }));

    expect(
      screen.queryByRole('button', { name: /위로 이동/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /아래로 이동/ }),
    ).not.toBeInTheDocument();
  });

  it('changes the primary footer action to sharing after link creation', async () => {
    mutateAsync.mockResolvedValueOnce(
      createSharedMapResponse({ title: '성수 추천 지도' }),
    );

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    expect(
      await screen.findByRole('button', { name: '공유하기' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '공유 링크 만들기' }),
    ).not.toBeInTheDocument();
  });

  it('shows copied feedback when clipboard copy succeeds', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      share: undefined,
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    mutateAsync.mockResolvedValueOnce(
      createSharedMapResponse({ title: '성수 추천 지도' }),
    );

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));
    fireEvent.click(await screen.findByRole('button', { name: '공유하기' }));

    expect(await screen.findByText('링크를 복사했어요.')).toBeInTheDocument();
  });

  it('does not show a failure message when native share is cancelled', async () => {
    const nativeShare = vi
      .fn()
      .mockRejectedValueOnce(new DOMException('Share cancelled', 'AbortError'));
    vi.stubGlobal('navigator', { ...navigator, share: nativeShare });
    mutateAsync.mockResolvedValueOnce(createSharedMapResponse());

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));
    await screen.findByLabelText('공유 링크');
    fireEvent.click(screen.getByRole('button', { name: '공유하기' }));

    await waitFor(() => expect(nativeShare).toHaveBeenCalled());
    expect(
      screen.queryByText('복사에 실패했어요. 링크를 직접 복사해 주세요.'),
    ).not.toBeInTheDocument();
  });

  it('opens manual place selection in a separate sheet', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '성수 카페', ['cafe']),
          createPlace('2', '성수 밥집', ['meal']),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '직접 선택' }));

    expect(screen.getByText('직접 고른 장소 0개')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '장소 선택하기' }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: '장소 선택하기' }));

    expect(
      screen.getByRole('heading', { name: '공유할 장소 선택' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /성수 카페/ }));
    fireEvent.click(screen.getByRole('button', { name: '1개 선택 완료' }));

    expect(screen.getByText('직접 고른 장소 1개')).toBeInTheDocument();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: '공유 링크 만들기' }),
    ).toBeEnabled();
  });

  it('defines a mobile bottom sheet layout for narrow screens', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    const styleSheetText = readFileSync(shareMapDialogCssPath, 'utf8');

    expect(styleSheetText).toContain("'@media':");
    expect(styleSheetText).toContain("'(max-width: 640px)'");
    expect(styleSheetText).toContain("alignItems: 'flex-end'");
    expect(styleSheetText).toContain("maxHeight: '88dvh'");
    expect(styleSheetText).toContain('env(safe-area-inset-bottom)');
  });
});
