// "pnpm build" → apps/pin-plate/web/package.json의 "build" 스크립트 실행
// = "next build --webpack" → Vanilla Extract webpack 플러그인 정상 작동
const config = {
  default: {},
  buildCommand: 'pnpm build',
};

export default config;
