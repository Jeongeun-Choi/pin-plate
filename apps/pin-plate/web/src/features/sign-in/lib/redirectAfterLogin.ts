import { useRouter } from 'next/navigation';

export const redirectAfterLogin = async (
  _userId: string,
  router: ReturnType<typeof useRouter>,
) => {
  const isMobileWebView =
    typeof window !== 'undefined' && Boolean(window.ReactNativeWebView);

  const redirectTo = (path: string) => {
    if (isMobileWebView) {
      window.location.assign(path);
      return;
    }

    router.push(path);
    router.refresh();
  };

  redirectTo('/');
};
