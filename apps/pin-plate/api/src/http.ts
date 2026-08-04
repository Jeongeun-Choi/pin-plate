const DEFAULT_ALLOWED_CORS_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'X-Requested-With',
];

const ALLOWED_REQUEST_HEADER_NAMES = new Set(
  DEFAULT_ALLOWED_CORS_HEADERS.map((headerName) => headerName.toLowerCase()),
);

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
};

const isLocalFrontendOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    const localHostnames = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      localHostnames.has(url.hostname)
    );
  } catch {
    return false;
  }
};

const isAllowedRequestOrigin = (
  requestOrigin: string,
  frontendOrigin: string,
): boolean =>
  requestOrigin === frontendOrigin ||
  (isLocalFrontendOrigin(frontendOrigin) &&
    isLocalFrontendOrigin(requestOrigin));

const getAllowedCorsHeaders = (request: Request): string => {
  const requestedHeaders = request.headers.get(
    'Access-Control-Request-Headers',
  );

  if (!requestedHeaders) return DEFAULT_ALLOWED_CORS_HEADERS.join(', ');

  const allowedHeaders = requestedHeaders
    .split(',')
    .map((headerName) => headerName.trim())
    .filter((headerName) =>
      ALLOWED_REQUEST_HEADER_NAMES.has(headerName.toLowerCase()),
    );

  return allowedHeaders.length > 0
    ? allowedHeaders.join(', ')
    : DEFAULT_ALLOWED_CORS_HEADERS.join(', ');
};

const createSecurityHeaders = (request: Request): Headers => {
  const headers = new Headers({
    'Content-Security-Policy':
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    'Permissions-Policy':
      'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Permitted-Cross-Domain-Policies': 'none',
  });

  if (new URL(request.url).protocol === 'https:') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  return headers;
};

export const getConfiguredFrontendOrigin = (env: Env): string =>
  env.FRONTEND_ORIGIN || 'https://pinonplate.com';

export const createCorsHeaders = (
  request: Request,
  frontendOrigin: string,
): Headers => {
  const requestOrigin = request.headers.get('Origin');
  const headers = new Headers();

  if (requestOrigin && isAllowedRequestOrigin(requestOrigin, frontendOrigin)) {
    headers.set('Access-Control-Allow-Origin', requestOrigin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary', 'Origin');
  }

  headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  headers.set('Access-Control-Allow-Headers', getAllowedCorsHeaders(request));
  headers.set('Access-Control-Max-Age', '86400');

  return headers;
};

export const withResponseHeaders = (
  response: Response,
  request: Request,
  corsHeaders: Headers,
  extraHeaders?: Headers,
): Response => {
  const headers = new Headers(response.headers);

  createSecurityHeaders(request).forEach((value, key) => {
    headers.set(key, value);
  });

  corsHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  extraHeaders?.forEach((value, key) => {
    headers.set(key, value);
  });

  const requestPathname = new URL(request.url).pathname;

  if (requestPathname === '/auth' || requestPathname.startsWith('/auth/')) {
    headers.set('Cache-Control', 'no-store');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const createJsonResponse = (
  body: Record<string, unknown>,
  status: number,
  request: Request,
  corsHeaders: Headers,
  extraHeaders?: Headers,
): Response =>
  withResponseHeaders(
    Response.json(body, {
      status,
      headers: JSON_HEADERS,
    }),
    request,
    corsHeaders,
    extraHeaders,
  );
