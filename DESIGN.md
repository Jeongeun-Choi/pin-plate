---
version: "alpha"
name: "Pin Plate Warm Personal Map"
description: "A warm, map-first design system for a Korean personal place archive where guest writing feels native, not downgraded."
colors:
  primary: "#ffa07a"
  primary-hover: "#ff8c69"
  primary-container: "#fff4e6"
  on-primary-container: "#8b4513"
  background: "#fff8ed"
  surface: "#ffffff"
  border: "#ffe4d6"
  text-primary: "#1a1a1a"
  text-body: "#4a4a4a"
  text-muted: "#6b6b6b"
  success: "#4CAF50"
  error: "#ff6b6b" # also used as brand-secondary accent (search-result pin)
  warning: "#ffd93d"
  rating-unvisited: "#e9c46a"
  rating-1: "#f4a261"
  rating-2: "#ffb84d"
  rating-3: "#ffd93d"
  rating-4: "#ffa07a"
  rating-5: "#ff6b6b"
  pin-unvisited: "#E8E8E8"
  pin-1: "#fff2eb"
  pin-2: "#ffe6d9"
  pin-3: "#ffccb3"
  pin-4: "#ffb399"
  pin-5: "#ff9966"
  pin-wishlist: "#ffd93d"
typography:
  display-lg:
    fontFamily: "Pretendard, Noto Sans KR, sans-serif"
    fontSize: "36px"
    fontWeight: "700"
    lineHeight: "1.3"
    letterSpacing: "0"
  title-lg:
    fontFamily: "Pretendard, Noto Sans KR, sans-serif"
    fontSize: "24px"
    fontWeight: "700"
    lineHeight: "1.3"
    letterSpacing: "0"
  title-md:
    fontFamily: "Pretendard, Noto Sans KR, sans-serif"
    fontSize: "20px"
    fontWeight: "700"
    lineHeight: "1.3"
    letterSpacing: "0"
  body-md:
    fontFamily: "Pretendard, Noto Sans KR, sans-serif"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0"
  body-sm:
    fontFamily: "Pretendard, Noto Sans KR, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0"
  label:
    fontFamily: "Pretendard, Noto Sans KR, sans-serif"
    fontSize: "14px"
    fontWeight: "500"
    lineHeight: "1.5"
    letterSpacing: "0"
  caption:
    fontFamily: "Pretendard, Noto Sans KR, sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "1.5"
    letterSpacing: "0"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  "0": "0"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  "3xl": "32px"
  "4xl": "40px"
  "5xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "12px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    typography: "{typography.label}"
    padding: "12px 16px"
    height: "44px"
  place-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  form-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "44px"
  map-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    size: "44px"
---

## Overview

Pin Plate는 맛집과 카페, 가보고 싶은 장소를 지도 위에 저장하고 다시 꺼내 보는 개인 장소 아카이브다. 디자인 방향은 **Warm Personal Map**이다. 지도와 장소 사진, 핀, 별점이 화면의 주인공이고, UI는 기록을 쉽게 시작하고 다시 찾기 쉽게 만드는 조용한 도구여야 한다.

이 문서는 [google-labs-code/design.md](https://github.com/google-labs-code/design.md)의 구조를 따른다. 상단 YAML front matter는 에이전트와 도구가 읽는 기준 토큰이고, 아래 Markdown은 그 토큰을 어떻게 해석하고 적용할지 설명하는 제품 디자인 원칙이다.

가장 중요한 제품 제약은 비로그인 사용자도 글 작성과 사진 업로드를 시작할 수 있어야 한다는 점이다. 게스트 작성은 별도의 낮은 등급 경험이 아니라 같은 장소 기록 경험이며, 저장 위치와 동기화 범위만 다르다. 로그인 유도는 작성 차단이 아니라 기록 보존 제안처럼 느껴져야 한다.

## Colors

색상은 `packages/ui/src/styles/vars.css.ts`의 Vanilla Extract 토큰을 기준으로 한다. 새 UI에서 색상을 직접 하드코딩하지 말고, 필요한 경우 의미 기반 토큰을 먼저 추가한다.

- **Primary `#ffa07a`:** 저장, 작성, 선택 상태처럼 제품의 주요 행동을 표시한다.
- **Primary hover `#ff8c69`:** primary CTA의 hover와 pressed 상태에 쓴다.
- **Primary container `#fff4e6`:** 선택된 칩, 부드러운 강조면, secondary 버튼 배경에 쓴다.
- **Background `#fff8ed`:** 앱의 따뜻한 크림 배경이다. 지도와 사진이 있는 화면에서는 넓게 쓰기보다 패널과 빈 상태에서 사용한다.
- **Surface `#ffffff`:** 카드, 모달, 입력, 지도 위 floating control의 표면이다.
- **Border `#ffe4d6`:** 입력, 카드 구분선, 연한 패널 경계에 쓴다.
- **Text primary `#1a1a1a`:** 제목, 장소명, 핵심 액션에 쓴다.
- **Text body `#4a4a4a`:** 메모, 설명, 기본 본문에 쓴다.
- **Text muted `#6b6b6b`:** 날짜, 거리, 보조 메타 정보에 쓴다.

별점과 핀 색은 제품 의미를 담는 핵심 토큰이다. 별점 색은 경험의 평가를, 핀 색은 지도에서의 상태와 밀도를 전달한다. 색만으로 의미를 전달하지 말고 별점 숫자, 상태 라벨, 아이콘을 함께 둔다.

## Typography

기본 글꼴은 `Pretendard, Noto Sans KR, sans-serif`다. 한국어 장소명, 메모, 상태 라벨이 많은 제품이므로 장식적인 display font를 추가하지 않는다.

타입 스케일은 제품 내부 UI에 맞춘다. `display-lg`는 빈 상태나 드문 페이지급 메시지에만 쓰고, 장소 상세와 작성 화면에서는 `title-lg`, `title-md`, `body-md`, `body-sm`, `caption`을 우선한다. 새 UI의 letter spacing은 0으로 둔다.

본문은 16px와 line-height 1.5를 기본으로 한다. 카드 메타와 폼 라벨은 14px를 사용하되 터치 타깃은 줄이지 않는다. 지도 위 작은 컨트롤에서도 아이콘만 있는 버튼에는 접근 가능한 이름을 제공한다.

## Layout

레이아웃은 **map-first hybrid**다. 지도 화면에서는 패널과 컨트롤이 지도를 보조해야 하고, 리스트/상세 화면에서는 장소 사진, 별점, 메모가 안정적으로 읽혀야 한다.

모바일은 단일 컬럼과 바텀시트를 기본으로 한다. 주요 버튼과 지도 컨트롤은 최소 44px 터치 타깃을 유지한다. 데스크톱에서는 지도와 리스트 또는 상세 패널을 나란히 보여줄 수 있지만, 화면을 카드 장식으로 채우지 않는다.

간격은 4px 기반 scale을 쓴다. 아이콘과 라벨 사이는 4-8px, 폼 필드와 카드 내부는 12-16px, 모달 본문과 주요 섹션은 20-32px를 기준으로 한다. 반응형 처리는 고정 폭보다 `minmax`, `clamp`, percentage, viewport-safe constraints를 우선한다.

## Elevation & Depth

깊이는 정보 위계를 위해서만 쓴다. 지도 위 컨트롤, 바텀시트, 모달은 배경과 분리되어야 하므로 `vars.boxShadow.float` 계열의 elevation을 사용한다. 일반 리스트 카드에는 `vars.boxShadow.card` 수준의 얕은 그림자만 허용한다.

페이지 섹션 전체를 떠 있는 카드처럼 만들지 않는다. 지도, 장소 사진, 리스트가 이미 충분한 시각 정보를 만들기 때문에 중첩된 카드와 강한 그림자는 제품을 답답하게 만든다.

## Shapes

기본 radius는 컴포넌트 성격에 맞게 제한적으로 쓴다.

- **8px:** 작은 반복 항목, compact control.
- **12px:** 입력, 기본 버튼, 작은 카드.
- **16px:** 장소 카드, 폼 패널, 바텀시트 내부 표면.
- **24px:** 큰 모달, 넓은 빈 상태.
- **9999px:** 칩, 배지, 원형 지도 컨트롤.

카드 안에 다시 카드형 컨테이너를 넣지 않는다. 반복 항목, 모달, 실제 도구 표면에만 card treatment를 사용한다.

## Components

**Buttons:** `solid`는 저장, 작성, 공유 확정처럼 가장 중요한 액션에만 쓴다. `secondary`와 `ghost`는 로그인 유도, 필터, 지도 컨트롤처럼 보조적인 행동에 쓴다. 삭제는 항상 danger 색과 명확한 텍스트를 함께 사용한다.

**Place cards:** 사진, 장소명, 상태/별점, 위치, 메모 요약, 날짜 순서로 읽히게 한다. 카드 전체가 이동이면 링크, 상태 변경이면 버튼처럼 semantic HTML을 맞춘다.

**Forms:** 모든 입력에는 label을 연결한다. placeholder는 label 대체물이 아니다. 작성/수정 UI는 로그인 글과 게스트 글이 같은 제품 엔티티처럼 보이게 유지하고, `guest` 같은 저장소 구분을 사용자에게 노출하지 않는다.

**Map controls:** 지도 위 컨트롤은 작고 명확해야 한다. 아이콘 버튼에는 `aria-label`을 제공하고, 지도/마커/리스트/상세 이동 흐름은 같은 장소 엔티티를 다루는 느낌을 유지한다.

**Guest states:** 비로그인 상태 문구는 "로그인해야 쓸 수 있음"이 아니라 "지금 기록하고, 나중에 보존할 수 있음"의 톤을 사용한다. 가입 CTA는 사용자가 이미 만든 기록을 잃지 않게 돕는 제안이어야 한다.

## Do's and Don'ts

Do:

- `packages/ui/src/styles/vars.css.ts`의 토큰을 디자인 기준값으로 사용한다.
- 스타일은 co-located `.css.ts`에 작성하고 `import * as s from './Component.css'` 패턴을 따른다.
- 모바일과 웹 viewport를 함께 확인한다.
- 지도, 장소 사진, 핀, CTA 중 무엇이 주인공인지 한눈에 보이게 한다.
- 별점, 오류, 저장 상태는 색상과 텍스트 또는 아이콘을 함께 사용한다.
- 게스트 작성, 지도 마커, 상세 화면, 수정/삭제 흐름을 같은 제품 흐름으로 다룬다.

Don't:

- 비로그인 업로드 위험을 로그인 필수로 단순 차단하지 않는다.
- `guest`, `guest-post` 같은 내부 저장소 구분을 URL, 지도 마커, 상세 화면, 리스트에 노출하지 않는다.
- 토큰 밖의 임의 색상, spacing, radius, shadow를 새로 하드코딩하지 않는다.
- 지도와 장소 사진을 가리는 큰 장식 카드, 그라디언트, 마케팅식 히어로를 만들지 않는다.
- 색상만으로 상태를 전달하지 않는다.
- hover에 모바일 핵심 동작을 의존시키지 않는다.

## Implementation Notes

React 컴포넌트는 프로젝트의 hook ordering, arrow function, inline `interface Props` 규칙을 따른다. 새 인터랙션은 semantic HTML과 키보드 조작을 기본으로 한다. 모달과 바텀시트는 focus trap, escape close, focus restore를 지켜야 한다.

디자인 QA에서는 최소한 모바일 360px, 일반 노트북, 넓은 데스크톱에서 버튼 텍스트, 카드 제목, 지도 패널, 업로드 UI가 겹치거나 잘리지 않는지 확인한다.

## Decisions Log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-05-14 | Adopted `DESIGN.md` alpha front matter and canonical section order | The google-labs-code format gives coding agents machine-readable tokens plus human-readable design rationale. |
| 2026-05-14 | Kept Pin Plate's existing warm peach token system | `packages/ui/src/styles/vars.css.ts` already defines the product's brand colors, spacing, typography, pin colors, and rating colors. |
| 2026-05-14 | Treated guest writing as normal product UI | Product policy says guest posts are the same entity and should not expose storage/source distinctions to users. |
