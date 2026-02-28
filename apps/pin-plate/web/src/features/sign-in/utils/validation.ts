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

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
