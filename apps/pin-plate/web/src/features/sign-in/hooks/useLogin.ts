import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  login,
  loginWithGoogle,
  getUserNickname,
  getSession,
  LoginParams,
} from '../api/auth';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: async (data) => {
      if (data.session) {
        try {
          localStorage.setItem('accessToken', data.session.access_token);
        } catch (e) {
          console.error('Failed to save access token to localStorage:', e);
        }
        await redirectAfterLogin(data.session.user.id, router);
      }
    },
  });
};

export const useGoogleLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => loginWithGoogle(),
    onSuccess: async () => {
      const session = await getSession();

      if (!session) return;

      await redirectAfterLogin(session.user.id, router);
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
  });
};

const redirectAfterLogin = async (
  userId: string,
  router: ReturnType<typeof useRouter>,
) => {
  const nickname = await getUserNickname(userId);

  if (!nickname) {
    document.cookie =
      'is_in_registration_flow=true; path=/sign-up/profile; max-age=300; SameSite=Lax';
    router.push('/sign-up/profile');
  } else {
    router.refresh();
    router.push('/');
  }
};
