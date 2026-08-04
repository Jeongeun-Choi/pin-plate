import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/_utils/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  buildSanitizedPostPayload,
  parsePostPayload,
  parseUpdatePostPayload,
} from './postRequest';

const getAuthenticatedUserId = async (request: NextRequest) => {
  const requestUser = await getAuthenticatedUser(request);

  return requestUser?.id ?? null;
};

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get('id');
  const kakaoPlaceId = requestUrl.searchParams.get('kakaoPlaceId');
  const offset = Number.parseInt(requestUrl.searchParams.get('offset') ?? '0');
  const limit = Number.parseInt(requestUrl.searchParams.get('limit') ?? '0');
  const supabase = createAdminClient();

  if (id) {
    const postId = Number.parseInt(id, 10);

    if (!Number.isFinite(postId)) {
      return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  let query = supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (kakaoPlaceId) {
    query = query.eq('kakao_place_id', kakaoPlaceId);
  }

  if (Number.isFinite(offset) && Number.isFinite(limit) && limit > 0) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const payload = await parsePostPayload(request);
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid post payload' },
      { status: 400 },
    );
  }

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (payload.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminClient();
  const postPayload = await buildSanitizedPostPayload(
    supabase,
    payload,
    userId,
  );
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

  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (updatePostRequestBody.payload.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createAdminClient();
  const postPayload = await buildSanitizedPostPayload(
    supabase,
    updatePostRequestBody.payload,
    userId,
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

export async function DELETE(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postId = Number.parseInt(
    new URL(request.url).searchParams.get('id') ?? '',
    10,
  );

  if (!Number.isFinite(postId)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
