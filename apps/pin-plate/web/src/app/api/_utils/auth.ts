import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

const getAuthApiBaseUrl = (request: NextRequest): string => {
  const configuredAuthApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace(
    /\/+$/g,
    '',
  );

  if (configuredAuthApiUrl) return configuredAuthApiUrl;

  const requestUrl = new URL(request.url);
  const localHostnames = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

  if (localHostnames.has(requestUrl.hostname)) {
    return `http://${requestUrl.hostname}:8787`;
  }

  return 'https://api.pinonplate.com';
};

const parseBetterAuthUser = (value: unknown): AuthenticatedUser | null => {
  if (typeof value !== 'object' || value === null) return null;

  const response = value as { user?: unknown };

  if (typeof response.user !== 'object' || response.user === null) return null;

  const user = response.user as { email?: unknown; id?: unknown };

  if (typeof user.id !== 'string') return null;

  return {
    id: user.id,
    email: typeof user.email === 'string' ? user.email : undefined,
  };
};

const getBetterAuthUser = async (
  request: NextRequest,
): Promise<AuthenticatedUser | null> => {
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) return null;

  try {
    const response = await fetch(
      `${getAuthApiBaseUrl(request)}/auth/get-session`,
      {
        headers: {
          Accept: 'application/json',
          Cookie: cookieHeader,
        },
      },
    );

    if (!response.ok) return null;

    return parseBetterAuthUser(await response.json());
  } catch {
    return null;
  }
};

const getSupabaseAuthUser = async (): Promise<AuthenticatedUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? { id: user.id, email: user.email } : null;
};

export const getAuthenticatedUser = async (
  request: NextRequest,
): Promise<AuthenticatedUser | null> => {
  const betterAuthUser = await getBetterAuthUser(request);

  if (betterAuthUser) return betterAuthUser;

  return getSupabaseAuthUser();
};
