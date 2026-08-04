#!/usr/bin/env node

const DEFAULT_BASE_URL = 'http://127.0.0.1:8787';
const DEFAULT_ORIGIN = 'http://localhost:3000';
const DEFAULT_PASSWORD = 'PinPlateSmoke123!';

const parseArgs = (argv) =>
  argv.reduce(
    (options, arg) => {
      if (arg.startsWith('--base-url=')) {
        return { ...options, baseUrl: arg.slice('--base-url='.length) };
      }

      if (arg.startsWith('--email=')) {
        return { ...options, email: arg.slice('--email='.length) };
      }

      if (arg.startsWith('--origin=')) {
        return { ...options, origin: arg.slice('--origin='.length) };
      }

      if (arg.startsWith('--password=')) {
        return { ...options, password: arg.slice('--password='.length) };
      }

      if (arg === '--sign-in') {
        return { ...options, shouldSignIn: true };
      }

      if (arg === '--google') {
        return { ...options, shouldTestGoogle: true };
      }

      return options;
    },
    {
      baseUrl: process.env.AUTH_SMOKE_BASE_URL ?? DEFAULT_BASE_URL,
      email:
        process.env.AUTH_SMOKE_EMAIL ??
        `pinplate-smoke-${Date.now()}@example.com`,
      origin: process.env.AUTH_SMOKE_ORIGIN ?? DEFAULT_ORIGIN,
      password: process.env.AUTH_SMOKE_PASSWORD ?? DEFAULT_PASSWORD,
      shouldTestGoogle: process.env.AUTH_SMOKE_GOOGLE === 'true',
      shouldSignIn: process.env.AUTH_SMOKE_SIGN_IN === 'true',
    },
  );

const requestJson = async (url, origin, init = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Origin: origin,
      ...init.headers,
    },
  });
  const responseText = await response.text();
  const responseBody = responseText ? parseResponseBody(responseText) : null;

  return {
    body: responseBody,
    headers: response.headers,
    ok: response.ok,
    status: response.status,
  };
};

const parseResponseBody = (responseText) => {
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

const getSetCookies = (headers) => {
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }

  const setCookie = headers.get('set-cookie');

  return setCookie ? [setCookie] : [];
};

const getCookieHeader = (setCookies) =>
  setCookies.map((cookie) => cookie.split(';')[0]).join('; ');

const assertStatus = ({ label, result, expectedStatuses }) => {
  if (!expectedStatuses.includes(result.status)) {
    throw new Error(
      `${label} failed with ${result.status}: ${JSON.stringify(result.body)}`,
    );
  }

  console.log(`${label}: ${result.status}`);
};

const assertGoogleOAuthUrl = (url) => {
  const parsedUrl = new URL(url);
  const redirectUri = parsedUrl.searchParams.get('redirect_uri');

  if (parsedUrl.host !== 'accounts.google.com') {
    throw new Error(`Expected Google OAuth host, got ${parsedUrl.host}`);
  }

  if (redirectUri !== 'http://localhost:8787/auth/callback/google') {
    throw new Error(`Unexpected Google redirect_uri: ${redirectUri}`);
  }

  if (!parsedUrl.searchParams.get('state')) {
    throw new Error('Google OAuth URL is missing state.');
  }

  if (!parsedUrl.searchParams.get('code_challenge')) {
    throw new Error('Google OAuth URL is missing PKCE code_challenge.');
  }

  if (parsedUrl.searchParams.get('prompt') !== 'select_account consent') {
    throw new Error(
      `Unexpected Google OAuth prompt: ${parsedUrl.searchParams.get('prompt')}`,
    );
  }

  if (parsedUrl.searchParams.get('access_type') !== 'offline') {
    throw new Error(
      `Unexpected Google OAuth access_type: ${parsedUrl.searchParams.get(
        'access_type',
      )}`,
    );
  }
};

const assertGoogleOAuthStateCookie = (headers) => {
  const stateCookie = getSetCookies(headers).find((cookie) =>
    cookie.startsWith('pin-plate.state='),
  );

  if (!stateCookie) {
    throw new Error('Google OAuth start did not return a state cookie.');
  }

  if (stateCookie.toLowerCase().includes('domain=pinonplate.com')) {
    throw new Error(
      'Local Google OAuth state cookie must not use Domain=pinonplate.com.',
    );
  }
};

const runGoogleOAuthSmoke = async ({ baseUrl, origin }) => {
  const signInSocialResult = await requestJson(
    `${baseUrl}/auth/sign-in/social`,
    origin,
    {
      method: 'POST',
      body: JSON.stringify({
        callbackURL: `${origin}/auth/callback`,
        provider: 'google',
      }),
    },
  );

  assertStatus({
    label: 'POST /auth/sign-in/social',
    result: signInSocialResult,
    expectedStatuses: [200],
  });

  if (typeof signInSocialResult.body?.url !== 'string') {
    throw new Error('Google sign-in did not return an OAuth URL.');
  }

  assertGoogleOAuthUrl(signInSocialResult.body.url);
  assertGoogleOAuthStateCookie(signInSocialResult.headers);
  console.log('Google OAuth start URL is valid.');
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const baseUrl = options.baseUrl.replace(/\/+$/g, '');

  console.log(`Auth smoke base URL: ${baseUrl}`);
  console.log(`Smoke email: ${options.email}`);

  const healthResult = await requestJson(`${baseUrl}/health`, options.origin);
  assertStatus({
    label: 'GET /health',
    result: healthResult,
    expectedStatuses: [200],
  });

  const authOkResult = await requestJson(`${baseUrl}/auth/ok`, options.origin);
  assertStatus({
    label: 'GET /auth/ok',
    result: authOkResult,
    expectedStatuses: [200],
  });

  if (options.shouldTestGoogle) {
    await runGoogleOAuthSmoke({ baseUrl, origin: options.origin });
  }

  const signUpResult = await requestJson(
    `${baseUrl}/auth/sign-up/email`,
    options.origin,
    {
      method: 'POST',
      body: JSON.stringify({
        callbackURL: `${options.origin}/auth/callback`,
        email: options.email,
        name: 'Pin Plate Smoke',
        password: options.password,
      }),
    },
  );
  assertStatus({
    label: 'POST /auth/sign-up/email',
    result: signUpResult,
    expectedStatuses: [200],
  });

  if (!options.shouldSignIn) {
    console.log(
      'Sign-in smoke skipped. Pass --sign-in with a verified account to test sessions.',
    );
    console.log('Auth smoke test passed through sign-up.');
    return;
  }

  const signInResult = await requestJson(
    `${baseUrl}/auth/sign-in/email`,
    options.origin,
    {
      method: 'POST',
      body: JSON.stringify({
        email: options.email,
        password: options.password,
        rememberMe: false,
      }),
    },
  );

  if (signInResult.status === 403) {
    console.log(
      'POST /auth/sign-in/email: 403 (expected when email verification is required)',
    );
    console.log('Smoke test passed through sign-up and verification gate.');
    return;
  }

  assertStatus({
    label: 'POST /auth/sign-in/email',
    result: signInResult,
    expectedStatuses: [200],
  });

  const cookieHeader = getCookieHeader(getSetCookies(signInResult.headers));

  if (!cookieHeader) {
    throw new Error('Sign-in succeeded but no session cookie was returned.');
  }

  const sessionResult = await requestJson(
    `${baseUrl}/auth/get-session`,
    options.origin,
    {
      headers: {
        Cookie: cookieHeader,
      },
    },
  );
  assertStatus({
    label: 'GET /auth/get-session',
    result: sessionResult,
    expectedStatuses: [200],
  });

  const signOutResult = await requestJson(
    `${baseUrl}/auth/sign-out`,
    options.origin,
    {
      method: 'POST',
      headers: {
        Cookie: cookieHeader,
      },
    },
  );
  assertStatus({
    label: 'POST /auth/sign-out',
    result: signOutResult,
    expectedStatuses: [200],
  });

  console.log('Auth smoke test passed.');
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
