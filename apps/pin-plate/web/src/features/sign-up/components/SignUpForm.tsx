'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@pin-plate/ui';
import { signup, type SignupState } from '../actions';
import * as styles from './SignUpForm.styles.css';

const initialState: SignupState = {
  error: '',
};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      alert('회원가입이 완료됐습니다.');
      router.push('/sign-in');
    }
  }, [state?.success, router]);

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          이름
        </label>
        <Input
          id="name"
          name="name"
          className={styles.input}
          placeholder="이름"
          disabled={isPending}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          이메일
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          className={styles.input}
          placeholder="example@email.com"
          disabled={isPending}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          비밀번호
        </label>
        <Input
          id="password"
          name="password"
          className={styles.input}
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          required
          minLength={8}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPassword">
          비밀번호 확인
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          className={styles.input}
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          required
          minLength={8}
        />
      </div>

      {state?.error && <div className={styles.errorMessage}>{state.error}</div>}

      <Button type="submit" size="full" disabled={isPending}>
        회원가입
      </Button>

      <p className={styles.loginLink}>
        이미 계정이 있으신가요? <a href="/sign-in">로그인</a>
      </p>
    </form>
  );
}

export default SignUpForm;
