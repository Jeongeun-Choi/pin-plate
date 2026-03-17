import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pin-plate/ui'],
  outputFileTracingRoot: new URL('../../../', import.meta.url).pathname,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config) => {
    // React Refresh 로더가 .css.ts를 건드리지 못하게 차단
    config.module.rules.forEach((rule) => {
      if (!rule.oneOf) return;

      rule.oneOf.forEach((oneOfRule) => {
        if (
          oneOfRule.test &&
          oneOfRule.test instanceof RegExp &&
          (oneOfRule.test.test('test.tsx') || oneOfRule.test.test('test.ts'))
        ) {
          const existingExclude = oneOfRule.exclude;

          oneOfRule.exclude = (path) => {
            if (/\.css\.ts$/.test(path)) return true;
            if (typeof existingExclude === 'function') return existingExclude(path);
            if (existingExclude instanceof RegExp) return existingExclude.test(path);
            return false;
          };
        }
      });
    });

    // 모노레포 내 React 중복 참조 방지
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'react',
      'react-dom': 'react-dom',
    };

    return config;
  },
};

export default withVanillaExtract(nextConfig);
