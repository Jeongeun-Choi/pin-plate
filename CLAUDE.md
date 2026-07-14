# CLAUDE.md — Coding Standards for pin-plate

## Product Intent Guardrails

- Pin Plate는 **로그인 사용자만 앱 내부 기능에 진입할 수 있고, 비로그인 사용자는 공유 페이지만 볼 수 있는 제품**이다.
- 비로그인 사용자는 공개 공유 페이지(`/share/:slug`) 조회만 허용한다.
- 비로그인 사용자가 보호된 화면에 진입하면 로그인 화면으로 리다이렉트한다.
- 글 작성, 사진 업로드, 지도/리스트 조회, 마이페이지, 게시글 상세/수정/삭제 등 사용자 데이터에 접근하는 기능은 인증 이후에만 제공한다.
- 비로그인 글 작성이나 게스트 업로드 세션을 새로 만들지 않는다.
- `guest_posts`, `guest`, `guest-post` 같은 게스트 게시글 저장소/URL/상태 모델을 도입하지 않는다.
- 보안 보완 시 비로그인 업로드를 허용하는 방향으로 우회하지 말고, 인증 게이트와 서버 권한 검증을 유지한다.
- `/api/posts`, `/api/image` 등 사용자 데이터 생성/수정 API는 인증되지 않은 요청에 `401 Unauthorized`를 반환해야 한다.
- 클라이언트의 `user_id` payload는 신뢰하지 말고 서버에서 확인한 인증 사용자 id와 일치하는지 검증한다.
- 통합 테스트를 추가할 때는 비로그인 사용자가 공유 페이지만 볼 수 있는지, 보호된 라우트에서 로그인 화면으로 리다이렉트되는지, 인증된 사용자만 핵심 플로우를 수행할 수 있는지 우선 검증한다.
- 상세 제품 정책은 `PRODUCT_PLAN.md`의 “제품 의도: 인증 기반 개인 지도와 공개 공유 조회”를 기준으로 삼는다.

## React 19 Best Practices

### Server vs Client Components (Next.js App Router)

- Default to **Server Components** — no `'use client'` unless the component uses hooks, browser APIs, or event handlers
- Keep `'use client'` boundaries as small/deep as possible
- Use `<Suspense>` with a `fallback` for async Server Components and lazy-loaded Client Components
- Never use `useEffect` to fetch data — use Server Components or React Query (`useQuery`) instead

### Concurrent Features

- Use `useTransition` for non-urgent state updates (e.g. filter changes, navigation)
- Use `useDeferredValue` to defer expensive derived values
- Prefer `<Suspense>` over manual loading state where possible

### Actions & Forms (React 19)

- Use React 19 `useActionState` for form submissions instead of manual loading/error state
- Use `useFormStatus` inside form child components to read pending state

---

## Hook Ordering (enforced)

Inside every component, hooks must appear in this order:

1. `useState` — all state declarations at the **very top**
2. `useRef`, `useContext`, `useId`, etc.
3. Custom hooks / React Query hooks (`useQuery`, `useMutation`, etc.)
4. `useMemo`, `useCallback`
5. `useEffect` — always placed **immediately before `return`**

```tsx
// ✅ Correct
export function MyComponent() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  const { data } = useQuery(...)

  const handleClick = () => { ... }

  useEffect(() => {
    // side effects
  }, [count])

  return <div ref={ref}>...</div>
}
```

---

## Function Declarations Inside Components

All functions defined **inside** a component must use **arrow function** syntax:

```tsx
// ✅ Correct
const handleClick = () => { ... }
const formatLabel = (value: string) => value.toUpperCase()

// ❌ Wrong
function handleClick() { ... }
```

Top-level (module-level) utility functions outside components may use either style, but prefer arrow functions for consistency.

---

## TypeScript

- Always type component props with an inline `interface Props { ... }` (not `type`)
- Avoid `any` — use `unknown` and narrow types explicitly
- Use Zod for runtime validation at API boundaries

---

## Styling (Vanilla Extract)

- All styles live in a co-located `.css.ts` file
- Import as `import * as s from './Component.css'`
- Use design tokens from `styles/tokens.css.ts` — never hardcode colors, spacing, or fonts
- No inline `style` props except for truly dynamic values (e.g. computed widths)

---

## State Management

- **Local UI state:** `useState` / `useReducer`
- **Server/async state:** TanStack React Query (`useQuery`, `useMutation`)
- **Global client state:** Jotai atoms
- Do not mix concerns — React Query owns server state, Jotai owns UI/global state

---

## Naming

- Variable names must clearly describe their role — avoid generic names like `loading`, `data`, `detecting`
- Boolean variables should use a prefix that describes what they represent: `is`, `has`, `should`, `can`
- When renaming destructured values, include enough context to distinguish them from similar variables

```ts
// ❌ Too vague
const { data, isLoading, refetch } = useGitHubRepos();
const detecting = useIsFetching(...) > 0;

// ✅ Clear
const { data: gitHubRepos, isLoading: isGitHubReposLoading, refetch: refetchGitHubRepos } = useGitHubRepos();
const isDetectingMonorepo = useIsFetching(...) > 0;
```

---

## Accessibility (a11y)

- Interactive elements must use semantic HTML — `<button>` for actions, `<a>` for navigation, never `<div onClick>`
- All images require meaningful `alt` text; decorative images use `alt=""`
- Form inputs must have associated `<label>` (via `htmlFor` or wrapping)
- Use `aria-label` or `aria-labelledby` when visible text is absent (e.g. icon-only buttons)
- Use `aria-expanded`, `aria-haspopup`, `aria-controls` for dropdowns and disclosure patterns
- Modals/dialogs must trap focus and restore focus on close; use `role="dialog"` with `aria-modal="true"`
- Maintain logical tab order — avoid `tabIndex` values greater than 0
- Color must not be the only means of conveying information (add text or icons alongside)
- Minimum color contrast ratio: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- All interactive elements must be keyboard-operable (`Enter`/`Space` for buttons, `Escape` to dismiss overlays)

---

## Opus-Sonnet Skill

**구현·설계·기능 개발** 요청이 오면 반드시 `.claude/skills/opus-sonnet/SKILL.md`를
읽고 그 지침을 따른다. 코드를 먼저 작성하지 않는다.

---

## Lint & Formatting

코드 추가·수정 후 반드시 아래 명령을 실행해 린트와 포매팅을 맞춘다:

```bash
pnpm lint:fix
```

- ESLint 자동 수정 + Prettier 포매팅이 함께 적용됨
- 수정된 파일이 있으면 커밋에 포함시킨다
- `warning`은 무시하지 말고 가능하면 해소한다 (단, 기존 코드의 경고는 별도 커밋으로 분리)

## Typecheck

코드 추가, 수정 후 반드시 아래 명령을 실행해 타입 체크를 한다:

```bash
pnpm tsc
```

- type 에러를 자동 수정한다.
- `warning`은 무시하지 말고 가능하면 해소한다.

---

## General

- Prefer composition over prop drilling — use children or compound components
- Keep components small and focused on one responsibility
- No commented-out code in commits
- No `console.log` in production code — use structured logging utilities if needed
- 전체적으로 deprecated 된 api나 함수는 쓰지마.
- 기능 추가 및 수정시 발생할 수 있는 엣지 케이스를 생각하고 구현해줘.

## Design System

Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match `DESIGN.md`.
