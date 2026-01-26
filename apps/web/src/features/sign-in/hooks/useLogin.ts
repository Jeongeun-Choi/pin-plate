import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, LoginParams } from '../services/auth.service';

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
        router.push('/home');
      }
    },
  });
};
