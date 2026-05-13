# AGENTS.md — Coding Standards for pin-plate

## Product Intent Guardrails

- Pin Plate는 **비로그인 사용자도 글 작성과 사진 업로드가 가능해야 하는 제품**이다.
- 보안 보완 시 비로그인 업로드 위험을 단순히 로그인 필수로 막지 않는다.
- 비로그인 업로드 보호는 게스트 세션, 브라우저/기기 기준 임시 식별자, 업로드 개수/용량 제한, rate limit, 만료 시간, 파일 타입 검증, 악성 파일 검증, 사후 정리 정책을 우선 검토한다.
- 웹은 서버 발급 HttpOnly 게스트 업로드 세션 쿠키를 우선 사용하고, 모바일 네이티브 업로드는 서버 발급 게스트 세션 토큰을 secure storage에 저장한 뒤 요청 헤더로 보내는 방식을 사용한다.
- 게스트 업로드 세션은 클라이언트가 임의로 만들 수 없는 서버 서명 토큰이어야 하며, 웹과 모바일 모두 같은 서버 검증 로직을 공유한다.
- 영구 저장, 기기 간 동기화, 계정 귀속, 장기 보존은 가입/로그인 이후 기능으로 구분한다.
- 상세 제품 정책은 `PRODUCT_PLAN.md`의 “제품 의도: 비로그인 작성과 업로드”를 기준으로 삼는다.

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

**구현·설계·기능 개발** 요청이 오면 반드시 `.Codex/skills/opus-sonnet/SKILL.md`를
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
