import { createClient } from '@/utils/supabase/client';
import { AuthTokenResponsePassword } from '@supabase/supabase-js';
import {
  GOOGLE_LOGIN_CHANNEL,
  isGoogleLoginCallbackMessage,
  isGoogleLoginFailureMessage,
  isGoogleLoginSuccessMessage,
} from '../lib/googleLoginMessage';

export interface LoginParams {
  email: string;
  password: string;
}

export const login = async (
  params: LoginParams,
): Promise<AuthTokenResponsePassword['data']> => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) throw new Error(error.message);
  return data;
};

export const loginWithGoogle = async () => {
  const supabase = createClient();
  const isMobileWebView = Boolean(window.ReactNativeWebView);
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  const popupWindow = isMobileWebView
    ? null
    : window.open(
        '',
        'google-login',
        `width=${width},height=${height},top=${top},left=${left}`,
      );
  const shouldUsePopup = Boolean(popupWindow);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo:
        isMobileWebView || !shouldUsePopup
          ? `${window.location.origin}/auth/callback`
          : `${window.location.origin}/auth/callback?popup=true`,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    popupWindow?.close();
    throw new Error(error.message);
  }

  if (!data.url) {
    popupWindow?.close();
    return;
  }

  // 모바일 WebView는 팝업(window.open)과 BroadcastChannel을 지원하지 않으므로
  // 같은 화면에서 그대로 이동시키고, 완료 처리는 콜백 페이지가 전담한다.
  if (isMobileWebView || !popupWindow) {
    window.location.href = data.url;
    return;
  }

  popupWindow.location.href = data.url;

  return new Promise<void>((resolve, reject) => {
    let hasCompletedGoogleLogin = false;
    let popupClosedTimerId: number | null = null;
    const channel =
      typeof BroadcastChannel === 'undefined'
        ? null
        : new BroadcastChannel(GOOGLE_LOGIN_CHANNEL);

    const cleanupGoogleLoginListeners = () => {
      channel?.close();
      window.removeEventListener('message', handleWindowMessage);

      if (popupClosedTimerId !== null) {
        window.clearInterval(popupClosedTimerId);
      }
    };

    const completeGoogleLogin = () => {
      if (hasCompletedGoogleLogin) return;
      hasCompletedGoogleLogin = true;

      cleanupGoogleLoginListeners();
      popupWindow.close();
      supabase.auth.getSession().then(() => resolve(), reject);
    };

    const completeGoogleLoginWithCode = (code: string) => {
      if (hasCompletedGoogleLogin) return;
      hasCompletedGoogleLogin = true;

      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) throw new Error(error.message);

          cleanupGoogleLoginListeners();
          popupWindow.close();
          resolve();
        })
        .catch((error: unknown) => {
          cleanupGoogleLoginListeners();
          popupWindow.close();
          reject(error);
        });
    };

    const failGoogleLogin = (message: string) => {
      if (hasCompletedGoogleLogin) return;
      hasCompletedGoogleLogin = true;

      cleanupGoogleLoginListeners();
      popupWindow.close();
      reject(new Error(message));
    };

    const handleChannelMessage = (event: MessageEvent<unknown>) => {
      if (isGoogleLoginCallbackMessage(event.data)) {
        completeGoogleLoginWithCode(event.data.code);
        return;
      }

      if (isGoogleLoginFailureMessage(event.data)) {
        failGoogleLogin(event.data.message);
        return;
      }

      if (isGoogleLoginSuccessMessage(event.data)) {
        completeGoogleLogin();
      }
    };

    const handleWindowMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin) return;

      if (isGoogleLoginCallbackMessage(event.data)) {
        completeGoogleLoginWithCode(event.data.code);
        return;
      }

      if (isGoogleLoginFailureMessage(event.data)) {
        failGoogleLogin(event.data.message);
        return;
      }

      if (isGoogleLoginSuccessMessage(event.data)) {
        completeGoogleLogin();
      }
    };

    channel?.addEventListener('message', handleChannelMessage);
    window.addEventListener('message', handleWindowMessage);
    popupClosedTimerId = window.setInterval(() => {
      if (!popupWindow.closed) return;

      cleanupGoogleLoginListeners();
      reject(new Error('Google login popup was closed before completion.'));
    }, 500);
  });
};

export const getUserNickname = async (
  userId: string,
): Promise<string | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', userId)
    .single();
  return data?.nickname ?? null;
};

export const getSession = async () => {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
};
