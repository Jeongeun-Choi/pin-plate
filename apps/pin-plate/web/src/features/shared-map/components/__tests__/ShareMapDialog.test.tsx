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

  it('disables creation when selected tag criteria has no places', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));
    fireEvent.click(screen.getByRole('button', { name: '혼밥' }));
    fireEvent.click(screen.getByRole('option', { name: '데이트' }));

    expect(
      screen.getByRole('button', { name: '공유 링크 만들기' }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        '이 태그가 붙은 장소가 없어요. 다른 태그나 직접 선택을 써 보세요.',
      ),
    ).toBeInTheDocument();
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

  it('suggests another criteria when a tag has no matching places', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));
    fireEvent.click(screen.getByRole('button', { name: '혼밥' }));
    fireEvent.click(screen.getByRole('option', { name: '데이트' }));

    expect(
      screen.getByText(
        '이 태그가 붙은 장소가 없어요. 다른 태그나 직접 선택을 써 보세요.',
      ),
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
