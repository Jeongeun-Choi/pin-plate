import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  buildSanitizedPostPayload,
  parsePostPayload,
  parseUpdatePostPayload,
} from './postRequest';

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

  const { supabase, userId } = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (updatePostRequestBody.payload.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
