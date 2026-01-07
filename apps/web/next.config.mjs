import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@pin-plate/ui'],
  experimental: {
    outputFileTracingRoot: '../../',
  },
  // Naver Maps의 createContext 에러를 해결하기 위한 설정
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': 'react',
      'react-dom': 'react-dom',
    };
    return config;
  },
};

export default withVanillaExtract(nextConfig);
