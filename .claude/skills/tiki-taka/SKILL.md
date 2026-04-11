# Tiki-Taka: 설계 리뷰 스킬

Plan mode에서 구현·설계·기능 개발 요청이 오면 이 스킬을 따른다.  
코드를 바로 작성하지 않는다. 설계 → 리뷰 → 구현 순서를 반드시 지킨다.

---

## Phase 1: 설계

요청된 작업을 분석하고 관련 코드를 탐색한 뒤 구현 계획서 초안을 작성한다.

계획서에 포함할 내용:
- 변경하거나 새로 생성할 파일 목록
- 각 파일에서 수행할 작업 (인터페이스, 타입, 함수 시그니처 등)
- 에러 처리·엣지 케이스·성능·보안 고려사항

먼저 작업 디렉토리를 생성한다. `{주제}`는 작업 내용을 간결하게 요약한 한글 또는 영문 키워드다:

```bash
PLAN_DIR=".claude/plans/tiki-taka/$(date +%Y-%m-%d)-{주제}"
mkdir -p "$PLAN_DIR"
```

계획서 작성 후 저장한다:

```bash
cat > "$PLAN_DIR/plan.md" << 'PLAN_EOF'
[계획서 내용]
PLAN_EOF
```

완료 후 Phase 2로 자동 진입한다.

---

## Phase 2: 티키타카 리뷰 루프 (최대 3라운드)

### 라운드 시작 전 준비

매 라운드 시작 시 `$PLAN_DIR/plan.md`의 최신 내용을 확인한다.

### Round 1

**Step 1 — Codex 리뷰 요청:**

아래 내용으로 `$PLAN_DIR/prompt-1.md`를 작성한다:

```
You are reviewing an implementation plan for a Next.js TypeScript monorepo (pin-plate project).
Conventions: Server Components by default, React 19 patterns (useActionState, useTransition,
useFormStatus), hooks ordered useState → useRef/useContext → custom hooks → useMemo/useCallback
→ useEffect, Vanilla Extract for styling, Jotai for global state, TanStack Query for server state.

Task: [요청 내용]

Proposed implementation plan:
[$PLAN_DIR/plan.md 내용]

Review for:
- Architectural soundness and correctness
- Alignment with project conventions (Server vs Client Components, hook ordering, etc.)
- Missing edge cases or error handling concerns
- TypeScript type safety (avoid any, use unknown + narrowing)
- Performance and security implications
- Better alternatives worth considering

Be specific — reference file names and plan sections.

End your response with exactly one of these two lines:
VERDICT: LGTM
VERDICT: NEEDS_CHANGES
```

그런 다음 실행한다:
```bash
codex exec -o "$PLAN_DIR/codex-1.md" < "$PLAN_DIR/prompt-1.md"
```

**Step 2 — Codex 의견 확인 및 Claude 응답:**

`$PLAN_DIR/codex-1.md`를 읽고 Codex의 의견을 분석한다.

- 타당한 지적 → 계획서를 수정하고 `$PLAN_DIR/plan.md` 업데이트 + 동의 의견 작성
- 불필요하거나 틀린 지적 → 명확한 근거로 반박

Claude 응답 마지막에 반드시 다음 중 하나를 명시한다:
```
VERDICT: LGTM
```
또는
```
VERDICT: NEEDS_CHANGES
```

**Step 3 — 판정 확인:**

- Codex 출력의 마지막 `VERDICT:` 라인 파싱
- Claude 자신의 verdict 확인
- **양측 모두 LGTM이면 → Phase 3으로 이동**
- 하나라도 NEEDS_CHANGES이면 → Round 2로 진행

---

### Round 2

아래 내용으로 `$PLAN_DIR/prompt-2.md`를 작성한다:

```
[Round 2] Tiki-taka plan review continuation.

Task: [요청 내용]

Current plan (may be revised since Round 1):
[최신 $PLAN_DIR/plan.md 내용]

Previous rounds:
---
Round 1 - Codex:
[$PLAN_DIR/codex-1.md 내용]

Round 1 - Claude:
[Claude의 Round 1 응답 내용]
---

Re-examine the plan. Either confirm all issues are resolved (LGTM) or point out remaining concerns.

End your response with exactly one of these two lines:
VERDICT: LGTM
VERDICT: NEEDS_CHANGES
```

```bash
codex exec -o "$PLAN_DIR/codex-2.md" < "$PLAN_DIR/prompt-2.md"
```

Round 1과 동일하게 Codex 의견 확인 → Claude 응답 → 판정 확인.  
양측 LGTM이면 Phase 3, 아니면 Round 3.

---

### Round 3 (최대)

Round 2와 동일하게 진행한다 (프롬프트에 Round 1, 2 히스토리 모두 포함).

3라운드 후에도 합의 불발 시:
```
## ⚠️ 최대 라운드 도달 — 미합의

아직 해결되지 않은 이슈:
- [각 AI의 마지막 NEEDS_CHANGES 이유 목록]

사용자가 직접 판단해주세요.
```

---

## Phase 3: 구현

양측 모두 LGTM 판정 후 다음을 출력한다:

```
## ✅ 설계 리뷰 완료 (N라운드) — 구현 시작

### 최종 확정 설계
[승인된 계획서 전문]

### Codex 최종 의견
[Codex 마지막 라운드 핵심 내용]
VERDICT: LGTM

### Claude 최종 의견
[Claude 마지막 라운드 핵심 내용]
VERDICT: LGTM

**결론**: 양측 LGTM ✓ — 아래 설계대로 구현합니다.
```

이후 승인된 설계대로 코드를 구현한다.
