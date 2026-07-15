import { expect, test, type Page } from '@playwright/test';

const authTokenPattern = /\/auth\/v1\/token\?grant_type=password/;
const profilePattern = /\/rest\/v1\/profiles/;

const waitForClientReady = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() =>
    Array.from(document.scripts).some((script) =>
      script.src.includes('/_next/static/'),
    ),
  );
};

const fillLoginForm = async (page: Page, email: string, password: string) => {
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
};

const fillSignUpForm = async (
  page: Page,
  fields: {
    name: string;
    email: string;
    password: string;
  },
) => {
  await page.getByLabel('이름').fill(fields.name);
  await page.getByLabel('이메일').fill(fields.email);
  await page.getByLabel('비밀번호', { exact: true }).fill(fields.password);
  await page.getByLabel('비밀번호 확인').fill(fields.password);
};

const getRealSignupEmail = () => {
  const emailTemplate = process.env.PIN_PLATE_E2E_SIGNUP_EMAIL_TEMPLATE;

  if (emailTemplate) {
    return emailTemplate.replace('{timestamp}', Date.now().toString());
  }

  return process.env.PIN_PLATE_E2E_SIGNUP_EMAIL;
};

const mockInvalidLogin = async (page: Page) => {
  await page.route(authTokenPattern, async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid login credentials',
        msg: 'Invalid login credentials',
      }),
    });
  });
};

const mockSuccessfulLogin = async (page: Page) => {
  const calls = {
    token: 0,
    profile: 0,
  };

  await page.route(authTokenPattern, async (route) => {
    calls.token += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'e2e-access-token',
        refresh_token: 'e2e-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: {
          id: 'user-1',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'user@example.com',
          app_metadata: {},
          user_metadata: {},
          created_at: '2026-07-15T00:00:00.000Z',
          updated_at: '2026-07-15T00:00:00.000Z',
        },
      }),
    });
  });

  await page.route(profilePattern, async (route) => {
    calls.profile += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ nickname: '맛집러' }),
    });
  });

  return calls;
};

test.describe('auth pages', () => {
  test('shows sign-up password mismatch feedback below the confirm password input', async ({
    page,
  }) => {
    await page.goto('/sign-up');
    await waitForClientReady(page);

    await expect(
      page.getByRole('heading', { name: /pin plate/i }),
    ).toBeVisible();

    await page.getByLabel('이름').fill('맛집러');
    await page.getByLabel('이메일').fill('user@example.com');
    await page.getByLabel('비밀번호', { exact: true }).fill('password1');
    await page.getByLabel('비밀번호 확인').fill('password2');

    await expect(page.getByText('비밀번호가 일치하지 않습니다.')).toBeVisible();
  });

  test('shows invalid login credentials below the password input', async ({
    page,
  }) => {
    await mockInvalidLogin(page);

    await page.goto('/sign-in');
    await waitForClientReady(page);
    await fillLoginForm(page, 'user@example.com', 'wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(
      page.getByText('이메일 또는 비밀번호가 일치하지 않습니다.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test('stores the access token after successful email login', async ({
    page,
  }) => {
    const calls = await mockSuccessfulLogin(page);

    await page.goto('/sign-in');
    await waitForClientReady(page);
    await fillLoginForm(page, 'user@example.com', 'password1');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect.poll(() => calls.token).toBe(1);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('accessToken')))
      .toBe('e2e-access-token');
    await expect.poll(() => calls.profile).toBe(1);
  });

  test('signs up through the real Supabase-backed server action when configured', async ({
    page,
  }) => {
    test.skip(
      !getRealSignupEmail() || !process.env.PIN_PLATE_E2E_SIGNUP_PASSWORD,
      'Set PIN_PLATE_E2E_SIGNUP_EMAIL_TEMPLATE or PIN_PLATE_E2E_SIGNUP_EMAIL plus PIN_PLATE_E2E_SIGNUP_PASSWORD to run real signup success E2E.',
    );

    const email = getRealSignupEmail();
    const password = process.env.PIN_PLATE_E2E_SIGNUP_PASSWORD;

    if (!email || !password) return;

    await page.goto('/sign-up');
    await waitForClientReady(page);
    await fillSignUpForm(page, {
      name: '맛집러',
      email,
      password,
    });
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(
      page.getByRole('heading', { name: /pin plate/i }),
    ).toBeVisible();
  });

  test('logs in through the real Supabase client when configured', async ({
    page,
  }) => {
    test.skip(
      !process.env.PIN_PLATE_E2E_LOGIN_EMAIL ||
        !process.env.PIN_PLATE_E2E_LOGIN_PASSWORD,
      'Set PIN_PLATE_E2E_LOGIN_EMAIL and PIN_PLATE_E2E_LOGIN_PASSWORD to run real login success E2E.',
    );

    const email = process.env.PIN_PLATE_E2E_LOGIN_EMAIL;
    const password = process.env.PIN_PLATE_E2E_LOGIN_PASSWORD;

    if (!email || !password) return;

    await page.goto('/sign-in');
    await waitForClientReady(page);
    await fillLoginForm(page, email, password);
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page).not.toHaveURL(/\/sign-in$/);
  });
});
