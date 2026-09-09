import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountPopover } from '../AccountPopover';

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

vi.mock('@/features/profile/hooks/useMyProfile', () => ({
  useMyProfile: vi.fn(),
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
    },
  }),
}));

const { useMyProfile } = await import('@/features/profile/hooks/useMyProfile');

const mockedUseMyProfile = vi.mocked(useMyProfile);

describe('AccountPopover', () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    mockedUseMyProfile.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useMyProfile>);
  });

  it('shows the current user info when a profile exists', () => {
    const onClose = vi.fn();

    mockedUseMyProfile.mockReturnValue({
      data: {
        id: 'user-1',
        nickname: '맛집러',
        name: null,
        image_url: null,
        email: 'user@example.com',
      },
      isLoading: false,
    } as ReturnType<typeof useMyProfile>);

    render(<AccountPopover onClose={onClose} />);

    expect(screen.getByText('맛집러')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '로그인하기' }),
    ).not.toBeInTheDocument();
  });

  it('does not show signed-out actions while the profile is loading', () => {
    const onClose = vi.fn();

    mockedUseMyProfile.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useMyProfile>);

    render(<AccountPopover onClose={onClose} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      '내 정보를 불러오는 중이에요.',
    );
    expect(
      screen.queryByRole('button', { name: '로그인하기' }),
    ).not.toBeInTheDocument();
  });

  it('lets signed-out users open My Page from the account menu', () => {
    const onClose = vi.fn();

    render(<AccountPopover onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /마이페이지/ }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/my-page');
  });
});
