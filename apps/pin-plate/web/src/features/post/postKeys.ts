export const postKeys = {
  all: ['posts'] as const,
  lists: (userId?: string) => [...postKeys.all, 'list', { userId }] as const,
  detail: (id: number) => [...postKeys.all, 'detail', id] as const,
};
