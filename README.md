# Pin Plate

> **🚧 Currently in Development**
>
> 이 프로젝트는 현재 활발히 개발이 진행 중입니다. 주요 기능 구현이 완료되었으며, 사용자 경험 개선 및 추가 기능 개발 단계에 있습니다.

지도 위에 나만의 장소를 핀으로 기록하고 공유하는 서비스입니다.

## ✨ Feature Checklist

현재 구현된 기능과 진행 중인 작업 목록입니다.

- [x] **Project Setup**
  - Monorepo (Turbo/pnpm)
  - Next.js 16 (App Router)
  - React Native / Expo 54
  - Design System (Vanilla Extract)

- [x] **Map Service**
  - Naver Map V3 연동
  - 사용자 위치 기반 지도 중심 이동
  - **Hybrid Location**: Web(Geolocation API) & App(Bridge via WebView) 지원

- [x] **Post Management**
  - 게시글 작성/수정 (Modal UI)
  - 장소 검색 (Kakao Local API)
  - 이미지 업로드 (AWS S3 Pre-signed URL)
  - 별점 평가 UI

- [ ] **Community & Interaction**
  - [ ] 사용자 프로필 및 팔로우

## 🛠 Tech Stack

**Monorepo**

- **Package Manager**: [pnpm](https://pnpm.io/) (Workspaces)

**Apps**

- **Web (`apps/web`)**:
  - Framework: Next.js 16 (App Router)
  - Language: TypeScript
  - Styling: Vanilla Extract
  - State Management: Jotai, TanStack Query
  - Map: Naver Maps API
- **Mobile (`apps/mobile`)**:
  - Framework: React Native 0.81, Expo 54
  - WebView: react-native-webview (Hybrid App)
  - Features: Expo Location, Bridge Communication

**Packages**

- **UI (`packages/ui`)**: Shared React components
- **Config**: Shared ESLint & Prettier configurations

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm

### Installation

```bash
pnpm install
```

### Running the Project

**Web Application**

```bash
pnpm dev:web
# Runs on http://localhost:3000
```

**Mobile Application**

```bash
pnpm dev:mobile
# Starts Expo development server
```

## 📂 Project Structure

```
.
├── apps
│   ├── web        # Next.js web application
│   ├── mobile     # Expo mobile application
│   └── backend    # Backend services
├── packages
│   ├── ui         # Shared UI components
│   ├── eslint-config
│   └── prettier-config
└── ...
```
