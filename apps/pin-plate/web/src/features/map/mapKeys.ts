export const mapKeys = {
  nearbyRestaurants: (lat: number | undefined, lng: number | undefined) =>
    ['nearbyRestaurants', lat, lng] as const,
};
