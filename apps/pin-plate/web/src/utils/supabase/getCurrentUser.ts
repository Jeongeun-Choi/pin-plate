import { createClient } from './client';
import { User } from '@supabase/supabase-js';

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
