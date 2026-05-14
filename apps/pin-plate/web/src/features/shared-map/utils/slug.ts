const KOREAN_ROMANIZATION: Record<string, string> = {
  성수: 'seongsu',
  카페: 'kape',
  추천: 'cuceon',
  맛집: 'matjip',
  지도: 'jido',
};

const normalizeTitle = (title: string) =>
  title
    .trim()
    .split(/\s+/)
    .map((part) => KOREAN_ROMANIZATION[part] ?? part)
    .join('-')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');

export const createShareSlug = (title: string) => {
  const prefix = normalizeTitle(title) || 'map';
  const suffix = crypto.randomUUID().replaceAll('-', '');

  return `${prefix}-${suffix}`;
};
