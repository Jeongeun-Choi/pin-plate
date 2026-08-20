import { z } from 'zod';

const profileWithEmailSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable(),
  name: z.string().nullable(),
  image_url: z.string().nullable(),
  email: z.string().nullable().optional(),
});

export type ProfileWithEmail = z.infer<typeof profileWithEmailSchema>;

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

  return profileWithEmailSchema.nullable().parse(await response.json());
};
