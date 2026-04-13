'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export interface SignupState {
  error: string;
  success?: boolean;
}

const PASSWORD_ERROR =
  '비밀번호는 8자 이상이며 영문과 숫자를 모두 포함해야 합니다.';

const validatePassword = (password: string): string | null => {
  if (password.length < 8) return PASSWORD_ERROR;
  if (!/[A-Za-z]/.test(password)) return PASSWORD_ERROR;
  if (!/[0-9]/.test(password)) return PASSWORD_ERROR;
  return null;
};

const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '유효한 이메일 형식을 입력해주세요.';
  }
  return null;
};

const validateName = (name: string): string | null => {
  const nameRegex = /^[가-힣a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return '이름에는 한글 또는 영문만 사용할 수 있습니다.';
  }
  return null;
};

const translateSignupError = (message: string): string => {
  if (message.includes('User already registered')) {
    return '이미 가입된 이메일입니다.';
  }
  if (message.includes('Password should be at least')) {
    return PASSWORD_ERROR;
  }
  return '회원가입에 실패했습니다.';
};

export async function signup(
  prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !confirmPassword || !name) {
    return { error: '모든 필드를 입력해주세요.' };
  }

  if (password !== confirmPassword) {
    return { error: '비밀번호가 일치하지 않습니다.' };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { error: emailError };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 20) {
    return { error: '이름은 2자 이상 20자 이하로 입력해주세요.' };
  }

  const nameError = validateName(trimmedName);
  if (nameError) {
    return { error: nameError };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: trimmedName,
      },
    },
  });
  if (error) {
    return { error: translateSignupError(error.message) };
  }

  if (!data.session) {
    return {
      error: '이메일 인증이 필요합니다. Supabase 설정을 확인해주세요.',
    };
  }

  if (data.user) {
    const admin = createAdminClient();
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({ id: data.user.id, nickname: trimmedName });

    if (profileError) {
      return { error: '프로필 생성에 실패했습니다. 다시 시도해주세요.' };
    }
  }

  await supabase.auth.signOut();
  return { error: '', success: true };
}
