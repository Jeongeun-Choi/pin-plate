import { createAuth } from './auth';
import { parseRuntimeEnv } from './env';

const AUTH_ROUTE_PREFIX = '/auth';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
};

const getConfiguredFrontendOrigin = (env: Env): string =>
  env.FRONTEND_ORIGIN || 'https://pinonplate.com';

const createCorsHeaders = (
  request: Request,
  frontendOrigin: string,
): Headers => {
  const requestOrigin = request.headers.get('Origin');
  const requestedHeaders = request.headers.get(
    'Access-Control-Request-Headers',
  );
  const headers = new Headers();

  if (requestOrigin === frontendOrigin) {
    headers.set('Access-Control-Allow-Origin', frontendOrigin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary', 'Origin');
  }

  headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  headers.set(
    'Access-Control-Allow-Headers',
    requestedHeaders ?? 'Content-Type, Authorization',
  );
  headers.set('Access-Control-Max-Age', '86400');

  return headers;
};

const withCorsHeaders = (
  response: Response,
  corsHeaders: Headers,
): Response => {
  const headers = new Headers(response.headers);

  corsHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const createJsonResponse = (
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Headers,
): Response =>
  withCorsHeaders(
    Response.json(body, {
      status,
      headers: JSON_HEADERS,
    }),
    corsHeaders,
  );

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const frontendOrigin = getConfiguredFrontendOrigin(env);
    const corsHeaders = createCorsHeaders(request, frontendOrigin);

    try {
      const requestUrl = new URL(request.url);

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      if (request.method === 'GET' && requestUrl.pathname === '/health') {
        return createJsonResponse(
          { ok: true, service: 'pin-plate-api' },
          200,
          corsHeaders,
        );
      }

      if (
        requestUrl.pathname === AUTH_ROUTE_PREFIX ||
        requestUrl.pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)
      ) {
        const runtimeEnv = parseRuntimeEnv(env);
        const auth = createAuth({ ctx, env: runtimeEnv });
        const authResponse = await auth.handler(request);

        return withCorsHeaders(authResponse, corsHeaders);
      }

      return createJsonResponse(
        { code: 'NOT_FOUND', message: 'Route not found' },
        404,
        corsHeaders,
      );
    } catch (error: unknown) {
      console.error('Unhandled API error', error);

      return createJsonResponse(
        { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
        500,
        corsHeaders,
      );
    }
  },
} satisfies ExportedHandler<Env>;
