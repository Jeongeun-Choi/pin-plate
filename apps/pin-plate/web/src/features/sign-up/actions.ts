'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';

interface SignupState {
  error: string;
}

const translateSignupError = (message: string): string => {
  if (message.includes('User already registered')) {
    return '이미 가입된 이메일입니다.';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return '비밀번호는 6자 이상이어야 합니다.';
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
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return { error: '모든 필드를 입력해주세요.' };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 20) {
    return { error: '이름은 2자 이상 20자 이하로 입력해주세요.' };
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

  redirect('/');
}
