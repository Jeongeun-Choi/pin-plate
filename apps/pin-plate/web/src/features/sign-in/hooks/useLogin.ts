import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, loginWithGoogle, getSession, LoginParams } from '../api/auth';
import { redirectAfterLogin } from '../lib/redirectAfterLogin';

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
