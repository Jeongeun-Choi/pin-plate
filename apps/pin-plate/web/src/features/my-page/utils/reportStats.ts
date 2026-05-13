import type { Post } from '@/features/post/types/post';

export interface ReportMetric {
  name: string;
  count: number;
}

export interface MyPageReportStats {
  weeklyRestaurants: ReportMetric[];
  monthlyRestaurants: ReportMetric[];
  weeklyAreas: ReportMetric[];
  monthlyAreas: ReportMetric[];
  topTags: ReportMetric[];
}

const MAX_VISIBLE_ITEMS = 4;

const startOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const startOfWeek = (date: Date) => {
  const nextDate = startOfDay(date);
  const mondayOffset = (nextDate.getDay() + 6) % 7;
  nextDate.setDate(nextDate.getDate() - mondayOffset);
  return nextDate;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const isInDateRange = (value: string, startDate: Date, endDate: Date) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  return date >= startDate && date < endDate;
};

const sortMetrics = (
  [leftName, leftCount]: [string, number],
  [rightName, rightCount]: [string, number],
) => {
  if (rightCount !== leftCount) return rightCount - leftCount;

  return leftName.localeCompare(rightName, 'ko-KR');
};

const toTopMetrics = (counts: Map<string, number>) =>
  Array.from(counts.entries())
    .sort(sortMetrics)
    .slice(0, MAX_VISIBLE_ITEMS)
    .map(([name, count]) => ({ name, count }));

const countPlaces = (posts: Post[]) => {
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    const placeName = post.place_name.trim();
    if (!placeName) return;

    counts.set(placeName, (counts.get(placeName) ?? 0) + 1);
  });

  return toTopMetrics(counts);
};

const broadAreaNames = new Set([
  '서울',
  '서울특별시',
  '부산',
  '부산광역시',
  '대구',
  '대구광역시',
  '인천',
  '인천광역시',
  '광주',
  '광주광역시',
  '대전',
  '대전광역시',
  '울산',
  '울산광역시',
  '세종',
  '세종특별자치시',
  '경기',
  '경기도',
  '강원',
  '강원도',
  '강원특별자치도',
  '충북',
  '충청북도',
  '충남',
  '충청남도',
  '전북',
  '전라북도',
  '전북특별자치도',
  '전남',
  '전라남도',
  '경북',
  '경상북도',
  '경남',
  '경상남도',
  '제주',
  '제주도',
  '제주특별자치도',
]);

const cityNameAliases = new Map([
  ['서울', '서울시'],
  ['서울특별시', '서울시'],
  ['부산', '부산시'],
  ['부산광역시', '부산시'],
  ['대구', '대구시'],
  ['대구광역시', '대구시'],
  ['인천', '인천시'],
  ['인천광역시', '인천시'],
  ['광주', '광주시'],
  ['광주광역시', '광주시'],
  ['대전', '대전시'],
  ['대전광역시', '대전시'],
  ['울산', '울산시'],
  ['울산광역시', '울산시'],
]);

const findAreaToken = (tokens: string[], suffixes: string[]) =>
  tokens.find(
    (token) =>
      !broadAreaNames.has(token) &&
      suffixes.some((suffix) => token.endsWith(suffix)),
  );

const getAreaNameFromAddress = (address: string) => {
  const tokens = address.trim().split(/\s+/).filter(Boolean);
  const districtName = findAreaToken(tokens, ['구', '군']);
  const broadCityName = tokens.find((token) => cityNameAliases.has(token));
  const cityName = broadCityName ?? findAreaToken(tokens, ['시']);

  if (cityName && districtName) {
    return `${cityNameAliases.get(cityName) ?? cityName} ${districtName}`;
  }

  const areaName =
    districtName ??
    (broadCityName ? undefined : cityName) ??
    findAreaToken(tokens, ['동', '읍', '면']);

  return areaName;
};

const countAreas = (posts: Post[]) => {
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    const areaName = getAreaNameFromAddress(post.address) ?? post.place_name;
    const metricName = areaName.trim();
    if (!metricName) return;

    counts.set(metricName, (counts.get(metricName) ?? 0) + 1);
  });

  return toTopMetrics(counts);
};

const countTags = (posts: Post[]) => {
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const tagName = tag.trim();
      if (!tagName) return;

      counts.set(tagName, (counts.get(tagName) ?? 0) + 1);
    });
  });

  return toTopMetrics(counts);
};

export const buildMyPageReportStats = (
  posts: Post[],
  now: Date = new Date(),
): MyPageReportStats => {
  const weekStartDate = startOfWeek(now);
  const weekEndDate = addDays(weekStartDate, 7);
  const monthStartDate = startOfMonth(now);
  const monthEndDate = addMonths(monthStartDate, 1);

  const weeklyPosts = posts.filter((post) =>
    isInDateRange(post.created_at, weekStartDate, weekEndDate),
  );
  const monthlyPosts = posts.filter((post) =>
    isInDateRange(post.created_at, monthStartDate, monthEndDate),
  );

  return {
    weeklyRestaurants: countPlaces(weeklyPosts),
    monthlyRestaurants: countPlaces(monthlyPosts),
    weeklyAreas: countAreas(weeklyPosts),
    monthlyAreas: countAreas(monthlyPosts),
    topTags: countTags(monthlyPosts),
  };
};
