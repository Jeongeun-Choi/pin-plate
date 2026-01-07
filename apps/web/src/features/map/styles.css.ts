import { style } from '@vanilla-extract/css';

// 지도는 항상 부모 컨테이너(화면 전체)를 꽉 채웁니다.
// 전략 2: 반응형 풀 스크린 (PC/Mobile 모두 전체 화면)
export const mapContainerStyle = style({
  width: '100%',
  height: '100%',
  position: 'absolute', // absolute로 변경하여 레이아웃 흐름에서 분리, 전체 화면 점유 유리
  top: 0,
  left: 0,
  zIndex: 0, // 다른 UI 요소들이 지도 위에 올라오도록 가장 아래로
});
