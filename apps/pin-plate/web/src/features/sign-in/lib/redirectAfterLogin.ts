import { useRouter } from 'next/navigation';
import { getUserNickname } from '../api/auth';

export const redirectAfterLogin = async (
  userId: string,
  router: ReturnType<typeof useRouter>,
) => {
  const nickname = await getUserNickname(userId);
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

  if (!nickname) {
    document.cookie =
      'is_in_registration_flow=true; path=/sign-up/profile; max-age=300; SameSite=Lax';
    redirectTo('/sign-up/profile');
  } else {
    redirectTo('/');
  }
};
