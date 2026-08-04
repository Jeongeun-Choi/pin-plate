import { checkRateLimit, type RateLimitResult } from './rateLimit';

interface AuthRateLimitResult extends RateLimitResult {
  scope: string;
}

const AUTH_PREFIX = '/auth';
const GENERAL_AUTH_RATE_LIMIT = 60;
const GENERAL_AUTH_RATE_WINDOW_MS = 60_000;
const SESSION_RATE_LIMIT = 240;
const SESSION_RATE_WINDOW_MS = 60_000;
const SENSITIVE_AUTH_IP_RATE_LIMIT = 20;
const SENSITIVE_AUTH_EMAIL_RATE_LIMIT = 5;
const SENSITIVE_AUTH_RATE_WINDOW_MS = 10 * 60_000;

const normalizeIpHeader = (value: string | null): string | null => {
  const rawIp = value?.split(',')[0]?.trim();
  return rawIp && rawIp.length > 0 ? rawIp.replace(/:\d+$/, '') : null;
};

const getClientIp = (request: Request): string =>
  normalizeIpHeader(request.headers.get('cf-connecting-ip')) ??
  normalizeIpHeader(request.headers.get('x-real-ip')) ??
  normalizeIpHeader(request.headers.get('x-forwarded-for')) ??
  'unknown';

const normalizeEmail = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0
    ? value.trim().toLowerCase()
    : null;

const isAuthRoute = (pathname: string): boolean =>
  pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`);

const isSessionLookupRoute = (request: Request, pathname: string): boolean =>
  request.method === 'GET' && pathname === `${AUTH_PREFIX}/get-session`;

const isSensitiveAuthRoute = (request: Request, pathname: string): boolean => {
  if (request.method !== 'POST') return false;

  return (
    pathname.startsWith(`${AUTH_PREFIX}/sign-in/`) ||
    pathname.startsWith(`${AUTH_PREFIX}/sign-up/`) ||
    pathname === `${AUTH_PREFIX}/forget-password` ||
    pathname === `${AUTH_PREFIX}/forgot-password` ||
    pathname === `${AUTH_PREFIX}/request-password-reset`
  );
};

const readEmailFromRequest = async (
  request: Request,
): Promise<string | null> => {
  try {
    const body = await request.clone().json();

    if (typeof body !== 'object' || body === null) return null;

    const payload = body as { email?: unknown };
    return normalizeEmail(payload.email);
  } catch {
    return null;
  }
};

const buildResult = (
  scope: string,
  checkResult: RateLimitResult,
): AuthRateLimitResult => ({
  ...checkResult,
  scope,
});

export const checkAuthRateLimit = async (
  request: Request,
): Promise<AuthRateLimitResult | null> => {
  const requestUrl = new URL(request.url);

  if (!isAuthRoute(requestUrl.pathname)) return null;

  const now = Date.now();
  const clientIp = getClientIp(request);

  if (isSessionLookupRoute(request, requestUrl.pathname)) {
    return buildResult(
      'auth-session-ip',
      checkRateLimit({
        key: `auth:session:ip:${clientIp}`,
        limit: SESSION_RATE_LIMIT,
        now,
        windowMs: SESSION_RATE_WINDOW_MS,
      }),
    );
  }

  if (isSensitiveAuthRoute(request, requestUrl.pathname)) {
    const ipResult = buildResult(
      'auth-sensitive-ip',
      checkRateLimit({
        key: `auth:sensitive:ip:${clientIp}`,
        limit: SENSITIVE_AUTH_IP_RATE_LIMIT,
        now,
        windowMs: SENSITIVE_AUTH_RATE_WINDOW_MS,
      }),
    );

    if (!ipResult.isAllowed) return ipResult;

    const email = await readEmailFromRequest(request);

    if (!email) return ipResult;

    return buildResult(
      'auth-sensitive-email',
      checkRateLimit({
        key: `auth:sensitive:email:${email}`,
        limit: SENSITIVE_AUTH_EMAIL_RATE_LIMIT,
        now,
        windowMs: SENSITIVE_AUTH_RATE_WINDOW_MS,
      }),
    );
  }

  if (request.method === 'OPTIONS') return null;

  return buildResult(
    'auth-general-ip',
    checkRateLimit({
      key: `auth:general:ip:${clientIp}`,
      limit: GENERAL_AUTH_RATE_LIMIT,
      now,
      windowMs: GENERAL_AUTH_RATE_WINDOW_MS,
    }),
  );
};

export const createRateLimitHeaders = (
  rateLimitResult: AuthRateLimitResult,
): Headers => {
  const resetInSeconds = Math.max(
    1,
    Math.ceil((rateLimitResult.resetAt - Date.now()) / 1_000),
  );

  return new Headers({
    'Retry-After': resetInSeconds.toString(),
    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt / 1_000).toString(),
    'X-RateLimit-Scope': rateLimitResult.scope,
  });
};
