'use client';

import { Input } from '@pin-plate/ui';
import * as styles from './SignUpForm.styles.css';

const signupIcon =
  'http://localhost:3845/assets/fa4a3321d9658b6667b8a4fe466a85f9de569dd1.svg';

export function SignUpForm() {
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          이름
        </label>
        <Input
          id="name"
          className={styles.input as unknown as string}
          defaultValue="홍길동"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          이메일
        </label>
        <Input
          id="email"
          className={styles.input as unknown as string}
          placeholder="example@email.com"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          비밀번호
        </label>
        <Input
          id="password"
          className={styles.input as unknown as string}
          type="password"
          placeholder="••••••••"
        />
      </div>

      <button className={styles.cta} type="submit">
        <img src={signupIcon} alt="signup" width={20} height={20} />
        회원가입
      </button>
    </form>
  );
}

export default SignUpForm;
