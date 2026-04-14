# Sign-Up 완료 후 Sign-In 페이지로 리다이렉트

## 목적

회원가입 완료 후 자동으로 홈으로 이동하는 대신, sign-in 페이지로 이동해 사용자가 직접 로그인하게 한다.

## 변경 내용

**파일:** `apps/pin-plate/web/src/features/sign-up/actions.ts`

회원가입 완료 시점(`profiles` upsert 성공 후):
1. `supabase.auth.signOut()` 호출 — 미들웨어가 로그인 상태에서 `/sign-in` 접근 시 `/`로 튕기므로 세션을 먼저 끊어야 함
2. `redirect('/sign-in')` 으로 변경

## 검증

1. 신규 이메일로 회원가입
2. `/sign-in` 페이지로 이동되는지 확인
3. 이메일/비밀번호 입력 후 로그인 → `/`으로 이동 확인
