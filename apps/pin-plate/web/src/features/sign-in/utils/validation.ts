export const getAuthErrorMessage = (error: Error | null): string | null => {
  if (!error) return null;

  const message = error.message;

  // Supabase Auth Error Codes mapping
  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 일치하지 않습니다.';
  }
  if (message.includes('Email not confirmed')) {
    return '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.';
  }
  if (message.includes('Too many requests') || message.includes('429')) {
    return '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }
  if (message.includes('network')) {
    return '네트워크 연결을 확인해주세요.';
  }

  // Default fallback
  return '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
};

export const getPasswordResetRequestErrorMessage = (
  error: Error | null,
): string => {
  if (!error)
    return '재설정 메일을 보내지 못했어요. 잠시 후 다시 시도해주세요.';

  const message = error.message.toLowerCase();

  if (message.includes('rate') || message.includes('429')) {
    return '요청이 잠시 많아요. 몇 분 뒤에 다시 시도해주세요.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
  }

  return '재설정 메일을 보내지 못했어요. 이메일 주소를 확인하고 다시 시도해주세요.';
};

export const getPasswordUpdateErrorMessage = (error: Error | null): string => {
  if (!error) return '비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해주세요.';

  const message = error.message.toLowerCase();

  if (message.includes('session') || message.includes('jwt')) {
    return '재설정 링크가 만료됐어요. 새 링크를 다시 요청해주세요.';
  }

  if (message.includes('weak') || message.includes('password')) {
    return '더 안전한 비밀번호를 입력해주세요. 영문과 숫자를 포함해 8자 이상이면 좋아요.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return '네트워크 연결을 확인한 뒤 다시 시도해주세요.';
  }

  return '비밀번호를 바꾸지 못했어요. 재설정 링크를 다시 열어 시도해주세요.';
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
