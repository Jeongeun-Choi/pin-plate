import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareMapDialog } from '../components/ShareMapDialog';
import { useCreateSharedMap } from '../hooks/useCreateSharedMap';
import type { PlaceStatus, PlaceWithStats } from '@/features/place/types/place';
import type { SharedMap } from '../types/sharedMap';

vi.mock('../hooks/useCreateSharedMap', () => ({
  useCreateSharedMap: vi.fn(),
}));

const createPlace = (
  id: string,
  name: string,
  tags: string[],
  address = '서울 성동구 성수동',
  status: PlaceStatus = 'recommend',
): PlaceWithStats => ({
  id,
  user_id: 'user-1',
  kakao_place_id: `kakao-${id}`,
  place_name: name,
  address,
  lat: 37.5,
  lng: 127.1,
  status,
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

const shareMapDialogCssPath = resolve(
  __dirname,
  '../components/ShareMapDialog.css.ts',
);

const goToSelectionStep = () => {
  fireEvent.click(screen.getByRole('button', { name: '다음' }));
};

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

  it('starts from the compose step before showing sharing criteria', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('1 구성하기')).toBeInTheDocument();
    expect(screen.getByLabelText('공유 지도 제목')).toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: '태그' }),
    ).not.toBeInTheDocument();

    goToSelectionStep();

    expect(screen.getByText('2 지정하기')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '태그' })).toBeInTheDocument();
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

    goToSelectionStep();
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

    goToSelectionStep();
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

    goToSelectionStep();
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

  it('shows status criteria as chips with counts', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '성수 카페', ['work']),
          createPlace(
            '2',
            '다시 갈 식당',
            ['date'],
            '서울 성동구 서울숲',
            'want_to_revisit',
          ),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    goToSelectionStep();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '추천 1개' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '또 갈 곳 1개' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '또 갈 곳 1개' }));

    expect(
      screen.getByText('또 갈 곳 장소 1개 중 1개 선택'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '공유 링크 만들기' }),
    ).toBeEnabled();
  });

  it('disables empty status chips', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    goToSelectionStep();
    expect(screen.getByRole('button', { name: '또 갈 곳 0개' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '공유 링크 만들기' }),
    ).toBeEnabled();
    expect(
      screen.queryByText(
        '공유할 장소가 없어요. 다른 상태나 직접 선택을 써 보세요.',
      ),
    ).not.toBeInTheDocument();
  });

  it('offers saved regions as chips instead of a free text field', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '성수 카페', ['work'], '서울 성동구 성수동'),
          createPlace('2', '연남 식당', ['date'], '서울 마포구 연남동'),
          createPlace('3', '서울숲 카페', ['cafe'], '서울 성동구 서울숲'),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    goToSelectionStep();
    fireEvent.click(screen.getByRole('radio', { name: '지역' }));

    expect(
      screen.queryByRole('textbox', { name: '공유할 지역' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '서울시 성동구 2개' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '서울시 마포구 1개' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '서울시 마포구 1개' }));

    expect(
      screen.getByText('서울시 마포구 장소 1개 중 1개 선택'),
    ).toBeInTheDocument();
  });

  it('keeps a long region list compact behind a full region picker', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[
          createPlace('1', '장소 1', [], '서울 성동구 성수동'),
          createPlace('2', '장소 2', [], '서울 성동구 서울숲'),
          createPlace('3', '장소 3', [], '서울 마포구 연남동'),
          createPlace('4', '장소 4', [], '서울 마포구 망원동'),
          createPlace('5', '장소 5', [], '서울 강남구 역삼동'),
          createPlace('6', '장소 6', [], '서울 강남구 삼성동'),
          createPlace('7', '장소 7', [], '서울 용산구 한남동'),
          createPlace('8', '장소 8', [], '서울 용산구 이태원동'),
          createPlace('9', '장소 9', [], '서울 종로구 계동'),
          createPlace('10', '장소 10', [], '서울 종로구 삼청동'),
          createPlace('11', '장소 11', [], '서울 서대문구 연희동'),
          createPlace('12', '장소 12', [], '서울 서대문구 북가좌동'),
          createPlace('13', '장소 13', [], '서울 송파구 잠실동'),
          createPlace('14', '장소 14', [], '서울 송파구 송파동'),
          createPlace('15', '장소 15', [], '서울 영등포구 여의도동'),
          createPlace('16', '장소 16', [], '서울 영등포구 문래동'),
          createPlace('17', '장소 17', [], '경기 성남시 분당구 정자동'),
        ]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    goToSelectionStep();
    fireEvent.click(screen.getByRole('radio', { name: '지역' }));

    expect(
      screen.getByRole('button', { name: '지역 더 보기' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '성남시 분당구 1개' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '지역 더 보기' }));

    expect(
      screen.getByRole('heading', { name: '공유할 지역 선택' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: '지역 검색' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '성남시 분당구 1개' }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: '지역 검색' }), {
      target: { value: '정자동' },
    });

    expect(
      screen.getByRole('heading', { name: '검색 결과' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '성남시 분당구 1개' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '서울시 성동구 2개' }),
    ).not.toBeInTheDocument();
  });

  it('wraps tab focus past a disabled create button', async () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', [])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    goToSelectionStep();
    fireEvent.click(screen.getByRole('radio', { name: '태그' }));

    const disabledCreateButton = screen.getByRole('button', {
      name: '공유 링크 만들기',
    });
    const headerCloseButton = screen.getByRole('button', { name: '닫기' });
    const footerBackButton = screen.getByRole('button', { name: '이전' });

    await waitFor(() => expect(headerCloseButton).toHaveFocus());
    expect(disabledCreateButton).toBeDisabled();

    footerBackButton.focus();
    fireEvent.keyDown(window, { key: 'Tab', code: 'Tab', keyCode: 9 });

    await waitFor(() => expect(headerCloseButton).toHaveFocus());
  });

  it('keeps region selection separate from the title field', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    goToSelectionStep();
    fireEvent.click(screen.getByRole('radio', { name: '지역' }));
    fireEvent.click(screen.getByRole('button', { name: '이전' }));

    const titleInput = screen.getByRole('textbox', {
      name: '공유 지도 제목',
    });

    expect(titleInput).toHaveValue('');
    expect(titleInput).toHaveAttribute('placeholder', '예: 성수 맛집 지도');
    expect(
      screen.queryByRole('textbox', { name: '공유할 지역' }),
    ).not.toBeInTheDocument();
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

    goToSelectionStep();
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
    goToSelectionStep();
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

    goToSelectionStep();
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
    goToSelectionStep();
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

    goToSelectionStep();
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

    goToSelectionStep();
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
    goToSelectionStep();
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
    goToSelectionStep();
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
    goToSelectionStep();
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

    goToSelectionStep();
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
