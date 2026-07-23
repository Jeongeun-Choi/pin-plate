export const mobileSafeAreaInsetBottom =
  'max(env(safe-area-inset-bottom), 16px)';

export const mobileNavigationBaseHeight = '60px';

export const mobileNavigationHeight = `calc(${mobileNavigationBaseHeight} + ${mobileSafeAreaInsetBottom})`;
