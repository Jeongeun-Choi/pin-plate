'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { z } from 'zod';

export interface SignupState {
  error: string;
  success?: boolean;
  requiresEmailConfirmation?: boolean;
  message?: string;
  fieldErrors?: SignupFieldErrors;
}

interface SignupFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const PASSWORD_ERROR =
  '비밀번호는 8자 이상이며 영문과 숫자를 모두 포함해야 합니다.';

const SIGNUP_FIELD_NAMES = [
  'name',
  'email',
  'password',
  'confirmPassword',
] as const;

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, '이름은 2자 이상 20자 이하로 입력해주세요.')
      .max(20, '이름은 2자 이상 20자 이하로 입력해주세요.')
      .regex(
        /^[가-힣a-zA-Z\s]+$/,
        '이름에는 한글 또는 영문만 사용할 수 있습니다.',
      ),
    email: z
      .string()
      .trim()
      .min(1, '이메일을 입력해주세요.')
      .email('유효한 이메일 형식을 입력해주세요.')
      .transform((email) => email.toLowerCase()),
    password: z
      .string()
      .min(8, PASSWORD_ERROR)
      .regex(/[A-Za-z]/, PASSWORD_ERROR)
      .regex(/[0-9]/, PASSWORD_ERROR),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((fields) => fields.password === fields.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  });

const translateSignupError = (message: string): string => {
  if (message.includes('Password should be at least')) {
    return PASSWORD_ERROR;
  }
  if (message.includes('rate limit') || message.includes('Too many')) {
    return '회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }
  return '회원가입에 실패했습니다.';
};

const getSignupErrorState = (message: string): SignupState => {
  if (message.includes('User already registered')) {
    return {
      error: '',
      fieldErrors: {
        email: '이미 가입된 이메일입니다.',
      },
    };
  }

  if (message.includes('Password should be at least')) {
    return {
      error: '',
      fieldErrors: {
        password: PASSWORD_ERROR,
      },
    };
  }

  return { error: translateSignupError(message) };
};

const getSignupValidationResult = (formData: FormData) => {
  const parsedFields = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsedFields.success) {
    const fieldErrors = parsedFields.error.issues.reduce<SignupFieldErrors>(
      (errors, issue) => {
        const fieldName = issue.path[0];

        if (
          SIGNUP_FIELD_NAMES.includes(
            fieldName as (typeof SIGNUP_FIELD_NAMES)[number],
          ) &&
          !errors[fieldName as keyof SignupFieldErrors]
        ) {
          errors[fieldName as keyof SignupFieldErrors] = issue.message;
        }

        return errors;
      },
      {},
    );

    return {
      fields: null,
      fieldErrors,
    };
  }

  return {
    fields: parsedFields.data,
    fieldErrors: null,
  };
};

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const supabase = await createClient();
  const { fields, fieldErrors } = getSignupValidationResult(formData);

  if (!fields) {
    return {
      error: '',
      fieldErrors,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: fields.email,
    password: fields.password,
    options: {
      data: {
        full_name: fields.name,
      },
    },
  });
  if (error) {
    return getSignupErrorState(error.message);
  }

  if (data.user) {
    const admin = createAdminClient();
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({ id: data.user.id, nickname: fields.name });

    if (profileError) {
      return { error: '프로필 생성에 실패했습니다. 다시 시도해주세요.' };
    }
  }

  if (!data.session) {
    return {
      error: '',
      success: true,
      requiresEmailConfirmation: true,
      message:
        '인증 메일을 보냈어요. 메일함에서 인증을 완료한 뒤 로그인해주세요.',
    };
  }

  await supabase.auth.signOut();
  return {
    error: '',
    success: true,
    message: '로그인 화면에서 바로 시작할 수 있어요.',
  };
}
