# Pin Plate 📍

> **🚧 개발 중**
>
> 주요 기능 구현이 완료되었으며, 사용자 경험 개선 및 추가 기능을 개발하고 있습니다.

지도 위에 나만의 장소를 핀으로 기록하고 공유하는 서비스입니다.

🔗 **서비스 바로가기**: [https://d3w5ds74y6zrqz.cloudfront.net](https://d3w5ds74y6zrqz.cloudfront.net)

---

## 주요 기능

- [x] **지도 서비스** — 네이버 지도 V3 연동, 사용자 위치 기반 지도 중심 이동
- [x] **하이브리드 위치** — Web(Geolocation API) & 모바일 앱(Bridge via WebView) 동시 지원
- [x] **게시글 관리** — 장소 기록 작성 / 수정 / 삭제 (Modal UI)
- [x] **장소 검색** — 카카오 로컬 API 기반 장소 검색
- [x] **이미지 업로드** — AWS S3 Pre-signed URL 방식
- [x] **별점 평가** — 1~5점 평점 UI
- [x] **회원 인증** — Supabase Auth 기반 이메일 회원가입 / 로그인
- [ ] **커뮤니티** — 사용자 프로필, 팔로우 기능 (예정)

---

## 기술 스택

**모노레포**
- 패키지 매니저: pnpm (Workspaces)

**웹 앱** (`apps/pin-plate/web`)
- 프레임워크: Next.js 16 (App Router)
- 언어: TypeScript
- 스타일링: Vanilla Extract
- 상태관리: Jotai, TanStack Query
- 지도: Naver Maps API V3

**모바일 앱** (`apps/pin-plate/mobile`)
- 프레임워크: React Native 0.81, Expo 54
- 방식: react-native-webview 하이브리드 앱
- 기능: Expo Location, WebView 브릿지 통신

**공유 패키지**
- `packages/ui` — 공유 React 컴포넌트
- `packages/eslint-config`, `packages/prettier-config` — 공유 코드 스타일 설정

**인프라**
- DB / Auth: Supabase (PostgreSQL)
- 스토리지: AWS S3
- 배포: SST v2 + AWS Lambda (ap-northeast-2)

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 10+

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev:pin-plate:web     # 웹 앱 (http://localhost:3000)
pnpm dev:pin-plate:mobile  # 모바일 앱 (Expo)
```

---

## 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev:pin-plate:web` | 웹 개발 서버 실행 |
| `pnpm dev:pin-plate:mobile` | Expo 개발 서버 실행 |
| `pnpm build:pin-plate:web` | 웹 프로덕션 빌드 |
| `pnpm build:pin-plate:mobile` | 모바일 EAS 빌드 |
| `pnpm lint:fix` | ESLint 자동 수정 |
| `pnpm prettier:fix` | 코드 포맷팅 |
| `pnpm sst:deploy` | AWS 배포 (프로덕션) |

---

## 프로젝트 구조

```
pin-plate/
├── apps/
│   └── pin-plate/
│       ├── web/          # Next.js 웹 앱
│       └── mobile/       # React Native + Expo 앱
├── packages/
│   ├── ui/               # 공유 UI 컴포넌트 라이브러리
│   ├── eslint-config/    # 공유 ESLint 설정
│   └── prettier-config/  # 공유 Prettier 설정
├── sst.config.ts         # AWS 인프라 설정 (IaC)
└── pnpm-workspace.yaml
```

---

## 모바일 앱 아키텍처

React Native WebView로 웹 앱을 감싸는 **하이브리드 구조**입니다.
네이티브 위치 정보(Expo Location)를 WebView 브릿지를 통해 웹으로 주입합니다.

```
[React Native (Expo)]
    └── WebView
          └── [Next.js Web App]
                 ↑
         Location Bridge (네이티브 → 웹)
```
