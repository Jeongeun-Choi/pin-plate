/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "pin-plate",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        aws: { region: "ap-northeast-2", version: "7.20.0" },
        cloudflare: { version: "6.13.0" },
      },
    };
  },

  async run() {
    // 서버 사이드 Secrets (SSM Parameter Store에 저장)
    // 등록: pnpm sst:secret set <Name> <value> --stage production
    const kakaoSearchClientId = new sst.Secret("KakaoSearchClientId");
    const awsAccessKeyId = new sst.Secret("AwsAccessKeyId");
    const awsSecretAccessKey = new sst.Secret("AwsSecretAccessKey");
    const supabaseUrl = new sst.Secret("SupabaseUrl");
    const supabaseApiKey = new sst.Secret("SupabaseApiKey");
    const xaiApiKey = new sst.Secret("XaiApiKey");
    const githubToken = new sst.Secret("GithubToken");
    const githubOwner = new sst.Secret("GithubOwner");
    const githubRepo = new sst.Secret("GithubRepo");

    // 클라이언트 사이드 Secrets (빌드 시 JS 번들에 포함)
    const kakaoAppKey = new sst.Secret("KakaoAppKey");
    const naverMapClientId = new sst.Secret("NaverMapClientId");
    const s3BucketName = new sst.Secret("S3BucketName");

    const web = new sst.aws.Nextjs("PinPlateWeb", {
      path: "apps/pin-plate/web",
      // open-next.config.ts에서 내부 빌드 커맨드를 "pnpm build"로 오버라이드
      // → next build --webpack 실행 (Vanilla Extract 호환 필수)
      buildCommand: "pnpm exec open-next build",
      regions: ["ap-northeast-2"],

      environment: {
        NODE_ENV: "production",
        // 서버 사이드
        KAKAO_SEARCH_CLIENT_ID: kakaoSearchClientId.value,
        S3_ACCESS_KEY_ID: awsAccessKeyId.value,
        S3_SECRET_ACCESS_KEY: awsSecretAccessKey.value,
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl.value,
        NEXT_PUBLIC_SUPABASE_API_KEY: supabaseApiKey.value,
        XAI_API_KEY: xaiApiKey.value,
        GITHUB_TOKEN: githubToken.value,
        GITHUB_OWNER: githubOwner.value,
        GITHUB_REPO: githubRepo.value,
        // 클라이언트 사이드 (NEXT_PUBLIC_*)
        NEXT_PUBLIC_KAKAO_APP_KEY: kakaoAppKey.value,
        NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: naverMapClientId.value,
        NEXT_PUBLIC_AWS_S3_BUCKET_NAME: s3BucketName.value,
        NEXT_PUBLIC_AWS_REGION: "ap-northeast-2",
      },

      server: {
        memory: "1024 MB",
      },

      domain: {
        name: "pinonplate.com",
        redirects: ["www.pinonplate.com"],
        dns: sst.cloudflare.dns(),
      },
    });

    return { url: web.url };
  },
});
