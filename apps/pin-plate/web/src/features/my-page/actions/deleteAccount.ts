'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';

export async function deleteAccount(): Promise<{ error: string } | never> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: '사용자 정보를 가져올 수 없습니다.' };
  }

  const { error: postsError } = await supabase
    .from('posts')
    .delete()
    .eq('user_id', user.id);

  if (postsError) {
    return { error: '데이터 삭제 중 오류가 발생했습니다.' };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) {
    return { error: '프로필 삭제 중 오류가 발생했습니다.' };
  }

  const adminClient = createAdminClient();
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    return { error: '계정 삭제 중 오류가 발생했습니다.' };
  }

  await supabase.auth.signOut();
  redirect('/sign-in');
}
