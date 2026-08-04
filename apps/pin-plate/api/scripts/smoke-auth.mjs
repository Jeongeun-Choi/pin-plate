#!/usr/bin/env node

const DEFAULT_BASE_URL = 'http://localhost:8787';
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

      return options;
    },
    {
      baseUrl: process.env.AUTH_SMOKE_BASE_URL ?? DEFAULT_BASE_URL,
      email:
        process.env.AUTH_SMOKE_EMAIL ??
        `pinplate-smoke-${Date.now()}@example.com`,
      origin: process.env.AUTH_SMOKE_ORIGIN ?? DEFAULT_ORIGIN,
      password: process.env.AUTH_SMOKE_PASSWORD ?? DEFAULT_PASSWORD,
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

  const signUpResult = await requestJson(
    `${baseUrl}/auth/sign-up/email`,
    options.origin,
    {
      method: 'POST',
      body: JSON.stringify({
        callbackURL: `${baseUrl}/auth/ok`,
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
