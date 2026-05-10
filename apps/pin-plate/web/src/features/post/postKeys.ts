export const postKeys = {
  all: ['posts'] as const,
  lists: (userId?: string) =>
    userId
      ? ([...postKeys.all, 'list', { userId }] as const)
      : ([...postKeys.all, 'list'] as const),
  detail: (id: number) => [...postKeys.all, 'detail', id] as const,
  byPlace: (userId: string, placeId: string) =>
    [...postKeys.all, 'by-place', { userId, placeId }] as const,
};
