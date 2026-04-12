'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface LoginState {
  error: string;
}

export async function login(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
    };
  }

  redirect('/');
}
