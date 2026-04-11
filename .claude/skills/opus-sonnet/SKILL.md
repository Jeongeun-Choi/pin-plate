# Opus-Sonnet: 토큰 효율 개발 스킬

구현·설계·기능 개발 요청이 오면 이 스킬을 따른다.
Opus가 설계·리뷰를 담당하고, Sonnet이 구현을 실행한다. 코드를 먼저 작성하지 않는다.

---

## Phase 1-2: 설계 + 티키타카 리뷰 (Opus)

설계가 완료되면 **반드시** 아래 명령으로 tiki-taka 리뷰를 자동 실행한다:

```tool
Skill({ skill: "tiki-taka" })
```

- Skill tool 호출은 설계 완료 즉시, 사용자 확인 없이 자동으로 수행한다
- Phase 1(설계) + Phase 2(티키타카 리뷰 루프)까지 정상 진행한다
- **Phase 3(구현)은 실행하지 않는다** — tiki-taka의 Phase 3 대신 아래 Phase 3으로 넘긴다

양측 LGTM 판정 후 다음을 출력한다:

```
## ✅ 설계 리뷰 완료 — Sonnet 에이전트로 구현 위임
```

이후 Phase 3으로 진입한다.

---

## Phase 3: 구현 위임 (Sonnet 에이전트)

### 3-1. 작업 분해

승인된 계획서(`$PLAN_DIR/plan.md`)를 분석하여 작업 단위로 분해한다.

**분해 기준:**
- 파일 간 의존성이 없는 독립 작업 → 병렬 에이전트
- 공유 타입/인터페이스 필요 시 → 해당 작업을 선행 에이전트로 먼저 실행
- 작업이 3개 미만이거나 강하게 결합 → 단일 에이전트로 통합

### 3-2. Sonnet 에이전트 디스패치

각 작업 단위에 대해 Agent tool을 호출한다:

```
Agent({
  model: "sonnet",
  description: "구현: [작업 요약]",
  prompt: "[아래 템플릿]"
})
```

**프롬프트 템플릿:**

```
## 프로젝트 규칙 (CLAUDE.md 핵심)
- Server Components 기본, 'use client'는 hooks/browser API/이벤트 핸들러 사용 시만
- Hook 순서: useState → useRef/useContext → custom hooks → useMemo/useCallback → useEffect
- 컴포넌트 내부 함수는 arrow function만 사용
- 스타일: Vanilla Extract (.css.ts), import * as s from './Component.css'
- 타입: inline interface Props, any 금지 → unknown + narrowing
- 서버 상태: TanStack Query, 글로벌 상태: Jotai
- 네이밍: boolean은 is/has/should/can 접두사, 구체적 변수명 사용

## 구현할 작업
[계획서에서 해당 에이전트 담당 부분 전문]

## 관련 기존 코드
[파일 경로 및 핵심 패턴 — Opus가 설계 시 파악한 내용]

## 기대 결과물
- 생성/수정할 파일: [목록]
- 수정하지 말 것: [목록]

## 완료 시
작업 결과를 요약하고, 우려 사항이 있으면 CONCERNS: 섹션에 기술한다.
```

**병렬 에이전트** (독립 작업 2개 이상):
- 하나의 메시지에서 여러 Agent tool을 동시에 호출한다
- 각 에이전트는 자신의 담당 파일만 수정한다

**순차 에이전트** (의존성 있는 작업):
- 선행 작업 에이전트 완료 후 후속 에이전트를 호출한다

### 3-3. 실패 처리

에이전트가 실패하거나 부정확한 코드를 생성한 경우:
1. 더 구체적인 지시사항으로 Sonnet 에이전트를 재호출한다 (최대 2회)
2. 2회 재시도 후에도 실패하면 Opus가 직접 해당 부분을 구현한다

---

## Phase 4: 검증 (Opus)

Sonnet 에이전트 완료 후 Opus가 직접 수행한다.

### 4-1. 자동 검증

```bash
pnpm lint:fix
pnpm tsc --noEmit
```

### 4-2. 코드 리뷰

- 계획서 대비 구현 완성도 확인
- CLAUDE.md 규칙 준수 여부 점검 (훅 순서, Server/Client 분리, 네이밍 등)
- 누락된 엣지 케이스, 타입 안전성 확인

### 4-3. 수정

- 경미한 수정 (린트 오류, 네이밍, 타입 등): Opus가 직접 수정
- 대규모 수정 (로직 변경, 구조 재작성): Sonnet 에이전트 재호출

### 4-4. 완료 보고

```
## ✅ 구현 완료

### 설계 리뷰: N라운드 (Opus + Codex)
### 구현: Sonnet 에이전트 M개
### 검증: lint ✓ / type-check ✓ / 코드 리뷰 ✓

### 변경된 파일
- [파일 목록]
```
