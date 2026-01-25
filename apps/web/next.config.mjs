import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 모노레포 패키지 트랜스파일 설정
  transpilePackages: ['@pin-plate/ui'],

  // pnpm workspace의 루트를 추적하도록 설정 (이미 잘 설정하셨습니다)
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,

  webpack: (config) => {
    // 1. React Refresh(Fast Refresh) 로더가 .css.ts를 건드리지 못하게 차단
    config.module.rules.forEach((rule) => {
      if (!rule.oneOf) return;

      rule.oneOf.forEach((oneOfRule) => {
        // JS/TS 관련 로더(next-swc-loader 등)를 찾습니다.
        if (
          oneOfRule.test &&
          oneOfRule.test instanceof RegExp &&
          (oneOfRule.test.test('test.tsx') || oneOfRule.test.test('test.ts'))
        ) {
          // 기존 exclude가 있다면 유지하면서 .css.ts를 추가로 제외합니다.
          const existingExclude = oneOfRule.exclude;

          oneOfRule.exclude = (path) => {
            // vanilla-extract 스타일 파일은 React Refresh 대상에서 제외
            if (/\.css\.ts$/.test(path)) {
              return true;
            }

            // 기존 exclude 로직 적용
            if (typeof existingExclude === 'function') {
              return existingExclude(path);
            }
            if (existingExclude instanceof RegExp) {
              return existingExclude.test(path);
            }
            return false;
          };
        }
      });
    });

    // 2. 모노레포 내 동일 라이브러리 중복 참조 방지 (React Context 에러 방지)
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'react',
      'react-dom': 'react-dom',
    };

    return config;
  },
};

export default withVanillaExtract(nextConfig);
