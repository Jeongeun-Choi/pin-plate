import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { login, loginWithGoogle, LoginParams } from '../services/auth.service';

export const useLogin = () => {
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: async (data) => {
      if (data.session) {
        try {
          localStorage.setItem('accessToken', data.session.access_token);
        } catch (e) {
          console.error('Failed to save access token to localStorage:', e);
        }
        await checkUserProfileAndRedirect(
          supabase,
          data.session.user.id,
          router,
        );
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

      // 세션이 없는 경우(인증 미완료)에는 리다이렉트하지 않고 로그인 페이지에 머뭄
      if (!session) {
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
    // Set a temporary cookie to allow access to the profile setup page
    document.cookie =
      'is_in_registration_flow=true; path=/sign-up/profile; max-age=300; SameSite=Lax';
    router.push('/sign-up/profile');
  } else {
    router.refresh();
    router.push('/');
  }
};
