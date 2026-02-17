import { createClient } from '@/utils/supabase/client';

export interface Profile {
  id: string;
  nickname: string;
  name: string | null;
  image_url: string | null;
}

export type ProfileWithEmail = Profile & { email?: string | null };

export const getMyProfile = async (): Promise<ProfileWithEmail | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return { ...(data as Profile), email: user.email };
};
