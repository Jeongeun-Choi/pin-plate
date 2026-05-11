export const placeKeys = {
  all: ['places'] as const,
  lists: (userId?: string) =>
    userId
      ? ([...placeKeys.all, 'list', { userId }] as const)
      : ([...placeKeys.all, 'list'] as const),
  detail: (placeId: string) => [...placeKeys.all, 'detail', placeId] as const,
};
