import { createAuthRuntime } from './auth';
import { checkAuthRateLimit, createRateLimitHeaders } from './authRateLimit';
import { parseRuntimeEnv } from './env';
import {
  createCorsHeaders,
  createJsonResponse,
  getConfiguredFrontendOrigin,
  withResponseHeaders,
} from './http';

const AUTH_ROUTE_PREFIX = '/auth';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const frontendOrigin = getConfiguredFrontendOrigin(env);
    const corsHeaders = createCorsHeaders(request, frontendOrigin);

    try {
      const requestUrl = new URL(request.url);

      if (request.method === 'OPTIONS') {
        return withResponseHeaders(
          new Response(null, {
            status: 204,
          }),
          request,
          corsHeaders,
        );
      }

      if (request.method === 'GET' && requestUrl.pathname === '/health') {
        return createJsonResponse(
          { ok: true, service: 'pin-plate-api' },
          200,
          request,
          corsHeaders,
        );
      }

      if (
        requestUrl.pathname === AUTH_ROUTE_PREFIX ||
        requestUrl.pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)
      ) {
        const rateLimitResult = await checkAuthRateLimit(request);

        if (rateLimitResult && !rateLimitResult.isAllowed) {
          return createJsonResponse(
            {
              code: 'RATE_LIMITED',
              message: 'Too many authentication requests',
            },
            429,
            request,
            corsHeaders,
            createRateLimitHeaders(rateLimitResult),
          );
        }

        const runtimeEnv = parseRuntimeEnv(env);
        const authRuntime = createAuthRuntime({ ctx, env: runtimeEnv });

        try {
          const authResponse = await authRuntime.auth.handler(request);

          return withResponseHeaders(authResponse, request, corsHeaders);
        } finally {
          await authRuntime.closeDatabasePool();
        }
      }

      return createJsonResponse(
        { code: 'NOT_FOUND', message: 'Route not found' },
        404,
        request,
        corsHeaders,
      );
    } catch (error: unknown) {
      console.error('Unhandled API error', error);

      return createJsonResponse(
        { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' },
        500,
        request,
        corsHeaders,
      );
    }
  },
} satisfies ExportedHandler<Env>;
