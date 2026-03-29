// "pnpm build" → apps/pin-plate/web/package.json의 "build" 스크립트 실행
// = "next build --webpack" → Vanilla Extract webpack 플러그인 정상 작동
const config = {
  default: {},
  buildCommand: 'pnpm build',
  middleware: {
    // Supabase auth.getUser()는 외부 HTTP 요청이 필요하므로
    // CloudFront Functions 대신 Lambda@Edge에서 실행해야 함
    external: true,
  },
};

export default config;
