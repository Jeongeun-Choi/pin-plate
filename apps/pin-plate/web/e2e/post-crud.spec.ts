import { expect, test, type Page, type Route } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const readLocalEnvValue = (key: string): string | undefined => {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return undefined;

  const line = readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith(`${key}=`));
  if (!line) return undefined;

  const value = line.slice(line.indexOf('=') + 1).trim();
  return value.replace(/^['"]|['"]$/g, '') || undefined;
};

const getE2eEnvValue = (key: string): string | undefined =>
  process.env[key] ?? readLocalEnvValue(key);

const TEST_LOGIN_EMAIL = getE2eEnvValue('PIN_PLATE_E2E_LOGIN_EMAIL');
const TEST_LOGIN_PASSWORD = getE2eEnvValue('PIN_PLATE_E2E_LOGIN_PASSWORD');
const FALLBACK_USER_ID = 'user-crud-1';
const PLACE_ID = 'google-place-crud-1';
const PLACE_NAME = '성수 CRUD 식당';
const PLACE_ADDRESS = '서울 성동구 CRUD로 1';
const CREATED_POST_ID = 2026;

interface PostFixture {
  id: number;
  content: string;
  rating: number;
  image_urls: string[];
  image_keys?: string[];
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  user_id: string;
  tags: string[];
  created_at: string;
}

interface PlaceFixture {
  id: string;
  user_id: string;
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  status: 'visited';
  tags: string[];
  created_at: string;
  updated_at: string;
  posts: Pick<PostFixture, 'id' | 'rating' | 'image_urls' | 'created_at'>[];
}

interface PostPayload {
  content: string;
  rating: number;
  image_urls: string[];
  image_keys?: string[];
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  user_id: string;
  tags: string[];
}

interface UpdatePostRequestBody {
  id: number;
  payload: Partial<PostPayload>;
}

interface CrudState {
  userId: string;
  posts: PostFixture[];
  createPayloads: PostPayload[];
  updateRequests: UpdatePostRequestBody[];
  deletedPostIds: number[];
}

const waitForClientReady = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() =>
    Array.from(document.scripts).some((script) =>
      script.src.includes('/_next/static/'),
    ),
  );
};

const searchPlaceFixture = {
  id: PLACE_ID,
  place_name: PLACE_NAME,
  category_name: '한식',
  category_group_code: '',
  category_group_name: '음식점',
  phone: '02-1234-5678',
  address_name: PLACE_ADDRESS,
  road_address_name: PLACE_ADDRESS,
  x: '127.045',
  y: '37.545',
  place_url: '',
  distance: '',
};

const createEmptyState = (): CrudState => ({
  userId: FALLBACK_USER_ID,
  posts: [],
  createPayloads: [],
  updateRequests: [],
  deletedPostIds: [],
});

const createPlaceFromPosts = (
  posts: PostFixture[],
  userId: string,
): PlaceFixture[] => {
  if (posts.length === 0) return [];

  const latestPost = posts[0];
  return [
    {
      id: 'place-crud-1',
      user_id: userId,
      kakao_place_id: latestPost.kakao_place_id,
      place_name: latestPost.place_name,
      address: latestPost.address,
      lat: latestPost.lat,
      lng: latestPost.lng,
      status: 'visited',
      tags: [],
      created_at: latestPost.created_at,
      updated_at: latestPost.created_at,
      posts: posts.map((post) => ({
        id: post.id,
        rating: post.rating,
        image_urls: post.image_urls,
        created_at: post.created_at,
      })),
    },
  ];
};

const respondJson = async (
  route: Route,
  body: unknown,
  status: number = 200,
) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
};

const parseRequestBody = <T>(route: Route): T => {
  const body = route.request().postData();
  if (!body) {
    throw new Error(`Missing request body for ${route.request().url()}`);
  }

  return JSON.parse(body) as T;
};

const getEqFilterNumber = (url: URL, key: string): number | null => {
  const rawValue = url.searchParams.get(key);
  if (!rawValue?.startsWith('eq.')) return null;

  const parsedValue = Number(rawValue.slice(3));
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const getEqFilterString = (url: URL, key: string): string | null => {
  const rawValue = url.searchParams.get(key);
  if (!rawValue?.startsWith('eq.')) return null;

  return rawValue.slice(3);
};

const findPost = (state: CrudState, id: number): PostFixture | null =>
  state.posts.find((post) => post.id === id) ?? null;

const mockSupabaseRest = async (page: Page, state: CrudState) => {
  await page.route(/\/rest\/v1\/(profiles|places|posts)/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname.endsWith('/profiles')) {
      await respondJson(route, { id: state.userId, nickname: 'CRUD 테스터' });
      return;
    }

    if (url.pathname.endsWith('/places')) {
      await respondJson(route, createPlaceFromPosts(state.posts, state.userId));
      return;
    }

    if (url.pathname.endsWith('/posts') && request.method() === 'DELETE') {
      const postId = getEqFilterNumber(url, 'id');
      if (postId !== null) {
        state.deletedPostIds.push(postId);
        state.posts = state.posts.filter((post) => post.id !== postId);
      }

      await respondJson(route, []);
      return;
    }

    if (url.pathname.endsWith('/posts')) {
      const postId = getEqFilterNumber(url, 'id');
      if (postId !== null) {
        await respondJson(route, findPost(state, postId));
        return;
      }

      const placeId = getEqFilterString(url, 'kakao_place_id');
      if (placeId) {
        await respondJson(
          route,
          state.posts.filter((post) => post.kakao_place_id === placeId),
        );
        return;
      }

      await respondJson(route, state.posts);
      return;
    }

    await respondJson(route, []);
  });
};

const mockAppApi = async (page: Page, state: CrudState) => {
  await page.route(/\/api\/search\?/, async (route) => {
    await respondJson(route, {
      meta: {
        total_count: 1,
        pageable_count: 1,
        is_end: true,
        same_name: { region: [], keyword: PLACE_NAME, selected_region: '' },
      },
      documents: [searchPlaceFixture],
    });
  });

  await page.route('**/api/posts', async (route) => {
    const request = route.request();

    if (request.method() === 'POST') {
      const payload = parseRequestBody<PostPayload>(route);
      state.createPayloads.push(payload);
      state.userId = payload.user_id;

      const createdPost: PostFixture = {
        ...payload,
        id: CREATED_POST_ID,
        created_at: '2026-07-16T09:00:00.000Z',
      };
      state.posts = [createdPost];

      await respondJson(route, [createdPost]);
      return;
    }

    if (request.method() === 'PATCH') {
      const updateRequestBody = parseRequestBody<UpdatePostRequestBody>(route);
      state.updateRequests.push(updateRequestBody);

      const previousPost = findPost(state, updateRequestBody.id);
      if (!previousPost) {
        await respondJson(route, { error: 'not_found' }, 404);
        return;
      }

      const updatedPost: PostFixture = {
        ...previousPost,
        ...updateRequestBody.payload,
        id: previousPost.id,
        created_at: previousPost.created_at,
      };
      state.posts = state.posts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post,
      );

      await respondJson(route, updatedPost);
      return;
    }

    await respondJson(route, { error: 'unsupported_method' }, 405);
  });
};

const setupCrudMocks = async (page: Page, state: CrudState) => {
  await page.addInitScript(() => {
    (
      window as Window & {
        nativeLocation?: {
          coords: { latitude: number; longitude: number };
        };
      }
    ).nativeLocation = {
      coords: {
        latitude: 37.545,
        longitude: 127.045,
      },
    };
  });
  await mockAppApi(page, state);
};

const signIn = async (page: Page) => {
  if (!TEST_LOGIN_EMAIL || !TEST_LOGIN_PASSWORD) {
    throw new Error('Missing E2E login credentials');
  }

  await page.goto('/sign-in');
  await waitForClientReady(page);
  await page.getByLabel('이메일').fill(TEST_LOGIN_EMAIL);
  await page.getByLabel('비밀번호').fill(TEST_LOGIN_PASSWORD);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL(/\/$|\/sign-up\/profile/, { timeout: 10_000 });

  if (/\/sign-up\/profile/.test(page.url())) {
    await page.getByLabel('닉네임').fill('CRUD테스터');
    await page.getByRole('button', { name: '시작하기' }).click();
  }

  await expect(page).toHaveURL(/\/$/);
};

const setRating = async (page: Page, value: number) => {
  const starIndex = Math.max(0, Math.min(4, Math.ceil(value) - 1));
  const ratingField = page.locator('label').filter({ hasText: '평점' }).first();
  await ratingField
    .locator('..')
    .locator('span')
    .nth(starIndex * 3)
    .click({
      position: { x: 24, y: 12 },
    });
};

test.describe('post CRUD', () => {
  test('creates, reads, updates, and deletes a post from the app UI', async ({
    page,
  }) => {
    test.skip(
      !TEST_LOGIN_EMAIL || !TEST_LOGIN_PASSWORD,
      'Set PIN_PLATE_E2E_LOGIN_EMAIL and PIN_PLATE_E2E_LOGIN_PASSWORD to run post CRUD E2E.',
    );

    const state = createEmptyState();
    await setupCrudMocks(page, state);

    await signIn(page);
    await mockSupabaseRest(page, state);

    await page.getByRole('button', { name: '작성하기' }).click();
    await expect(
      page.getByRole('heading', { name: '맛집 기록' }),
    ).toBeVisible();

    await page.getByPlaceholder('장소를 입력하세요').fill(PLACE_NAME);
    await page
      .getByRole('button', { name: /^검색$/ })
      .last()
      .click();
    await page.getByRole('button', { name: new RegExp(PLACE_NAME) }).click();
    await expect(page.getByText('선택된 장소')).toBeVisible();

    await setRating(page, 5);
    await page
      .getByPlaceholder('맛, 서비스, 분위기는 어땠나요?')
      .fill('처음 남긴 CRUD 기록');
    await page.getByRole('button', { name: '등록하기' }).click();

    await expect.poll(() => state.createPayloads.length).toBe(1);
    expect(state.createPayloads[0]).toMatchObject({
      content: '처음 남긴 CRUD 기록',
      rating: 5,
      place_name: PLACE_NAME,
      address: PLACE_ADDRESS,
      kakao_place_id: PLACE_ID,
      user_id: state.userId,
    });

    await page.getByRole('button', { name: '리스트' }).click();
    await expect(page.getByText('총 1개의 장소')).toBeVisible();
    await page.getByText(PLACE_NAME).click();

    await expect(page.getByRole('heading', { name: PLACE_NAME })).toBeVisible();
    await expect(page.getByText('처음 남긴 CRUD 기록')).toBeVisible();

    await page.getByRole('button', { name: '⋮' }).click();
    await page.getByRole('button', { name: '수정하기' }).click();
    await expect(
      page.getByRole('heading', { name: '리뷰 수정' }),
    ).toBeVisible();

    await page.locator('textarea').fill('수정된 CRUD 기록');
    await page.getByRole('button', { name: '완료' }).click();

    await expect.poll(() => state.updateRequests.length).toBe(1);
    expect(state.updateRequests[0]).toMatchObject({
      id: CREATED_POST_ID,
      payload: {
        content: '수정된 CRUD 기록',
        rating: 5,
        place_name: PLACE_NAME,
        user_id: state.userId,
      },
    });
    await expect(page.getByText('수정된 CRUD 기록')).toBeVisible();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('정말로 삭제하시겠습니까?');
      await dialog.accept();
    });
    await page.getByRole('button', { name: '⋮' }).click();
    await page.getByRole('button', { name: '삭제하기' }).click();

    await expect
      .poll(() => state.deletedPostIds.includes(CREATED_POST_ID))
      .toBe(true);
  });
});
