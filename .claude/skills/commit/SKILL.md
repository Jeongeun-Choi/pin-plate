---
description: 변경사항을 분석해 관련 파일끼리 묶어 Conventional Commit 형식으로 여러 커밋을 생성합니다
argument-hint: (선택) 커밋에 대한 추가 힌트나 맥락 (예: 이미지 업로드 훅 분리)
---

# 자동 커밋

현재 변경사항을 분석해 관련 파일끼리 논리적 그룹으로 묶고, 각 그룹을 Conventional Commit 형식으로 커밋합니다.

## 사전 확인

커밋 전 아래를 실행해 현재 상태를 파악합니다:

1. `git status` — 변경된 파일 목록 확인
2. `git diff` — unstaged 변경 내용 확인
3. `git diff --cached` — staged 변경 내용 확인

변경사항이 없으면 사용자에게 알리고 중단합니다.

## Staged 파일 분기 처리

`git status` 결과 기준:
- **staged 파일 없음**: 모든 unstaged 변경 파일을 그룹핑 대상으로 처리합니다
- **staged 파일 있음**: staged 파일들을 우선 처리 대상으로 삼고, unstaged 파일도 함께 그룹핑할지 사용자에게 먼저 확인합니다

## 그룹핑 분석

변경 파일들을 아래 우선순위로 논리적 그룹으로 묶습니다:

1. **스코프** — `apps/pin-plate/`, `packages/ui/`, `.claude/` 등 경로 기준
2. **기능 연관성** — 같은 feature/hook/component 묶음 (예: 동일 폴더의 관련 훅들)
3. **변경 타입** — feat끼리, fix끼리, chore끼리

> **한계**: 단일 파일 내 혼재된 변경은 파일 단위로만 그룹핑 가능합니다 (hunk-level 분리 미지원). 해당 파일은 가장 관련성 높은 그룹에 포함합니다.

## 커밋 타입 결정 규칙

| 타입 | 언제 사용 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `style` | 포맷팅, 스타일 변경 (로직 무관) |
| `docs` | 문서, 주석, README 변경 |
| `chore` | 빌드, 설정, 의존성 변경 |
| `test` | 테스트 추가 또는 수정 |
| `ci` | CI/CD 파이프라인 변경 |

## 스코프 결정 규칙

변경된 파일 경로를 기준으로 스코프를 결정합니다:

| 변경 경로 | 스코프 |
|---|---|
| `apps/pin-plate/` | `pin-plate` |
| `apps/web/` | `web` |
| `packages/ui/` | `ui` |
| `.claude/`, `CLAUDE.md` | `claude` |
| `.github/` | `ci` |
| 루트 설정 파일 (`package.json`, `tsconfig.json` 등) | `config` |

여러 경로에 걸친 변경은 그룹으로 분리하여 각각 커밋합니다.

## 커밋 메시지 작성 규칙

- **형식**: `타입(스코프): 제목`
- **제목**: 한국어, 명령형(동사 원형), 50자 이내, 마침표 없음
- **예시**:
  - `fix(pin-plate): 마커 클릭 이벤트 중복 등록 수정`
  - `refactor(ui): Card 컴포넌트 스타일 토큰 적용`
  - `chore(config): pnpm 워크스페이스 설정 업데이트`

사용자가 argument로 힌트를 제공한 경우 해당 내용을 반영합니다.

## 커밋 절차

1. 그룹핑 분석 후 아래 미리보기를 사용자에게 보여주고 확인 요청:

   ```
   총 N개의 커밋으로 나눠 커밋합니다:

   [1/N] refactor(pin-plate): 이미지 업로드 훅 분리
     - apps/pin-plate/web/src/features/post/hooks/useUploadImages.ts (신규)
     - apps/pin-plate/web/src/features/post/hooks/usePostForm.ts
     - apps/pin-plate/web/src/features/post/hooks/useEditPostForm.ts

   [2/N] refactor(ui): Card 컴포넌트 스타일 개선
     - packages/ui/src/components/Card/Card.tsx

   [3/N] docs(claude): 코딩 규칙 업데이트
     - CLAUDE.md
   ```

2. 사용자 확인 후 각 그룹별로 순차적으로 커밋합니다:
   - `git add <그룹에 속한 파일들>` — 해당 파일만 스테이징
   - `git commit -m "타입(스코프): 제목"` — 커밋 실행

3. **중간 커밋 실패 시 즉시 중단** — 이후 그룹 커밋을 진행하지 않고 실패 원인을 보고합니다. 이미 완료된 커밋이 있다면 해당 커밋 해시도 함께 알립니다.

4. 모든 커밋 성공 시 커밋 해시 목록을 반환합니다.

## 주의사항

- `.env`, `*.secret`, `credentials` 등 민감한 파일이 포함된 경우 사용자에게 경고하고 해당 파일을 제외할지 확인합니다
- `node_modules/`, `.next/`, `dist/`, `build/` 경로의 파일은 스테이징에서 제외합니다
- 커밋 전 항상 미리보기를 보여주고 확인을 받습니다 — 자동으로 커밋하지 않습니다
