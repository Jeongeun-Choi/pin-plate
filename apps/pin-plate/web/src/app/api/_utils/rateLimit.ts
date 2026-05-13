interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}

const GOOGLE_PLACES_RATE_LIMIT = 30;
const GOOGLE_PLACES_RATE_WINDOW_MS = 60_000;

const rateLimitMap = new Map<string, RateLimitEntry>();

const normalizeIpHeader = (value: string | null) => {
  const rawIp = value?.split(',')[0]?.trim();
  return rawIp && rawIp.length > 0 ? rawIp.replace(/:\d+$/, '') : null;
};

export const checkRateLimit = ({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: RateLimitOptions): boolean => {
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
};

export const getClientRateLimitKey = (request: Request) =>
  normalizeIpHeader(request.headers.get('cf-connecting-ip')) ??
  normalizeIpHeader(request.headers.get('cloudfront-viewer-address')) ??
  normalizeIpHeader(request.headers.get('x-real-ip')) ??
  normalizeIpHeader(request.headers.get('x-forwarded-for')) ??
  'unknown';

export const checkGooglePlacesRateLimit = (request: Request) =>
  checkRateLimit({
    key: `google-places:${getClientRateLimitKey(request)}`,
    limit: GOOGLE_PLACES_RATE_LIMIT,
    windowMs: GOOGLE_PLACES_RATE_WINDOW_MS,
  });
