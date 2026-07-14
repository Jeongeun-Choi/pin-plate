'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyProfile } from '@/features/my-page';
import type { ProfileWithEmail } from '@/features/my-page/api/getMyProfile';
import { createClient } from '@/utils/supabase/client';
import * as styles from './page.css';
import { Button, Input } from '@pin-plate/ui';
import { useToast } from '@/providers/ToastProvider';

export default function ProfileEditPage() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return null;

  return <ProfileEditForm profile={profile} />;
}

interface Props {
  profile: ProfileWithEmail;
}

function ProfileEditForm({ profile }: Props) {
  const [nickname, setNickname] = useState(profile.nickname || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { showErrorToast, showSuccessToast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      showSuccessToast({
        title: '프로필이 수정됐어요',
        description: '변경한 닉네임이 저장됐어요.',
      });
      router.refresh();
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast({
        title: '프로필 수정에 실패했어요',
        description: '잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.label}>계정 정보</div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>이메일</label>
          <div className={styles.readOnlyField}>{profile.email}</div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>닉네임</label>
          <Input
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
