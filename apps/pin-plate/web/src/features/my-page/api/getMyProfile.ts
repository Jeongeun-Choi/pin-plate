export interface Profile {
  id: string;
  nickname: string;
  name: string | null;
  image_url: string | null;
}

export type ProfileWithEmail = Profile & { email?: string | null };

export const getMyProfile = async (): Promise<ProfileWithEmail | null> => {
  const response = await fetch('/api/profile', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('profile_fetch_failed');
  }

  return (await response.json()) as ProfileWithEmail | null;
};
