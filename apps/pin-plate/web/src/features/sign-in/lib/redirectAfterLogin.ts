import { useRouter } from 'next/navigation';
import { getUserNickname } from '../api/auth';

export const redirectAfterLogin = async (
  userId: string,
  router: ReturnType<typeof useRouter>,
) => {
  const nickname = await getUserNickname(userId);

  if (!nickname) {
    document.cookie =
      'is_in_registration_flow=true; path=/sign-up/profile; max-age=300; SameSite=Lax';
    router.push('/sign-up/profile');
  } else {
    router.push('/');
    router.refresh();
  }
};
