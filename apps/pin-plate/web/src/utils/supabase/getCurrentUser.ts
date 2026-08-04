import { createClient } from './client';

export interface CurrentUser {
  id: string;
  email?: string;
}

const getBetterAuthCurrentUser = async (): Promise<CurrentUser | null> => {
  const response = await fetch('/api/me', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error('current_user_fetch_failed');

  const value: unknown = await response.json();

  if (typeof value !== 'object' || value === null) return null;

  const { user } = value as { user?: unknown };

  if (typeof user !== 'object' || user === null) return null;

  const currentUser = user as { email?: unknown; id?: unknown };

  if (typeof currentUser.id !== 'string') return null;

  return {
    id: currentUser.id,
    email:
      typeof currentUser.email === 'string' ? currentUser.email : undefined,
  };
};

const getSupabaseCurrentUser = async (): Promise<CurrentUser | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? { id: user.id, email: user.email } : null;
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const betterAuthUser = await getBetterAuthCurrentUser();

  if (betterAuthUser) return betterAuthUser;

  return getSupabaseCurrentUser();
};
