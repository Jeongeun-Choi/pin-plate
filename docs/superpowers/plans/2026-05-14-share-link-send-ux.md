# Share Link Send UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn shared map creation from a plain URL-generation form into a confident “create, preview, and send” flow.

**Architecture:** Keep the existing `ShareMapDialog` boundary and Supabase creation flow. Add small local UI state for share/copy feedback, derive send-preview copy from the selected criteria and places, and change the post-create CTA hierarchy when `shareUrl` exists.

**Tech Stack:** Next.js App Router, React 19 client component, Vanilla Extract, Vitest, Testing Library, existing `useCreateSharedMap` mutation.

---

## File Structure

- Modify: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.tsx`
  - Owns dialog state, selected criteria, create mutation, share/copy action, post-create success UI.
- Modify: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.css.ts`
  - Adds styles for preview card, copied/shared status, and revised footer states.
- Modify: `apps/pin-plate/web/src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`
  - Covers auto title suggestion, actionable empty copy, preview card, copy/share success feedback, and post-create CTA hierarchy.

No database/API changes are needed.

---

### Task 1: Make Empty States Actionable

**Files:**
- Modify: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.tsx`
- Test: `apps/pin-plate/web/src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`

- [ ] **Step 1: Write failing tests for criteria-specific empty copy**

Add these tests inside `describe('ShareMapDialog', () => { ... })`:

```tsx
  it('guides the user when region criteria is blank', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '지역' }));

    expect(
      screen.getByText('지역명을 입력하면 주소에 포함된 장소를 찾아요.'),
    ).toBeInTheDocument();
  });

  it('suggests another criteria when a tag has no matching places', () => {
    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['work'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '태그' }));
    fireEvent.change(screen.getByLabelText('공유할 태그'), {
      target: { value: 'date' },
    });

    expect(
      screen.getByText('이 태그가 붙은 장소가 없어요. 다른 태그나 직접 선택을 써 보세요.'),
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: FAIL because the new empty-state messages do not exist yet.

- [ ] **Step 3: Add explicit empty-state copy**

In `ShareMapDialog.tsx`, add this helper near `getInitialCriteriaValue`:

```tsx
const getEmptySharePlacesMessage = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => {
  if (criteriaType === 'region' && !criteriaValue.trim()) {
    return '지역명을 입력하면 주소에 포함된 장소를 찾아요.';
  }
  if (criteriaType === 'region') {
    return '이 지역에 저장한 장소가 없어요. 다른 지역명이나 직접 선택을 써 보세요.';
  }
  if (criteriaType === 'tag') {
    return '이 태그가 붙은 장소가 없어요. 다른 태그나 직접 선택을 써 보세요.';
  }
  if (criteriaType === 'manual') {
    return '공유할 장소를 하나 이상 선택해 주세요.';
  }
  return '공유할 장소가 없어요. 다른 상태나 직접 선택을 써 보세요.';
};
```

Inside the component after `hasNoShareablePlaces`, add:

```tsx
  const emptySharePlacesMessage = getEmptySharePlacesMessage(
    criteriaType,
    criteriaValue,
  );
```

Replace:

```tsx
<p className={s.emptyText}>공유할 장소가 없어요.</p>
```

with:

```tsx
<p className={s.emptyText}>{emptySharePlacesMessage}</p>
```

- [ ] **Step 4: Update existing assertions**

In existing tests that assert `공유할 장소가 없어요.`, update them to the new criteria-specific copy:

```tsx
expect(
  screen.getByText('이 태그가 붙은 장소가 없어요. 다른 태그나 직접 선택을 써 보세요.'),
).toBeInTheDocument();
```

and:

```tsx
expect(
  screen.getByText('지역명을 입력하면 주소에 포함된 장소를 찾아요.'),
).toBeInTheDocument();
```

- [ ] **Step 5: Run the focused test**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: PASS.

---

### Task 2: Add Smart Default Title Preview

**Files:**
- Modify: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.tsx`
- Test: `apps/pin-plate/web/src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`

- [ ] **Step 1: Write failing tests for generated title**

Add:

```tsx
  it('uses a smart default title when the user has not typed one', async () => {
    mutateAsync.mockResolvedValueOnce({
      id: 'shared-map-1',
      owner_id: 'user-1',
      slug: 'seongsu-map',
      title: '추천 장소 지도',
      description: '',
      criteria_type: 'status',
      criteria_value: 'recommend',
      place_count: 1,
      cover_image_url: null,
      created_at: '2026-05-13T00:00:00.000Z',
      shared_map_places: [],
    });

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            title: '추천 장소 지도',
          }),
        }),
      ),
    );
  });
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: FAIL because `canCreateShareMap` still requires a typed title.

- [ ] **Step 3: Add title derivation**

Add this helper near the other top-level helpers:

```tsx
const getShareMapTitleSuggestion = (
  criteriaType: SharedMapCriteriaType,
  criteriaValue: string,
) => {
  if (criteriaType === 'region' && criteriaValue.trim()) {
    return `${criteriaValue.trim()} 맛집 지도`;
  }
  if (criteriaType === 'tag') {
    const selectedTag = ALL_TAGS.find((tag) => tag.id === criteriaValue);
    return selectedTag ? `${selectedTag.label} 장소 지도` : '공유 장소 지도';
  }
  if (criteriaType === 'manual') {
    return '직접 고른 맛집 지도';
  }
  return '추천 장소 지도';
};
```

Inside the component after `limitedPlaces`, add:

```tsx
  const titleSuggestion = getShareMapTitleSuggestion(criteriaType, criteriaValue);
  const shareMapTitle = title.trim() || titleSuggestion;
```

Change `canCreateShareMap` to remove the title requirement:

```tsx
  const canCreateShareMap =
    !hasNoShareablePlaces && !createSharedMapMutation.isPending;
```

In `handleCreateShareMap`, change:

```tsx
title,
```

to:

```tsx
title: shareMapTitle,
```

and add `shareMapTitle` to the dependency array.

Change the title input placeholder to:

```tsx
placeholder={titleSuggestion}
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: PASS.

---

### Task 3: Add Recipient Preview Card After Link Creation

**Files:**
- Modify: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.tsx`
- Modify: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.css.ts`
- Test: `apps/pin-plate/web/src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`

- [ ] **Step 1: Write failing test for preview card**

Add:

```tsx
  it('shows a recipient preview after creating a share link', async () => {
    mutateAsync.mockResolvedValueOnce({
      id: 'shared-map-1',
      owner_id: 'user-1',
      slug: 'seongsu-map',
      title: '성수 추천 지도',
      description: '',
      criteria_type: 'status',
      criteria_value: 'recommend',
      place_count: 1,
      cover_image_url: null,
      created_at: '2026-05-13T00:00:00.000Z',
      shared_map_places: [],
    });

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    expect(await screen.findByText('상대방에게 이렇게 보여요')).toBeInTheDocument();
    expect(screen.getByText('성수 추천 지도')).toBeInTheDocument();
    expect(screen.getByText('장소 1개')).toBeInTheDocument();
    expect(screen.getByText('성수 카페')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: FAIL because there is no preview card.

- [ ] **Step 3: Add preview styles**

In `ShareMapDialog.css.ts`, add:

```ts
export const previewCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing[2],
  padding: vars.spacing[4],
  border: `1px solid ${vars.colors.secondary.border}`,
  borderRadius: vars.borderRadius.xl,
  backgroundColor: vars.colors.common.white,
});

export const previewEyebrow = style({
  margin: 0,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
});

export const previewTitle = style({
  margin: 0,
  color: vars.colors.text.primary,
  fontSize: vars.fontSize.md,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.heading,
});

export const previewDescription = style({
  margin: 0,
  color: vars.colors.text.body,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.body,
});

export const previewMeta = style({
  margin: 0,
  color: vars.colors.text.sub,
  fontSize: vars.fontSize.xs,
});
```

- [ ] **Step 4: Render preview card before URL row**

Inside `{shareUrl && (...)}`, before the URL label, render:

```tsx
              <div className={s.previewCard}>
                <p className={s.previewEyebrow}>상대방에게 이렇게 보여요</p>
                <p className={s.previewTitle}>{shareMapTitle}</p>
                <p className={s.previewDescription}>
                  {description.trim() || `${limitedPlaces.length}개의 장소를 공유해요.`}
                </p>
                <p className={s.previewMeta}>장소 {limitedPlaces.length}개</p>
                {limitedPlaces[0] && (
                  <p className={s.previewMeta}>{limitedPlaces[0].place_name}</p>
                )}
              </div>
```

- [ ] **Step 5: Run the focused test**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: PASS.

---

### Task 4: Turn Post-Create CTA Into Send/Copy

**Files:**
- Modify: `apps/pin-plate/web/src/features/shared-map/components/ShareMapDialog.tsx`
- Test: `apps/pin-plate/web/src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx`

- [ ] **Step 1: Write failing tests for CTA hierarchy and feedback**

Add:

```tsx
  it('changes the primary footer action to sharing after link creation', async () => {
    mutateAsync.mockResolvedValueOnce({
      id: 'shared-map-1',
      owner_id: 'user-1',
      slug: 'seongsu-map',
      title: '성수 추천 지도',
      description: '',
      criteria_type: 'status',
      criteria_value: 'recommend',
      place_count: 1,
      cover_image_url: null,
      created_at: '2026-05-13T00:00:00.000Z',
      shared_map_places: [],
    });

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));

    expect(await screen.findByRole('button', { name: '공유하기' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '공유 링크 만들기' }),
    ).not.toBeInTheDocument();
  });

  it('shows copied feedback when clipboard copy succeeds', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    mutateAsync.mockResolvedValueOnce({
      id: 'shared-map-1',
      owner_id: 'user-1',
      slug: 'seongsu-map',
      title: '성수 추천 지도',
      description: '',
      criteria_type: 'status',
      criteria_value: 'recommend',
      place_count: 1,
      cover_image_url: null,
      created_at: '2026-05-13T00:00:00.000Z',
      shared_map_places: [],
    });

    render(
      <ShareMapDialog
        isOpen={true}
        places={[createPlace('1', '성수 카페', ['cafe'])]}
        ownerId="user-1"
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('공유 지도 제목'), {
      target: { value: '성수 추천 지도' },
    });
    fireEvent.click(screen.getByRole('button', { name: '공유 링크 만들기' }));
    fireEvent.click(await screen.findByRole('button', { name: '공유하기' }));

    expect(await screen.findByText('링크를 복사했어요.')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: FAIL because footer still says `공유 링크 만들기` and copy success has no feedback.

- [ ] **Step 3: Add share feedback state**

Near the existing state declarations:

```tsx
  const [shareFeedbackMessage, setShareFeedbackMessage] = useState('');
```

Whenever criteria/title/description/manual selection changes and when closing, clear it:

```tsx
setShareFeedbackMessage('');
```

- [ ] **Step 4: Update share/copy success handling**

In `handleShareUrl`, after native share succeeds:

```tsx
          setShareFeedbackMessage('공유 옵션을 열었어요.');
          return;
```

After clipboard write succeeds:

```tsx
        setShareFeedbackMessage('링크를 복사했어요.');
        return;
```

Before each attempt:

```tsx
      setErrorMessage('');
      setShareFeedbackMessage('');
```

Add `setShareFeedbackMessage` effects by using the state setter directly; no dependency array changes are needed for setters.

- [ ] **Step 5: Render feedback**

After `{errorMessage && ...}`, add:

```tsx
          {shareFeedbackMessage && (
            <p className={s.feedbackText} role="status">
              {shareFeedbackMessage}
            </p>
          )}
```

In `ShareMapDialog.css.ts`, add:

```ts
export const feedbackText = style({
  margin: 0,
  color: vars.colors.primary.default,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.body,
});
```

- [ ] **Step 6: Move primary share action to footer after creation**

In the success area, change the inline button label to secondary copy wording:

```tsx
링크 복사
```

In the footer primary button, render based on `shareUrl`:

```tsx
          <button
            type="button"
            className={s.primaryButton}
            onClick={shareUrl ? handleShareUrl : handleCreateShareMap}
            disabled={!shareUrl && !canCreateShareMap}
          >
            {shareUrl
              ? '공유하기'
              : createSharedMapMutation.isPending
                ? '공유 링크 만드는 중'
                : '공유 링크 만들기'}
          </button>
```

- [ ] **Step 7: Run the focused test**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: PASS.

---

### Task 5: Final Verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm --filter web test src/features/shared-map/components/__tests__/ShareMapDialog.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run shared-map tests**

Run:

```bash
pnpm --filter web test src/features/shared-map
```

Expected: PASS.

- [ ] **Step 3: Run lint fix**

Run:

```bash
pnpm lint:fix
```

Expected: completes with no new warnings caused by this change.

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm --filter web exec tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Manual QA if dev server is available**

Run:

```bash
pnpm --filter web dev
```

Then verify:

- Opening the share dialog shows actionable empty-state copy per criteria.
- Title placeholder changes with criteria.
- Creating a link reveals recipient preview.
- Footer primary changes from `공유 링크 만들기` to `공유하기`.
- Clipboard fallback shows `링크를 복사했어요.`
- Native share cancel does not show an error.

If this sandbox still blocks listening on port 3000 with `EPERM`, record that manual browser QA could not be run here and rely on tests, lint, and typecheck.

---

## Self-Review

**Spec coverage:** The plan covers all review findings: post-create CTA hierarchy, copy/share feedback, recipient preview confidence, smart title defaults, and actionable empty states.

**Placeholder scan:** No `TBD`, `TODO`, or undefined “handle later” steps remain.

**Type consistency:** New helpers use existing `SharedMapCriteriaType`, `ALL_TAGS`, `limitedPlaces`, and `shareMapTitle` names consistently.
