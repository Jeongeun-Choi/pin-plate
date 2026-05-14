# Shareable Restaurant Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build V1 shared restaurant maps so a user can publish a curated set of places as a public link with Open Graph metadata, and recipients can view the map/list without logging in.

**Architecture:** Shared maps are server-backed public snapshots, not post-detail shares. Authenticated users create a `shared_maps` row plus immutable `shared_map_places` rows from their saved places; public `/share/[slug]` uses Server Components to fetch by slug and generate OG metadata. The viewer page reuses map/list presentation concepts, while "내 지도에 저장" writes to existing guest localStorage when logged out and to `places` when logged in.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase, TanStack Query for client mutations, Jotai only for existing global UI state, Vanilla Extract co-located styles.

---

## Product Scope

### In Scope

- Header-level "공유하기" entry point for authenticated users.
- Share creator modal with four share criteria:
  - status: `recommend`, `want_to_revisit`
  - tag: selected tag slug
  - region: text filter against saved place address
  - manual: checked places
- Public `/share/[slug]` page that shows:
  - map with shared place markers
  - list of shared places
  - title, description, owner display label, count
  - "내 지도에 저장" per place
- Open Graph and Twitter card metadata on `/share/[slug]`.
- Guest save behavior using `guest_posts` localStorage-compatible data, with a clear CTA that account login preserves places across devices.
- Tests for snapshot creation, slug fetch, metadata generation, guest save conversion, and creator modal filtering.

### Not In Scope

- Post-detail sharing.
- Password-protected links.
- Link expiration.
- Recipient-specific permissions.
- Anonymous shared maps created from localStorage-only guest data.
- Dynamic image generation for OG. V1 uses a static branded OG image or the first shared place image when available.
- Editing a shared map after creation. V1 creates a new snapshot when a user shares again.

---

## Current Code To Reuse

- Saved places query: `apps/pin-plate/web/src/features/place/api/getPlaces.ts`
- Place types: `apps/pin-plate/web/src/features/place/types/place.ts`
- Place creation mutation: `apps/pin-plate/web/src/features/place/api/createPlace.ts`
- Guest localStorage validation and persistence: `apps/pin-plate/web/src/features/guest/storage/guestPostStorage.ts`
- Guest post type: `apps/pin-plate/web/src/features/guest/types/guestPost.ts`
- Header entry point: `apps/pin-plate/web/src/components/Header/index.tsx`
- Header styles: `apps/pin-plate/web/src/components/Header/Header.css.ts`
- Map rendering patterns: `apps/pin-plate/web/src/features/map/components/Map.tsx`
- Marker component: `apps/pin-plate/web/src/features/map/components/CustomMarker.tsx`
- Status labels and values: `apps/pin-plate/web/src/features/place/constants/status.ts`
- Tag constants: `apps/pin-plate/web/src/features/post/constants/tags.ts`
- Supabase server client: `apps/pin-plate/web/src/utils/supabase/server.ts`
- Supabase browser client: `apps/pin-plate/web/src/utils/supabase/client.ts`

---

## File Structure

### Database

- Create: `apps/pin-plate/web/supabase/migrations/202605130001_shareable_restaurant_maps.sql`
  - Creates `shared_maps` and `shared_map_places`.
  - Adds public read policies and owner-only insert policies.
  - Adds indexes for slug lookup and owner lookup.

### Shared Map Domain

- Create: `apps/pin-plate/web/src/features/shared-map/types/sharedMap.ts`
  - TypeScript interfaces for create payloads, rows, and public view model.
- Create: `apps/pin-plate/web/src/features/shared-map/utils/slug.ts`
  - Generates URL-safe slugs.
- Create: `apps/pin-plate/web/src/features/shared-map/utils/sharePreview.ts`
  - Builds title, description, and OG image fallback from shared map data.
- Create: `apps/pin-plate/web/src/features/shared-map/api/createSharedMap.ts`
  - Browser-side authenticated creation flow.
- Create: `apps/pin-plate/web/src/features/shared-map/api/getSharedMapBySlug.ts`
  - Server-side public slug fetch flow.
- Create: `apps/pin-plate/web/src/features/shared-map/hooks/useCreateSharedMap.ts`
  - React Query mutation for creator UI.
- Create: `apps/pin-plate/web/src/features/shared-map/utils/saveSharedPlace.ts`
  - Saves a shared place to logged-in account or guest localStorage.

### Creator UI

- Create: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.tsx`
- Create: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.css.ts`
- Modify: `apps/pin-plate/web/src/components/Header/index.tsx`
- Modify: `apps/pin-plate/web/src/components/Header/Header.css.ts`
- Optional create if no icon exists: `packages/ui/src/icons/IcShare.tsx`
- Modify if icon is added: `packages/ui/src/icons/index.ts`

### Public Viewer UI

- Create: `apps/pin-plate/web/src/app/share/[slug]/page.tsx`
- Create: `apps/pin-plate/web/src/app/share/[slug]/page.css.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedMapView.tsx`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedMapView.css.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedMapCanvas.tsx`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedPlaceList.tsx`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SaveSharedPlaceButton.tsx`

### Tests

- Create: `apps/pin-plate/web/src/features/shared-map/utils/__tests__/slug.test.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/utils/__tests__/sharePreview.test.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/utils/__tests__/saveSharedPlace.test.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`
- Create: `apps/pin-plate/web/src/app/share/[slug]/__tests__/metadata.test.ts`

---

## Data Model

```sql
create table public.shared_maps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 180),
  criteria_type text not null check (criteria_type in ('status', 'tag', 'region', 'manual')),
  criteria_value text not null default '' check (char_length(criteria_value) <= 80),
  place_count integer not null check (place_count > 0 and place_count <= 100),
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table public.shared_map_places (
  id uuid primary key default gen_random_uuid(),
  shared_map_id uuid not null references public.shared_maps(id) on delete cascade,
  source_place_id uuid not null,
  kakao_place_id text not null,
  place_name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  status text not null,
  tags text[] not null default '{}',
  avg_rating double precision,
  first_image text,
  visit_count integer not null default 0,
  sort_order integer not null,
  created_at timestamptz not null default now()
);
```

RLS intent:

- `shared_maps`: owner can insert and select their own rows; anyone can select public rows by slug.
- `shared_map_places`: owner can insert rows only for maps they own; anyone can select places for public maps.
- No update/delete UI in V1. Tables may still allow owner delete for future cleanup, but the V1 UI does not expose it.

Snapshot intent:

- Shared map places are copied at share time.
- Later changes to the owner’s private places do not silently change previously sent links.
- This makes Kakao/Slack/Message previews stable and avoids surprising recipients.

---

## Data Flow

```text
Creator clicks 공유하기
  -> ShareMapDialog loads saved places from usePlaces()
  -> User picks status/tag/region/manual criterion
  -> Dialog filters selected PlaceWithStats[]
  -> useCreateSharedMap mutation inserts shared_maps row
  -> mutation inserts shared_map_places snapshot rows
  -> UI shows /share/{slug}
  -> user copies or native-shares link

Recipient opens /share/{slug}
  -> Server Component fetches public shared map by slug
  -> generateMetadata builds OG tags from same public data
  -> SharedMapView renders map and list
  -> recipient clicks 내 지도에 저장
  -> logged in: createPlace(user.id, payload)
  -> logged out: addGuestPost(derivedGuestPost)
```

Shadow paths:

- Missing slug: render `notFound()`.
- Empty filtered place set: disable creation and show "공유할 장소가 없어요."
- Too many filtered places: cap at 100 and show count before creation.
- Supabase insert failure: keep dialog open and show "공유 링크를 만들지 못했어요. 다시 시도해 주세요."
- Clipboard failure: show the generated URL in a readonly input and let the user select it.
- Guest duplicate save: detect matching `kakao_place_id` in `guest_posts` and show "이미 내 지도에 저장됐어요."

---

## Task 1: Add Shared Map Tables and Policies

**Files:**
- Create: `apps/pin-plate/web/supabase/migrations/202605130001_shareable_restaurant_maps.sql`

- [ ] **Step 1: Create the migration file**

```sql
create extension if not exists pgcrypto;

create table if not exists public.shared_maps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 180),
  criteria_type text not null check (criteria_type in ('status', 'tag', 'region', 'manual')),
  criteria_value text not null default '' check (char_length(criteria_value) <= 80),
  place_count integer not null check (place_count > 0 and place_count <= 100),
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.shared_map_places (
  id uuid primary key default gen_random_uuid(),
  shared_map_id uuid not null references public.shared_maps(id) on delete cascade,
  source_place_id uuid not null,
  kakao_place_id text not null,
  place_name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  status text not null,
  tags text[] not null default '{}',
  avg_rating double precision,
  first_image text,
  visit_count integer not null default 0,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create index if not exists shared_maps_slug_idx on public.shared_maps(slug);
create index if not exists shared_maps_owner_id_created_at_idx on public.shared_maps(owner_id, created_at desc);
create index if not exists shared_map_places_shared_map_id_sort_idx on public.shared_map_places(shared_map_id, sort_order);

alter table public.shared_maps enable row level security;
alter table public.shared_map_places enable row level security;

create policy "shared maps are publicly readable"
  on public.shared_maps for select
  using (true);

create policy "users can create their own shared maps"
  on public.shared_maps for insert
  with check (auth.uid() = owner_id);

create policy "users can read their own shared maps"
  on public.shared_maps for select
  using (auth.uid() = owner_id);

create policy "shared map places are publicly readable"
  on public.shared_map_places for select
  using (
    exists (
      select 1 from public.shared_maps
      where shared_maps.id = shared_map_places.shared_map_id
    )
  );

create policy "users can create places for their own shared maps"
  on public.shared_map_places for insert
  with check (
    exists (
      select 1 from public.shared_maps
      where shared_maps.id = shared_map_places.shared_map_id
      and shared_maps.owner_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Verify migration syntax locally**

Run: `pnpm --filter web lint --fix`

Expected: PASS with no new lint errors. SQL is not executed by lint, but this catches accidental project formatting fallout.

- [ ] **Step 3: Commit**

```bash
git add apps/pin-plate/web/supabase/migrations/202605130001_shareable_restaurant_maps.sql
git commit -m "feat: add shared map tables"
```

---

## Task 2: Add Shared Map Types and Pure Utilities

**Files:**
- Create: `apps/pin-plate/web/src/features/shared-map/types/sharedMap.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/utils/slug.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/utils/sharePreview.ts`
- Test: `apps/pin-plate/web/src/features/shared-map/utils/__tests__/slug.test.ts`
- Test: `apps/pin-plate/web/src/features/shared-map/utils/__tests__/sharePreview.test.ts`

- [ ] **Step 1: Write slug tests**

```ts
import { describe, expect, it, vi } from 'vitest';
import { createShareSlug } from '../slug';

describe('createShareSlug', () => {
  it('creates a url-safe slug with a readable prefix and random suffix', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '12345678-1234-4234-9234-123456789abc',
    );

    expect(createShareSlug('성수 카페 추천')).toBe('seongsu-kape-cuceon-12345678');
  });

  it('falls back to map when the title has no latin-safe characters', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      'abcdef12-1234-4234-9234-123456789abc',
    );

    expect(createShareSlug('!!!')).toBe('map-abcdef12');
  });
});
```

- [ ] **Step 2: Implement `slug.ts`**

```ts
const KOREAN_ROMANIZATION: Record<string, string> = {
  성수: 'seongsu',
  카페: 'kape',
  추천: 'cuceon',
  맛집: 'matjip',
  지도: 'jido',
};

const normalizeTitle = (title: string) => {
  const tokenized = title
    .trim()
    .split(/\s+/)
    .map((part) => KOREAN_ROMANIZATION[part] ?? part)
    .join('-');

  return tokenized
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
};

export const createShareSlug = (title: string) => {
  const prefix = normalizeTitle(title) || 'map';
  const suffix = crypto.randomUUID().slice(0, 8);

  return `${prefix}-${suffix}`;
};
```

- [ ] **Step 3: Write preview tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildSharePreview } from '../sharePreview';

describe('buildSharePreview', () => {
  it('builds title and description from shared map data', () => {
    expect(
      buildSharePreview({
        title: '성수 카페 지도',
        description: '',
        placeCount: 3,
        coverImageUrl: null,
      }),
    ).toEqual({
      title: '성수 카페 지도 | Pin Plate',
      description: '추천 장소 3곳을 지도와 리스트로 확인해 보세요.',
      imageUrl: '/logo.svg',
    });
  });

  it('uses custom description and cover image when present', () => {
    expect(
      buildSharePreview({
        title: '데이트 맛집',
        description: '조용하고 맛있는 곳만 모았어요.',
        placeCount: 2,
        coverImageUrl: 'https://example.com/cover.jpg',
      }),
    ).toEqual({
      title: '데이트 맛집 | Pin Plate',
      description: '조용하고 맛있는 곳만 모았어요.',
      imageUrl: 'https://example.com/cover.jpg',
    });
  });
});
```

- [ ] **Step 4: Implement `types/sharedMap.ts`**

```ts
import type { PlaceStatus } from '@/features/place/types/place';

export type SharedMapCriteriaType = 'status' | 'tag' | 'region' | 'manual';

export interface SharedMapPlace {
  id: string;
  shared_map_id: string;
  source_place_id: string;
  kakao_place_id: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  status: PlaceStatus;
  tags: string[];
  avg_rating: number | null;
  first_image: string | null;
  visit_count: number;
  sort_order: number;
  created_at: string;
}

export interface SharedMap {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  description: string;
  criteria_type: SharedMapCriteriaType;
  criteria_value: string;
  place_count: number;
  cover_image_url: string | null;
  created_at: string;
  shared_map_places: SharedMapPlace[];
}

export interface CreateSharedMapPayload {
  title: string;
  description: string;
  criteriaType: SharedMapCriteriaType;
  criteriaValue: string;
  places: Array<{
    id: string;
    kakao_place_id: string;
    place_name: string;
    address: string;
    lat: number;
    lng: number;
    status: PlaceStatus;
    tags: string[];
    avg_rating: number | null;
    first_image: string | null;
    visit_count: number;
  }>;
}
```

- [ ] **Step 5: Implement `sharePreview.ts`**

```ts
interface SharePreviewInput {
  title: string;
  description: string;
  placeCount: number;
  coverImageUrl: string | null;
}

export const buildSharePreview = ({
  title,
  description,
  placeCount,
  coverImageUrl,
}: SharePreviewInput) => ({
  title: `${title} | Pin Plate`,
  description:
    description.trim() ||
    `추천 장소 ${placeCount}곳을 지도와 리스트로 확인해 보세요.`,
  imageUrl: coverImageUrl ?? '/logo.svg',
});
```

- [ ] **Step 6: Run utility tests**

Run: `pnpm --filter web test src/features/shared-map/utils/__tests__/slug.test.ts src/features/shared-map/utils/__tests__/sharePreview.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/pin-plate/web/src/features/shared-map/types apps/pin-plate/web/src/features/shared-map/utils
git commit -m "feat: add shared map utilities"
```

---

## Task 3: Implement Shared Map API Functions

**Files:**
- Create: `apps/pin-plate/web/src/features/shared-map/api/createSharedMap.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/api/getSharedMapBySlug.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/hooks/useCreateSharedMap.ts`

- [ ] **Step 1: Implement browser creation API**

```ts
import { createClient } from '@/utils/supabase/client';
import type { CreateSharedMapPayload, SharedMap } from '../types/sharedMap';
import { createShareSlug } from '../utils/slug';

const MAX_SHARED_PLACES = 100;

export const createSharedMap = async (
  ownerId: string,
  payload: CreateSharedMapPayload,
): Promise<SharedMap> => {
  const selectedPlaces = payload.places.slice(0, MAX_SHARED_PLACES);

  if (selectedPlaces.length === 0) {
    throw new Error('shared_map_requires_places');
  }

  const supabase = createClient();
  const coverImageUrl =
    selectedPlaces.map((place) => place.first_image).find(Boolean) ?? null;
  const slug = createShareSlug(payload.title);

  const { data: sharedMapRow, error: sharedMapError } = await supabase
    .from('shared_maps')
    .insert({
      owner_id: ownerId,
      slug,
      title: payload.title.trim(),
      description: payload.description.trim(),
      criteria_type: payload.criteriaType,
      criteria_value: payload.criteriaValue.trim(),
      place_count: selectedPlaces.length,
      cover_image_url: coverImageUrl,
    })
    .select()
    .single();

  if (sharedMapError) throw sharedMapError;

  const { data: sharedPlaceRows, error: sharedPlacesError } = await supabase
    .from('shared_map_places')
    .insert(
      selectedPlaces.map((place, index) => ({
        shared_map_id: sharedMapRow.id,
        source_place_id: place.id,
        kakao_place_id: place.kakao_place_id,
        place_name: place.place_name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        status: place.status,
        tags: place.tags,
        avg_rating: place.avg_rating,
        first_image: place.first_image,
        visit_count: place.visit_count,
        sort_order: index,
      })),
    )
    .select()
    .order('sort_order', { ascending: true });

  if (sharedPlacesError) throw sharedPlacesError;

  return {
    ...(sharedMapRow as Omit<SharedMap, 'shared_map_places'>),
    shared_map_places: sharedPlaceRows ?? [],
  } as SharedMap;
};
```

- [ ] **Step 2: Implement server slug fetch API**

```ts
import { createClient } from '@/utils/supabase/server';
import type { SharedMap } from '../types/sharedMap';

export const getSharedMapBySlug = async (
  slug: string,
): Promise<SharedMap | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shared_maps')
    .select('*, shared_map_places(*)')
    .eq('slug', slug)
    .order('sort_order', {
      ascending: true,
      referencedTable: 'shared_map_places',
    })
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as unknown as SharedMap;
};
```

- [ ] **Step 3: Implement React Query mutation**

```ts
import { useMutation } from '@tanstack/react-query';
import { createSharedMap } from '../api/createSharedMap';
import type { CreateSharedMapPayload } from '../types/sharedMap';

export const useCreateSharedMap = () =>
  useMutation({
    mutationFn: ({
      ownerId,
      payload,
    }: {
      ownerId: string;
      payload: CreateSharedMapPayload;
    }) => createSharedMap(ownerId, payload),
  });
```

- [ ] **Step 4: Run typecheck for new APIs**

Run: `pnpm --filter web tsc --noEmit`

Expected: PASS. If the project script only supports `pnpm tsc`, run `pnpm tsc` from the repo root per `CLAUDE.md`.

- [ ] **Step 5: Commit**

```bash
git add apps/pin-plate/web/src/features/shared-map/api apps/pin-plate/web/src/features/shared-map/hooks
git commit -m "feat: add shared map data access"
```

---

## Task 4: Build Share Creator Dialog

**Files:**
- Create: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.tsx`
- Create: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.css.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`
- Modify: `apps/pin-plate/web/src/components/Header/index.tsx`
- Modify: `apps/pin-plate/web/src/components/Header/Header.css.ts`

- [ ] **Step 1: Write creator dialog tests**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShareMapDialog } from '../ShareMapDialog';
import type { PlaceWithStats } from '@/features/place/types/place';

const place = (id: string, name: string, tags: string[]): PlaceWithStats => ({
  id,
  user_id: 'user-1',
  kakao_place_id: `kakao-${id}`,
  place_name: name,
  address: '서울 성동구 성수동',
  lat: 37.5,
  lng: 127.1,
  status: 'recommend',
  tags,
  created_at: '2026-05-13T00:00:00.000Z',
  updated_at: '2026-05-13T00:00:00.000Z',
  posts: [],
  visit_count: 1,
  avg_rating: 4.5,
  last_visited_at: '2026-05-13T00:00:00.000Z',
  first_image: null,
});

describe('ShareMapDialog', () => {
  it('disables creation when selected criteria has no places', async () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[place('1', '성수 카페', ['작업/공부'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('radio', { name: '태그' }));
    await userEvent.selectOptions(screen.getByLabelText('공유할 태그'), '데이트');

    expect(screen.getByRole('button', { name: '공유 링크 만들기' })).toBeDisabled();
    expect(screen.getByText('공유할 장소가 없어요.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement dialog behavior**

The component must:

- keep state at the top in this order: criterion type, criterion value, title, description, selected place ids, generated URL, error text.
- use `useMemo` for filtered places.
- use arrow functions for all component-local handlers.
- cap selected places at 100.
- call `navigator.share` when available; otherwise call `navigator.clipboard.writeText`.
- show a readonly input containing the URL after creation.

Core filtering logic:

```ts
const filteredPlaces = useMemo(() => {
  if (criteriaType === 'status') {
    return places.filter((place) => place.status === criteriaValue);
  }
  if (criteriaType === 'tag') {
    return places.filter((place) => place.tags.includes(criteriaValue));
  }
  if (criteriaType === 'region') {
    return places.filter((place) => place.address.includes(criteriaValue.trim()));
  }
  return places.filter((place) => selectedPlaceIds.includes(place.id));
}, [criteriaType, criteriaValue, places, selectedPlaceIds]);
```

Submission shape:

```ts
const handleCreateShareMap = async () => {
  const limitedPlaces = filteredPlaces.slice(0, 100);
  if (limitedPlaces.length === 0) {
    setErrorMessage('공유할 장소가 없어요.');
    return;
  }

  try {
    setErrorMessage('');
    const sharedMap = await createSharedMapMutation.mutateAsync({
      ownerId,
      payload: {
        title,
        description,
        criteriaType,
        criteriaValue,
        places: limitedPlaces,
      },
    });
    const nextShareUrl = `${window.location.origin}/share/${sharedMap.slug}`;
    setShareUrl(nextShareUrl);
  } catch {
    setErrorMessage('공유 링크를 만들지 못했어요. 다시 시도해 주세요.');
  }
};
```

- [ ] **Step 3: Add Header integration**

Add `ShareMapDialog` state and render it from `Header`. Use `usePlaces()` to pass saved places and `getCurrentUser` query data to pass `ownerId`. Hide or disable the share button when no authenticated user exists.

Button label: `공유하기`

Disabled copy for logged-out users: `로그인하면 내 장소 지도를 공유할 수 있어요.`

- [ ] **Step 4: Run creator dialog test**

Run: `pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/pin-plate/web/src/features/shared-map/components apps/pin-plate/web/src/components/Header
git commit -m "feat: add shared map creator"
```

---

## Task 5: Build Public Shared Map Page and Metadata

**Files:**
- Create: `apps/pin-plate/web/src/app/share/[slug]/page.tsx`
- Create: `apps/pin-plate/web/src/app/share/[slug]/page.css.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedMapView.tsx`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedMapView.css.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedMapCanvas.tsx`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SharedPlaceList.tsx`
- Create: `apps/pin-plate/web/src/app/share/[slug]/__tests__/metadata.test.ts`

- [ ] **Step 1: Write metadata test**

```ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shared-map/api/getSharedMapBySlug', () => ({
  getSharedMapBySlug: vi.fn(async () => ({
    id: 'map-1',
    owner_id: 'user-1',
    slug: 'seongsu-cafe',
    title: '성수 카페 지도',
    description: '',
    criteria_type: 'tag',
    criteria_value: '작업/공부',
    place_count: 2,
    cover_image_url: null,
    created_at: '2026-05-13T00:00:00.000Z',
    shared_map_places: [],
  })),
}));

const { generateMetadata } = await import('../page');

describe('share page metadata', () => {
  it('returns Open Graph and Twitter preview metadata', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'seongsu-cafe' }),
    });

    expect(metadata.title).toBe('성수 카페 지도 | Pin Plate');
    expect(metadata.openGraph?.title).toBe('성수 카페 지도 | Pin Plate');
    expect(metadata.twitter?.card).toBe('summary_large_image');
  });
});
```

- [ ] **Step 2: Implement `page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSharedMapBySlug } from '@/features/shared-map/api/getSharedMapBySlug';
import { buildSharePreview } from '@/features/shared-map/utils/sharePreview';
import { SharedMapView } from '@/features/shared-map/components/SharedMapView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const sharedMap = await getSharedMapBySlug(slug);

  if (!sharedMap) {
    return {
      title: '공유 지도를 찾을 수 없어요 | Pin Plate',
    };
  }

  const preview = buildSharePreview({
    title: sharedMap.title,
    description: sharedMap.description,
    placeCount: sharedMap.place_count,
    coverImageUrl: sharedMap.cover_image_url,
  });

  return {
    title: preview.title,
    description: preview.description,
    openGraph: {
      title: preview.title,
      description: preview.description,
      images: [{ url: preview.imageUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: preview.title,
      description: preview.description,
      images: [preview.imageUrl],
    },
  };
};

export default async function SharePage({ params }: PageProps) {
  const { slug } = await params;
  const sharedMap = await getSharedMapBySlug(slug);

  if (!sharedMap) notFound();

  return <SharedMapView sharedMap={sharedMap} />;
}
```

- [ ] **Step 3: Implement viewer components**

`SharedMapView` should render:

- title and description
- count: `{sharedMap.place_count}개의 추천 장소`
- `SharedMapCanvas` on top for mobile, side-by-side for desktop
- `SharedPlaceList` with save buttons

`SharedMapCanvas` should:

- be a client component
- use `@vis.gl/react-google-maps`
- center on the first place, or Seoul fallback if the list is empty
- render `AdvancedMarker` for each shared place

`SharedPlaceList` should:

- render semantic list markup
- show place name, address, rating if present, tags, visit count
- include `SaveSharedPlaceButton` per place

- [ ] **Step 4: Run metadata test**

Run: `pnpm --filter web test src/app/share/[slug]/__tests__/metadata.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/pin-plate/web/src/app/share apps/pin-plate/web/src/features/shared-map/components
git commit -m "feat: add public shared map page"
```

---

## Task 6: Add Save Shared Place Behavior

**Files:**
- Create: `apps/pin-plate/web/src/features/shared-map/utils/saveSharedPlace.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/utils/__tests__/saveSharedPlace.test.ts`
- Create: `apps/pin-plate/web/src/features/shared-map/components/SaveSharedPlaceButton.tsx`

- [ ] **Step 1: Write guest save tests**

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { GUEST_POSTS_KEY } from '@/features/guest/storage/guestPostStorage';
import { saveSharedPlaceForGuest } from '../saveSharedPlace';

const sharedPlace = {
  id: 'place-1',
  shared_map_id: 'map-1',
  source_place_id: 'source-1',
  kakao_place_id: 'kakao-1',
  place_name: '성수 카페',
  address: '서울 성동구',
  lat: 37.5,
  lng: 127.1,
  status: 'recommend' as const,
  tags: ['작업/공부'],
  avg_rating: 4.5,
  first_image: null,
  visit_count: 2,
  sort_order: 0,
  created_at: '2026-05-13T00:00:00.000Z',
};

describe('saveSharedPlaceForGuest', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a shared place as a guest local post', () => {
    const result = saveSharedPlaceForGuest(sharedPlace);

    expect(result).toBe('saved');
    const raw = localStorage.getItem(GUEST_POSTS_KEY);
    expect(raw).toContain('성수 카페');
    expect(raw).toContain('kakao-1');
  });

  it('does not duplicate by kakao place id', () => {
    saveSharedPlaceForGuest(sharedPlace);
    const result = saveSharedPlaceForGuest(sharedPlace);

    expect(result).toBe('already_saved');
    expect(JSON.parse(localStorage.getItem(GUEST_POSTS_KEY) ?? '[]')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Implement guest save utility**

```ts
import { addGuestPost, loadGuestPosts } from '@/features/guest/storage/guestPostStorage';
import type { GuestPost } from '@/features/guest/types/guestPost';
import type { SharedMapPlace } from '../types/sharedMap';

export type SaveSharedPlaceResult = 'saved' | 'already_saved';

export const saveSharedPlaceForGuest = (
  sharedPlace: SharedMapPlace,
): SaveSharedPlaceResult => {
  const existingGuestPosts = loadGuestPosts();
  const hasAlreadySaved = existingGuestPosts.some(
    (post) => post.kakao_place_id === sharedPlace.kakao_place_id,
  );

  if (hasAlreadySaved) return 'already_saved';

  const guestPost: GuestPost = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    place_name: sharedPlace.place_name,
    address: sharedPlace.address,
    lat: sharedPlace.lat,
    lng: sharedPlace.lng,
    kakao_place_id: sharedPlace.kakao_place_id,
    content: '공유 지도에서 저장한 장소예요.',
    rating: sharedPlace.avg_rating ?? 0,
    image_urls: sharedPlace.first_image ? [sharedPlace.first_image] : [],
    tags: sharedPlace.tags,
  };

  addGuestPost(guestPost);
  return 'saved';
};
```

- [ ] **Step 3: Implement `SaveSharedPlaceButton.tsx`**

The button should:

- call `getCurrentUser` with React Query
- if logged out, call `saveSharedPlaceForGuest`
- if logged in, call existing `createPlace`
- disable itself after success
- show one of:
  - `내 지도에 저장`
  - `저장됐어요`
  - `이미 저장됐어요`
  - `저장하지 못했어요`

- [ ] **Step 4: Run save tests**

Run: `pnpm --filter web test src/features/shared-map/utils/__tests__/saveSharedPlace.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/pin-plate/web/src/features/shared-map/utils/saveSharedPlace.ts apps/pin-plate/web/src/features/shared-map/utils/__tests__/saveSharedPlace.test.ts apps/pin-plate/web/src/features/shared-map/components/SaveSharedPlaceButton.tsx
git commit -m "feat: save shared places"
```

---

## Task 7: End-to-End QA and Required Verification

**Files:**
- Modify only files needed to fix issues found during verification.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm --filter web test \
  src/features/shared-map/utils/__tests__/slug.test.ts \
  src/features/shared-map/utils/__tests__/sharePreview.test.ts \
  src/features/shared-map/utils/__tests__/saveSharedPlace.test.ts \
  src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx \
  src/app/share/[slug]/__tests__/metadata.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run lint fix**

Run: `pnpm lint:fix`

Expected: PASS. Include any modified files in the final commit.

- [ ] **Step 3: Run typecheck**

Run: `pnpm tsc`

Expected: PASS. If `pnpm tsc` is not defined at the root, run `pnpm --filter web tsc --noEmit` and record the command difference in the final report.

- [ ] **Step 4: Start dev server**

Run: `pnpm run dev:pin-plate:web`

Expected: local Next.js server starts, normally at `http://localhost:3000`.

- [ ] **Step 5: Manual QA in browser**

Verify:

- Logged-in user can open share dialog.
- Status/tag/region/manual modes filter places correctly.
- Empty result disables link creation.
- Created link is copyable.
- `/share/[slug]` opens while logged out.
- Shared page shows map markers and list.
- Shared page source or browser metadata inspection shows `og:title`, `og:description`, `og:image`, `twitter:card`.
- Logged-out recipient can click `내 지도에 저장` and then sees the saved place in their local map/list.
- Duplicate guest save shows `이미 저장됐어요`.

- [ ] **Step 6: Final commit**

```bash
git add apps/pin-plate/web/src apps/pin-plate/web/supabase packages/ui/src/icons
git commit -m "feat: add shareable restaurant maps"
```

---

## Risks and Decisions

- **Snapshot vs live map:** V1 uses snapshots. This is more predictable for recipients and OG previews. Live maps can be added later as an explicit "refresh shared map" feature.
- **Guest shared-map creation:** Not included. Guest data lives in localStorage and cannot produce a public link without uploading private local data to the server, which conflicts with the current guest model.
- **OG image:** V1 uses first place image or logo. A generated map preview can come later, but should not block the core social preview.
- **Public RLS:** Shared maps are intentionally public by slug. Slugs must be random enough not to enumerate easily; do not use sequential IDs in URLs.
- **Place save semantics:** Logged-out recipient save creates a guest local record, not a permanent account record. The UI should say this clearly after save.

---

## Self-Review

- Spec coverage: The plan covers public links, criteria-based creation, no-login viewing, no-login temporary save, OG metadata, and V1 exclusions from `PRODUCT_PLAN.md`.
- Placeholder scan: No placeholder sections are left for implementation workers.
- Type consistency: `SharedMap`, `SharedMapPlace`, `CreateSharedMapPayload`, and `SharedMapCriteriaType` names are introduced before use and reused consistently.
- Scope check: This is one coherent feature. It touches database, creator UI, public viewer UI, and save behavior, but each task produces independently testable software.
