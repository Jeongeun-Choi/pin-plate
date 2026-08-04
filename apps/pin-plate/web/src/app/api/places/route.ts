import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/_utils/auth';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  isPlaceStatus,
  isRecord,
  isStringArray,
  withPlaceStats,
} from './placeRouteUtils';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get('id');
  const kakaoPlaceId = requestUrl.searchParams.get('kakaoPlaceId');
  const supabase = createAdminClient();

  if (id) {
    const { data, error } = await supabase
      .from('places')
      .select('*, posts(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(withPlaceStats(data as Record<string, unknown>));
  }

  if (kakaoPlaceId) {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('user_id', user.id)
      .eq('kakao_place_id', kakaoPlaceId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('places')
    .select('*, posts(id, rating, image_urls, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(withPlaceStats));
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload: unknown = await request.json().catch(() => null);

  if (
    !isRecord(payload) ||
    typeof payload.kakao_place_id !== 'string' ||
    typeof payload.place_name !== 'string' ||
    typeof payload.address !== 'string' ||
    typeof payload.lat !== 'number' ||
    typeof payload.lng !== 'number' ||
    !isPlaceStatus(payload.status) ||
    !isStringArray(payload.tags)
  ) {
    return NextResponse.json(
      { error: 'Invalid place payload' },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('places')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload: unknown = await request.json().catch(() => null);

  if (
    !isRecord(payload) ||
    typeof payload.placeId !== 'string' ||
    !isPlaceStatus(payload.status)
  ) {
    return NextResponse.json(
      { error: 'Invalid place payload' },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('places')
    .update({ status: payload.status, updated_at: new Date().toISOString() })
    .eq('id', payload.placeId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const placeId = new URL(request.url).searchParams.get('id');

  if (!placeId) {
    return NextResponse.json({ error: 'Invalid place id' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('places')
    .delete()
    .eq('id', placeId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
