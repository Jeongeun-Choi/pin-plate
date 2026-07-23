'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { redirectAfterLogin } from '@/features/sign-in/lib/redirectAfterLogin';

const CallbackSpinner = () => (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          height: '32px',
          width: '32px',
          borderRadius: '50%',
          border: '4px solid #ffa07a',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <p
        style={{
          color: '#364153',
          fontSize: '14px',
          margin: 0,
        }}
      >
        로그인 중입니다...
      </p>
    </div>
  </div>
);

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

const AuthCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPopup = searchParams.get('popup') === 'true';
  const authCode = searchParams.get('code');

  useEffect(() => {
    const supabase = createClient();
    let hasCompletedAuth = false;
    let unsubscribeAuthState: (() => void) | null = null;
    // 팝업 플로우(데스크톱)에서만 opener와 통신한다. 모바일 WebView 등
    // top-level 리다이렉트로 들어온 경우 opener가 없으므로 이 채널을 쓰지 않는다.
    const channel = isPopup
      ? new BroadcastChannel('google_login_channel')
      : null;

    const handleLoginSuccess = (userId: string) => {
      if (hasCompletedAuth) return;
      hasCompletedAuth = true;

      if (isPopup) {
        channel?.postMessage({ type: 'GOOGLE_LOGIN_SUCCESS' });
        channel?.close();
        window.close();
        return;
      }

      redirectAfterLogin(userId, router);
    };

    const handleAuth = async () => {
      if (authCode) {
        const { data, error } =
          await supabase.auth.exchangeCodeForSession(authCode);

        if (error) throw new Error(error.message);

        if (data.session) {
          handleLoginSuccess(data.session.user.id);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // 이미 세션이 있다면 성공으로 간주
        handleLoginSuccess(session.user.id);
        return;
      }

      // 2. 인증 상태 변경 감지
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          handleLoginSuccess(session.user.id);
        }
      });

      unsubscribeAuthState = () => subscription.unsubscribe();
    };

    handleAuth().catch((error: unknown) => {
      console.error('Google callback failed:', error);
      channel?.close();
    });

    return () => {
      unsubscribeAuthState?.();
      channel?.close();
    };
  }, [authCode, isPopup, router]);

  return <CallbackSpinner />;
};
