export const calcAverageRating = (ratings: number[]): number => {
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return parseFloat(average.toFixed(1));
};
