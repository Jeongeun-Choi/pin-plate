export const GOOGLE_LOGIN_CHANNEL = 'google_login_channel';
export const GOOGLE_LOGIN_CALLBACK_TYPE = 'GOOGLE_LOGIN_CALLBACK';
export const GOOGLE_LOGIN_FAILURE_TYPE = 'GOOGLE_LOGIN_FAILURE';
export const GOOGLE_LOGIN_SUCCESS_TYPE = 'GOOGLE_LOGIN_SUCCESS';

export const GOOGLE_LOGIN_SUCCESS_MESSAGE = {
  type: GOOGLE_LOGIN_SUCCESS_TYPE,
} as const;

export interface GoogleLoginCallbackMessage {
  type: typeof GOOGLE_LOGIN_CALLBACK_TYPE;
  code: string;
}

export interface GoogleLoginFailureMessage {
  type: typeof GOOGLE_LOGIN_FAILURE_TYPE;
  message: string;
}

export const createGoogleLoginCallbackMessage = (
  code: string,
): GoogleLoginCallbackMessage => ({
  type: GOOGLE_LOGIN_CALLBACK_TYPE,
  code,
});

export const createGoogleLoginFailureMessage = (
  message: string,
): GoogleLoginFailureMessage => ({
  type: GOOGLE_LOGIN_FAILURE_TYPE,
  message,
});

export const isGoogleLoginSuccessMessage = (
  value: unknown,
): value is typeof GOOGLE_LOGIN_SUCCESS_MESSAGE => {
  if (typeof value !== 'object' || value === null) return false;

  return (
    (value as { type?: unknown }).type === GOOGLE_LOGIN_SUCCESS_MESSAGE.type
  );
};

export const isGoogleLoginCallbackMessage = (
  value: unknown,
): value is GoogleLoginCallbackMessage => {
  if (typeof value !== 'object' || value === null) return false;

  const message = value as { code?: unknown; type?: unknown };

  return (
    message.type === GOOGLE_LOGIN_CALLBACK_TYPE &&
    typeof message.code === 'string' &&
    message.code.length > 0
  );
};

export const isGoogleLoginFailureMessage = (
  value: unknown,
): value is GoogleLoginFailureMessage => {
  if (typeof value !== 'object' || value === null) return false;

  const message = value as { message?: unknown; type?: unknown };

  return (
    message.type === GOOGLE_LOGIN_FAILURE_TYPE &&
    typeof message.message === 'string'
  );
};
