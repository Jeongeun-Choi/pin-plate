export const myPageKeys = {
  all: ['my-page'] as const,
  profile: () => [...myPageKeys.all, 'profile'] as const,
};
