import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATH_PREFIXES = ['/sign-in', '/sign-up', '/auth', '/share'];

interface BetterAuthUser {
  id: string;
}

const getAuthApiBaseUrl = (request: NextRequest): string => {
  const configuredAuthApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace(
    /\/+$/g,
    '',
  );

  if (configuredAuthApiUrl) return configuredAuthApiUrl;

  const localHostnames = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

  if (localHostnames.has(request.nextUrl.hostname)) {
    return `http://${request.nextUrl.hostname}:8787`;
  }

  return 'https://api.pinonplate.com';
};

const parseBetterAuthUser = (value: unknown): BetterAuthUser | null => {
  if (typeof value !== 'object' || value === null) return null;

  const response = value as { user?: unknown };

  if (typeof response.user !== 'object' || response.user === null) return null;

  const user = response.user as { id?: unknown };

  if (typeof user.id !== 'string') return null;

  return { id: user.id };
};

const getBetterAuthUser = async (
  request: NextRequest,
): Promise<BetterAuthUser | null> => {
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

export async function updateSession(request: NextRequest) {
  const isPublicPath = PUBLIC_PATH_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  const betterAuthUser = await getBetterAuthUser(request);

  if (betterAuthUser) {
    if (
      request.nextUrl.pathname.startsWith('/sign-in') ||
      request.nextUrl.pathname.startsWith('/sign-up')
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_API_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very hard to debug
    // issues with users being logged out abnormally.

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isPublicPath) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }

    if (user && !isPublicPath) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/sign-in';
        return NextResponse.redirect(url);
      }
    }

    // 1. 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하려 할 때 -> 메인으로 리다이렉트
    if (
      user &&
      (request.nextUrl.pathname.startsWith('/sign-in') ||
        request.nextUrl.pathname.startsWith('/sign-up'))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Return the myNewResponse object.
    // If this is not done, you potentially cause the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
  } catch {
    if (isPublicPath) {
      return NextResponse.next({ request });
    }

    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }
}
