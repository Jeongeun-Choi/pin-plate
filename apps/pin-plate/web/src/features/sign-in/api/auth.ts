import { createClient } from '@/utils/supabase/client';
import { AuthTokenResponsePassword } from '@supabase/supabase-js';

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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: isMobileWebView
        ? `${window.location.origin}/auth/callback`
        : `${window.location.origin}/auth/callback?popup=true`,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw new Error(error.message);

  if (!data.url) return;

  // 모바일 WebView는 팝업(window.open)과 BroadcastChannel을 지원하지 않으므로
  // 같은 화면에서 그대로 이동시키고, 완료 처리는 콜백 페이지가 전담한다.
  if (isMobileWebView) {
    window.location.href = data.url;
    return;
  }

  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  window.open(
    data.url,
    'google-login',
    `width=${width},height=${height},top=${top},left=${left}`,
  );

  return new Promise<void>((resolve) => {
    const channel = new BroadcastChannel('google_login_channel');
    channel.onmessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        channel.close();
        supabase.auth.getSession().then(() => resolve());
      }
    };
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
