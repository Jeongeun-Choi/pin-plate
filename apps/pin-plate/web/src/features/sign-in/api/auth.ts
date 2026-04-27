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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?popup=true`,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw new Error(error.message);

  if (data.url) {
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
  }
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
