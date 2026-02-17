'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@pin-plate/ui';
import * as styles from './page.css';

export default function ProfileSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2자 이상 20자 이하로 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // Update public.profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, nickname: nickname.trim() });

      if (updateError) {
        throw updateError;
      }

      router.push('/');
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err.message || '프로필 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || '');
      }

      if (user?.user_metadata) {
        const { full_name, name: metaName } = user.user_metadata;
        const userName = full_name || metaName || '';
        if (userName) {
          setName(userName);
        }
      }
    };
    fetchUser();
  }, [supabase.auth]);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div>
          <h1 className={styles.title}>거의 다 왔어요!</h1>
          <p className={styles.description}>
            Pin Plate에서 사용할 닉네임을 설정해주세요.
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            이름
          </label>
          <input
            id="name"
            type="text"
            className={styles.input}
            value={name}
            disabled
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            이메일
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            disabled
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="nickname" className={styles.label}>
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            className={styles.input}
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={isLoading}
            minLength={2}
            maxLength={20}
          />
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>

        <Button
          type="submit"
          variant="solid"
          size="full"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? '저장 중...' : '시작하기'}
        </Button>
      </form>
    </div>
  );
}
