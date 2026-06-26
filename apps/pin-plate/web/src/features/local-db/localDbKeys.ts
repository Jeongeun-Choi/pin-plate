export const localDbKeys = {
  all: ['local-db'] as const,
  places: () => [...localDbKeys.all, 'places'] as const,
  placesWithStats: () => [...localDbKeys.places(), 'with-stats'] as const,
  posts: () => [...localDbKeys.all, 'posts'] as const,
  post: (id: string) => [...localDbKeys.posts(), id] as const,
};
