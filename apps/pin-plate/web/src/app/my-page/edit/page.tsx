'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMyProfile } from '@/features/my-page';
import { createClient } from '@/utils/supabase/client';
import * as styles from './page.css';
import { Button } from '@pin-plate/ui';

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: profile, isLoading } = useMyProfile();

  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    const supabase = createClient();

    try {
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      alert('프로필이 수정되었습니다.');
      router.refresh();
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>; // Simple loading state

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.label}>계정 정보</div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>이메일</label>
          <div className={styles.readOnlyField}>{profile?.email}</div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>닉네임</label>
          <input
            type="text"
            className={styles.inputField}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="닉네임을 입력해주세요"
          />
          <div className={styles.charCount}>{nickname.length}/20자</div>
        </div>
      </section>

      <Button
        variant="solid"
        onClick={handleSave}
        disabled={isSaving}
        size="full"
      >
        {isSaving ? '저장 중...' : '저장하기'}
      </Button>
    </div>
  );
}
