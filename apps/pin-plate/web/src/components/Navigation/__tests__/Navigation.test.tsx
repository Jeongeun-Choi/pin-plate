import { fireEvent, render, screen } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { viewModeAtom, type ViewMode } from '@/app/atoms';
import { Navigation } from '../index';

const pushMock = vi.fn();
let currentPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: pushMock,
  }),
}));

const renderNavigation = (initialViewMode: ViewMode = 'map') => {
  const store = createStore();
  store.set(viewModeAtom, initialViewMode);

  render(
    <Provider store={store}>
      <Navigation />
    </Provider>,
  );

  return store;
};

describe('Navigation', () => {
  beforeEach(() => {
    currentPathname = '/';
    pushMock.mockClear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('keeps the My tab active on My Page child routes', async () => {
    currentPathname = '/my-page/edit';

    renderNavigation();

    expect(
      await screen.findByRole('button', { name: '마이페이지' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', { name: '홈으로 이동' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('returns from My Page to the home map view', async () => {
    currentPathname = '/my-page';
    const store = renderNavigation('list');

    fireEvent.click(await screen.findByRole('button', { name: '홈으로 이동' }));

    expect(pushMock).toHaveBeenCalledWith('/');
    expect(store.get(viewModeAtom)).toBe('map');
  });

  it('does not render mobile navigation on desktop viewports', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderNavigation();

    expect(
      screen.queryByRole('button', { name: '홈으로 이동' }),
    ).not.toBeInTheDocument();
  });
});
