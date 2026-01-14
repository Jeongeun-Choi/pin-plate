import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pin-plate/ui'],
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
  turbopack: {
    // We are currently using a custom webpack config for Vanilla Extract
  },
  // Vanilla Extract가 모노레포에서 충돌나는 문제를 방지
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'react',
      'react-dom': 'react-dom',
    };

    // .css.ts 파일에 대해 Fast Refresh가 간섭하지 않도록 설정 보완
    if (!isServer) {
      config.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (
              oneOfRule.test &&
              oneOfRule.test.toString().includes('tsx|ts') &&
              oneOfRule.use &&
              Array.isArray(oneOfRule.use)
            ) {
              // 특정 상황에서 fast-refresh가 .css.ts 파일을 건드리지 못하게 처리 로직이 들어갈 수 있음
            }
          });
        }
      });
    }

    return config;
  },
};

export default withVanillaExtract(nextConfig);
