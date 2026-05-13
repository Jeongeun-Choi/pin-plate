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

vi.mock('@/features/my-page', () => ({
  useMyProfile: vi.fn(),
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
    },
  }),
}));

const { useMyProfile } = await import('@/features/my-page');

const mockedUseMyProfile = vi.mocked(useMyProfile);

describe('AccountPopover', () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    mockedUseMyProfile.mockReturnValue({
      data: null,
    } as ReturnType<typeof useMyProfile>);
  });

  it('lets signed-out users open My Page from the account menu', () => {
    const onClose = vi.fn();

    render(<AccountPopover onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /마이페이지/ }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/my-page');
  });
});
