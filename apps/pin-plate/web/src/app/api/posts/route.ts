import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  buildPublicImageUrl,
  getTrustedImageKeyFromUrl,
  isTrustedGuestImageKey,
  isTrustedUserImageKey,
} from '@/features/image/utils/imageReference';
import { getVerifiedGuestIdFromRequest } from '@/features/image/utils/guestUploadSession';

interface IncomingPostPayload {
  place_id?: string;
  content: string;
  rating: number;
  image_urls?: string[];
  image_keys?: string[];
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  user_id: string;
  tags: string[];
}

interface UpdatePostRequestBody {
  id: number;
  payload: IncomingPostPayload;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isIncomingPostPayload = (
  value: unknown,
): value is IncomingPostPayload => {
  if (!isRecord(value)) return false;

  return (
    (typeof value.place_id === 'undefined' ||
      typeof value.place_id === 'string') &&
    typeof value.content === 'string' &&
    typeof value.rating === 'number' &&
    (typeof value.image_urls === 'undefined' ||
      isStringArray(value.image_urls)) &&
    (typeof value.image_keys === 'undefined' ||
      isStringArray(value.image_keys)) &&
    typeof value.place_name === 'string' &&
    typeof value.address === 'string' &&
    typeof value.lat === 'number' &&
    typeof value.lng === 'number' &&
    typeof value.kakao_place_id === 'string' &&
    typeof value.user_id === 'string' &&
    isStringArray(value.tags)
  );
};

const parsePostPayload = async (
  request: NextRequest,
): Promise<IncomingPostPayload | null> => {
  try {
    const payload: unknown = await request.json();
    return isIncomingPostPayload(payload) ? payload : null;
  } catch {
    return null;
  }
};

const parseUpdatePostPayload = async (
  request: NextRequest,
): Promise<UpdatePostRequestBody | null> => {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body) || typeof body.id !== 'number') return null;

    return isIncomingPostPayload(body.payload)
      ? { id: body.id, payload: body.payload }
      : null;
  } catch {
    return null;
  }
};

const uniqueImageKeys = (imageKeys: string[]) => Array.from(new Set(imageKeys));

const isActorImageKey = (
  imageKey: string,
  userId: string,
  guestId: string | null,
) =>
  isTrustedUserImageKey(imageKey, userId) ||
  (guestId ? isTrustedGuestImageKey(imageKey, guestId) : false);

const sanitizeImageKeys = (
  payload: IncomingPostPayload,
  userId: string,
  guestId: string | null,
): string[] | null => {
  const submittedImageKeys = payload.image_keys ?? [];

  if (
    submittedImageKeys.some(
      (imageKey) => !isActorImageKey(imageKey, userId, guestId),
    )
  ) {
    return null;
  }

  const imageKeysFromUrls = (payload.image_urls ?? [])
    .map(getTrustedImageKeyFromUrl)
    .filter((imageKey): imageKey is string => Boolean(imageKey))
    .filter((imageKey) => isActorImageKey(imageKey, userId, guestId));

  return uniqueImageKeys([...submittedImageKeys, ...imageKeysFromUrls]);
};

const buildSanitizedPostPayload = (
  payload: IncomingPostPayload,
  userId: string,
  guestId: string | null,
) => {
  const imageKeys = sanitizeImageKeys(payload, userId, guestId);

  if (!imageKeys) return null;

  return {
    ...(payload.place_id ? { place_id: payload.place_id } : {}),
    content: payload.content,
    rating: payload.rating,
    image_urls: imageKeys.map(buildPublicImageUrl),
    place_name: payload.place_name,
    address: payload.address,
    lat: payload.lat,
    lng: payload.lng,
    kakao_place_id: payload.kakao_place_id,
    user_id: userId,
    tags: payload.tags,
  };
};

const getAuthenticatedUserId = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
};

export async function POST(request: NextRequest) {
  const payload = await parsePostPayload(request);
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid post payload' },
      { status: 400 },
    );
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (payload.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const guestId = getVerifiedGuestIdFromRequest(request);
  const postPayload = buildSanitizedPostPayload(payload, userId, guestId);
  if (!postPayload) {
    return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('posts')
    .insert(postPayload)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const updatePostRequestBody = await parseUpdatePostPayload(request);
  if (!updatePostRequestBody) {
    return NextResponse.json(
      { error: 'Invalid post payload' },
      { status: 400 },
    );
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (updatePostRequestBody.payload.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const guestId = getVerifiedGuestIdFromRequest(request);
  const postPayload = buildSanitizedPostPayload(
    updatePostRequestBody.payload,
    userId,
    guestId,
  );
  if (!postPayload) {
    return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('posts')
    .update(postPayload)
    .eq('id', updatePostRequestBody.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
