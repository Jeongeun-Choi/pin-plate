---
name: auto-devlog
description: git push를 할 때 해당 브랜치에서 어떤 작업을 했는지 정리해주는 스킬이다. AI가 모든걸 작성해서 작성한 코드에 대해서 알 수 없을때, 흐름을 따라가기 위해서 사용되는 스킬이다.
---

# auto-devlog: AI 자동 정리

git push할 때 해당 브랜치에서 어떤 작업을 했는지 정리해준다. 이때 저장 공간은 obsidian에 저장한다.

# 저장 폴더 구조

obsidian 내에 저장을 한다. 이때

```
pin-plate/
  Daily Logs/
    {브랜치명}/
      YYYY-MM-DD.md
```

로 저장한다.

# 저장 템플릿 형식

```
---
branch: feature/auth-flow
date: 2026-05-11
repo: my-service
tags:
  - devlog
  - backend
  - auth
---

# feature/auth-flow 작업 기록

## 목표
OAuth 로그인 플로우 개선 및 token refresh 안정화

---

## 오늘 작업 흐름

### 1. 로그인 상태 유지 문제 분석
- refresh token 만료 타이밍 확인
- access token 재발급 race condition 발견

### 2. middleware 구조 변경
- auth middleware 분리
- token validation 책임 이동

### 3. API 응답 구조 수정
- unauthorized response format 통일
- frontend 에러 처리 대응

---

## 주요 변경 파일
- `middleware/auth.ts`
- `services/token.service.ts`
- `routes/login.ts`

---

## 핵심 의사결정
- refresh 실패 시 silent retry 제거
- token validation cache 적용 안하기로 결정

---

## 남은 작업
- [ ] e2e 테스트 추가
- [ ] mobile client 대응 확인
- [ ] monitoring 로그 추가

---

## 참고 커밋
- `a1b2c3d`
- `d4e5f6g`
```

이렇게 해서

- 옵시디언 graph 연경 가능
- 주간 회고 자동화
- "왜 이렇게 구현했는지"
- AI가 다음 작업 이어받기 쉽다

이점을 노리기로 한다.

# 옵시디언 저장 cli

claude code로 템플릿 형식에 맞게 md 파일을 작성했다면 옵시디언에 저장해준다.
이때 저장 폴더 구조에 맞게 저장한다.

- 처음 저장하는 파일
  ```bash
  obsidian create name={YYYY-MM-DD}.md path="pin-plate/Daily Logs/{브랜치명}" content={claude code로 템플릿 형식에 맞게 md 파일}
  ```
- 기존에 존재하던 파일

  ```bash
  obsidian append file={YYYY-MM-DD}.md path="pin-plate/Daily Logs/{브랜치명}" content={claude code로 템플릿 형식에 맞게 md 파일}
  ```
