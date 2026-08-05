#!/usr/bin/env node
/* global console, fetch, process, URL */

import { setTimeout as sleep } from 'node:timers/promises';

const DEFAULT_BASE_URL = 'http://127.0.0.1:8787';
const DEFAULT_ORIGIN = 'http://localhost:3000';
const DEFAULT_PASSWORD = 'PinPlateSmoke123!';
const DEFAULT_NETWORK_RETRY_ATTEMPTS = 12;
const DEFAULT_NETWORK_RETRY_DELAY_MS = 5_000;

const getErrorMessage = (error) => {
  if (!(error instanceof Error)) return String(error);

  if (error.cause instanceof Error) {
    return `${error.message}: ${error.cause.message}`;
  }

  if (
    error.cause &&
    typeof error.cause === 'object' &&
    'message' in error.cause
  ) {
    return `${error.message}: ${String(error.cause.message)}`;
  }

  return error.message;
};

const getRetryAttemptCount = (value) =>
  Number.isInteger(value) && value > 0 ? value : DEFAULT_NETWORK_RETRY_ATTEMPTS;

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

      if (arg.startsWith('--network-retries=')) {
        return {
          ...options,
          networkRetryAttempts: Number(arg.slice('--network-retries='.length)),
        };
      }

      if (arg === '--sign-in') {
        return { ...options, shouldSignIn: true };
      }

      if (arg === '--skip-sign-up') {
        return { ...options, shouldSkipSignUp: true };
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
      networkRetryAttempts: Number(
        process.env.AUTH_SMOKE_NETWORK_RETRIES ??
          DEFAULT_NETWORK_RETRY_ATTEMPTS,
      ),
      shouldSkipSignUp: process.env.AUTH_SMOKE_SKIP_SIGN_UP === 'true',
      shouldTestGoogle: process.env.AUTH_SMOKE_GOOGLE === 'true',
      shouldSignIn: process.env.AUTH_SMOKE_SIGN_IN === 'true',
    },
  );

const requestJson = async (url, origin, init = {}) => {
  const { networkRetryAttempts = 1, ...requestInit } = init;
  const retryAttemptCount = getRetryAttemptCount(networkRetryAttempts);
  let lastError = null;

  for (let attempt = 1; attempt <= retryAttemptCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...requestInit,
        headers: {
          Accept: 'application/json',
          ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}),
          Origin: origin,
          ...requestInit.headers,
        },
      });

      return await parseJsonResponse(response);
    } catch (error) {
      lastError = error;

      if (attempt === retryAttemptCount) break;

      console.log(
        `Request failed (${attempt}/${retryAttemptCount}) for ${url}: ${getErrorMessage(
          error,
        )}. Retrying in ${DEFAULT_NETWORK_RETRY_DELAY_MS / 1_000}s...`,
      );
      await sleep(DEFAULT_NETWORK_RETRY_DELAY_MS);
    }
  }

  throw new Error(`Request failed for ${url}: ${getErrorMessage(lastError)}`);
};

const parseJsonResponse = async (response) => {
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

const assertGoogleOAuthUrl = (url, expectedRedirectUri) => {
  const parsedUrl = new URL(url);
  const redirectUri = parsedUrl.searchParams.get('redirect_uri');

  if (parsedUrl.host !== 'accounts.google.com') {
    throw new Error(`Expected Google OAuth host, got ${parsedUrl.host}`);
  }

  if (redirectUri !== expectedRedirectUri) {
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

const assertGoogleOAuthStateCookie = (headers, baseUrl) => {
  const stateCookie = getSetCookies(headers).find((cookie) =>
    cookie.startsWith('pin-plate.state='),
  );
  const isLocalSmoke = new URL(baseUrl).hostname === 'localhost';

  if (!stateCookie) {
    if (isLocalSmoke) {
      throw new Error('Google OAuth start did not return a state cookie.');
    }

    console.log(
      'Google OAuth state cookie was not exposed to the smoke runner; continuing because the OAuth URL contains state and PKCE.',
    );
    return;
  }

  if (
    isLocalSmoke &&
    stateCookie.toLowerCase().includes('domain=pinonplate.com')
  ) {
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

  assertGoogleOAuthUrl(
    signInSocialResult.body.url,
    `${baseUrl}/auth/callback/google`,
  );
  assertGoogleOAuthStateCookie(signInSocialResult.headers, baseUrl);
  console.log('Google OAuth start URL is valid.');
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const baseUrl = options.baseUrl.replace(/\/+$/g, '');

  console.log(`Auth smoke base URL: ${baseUrl}`);
  console.log(`Smoke email: ${options.email}`);

  const healthResult = await requestJson(`${baseUrl}/health`, options.origin, {
    networkRetryAttempts: options.networkRetryAttempts,
  });
  assertStatus({
    label: 'GET /health',
    result: healthResult,
    expectedStatuses: [200],
  });

  if (options.shouldTestGoogle) {
    await runGoogleOAuthSmoke({ baseUrl, origin: options.origin });
  }

  if (options.shouldSkipSignUp) {
    console.log('Sign-up smoke skipped.');
    console.log('Auth smoke test passed.');
    return;
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
