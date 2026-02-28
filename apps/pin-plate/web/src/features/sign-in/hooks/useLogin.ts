import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { login, loginWithGoogle, LoginParams } from '../services/auth.service';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: (data) => {
      if (data.session) {
        try {
          localStorage.setItem('accessToken', data.session.access_token);
        } catch (e) {
          console.error('Failed to save access token to localStorage:', e);
          // 선택적: 사용자에게 알림을 주거나, 인메모리 저장소로 대체할 수 있음
        }
        // Assuming we want to redirect to home on success
        router.push('/');
      }
    },
  });
};

export const useGoogleLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: () => loginWithGoogle(),
    onSuccess: async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      await checkUserProfileAndRedirect(supabase, session.user.id, router);
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
  });
};

const checkUserProfileAndRedirect = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  router: ReturnType<typeof useRouter>,
) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', userId)
    .single();

  if (!profile?.nickname) {
    router.push('/sign-up/profile');
  } else {
    router.push('/');
  }
};
