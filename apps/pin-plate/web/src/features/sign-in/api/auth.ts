import { createClient } from '@/utils/supabase/client';
import { AuthTokenResponsePassword } from '@supabase/supabase-js';
import {
  GOOGLE_LOGIN_CHANNEL,
  isGoogleLoginFailureMessage,
  isGoogleLoginSuccessMessage,
} from '../lib/googleLoginMessage';

export interface LoginParams {
  email: string;
  password: string;
}

interface BetterAuthUser {
  id: string;
  email?: string;
  name?: string | null;
}

interface BetterAuthSession {
  user: BetterAuthUser;
}

interface BetterAuthSocialSignInResponse {
  redirect?: boolean;
  url?: string;
}

const GOOGLE_LOGIN_POPUP_TIMEOUT_MS = 5 * 60 * 1_000;

const getAuthApiBaseUrl = () => {
  const configuredAuthApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL?.replace(
    /\/+$/g,
    '',
  );

  if (configuredAuthApiUrl) return configuredAuthApiUrl;

  if (typeof window !== 'undefined') {
    const localAuthHostnames = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

    if (localAuthHostnames.has(window.location.hostname)) {
      return `http://${window.location.hostname}:8787`;
    }
  }

  return 'https://api.pinonplate.com';
};

const parseBetterAuthSocialSignInResponse = (
  value: unknown,
): BetterAuthSocialSignInResponse => {
  if (typeof value !== 'object' || value === null) return {};

  const response = value as { redirect?: unknown; url?: unknown };

  return {
    redirect:
      typeof response.redirect === 'boolean' ? response.redirect : undefined,
    url: typeof response.url === 'string' ? response.url : undefined,
  };
};

const parseBetterAuthSession = (value: unknown): BetterAuthSession | null => {
  if (typeof value !== 'object' || value === null) return null;

  const response = value as { user?: unknown };

  if (typeof response.user !== 'object' || response.user === null) return null;

  const user = response.user as {
    email?: unknown;
    id?: unknown;
    name?: unknown;
  };

  if (typeof user.id !== 'string') return null;

  return {
    user: {
      id: user.id,
      email: typeof user.email === 'string' ? user.email : undefined,
      name: typeof user.name === 'string' ? user.name : null,
    },
  };
};

export const getBetterAuthSession =
  async (): Promise<BetterAuthSession | null> => {
    const response = await fetch(`${getAuthApiBaseUrl()}/auth/get-session`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    return parseBetterAuthSession(await response.json());
  };

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
  const callbackUrl = `${window.location.origin}/auth/callback?provider=better-auth${
    isMobileWebView || !shouldUsePopup ? '' : '&popup=true'
  }`;

  let response: Response;

  try {
    response = await fetch(`${getAuthApiBaseUrl()}/auth/sign-in/social`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callbackURL: callbackUrl,
        provider: 'google',
      }),
    });
  } catch {
    popupWindow?.close();
    throw new Error(
      '인증 서버에 연결하지 못했습니다. 로컬에서는 Worker dev 서버가 켜져 있는지 확인해주세요.',
    );
  }

  if (!response.ok) {
    popupWindow?.close();
    throw new Error('Google 로그인 URL을 생성하지 못했습니다.');
  }

  const data = parseBetterAuthSocialSignInResponse(await response.json());

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
    let popupTimeoutTimerId: number | null = null;
    const channel =
      typeof BroadcastChannel === 'undefined'
        ? null
        : new BroadcastChannel(GOOGLE_LOGIN_CHANNEL);

    const cleanupGoogleLoginListeners = () => {
      channel?.close();
      window.removeEventListener('message', handleWindowMessage);

      if (popupTimeoutTimerId !== null) {
        window.clearTimeout(popupTimeoutTimerId);
      }
    };

    const completeGoogleLogin = () => {
      if (hasCompletedGoogleLogin) return;
      hasCompletedGoogleLogin = true;

      cleanupGoogleLoginListeners();
      popupWindow.close();
      getBetterAuthSession().then(() => resolve(), reject);
    };

    const failGoogleLogin = (message: string) => {
      if (hasCompletedGoogleLogin) return;
      hasCompletedGoogleLogin = true;

      cleanupGoogleLoginListeners();
      popupWindow.close();
      reject(new Error(message));
    };

    const cancelGoogleLogin = () => {
      if (hasCompletedGoogleLogin) return;
      hasCompletedGoogleLogin = true;

      cleanupGoogleLoginListeners();
      resolve();
    };

    const handleChannelMessage = (event: MessageEvent<unknown>) => {
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
    popupTimeoutTimerId = window.setTimeout(() => {
      cancelGoogleLogin();
    }, GOOGLE_LOGIN_POPUP_TIMEOUT_MS);
  });
};

export const getSession = async () => {
  return getBetterAuthSession();
};
