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
    mutationFn: async () => {
      const googleLoginResult = await loginWithGoogle();

      if (!googleLoginResult.shouldVerifySession) {
        return null;
      }

      const session = await getSession();

      if (!session) {
        throw new Error(
          '로그인은 완료됐지만 세션을 확인하지 못했어요. 다시 시도해 주세요.',
        );
      }

      return session;
    },
    onSuccess: async (session) => {
      if (!session) return;

      await redirectAfterLogin(session.user.id, router);
    },
  });
};
