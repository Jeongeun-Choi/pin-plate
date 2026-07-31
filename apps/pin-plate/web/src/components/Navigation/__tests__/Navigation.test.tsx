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
  });

  it('keeps the My tab active on My Page child routes', () => {
    currentPathname = '/my-page/edit';

    renderNavigation();

    expect(screen.getByRole('button', { name: '마이페이지' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('button', { name: '홈으로 이동' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('returns from My Page to the home map view', () => {
    currentPathname = '/my-page';
    const store = renderNavigation('list');

    fireEvent.click(screen.getByRole('button', { name: '홈으로 이동' }));

    expect(pushMock).toHaveBeenCalledWith('/');
    expect(store.get(viewModeAtom)).toBe('map');
  });
});
