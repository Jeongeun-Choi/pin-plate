export const profileKeys = {
  all: ['my-page'] as const,
  me: () => [...profileKeys.all, 'profile'] as const,
};
